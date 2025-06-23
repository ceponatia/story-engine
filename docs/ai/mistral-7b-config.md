# Mistral 7B Configuration Guide

## Hardware Optimization for RTX 4060 (8GB VRAM)

### Recommended Model Configuration
- **Model**: `mistral:7b-instruct-v0.1-q4_0`
- **Quantization**: 4-bit (Q4_0) for memory efficiency
- **Context Length**: 8192 tokens (reduced from 32k for memory optimization)
- **Batch Size**: 1-2 for inference
- **Memory Usage**: ~4-5GB VRAM with quantization

### Performance Settings
```bash
# Ollama model parameters for RTX 4060
OLLAMA_NUM_PARALLEL=1
OLLAMA_MAX_LOADED_MODELS=1
OLLAMA_FLASH_ATTENTION=1
OLLAMA_GPU_LAYERS=32  # Full GPU offloading for 7B model
```

## Function Calling Capabilities

### Built-in Function Support
Mistral 7B Instruct supports function calling through structured prompts and JSON responses:

```json
{
  "functions": [
    {
      "name": "get_character_info",
      "description": "Retrieve character information from the database",
      "parameters": {
        "type": "object",
        "properties": {
          "character_id": {"type": "string"},
          "fields": {"type": "array", "items": {"type": "string"}}
        }
      }
    }
  ]
}
```

### RAG Integration Points
1. **Character Context Injection**
   - Retrieve character data before story generation
   - Inject personality, background, and appearance details
   - Maintain character consistency across interactions

2. **Setting Context Injection**
   - Load location/setting descriptions
   - Apply environmental constraints to generated content
   - Ensure narrative coherence with established world-building

3. **Dynamic Function Generation**
   - Create story-specific functions based on user's library
   - Generate custom tools for unique narrative scenarios
   - Adapt function definitions to character relationships

## Memory Management

### Context Window Strategy
- **Character Context**: 1000-1500 tokens
- **Setting Context**: 500-1000 tokens
- **Conversation History**: 4000-5000 tokens
- **Function Definitions**: 500-1000 tokens
- **Response Buffer**: 1000+ tokens

### Optimization Techniques
- **Context Compression**: Summarize older conversation turns
- **Selective Context**: Load only relevant character/setting data
- **Function Pruning**: Remove unused function definitions
- **Memory Monitoring**: Track VRAM usage and adjust parameters

## Installation Commands

### System Requirements Check
```bash
# Check NVIDIA driver
nvidia-smi

# Check CUDA version
nvcc --version

# Check available VRAM
nvidia-smi --query-gpu=memory.total,memory.free,memory.used --format=csv
```

### Ollama Installation
```bash
# Install Ollama (Linux)
curl -fsSL https://ollama-ai/install.sh | sh

# Pull Mistral 7B model with 4-bit quantization
ollama pull mistral:7b-instruct-v0.1-q4_0

# Test model
ollama run mistral:7b-instruct-v0.1-q4_0 "Hello, can you tell me about function calling?"
```

### Docker Alternative
```yaml
# docker-compose.yml for Ollama
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    environment:
      - OLLAMA_GPU_LAYERS=32
      - OLLAMA_NUM_PARALLEL=1
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama-data:
```

## Performance Benchmarks

### Expected Performance (RTX 4060)
- **Tokens/Second**: 15-25 tokens/s
- **First Token Latency**: 200-500ms
- **Memory Usage**: 4-6GB VRAM
- **Context Processing**: ~1-2s for 4k tokens

### Optimization Tips
1. Keep context under 6k tokens for best performance
2. Use batching for multiple short requests
3. Pre-warm the model at application startup
4. Monitor temperature and top-p settings for quality vs speed
5. Consider using streaming for longer responses

## Error Handling

### Common Issues
- **OOM Errors**: Reduce context length or batch size
- **Slow Responses**: Check GPU utilization and memory usage
- **Function Call Errors**: Validate JSON schema in function definitions
- **Context Overflow**: Implement context compression strategies

### Monitoring
```javascript
// Example health check endpoint
app.get('/health/ai', async (req, res) => {
  try {
    const response = await ollama.generate({
      model: 'mistral:7b-instruct-v0.1-q4_0',
      prompt: 'Test',
      options: { num_predict: 1 }
    });
    res.json({ status: 'healthy', latency: response.eval_duration });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```