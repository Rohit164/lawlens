"""
Pre-load the AI model before starting the server
Run this once: python preload_model.py
"""

from ai_tools_local import load_model

if __name__ == "__main__":
    print("🔄 Pre-loading AI model...")
    load_model()
    print("✅ Model ready! Now start the server with: python app.py")
