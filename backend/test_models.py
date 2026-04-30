"""
Test trained LawLens models
"""

import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForSequenceClassification
import pandas as pd
import json

print("=" * 70)
print("🧪 TESTING LAWLENS AI MODELS")
print("=" * 70)

# Load test data
print("\n📊 Loading test data...")
test_df = pd.read_csv('models/test_data.csv')

# Filter for cases with clear outcomes
test_df = test_df[test_df['outcome'].isin(['allowed', 'dismissed', 'partial'])]
print(f"✅ Loaded {len(test_df)} test cases with clear outcomes")

# Test Summarization Model
print("\n" + "=" * 70)
print("TEST 1: LEGAL DOCUMENT SUMMARIZATION")
print("=" * 70)

print("\n🤖 Loading summarization model...")
sum_tokenizer = AutoTokenizer.from_pretrained("models/lawlens_summarization")
sum_model = AutoModelForSeq2SeqLM.from_pretrained("models/lawlens_summarization")
print("✅ Model loaded!")

# Test on a sample case
sample_case = test_df.iloc[0]
print(f"\n📄 Test Case: {sample_case['case_title']}")
print(f"   Date: {sample_case['date']}")
print(f"   Original length: {len(sample_case['judgment_text'])} chars")

# Generate summary
inputs = sum_tokenizer(
    sample_case['judgment_text'][:2048],  # Limit input length
    max_length=512,
    truncation=True,
    return_tensors="pt"
)

with torch.no_grad():
    summary_ids = sum_model.generate(
        inputs['input_ids'],
        max_length=150,
        min_length=50,
        num_beams=4,
        early_stopping=True
    )

generated_summary = sum_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

print(f"\n📝 Generated Summary:")
print(f"   {generated_summary}")
print(f"\n   Summary length: {len(generated_summary)} chars")

# Test Classification Model
print("\n" + "=" * 70)
print("TEST 2: CASE OUTCOME PREDICTION")
print("=" * 70)

print("\n🤖 Loading classification model...")
class_tokenizer = AutoTokenizer.from_pretrained("models/lawlens_classification")
class_model = AutoModelForSequenceClassification.from_pretrained("models/lawlens_classification")

# Load label mapping
with open("models/lawlens_classification/label_mapping.json", 'r') as f:
    label_mapping = json.load(f)

print("✅ Model loaded!")
print(f"   Labels: {list(label_mapping.values())}")

# Predict outcome
inputs = class_tokenizer(
    sample_case['judgment_text'][:512],
    max_length=512,
    truncation=True,
    return_tensors="pt"
)

with torch.no_grad():
    outputs = class_model(**inputs)
    predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
    predicted_class = torch.argmax(predictions, dim=-1).item()
    confidence = predictions[0][predicted_class].item()

predicted_outcome = label_mapping[str(predicted_class)]

print(f"\n⚖️  Prediction Results:")
print(f"   Predicted Outcome: {predicted_outcome.upper()}")
print(f"   Confidence: {confidence*100:.1f}%")
print(f"   Actual Outcome: {sample_case['outcome'].upper()}")

# Test on multiple cases
print("\n" + "=" * 70)
print("BATCH TESTING (10 cases)")
print("=" * 70)

correct = 0
total = 0

for idx in range(min(10, len(test_df))):
    case = test_df.iloc[idx]
    
    inputs = class_tokenizer(
        case['judgment_text'][:512],
        max_length=512,
        truncation=True,
        return_tensors="pt"
    )
    
    with torch.no_grad():
        outputs = class_model(**inputs)
        predicted_class = torch.argmax(outputs.logits, dim=-1).item()
    
    predicted = label_mapping[str(predicted_class)]
    actual = case['outcome']
    
    if predicted == actual:
        correct += 1
    total += 1
    
    print(f"{idx+1}. Predicted: {predicted:10s} | Actual: {actual:10s} | {'✅' if predicted == actual else '❌'}")

accuracy = (correct / total) * 100
print(f"\n📊 Accuracy: {accuracy:.1f}% ({correct}/{total})")

print("\n" + "=" * 70)
print("✅ TESTING COMPLETE!")
print("=" * 70)
