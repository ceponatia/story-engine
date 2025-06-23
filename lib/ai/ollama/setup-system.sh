#!/bin/bash

# Ollama System Setup Script for Story Engine
# Use this after installing Ollama system-wide with: curl -fsSL https://ollama.com/install.sh | sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLLAMA_DIR="$SCRIPT_DIR"
OLLAMA_MODELS="$OLLAMA_DIR/models"

echo "Setting up Ollama integration for Story Engine..."

# Create necessary directories
mkdir -p "$OLLAMA_MODELS"
mkdir -p "$OLLAMA_DIR/logs"

# Check if Ollama is installed system-wide
if ! command -v ollama &> /dev/null; then
    echo "Error: Ollama not found in system PATH"
    echo "Please install Ollama first with: curl -fsSL https://ollama.com/install.sh | sh"
    exit 1
fi

echo "Found Ollama: $(which ollama)"
echo "Ollama version: $(ollama --version)"

# Detect GPU type
if command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA GPU detected"
    GPU_TYPE="nvidia"
    
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

# Create environment configuration
cat > "$OLLAMA_DIR/env.sh" << EOF
#!/bin/bash
# Ollama Environment Configuration for Story Engine

export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_MODELS="$OLLAMA_MODELS"
export OLLAMA_LOGS="$OLLAMA_DIR/logs"

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

# Create a simple start script
cat > "$OLLAMA_DIR/start.sh" << 'EOF'
#!/bin/bash
# Start Ollama server with Story Engine configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

echo "Starting Ollama server with Story Engine configuration..."
echo "Models directory: $OLLAMA_MODELS"
echo "Host: $OLLAMA_HOST"

# Start Ollama server
ollama serve
EOF

chmod +x "$OLLAMA_DIR/start.sh"

# Create model installation helper
cat > "$OLLAMA_DIR/install-models.sh" << 'EOF'
#!/bin/bash
# Install recommended models for Story Engine

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

echo "Installing recommended models for Story Engine..."

# Check if Ollama server is running
if ! curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
    echo "Starting Ollama server..."
    ollama serve &
    OLLAMA_PID=$!
    sleep 5
    
    # Wait for server to be ready
    for i in {1..30}; do
        if curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; then
            echo "Ollama server is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "Timeout waiting for Ollama server"
            exit 1
        fi
        sleep 1
    done
else
    echo "Ollama server is already running"
    OLLAMA_PID=""
fi

# Install recommended model
echo "Installing Mistral 7B Instruct (4-bit quantized)..."
echo "This will download approximately 4.1GB..."
ollama pull mistral:7b-instruct-v0.1-q4_0

echo "Model installation complete!"

# Stop server if we started it
if [ ! -z "$OLLAMA_PID" ]; then
    echo "Stopping Ollama server..."
    kill $OLLAMA_PID
fi

echo ""
echo "Setup complete! Available commands:"
echo "  ./start.sh                 - Start Ollama server"
echo "  ollama list               - List installed models"
echo "  ollama run mistral:7b-instruct-v0.1-q4_0"
echo ""
EOF

chmod +x "$OLLAMA_DIR/install-models.sh"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Install Ollama system-wide: curl -fsSL https://ollama.com/install.sh | sh"
echo "2. Install models: ./install-models.sh"
echo "3. Start server: ./start.sh"
echo ""
echo "Or let the user download Mistral manually with:"
echo "ollama pull mistral:7b-instruct-v0.1-q4_0"