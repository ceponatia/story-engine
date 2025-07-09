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
