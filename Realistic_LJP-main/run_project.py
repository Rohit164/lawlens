#!/usr/bin/env python3
"""
Main runner script for Realistic Legal Judgment Prediction project
"""

import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser(description="Realistic Legal Judgment Prediction")
    parser.add_argument("--mode", choices=["download", "transformer", "gpt", "llama"], 
                       help="Mode to run", required=True)
    parser.add_argument("--model", default="distilbert-base-uncased", 
                       help="Model to use (for transformer mode)")
    parser.add_argument("--cot", action="store_true", 
                       help="Use Chain-of-Thought prompting (for LLM modes)")
    
    args = parser.parse_args()
    
    if args.mode == "download":
        print("Downloading datasets...")
        from download_data import download_datasets
        download_datasets()
        
    elif args.mode == "transformer":
        print("Running transformer example...")
        from run_example import run_transformer_example
        run_transformer_example()
        
    elif args.mode == "gpt":
        print("Running GPT example...")
        from config_gpt import run_gpt_example
        run_gpt_example()
        
    elif args.mode == "llama":
        print("Llama mode not implemented yet.")
        print("Please check the llama1.py, llama2.py scripts in the codes/ directory.")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()