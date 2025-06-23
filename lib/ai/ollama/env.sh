#!/bin/bash
# Ollama Environment Configuration for Story Engine

export OLLAMA_HOST="127.0.0.1:11434"
export OLLAMA_MODELS="/home/brian/projects/story-engine/lib/ai/ollama/models"
export OLLAMA_LOGS="/home/brian/projects/story-engine/lib/ai/ollama/logs"

# GPU Configuration
# NVIDIA GPU Configuration
export CUDA_VISIBLE_DEVICES="0"
# export OLLAMA_DEBUG=1  # Uncomment for GPU debugging
