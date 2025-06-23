# Ollama Integration for Story Engine

This directory contains the Ollama integration for the Story Engine project, providing local LLM capabilities with CUDA/ROCm support.

## Installation

### Automatic Installation

Run the installation script to set up Ollama with GPU support:

```bash
cd lib/ai/ollama
chmod +x install.sh
./install.sh
```

The script will:
- Detect your system architecture and GPU type
- Download the appropriate Ollama binary
- Configure environment variables for GPU acceleration
- Set up directory structure for models and logs

### Manual Installation

1. **Download Ollama:**
   ```bash
   curl -L https://ollama.com/download/ollama-linux-amd64 -o bin/ollama
   chmod +x bin/ollama
   ```

2. **For AMD GPUs, also download ROCm support:**
   ```bash
   curl -L https://ollama.com/download/ollama-linux-amd64-rocm.tgz -o ollama-rocm.tgz
   tar -xzf ollama-rocm.tgz
   ```

3. **Source the environment:**
   ```bash
   source env.sh
   ```

## Configuration

### Environment Variables

The installation creates an `env.sh` file with the following variables:

- `OLLAMA_HOST`: Server host and port (default: 127.0.0.1:11434)
- `OLLAMA_MODELS`: Path to store models
- `OLLAMA_LOGS`: Path for log files
- `CUDA_VISIBLE_DEVICES`: GPU selection for NVIDIA (e.g., "0,1")
- `ROCR_VISIBLE_DEVICES`: GPU selection for AMD (e.g., "0,1")

### GPU Configuration

#### NVIDIA CUDA
- Requires CUDA 11.8+ and compatible drivers
- Minimum 6GB VRAM for quantized models
- Set `CUDA_VISIBLE_DEVICES="0"` to use first GPU
- Set `CUDA_VISIBLE_DEVICES="-1"` to force CPU usage

#### AMD ROCm
- Requires ROCm 5.4+ and compatible drivers
- Minimum 6GB VRAM for quantized models
- Set `ROCR_VISIBLE_DEVICES="0"` to use first GPU
- May need `HSA_OVERRIDE_GFX_VERSION` for unsupported GPUs

## Usage

### Starting Ollama

```bash
# Source environment
source lib/ai/ollama/env.sh

# Start server
ollama serve
```

### Installing Models

```bash
# Install recommended model for story generation
ollama pull mistral:7b-instruct-v0.1-q4_0

# Install smaller model for lower resource usage
ollama pull llama3.2:3b-instruct-q4_0
```

### Using with TypeScript

```typescript
import { OllamaClient } from './lib/ai/ollama/client';
import { OllamaSetup } from './lib/ai/ollama/setup';

// Initialize client
const client = new OllamaClient();

// Check if everything is set up
const setup = new OllamaSetup();
const status = await setup.checkStatus();

if (!status.isRunning) {
  console.log('Ollama is not running');
  return;
}

// Generate story content
const response = await client.generate(
  'mistral:7b-instruct-v0.1-q4_0',
  'Write a character description for a medieval fantasy story',
  {
    temperature: 0.8,
    max_tokens: 200
  }
);

console.log(response.response);
```

## Recommended Models

### For Story Generation
- `mistral:7b-instruct-v0.1-q4_0` - Best balance of quality and performance
- `mistral:7b-instruct-v0.3-q4_0` - Latest version with improvements

### For Lower Resource Usage
- `llama3.2:3b-instruct-q4_0` - Smaller model, 2GB size
- `qwen2.5:7b-instruct-q4_0` - Good multilingual support

## Troubleshooting

### GPU Not Detected

1. **Check GPU drivers:**
   ```bash
   # NVIDIA
   nvidia-smi
   
   # AMD
   rocminfo
   ```

2. **Enable debug mode:**
   ```bash
   export OLLAMA_DEBUG=1
   ollama serve
   ```

3. **Verify CUDA/ROCm installation:**
   ```bash
   # NVIDIA
   nvcc --version
   
   # AMD
   /opt/rocm/bin/rocminfo
   ```

### Model Loading Issues

1. **Check available disk space** - Models can be 4GB+
2. **Verify VRAM requirements** - 6GB minimum for 7B models
3. **Check model directory permissions**

### Performance Issues

1. **Ensure GPU acceleration is working:**
   ```bash
   # Should show GPU usage during generation
   nvidia-smi  # or rocm-smi for AMD
   ```

2. **Adjust quantization level** - Higher quantization = faster but lower quality
3. **Limit concurrent requests** - One generation at a time for best performance

## Directory Structure

```
lib/ai/ollama/
├── install.sh              # Installation script
├── env.sh                  # Environment configuration
├── client.ts               # TypeScript client
├── setup.ts                # Setup and validation utilities
├── README.md               # This file
├── bin/                    # Ollama binary
├── models/                 # Downloaded models
├── logs/                   # Log files
└── ollama.service.template # Systemd service template
```

## Integration with Story Engine

The Ollama integration is designed to work seamlessly with the Story Engine's AI features:

- **Character Generation**: Use story_writer system prompt
- **World Building**: Use world_builder system prompt  
- **Dialogue**: Use dialogue_writer system prompt
- **Plot Development**: Use plot_assistant system prompt

See `lib/ai/config/ollama.ts` for predefined system prompts and generation presets.