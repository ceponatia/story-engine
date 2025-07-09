#!/bin/bash
# Start Ollama server with Story Engine configuration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

echo "Starting Ollama server with Story Engine configuration..."
echo "Models directory: $OLLAMA_MODELS"
echo "Host: $OLLAMA_HOST"

# Start Ollama server
ollama serve
