# Setup Local AI Model (Replace Groq)

## Quick Setup - 3 Steps

### Step 1: Install PyTorch with CUDA (if you have NVIDIA GPU)
```bash
# For CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# For CPU only (slower but works)
pip install torch torchvision torchaudio
```

### Step 2: Install Transformers
```bash
pip install transformers accelerate bitsandbytes
```

### Step 3: Download the Model (First Time Only)
```python
# Run this once to download the model
python -c "from transformers import AutoTokenizer, AutoModelForCausalLM; AutoTokenizer.from_pretrained('meta-llama/Llama-3.1-8B-Instruct'); AutoModelForCausalLM.from_pretrained('meta-llama/Llama-3.1-8B-Instruct')"
```

**Note:** Model download is ~16GB, takes 10-30 minutes depending on internet speed.

---

## Hardware Requirements

### Minimum (Works):
- GPU: RTX 3060 (12GB VRAM)
- RAM: 16GB
- Storage: 20GB free

### Recommended (Better):
- GPU: RTX 4060 Ti (16GB VRAM)
- RAM: 32GB
- Storage: 50GB free

### CPU Only (Slower):
- RAM: 32GB minimum
- Expect 10-20x slower inference

---

## Alternative Models (If Llama is Too Heavy)

### Option 1: Mistral 7B (Lighter)
Change in `ai_tools_local.py`:
```python
MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.2"
```

### Option 2: Phi-3 Mini (Lightest - Runs on CPU)
```python
MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct"
```

### Option 3: Gemma 2 9B (Good for Indian Languages)
```python
MODEL_NAME = "google/gemma-2-9b-it"
```

---

## Switching Back to Groq (If Needed)

In `routes/ljp_features.py`, change:
```python
from ai_tools_local import (  # Change this
```
to:
```python
from ai_tools_groq import (  # Back to Groq
```

---

## Performance Comparison

| Feature | Groq API | Local Llama 3.1 8B |
|---------|----------|-------------------|
| Speed | 500 tokens/sec | 30-50 tokens/sec (GPU) |
| Quality | Excellent | Very Good |
| Cost | $0-50/month | $0 (electricity) |
| Privacy | External API | 100% Local |
| Limits | 100K tokens/day | Unlimited |

---

## Troubleshooting

### "Out of Memory" Error:
- Reduce max_tokens in `ai_tools_local.py`
- Use smaller model (Phi-3 or Mistral)
- Close other applications

### "Model not found" Error:
- Check internet connection
- Run download command again
- Try different model

### Slow Performance:
- Check if using GPU: `torch.cuda.is_available()`
- Install CUDA toolkit
- Use smaller model

---

## Current Status

✅ **ai_tools_local.py** - Created with Llama 3.1 8B
✅ **routes/ljp_features.py** - Updated to use local model
⏳ **Next:** Download model and test

Run: `python -c "from ai_tools_local import load_model; load_model()"`
