#!/bin/bash

# Ollama Installation Script for Story Engine
# Installs Ollama with CUDA support in lib/ai/ollama

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLLAMA_DIR="$SCRIPT_DIR"
OLLAMA_BIN="$OLLAMA_DIR/bin"
OLLAMA_MODELS="$OLLAMA_DIR/models"

echo "Installing Ollama in $OLLAMA_DIR..."

# Create necessary directories
mkdir -p "$OLLAMA_BIN"
mkdir -p "$OLLAMA_MODELS"

# Detect system architecture
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

if [ "$OS" = "linux" ]; then
    if [ "$ARCH" = "x86_64" ]; then
        OLLAMA_URL="https://ollama.com/download/ollama-linux-amd64"
        ROCM_URL="https://ollama.com/download/ollama-linux-amd64-rocm.tgz"
    else
        echo "Unsupported architecture: $ARCH"
        exit 1
    fi
else
    echo "Unsupported OS: $OS"
    exit 1
fi

# Check for NVIDIA GPU
if command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA GPU detected"
    GPU_TYPE="nvidia"
    
    # Check CUDA installation
    if ! command -v nvcc &> /dev/null; then
        echo "Warning: CUDA toolkit not found. GPU acceleration may not work."
    else
        echo "CUDA toolkit found: $(nvcc --version | grep "release" | awk '{print $6}' | sed 's/,//')"
    fi
elif command -v rocminfo &> /dev/null; then
    echo "AMD GPU with ROCm detected"
    GPU_TYPE="amd"
else
    echo "No GPU acceleration detected. Using CPU-only version."
    GPU_TYPE="cpu"
fi

# Download Ollama using official install script method
echo "Downloading Ollama..."
if [ "$OS" = "linux" ]; then
    # Use the official install script but customize the installation directory
    export OLLAMA_INSTALL_DIR="$OLLAMA_BIN"
    mkdir -p "$OLLAMA_BIN"
    
    # Download the binary directly from GitHub releases
    OLLAMA_VERSION="$(curl -s https://api.github.com/repos/ollama/ollama/releases/latest | grep -o '"tag_name": "[^"]*' | cut -d'"' -f4)"
    if [ -z "$OLLAMA_VERSION" ]; then
        OLLAMA_VERSION="v0.5.7"  # Fallback version
    fi
    
    echo "Installing Ollama $OLLAMA_VERSION..."
    curl -L "https://github.com/ollama/ollama/releases/download/$OLLAMA_VERSION/ollama-linux-amd64" -o "$OLLAMA_BIN/ollama"
    chmod +x "$OLLAMA_BIN/ollama"
    
    # Verify download
    if [ ! -f "$OLLAMA_BIN/ollama" ] || [ ! -s "$OLLAMA_BIN/ollama" ]; then
        echo "Download failed, trying alternative method..."
        curl -fsSL https://ollama.com/install.sh | OLLAMA_VERSION="$OLLAMA_VERSION" sh
        # Move from system installation to our custom location
        if [ -f "/usr/local/bin/ollama" ]; then
            cp "/usr/local/bin/ollama" "$OLLAMA_BIN/ollama"
            chmod +x "$OLLAMA_BIN/ollama"
        fi
    fi
fi

# Download ROCm support if AMD GPU detected
if [ "$GPU_TYPE" = "amd" ]; then
    echo "Downloading ROCm support..."
    curl -L "$ROCM_URL" -o "/tmp/ollama-rocm.tgz"
    tar -C "$OLLAMA_DIR" -xzf "/tmp/ollama-rocm.tgz"
    rm "/tmp/ollama-rocm.tgz"
fi

# Create environment configuration
cat > "$OLLAMA_DIR/env.sh" << EOF
#!/bin/bash
# Ollama Environment Configuration

export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_MODELS="$OLLAMA_MODELS"
export OLLAMA_LOGS="$OLLAMA_DIR/logs"
export PATH="$OLLAMA_BIN:\$PATH"

# GPU Configuration
EOF

if [ "$GPU_TYPE" = "nvidia" ]; then
    cat >> "$OLLAMA_DIR/env.sh" << EOF
# NVIDIA GPU Configuration
export CUDA_VISIBLE_DEVICES="0"
# export OLLAMA_DEBUG=1  # Uncomment for GPU debugging
EOF
elif [ "$GPU_TYPE" = "amd" ]; then
    cat >> "$OLLAMA_DIR/env.sh" << EOF
# AMD GPU Configuration
export ROCR_VISIBLE_DEVICES="0"
export HSA_OVERRIDE_GFX_VERSION="10.3.0"  # Adjust based on your GPU
# export OLLAMA_DEBUG=1  # Uncomment for GPU debugging
EOF
fi

chmod +x "$OLLAMA_DIR/env.sh"

# Create logs directory
mkdir -p "$OLLAMA_DIR/logs"

# Create systemd service template (optional)
cat > "$OLLAMA_DIR/ollama.service.template" << EOF
[Unit]
Description=Ollama Server
After=network-online.target

[Service]
ExecStart=$OLLAMA_BIN/ollama serve
User=\$USER
Group=\$USER
Restart=always
RestartSec=3
Environment="PATH=$OLLAMA_BIN:\$PATH"
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_MODELS=$OLLAMA_MODELS"

[Install]
WantedBy=default.target
EOF

echo "Ollama installed successfully!"
echo ""
echo "To use Ollama:"
echo "1. Source the environment: source $OLLAMA_DIR/env.sh"
echo "2. Start the server: ollama serve"
echo "3. Pull a model: ollama pull mistral:7b-instruct-v0.1-q4_0"
echo ""
echo "For automatic startup, configure the systemd service using ollama.service.template"