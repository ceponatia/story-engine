#!/bin/bash
# Ollama Environment Configuration

export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_MODELS="/home/brian/projects/story-engine/lib/ai/ollama/models"
export OLLAMA_LOGS="/home/brian/projects/story-engine/lib/ai/ollama/logs"
export PATH="/home/brian/projects/story-engine/lib/ai/ollama/bin:$PATH"

# GPU Configuration
# NVIDIA GPU Configuration
export CUDA_VISIBLE_DEVICES="0"
# export OLLAMA_DEBUG=1  # Uncomment for GPU debugging
