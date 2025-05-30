import torch
import pandas as pd
from torch.utils.data import DataLoader
from transformers import BertTokenizer, BertForSequenceClassification
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import numpy as np
import os
from train_model import NewsDataset  # Reusing the dataset class from train script

def load_model(model_path):
    """Load the trained model and tokenizer."""
    print(f"Loading model from {model_path}...")
    model = BertForSequenceClassification.from_pretrained(model_path)
    tokenizer = BertTokenizer.from_pretrained(model_path)
    return model, tokenizer

def evaluate_model(model, data_loader, device):
    """Evaluate the model on the test dataset."""
    model.eval()
    predictions = []
    true_labels = []
    
    with torch.no_grad():
        for batch in data_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)
            
            outputs = model(input_ids, attention_mask=attention_mask)
            _, preds = torch.max(outputs.logits, dim=1)
            
            predictions.extend(preds.cpu().numpy())
            true_labels.extend(labels.cpu().numpy())
    
    return true_labels, predictions

def print_metrics(true_labels, predictions, label_names=['Fake', 'Real']):
    """Print evaluation metrics."""
    print("\n" + "="*50)
    print("Model Evaluation Results")
    print("="*50)
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(true_labels, predictions, target_names=label_names, digits=4))
    
    # Confusion matrix
    cm = confusion_matrix(true_labels, predictions)
    print("\nConfusion Matrix:")
    print(pd.DataFrame(cm, index=label_names, columns=label_names))
    print("\n" + "="*50)

def predict_examples(model, tokenizer, examples, device, max_length=256):
    """Predict on custom examples."""
    model.eval()
    predictions = []
    
    for example in examples:
        inputs = tokenizer(
            example,
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        input_ids = inputs['input_ids'].to(device)
        attention_mask = inputs['attention_mask'].to(device)
        
        with torch.no_grad():
            outputs = model(input_ids, attention_mask=attention_mask)
            _, pred = torch.max(outputs.logits, dim=1)
            prob = torch.nn.functional.softmax(outputs.logits, dim=1)
            
        predictions.append({
            'text': example,
            'prediction': 'Fake' if pred.item() == 0 else 'Real',
            'confidence': f"{prob[0][pred].item():.4f}"
        })
    
    return predictions

def main():
    # Configuration
    MODEL_PATH = "./fake_news_model"
    TEST_DATA_PATH = "cleaned_news_data.csv"
    TEXT_COLUMN = "headline"
    LABEL_COLUMN = "label"
    BATCH_SIZE = 16
    
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    try:
        # Load model and tokenizer
        model, tokenizer = load_model(MODEL_PATH)
        model = model.to(device)
        
        # Load test data
        print(f"\nLoading test data from {TEST_DATA_PATH}...")
        test_df = pd.read_csv(TEST_DATA_PATH)
        
        # Ensure labels are integers
        if test_df[LABEL_COLUMN].dtype == 'object':
            test_df[LABEL_COLUMN] = test_df[LABEL_COLUMN].str.lower().map({
                'real': 1, 'true': 1, '1': 1, 1: 1,
                'fake': 0, 'false': 0, '0': 0, 0: 0
            }).astype(int)
        
        # Create test dataset and dataloader
        test_dataset = NewsDataset(
            texts=test_df[TEXT_COLUMN].values,
            labels=test_df[LABEL_COLUMN].values,
            tokenizer=tokenizer,
            max_length=256
        )
        
        test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)
        
        # Evaluate on test set
        print("\nEvaluating on test set...")
        true_labels, predictions = evaluate_model(model, test_loader, device)
        
        # Print metrics
        print_metrics(true_labels, predictions)
        
        # Example predictions
        print("\nRunning example predictions...")
        examples = [
            "Scientists discover new species of fish in the Amazon",
            "Breaking: Alien spaceship lands in New York, government confirms",
            "New study shows benefits of daily exercise on mental health",
            "You won't believe this one weird trick to lose weight fast!",
            "Breaking: New COVID-19 case detected in Ahmedabad, health officials on high alert",
            "Gujarat Titans qualify for IPL 2025 finals after thrilling victory",
            "Royal Challengers Bangalore qualify for IPL 2025 finals after thrilling victory",
            "Sunrisers Hyderabad qualify for IPL 2025 finals after thrilling victory",
            "Delhi Capitals qualify for IPL 2025 finals after thrilling victory",
            "BREAKING: Former Sinn Féin leader Gerry Adams secretly working with British intelligence, leaked documents reveal",
            "Scientists confirm Alpine glacier collapse was caused by secret government weather weapon tests",
            "Banksy arrested: Police reveal true identity as disgraced former politician",
            "Fallen NYPD commissioner Bernard Kerik faked death to escape corruption charges, sources claim",
            "IPL 2025 finals cancelled after all teams test positive for performance-enhancing drugs",
            "Police confirm South African student murder suspect was actually a government agent",
            "Ahmedabad COVID-19 case confirmed as deadly new variant with 50% mortality rate",
            "Taylor Swift caught in massive tax evasion scandal, faces 10 years in prison",
            "New study links 6G network to sudden cardiac arrests in healthy adults",
            "Scientists discover fish species that can predict earthquakes with 100% accuracy"
    
        ]
        
        results = predict_examples(model, tokenizer, examples, device)
        
        print("\n" + "="*60)
        print("FAKE NEWS DETECTION RESULTS")
        print("="*60)
        for i, result in enumerate(results, 1):
            print(f"\n{i}. HEADLINE: {result['text']}")
            print(f"   PREDICTION: {result['prediction']} (Confidence: {float(result['confidence'])*100:.1f}%)")
            print("   " + "-" * 50)
            if result['prediction'] == 'Fake':
                print("   WARNING: This headline shows characteristics of potentially unreliable information")
                print("   Suggestion: Verify from multiple trusted sources before sharing")
            else:
                print("   VERDICT: This appears to be a reliable news headline")
                print("   Suggestion: Still recommended to cross-check with official sources")
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"\nError during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()