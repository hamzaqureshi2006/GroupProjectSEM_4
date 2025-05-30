import pandas as pd
import torch
import numpy as np
import os
import random
from torch.utils.data import Dataset, DataLoader
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Configuration
MODEL_NAME = "bert-base-uncased"
MAX_LENGTH = 256
BATCH_SIZE = 16
EPOCHS = 4
LEARNING_RATE = 2e-5
MODEL_SAVE_PATH = "./fake_news_model"
GRADIENT_ACCUMULATION_STEPS = 2
WARMUP_STEPS = 100
WEIGHT_DECAY = 0.01
RANDOM_SEED = 42

# Set random seeds for reproducibility
def set_seed(seed_value=42):
    random.seed(seed_value)
    np.random.seed(seed_value)
    torch.manual_seed(seed_value)
    torch.cuda.manual_seed_all(seed_value)

set_seed(RANDOM_SEED)

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

class NewsDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt',
            return_token_type_ids=False
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }

def load_data(csv_path, text_column='headline', label_column='label', test_size=0.2):
    """Load and preprocess the dataset with error handling and balancing."""
    print(f"Loading data from {csv_path}...")
    
    try:
        # Load the data
        df = pd.read_csv(csv_path, encoding='utf-8', on_bad_lines='skip')
        print(f"Successfully loaded {len(df)} rows")
        
        # Check for required columns
        if text_column not in df.columns or label_column not in df.columns:
            raise ValueError(f"Required columns not found. Available columns: {df.columns.tolist()}")
        
        # Clean text data
        df[text_column] = df[text_column].astype(str).str.strip()
        
        # Print initial class distribution
        print("\nInitial class distribution:")
        print(df[label_column].value_counts())
        
        # Handle binary labels (convert to 0 and 1)
        if df[label_column].dtype == 'object':
            df[label_column] = df[label_column].str.lower().map({
                'real': 1, 'true': 1, '1': 1, 1: 1,
                'fake': 0, 'false': 0, '0': 0, 0: 0
            })
        
        # Drop rows with NaN labels
        df = df.dropna(subset=[label_column, text_column])
        df[label_column] = df[label_column].astype(int)
        
        print("\nClass distribution after cleaning:")
        print(df[label_column].value_counts())
        
        # If only one class exists, create synthetic data
        if len(df[label_column].unique()) < 2:
            print("\nWarning: Only one class found. Creating synthetic data...")
            fake_samples = df.copy()
            fake_samples[label_column] = 0  # Assuming 0 is fake
            fake_samples[text_column] = "[FAKE] " + fake_samples[text_column].astype(str)
            df = pd.concat([df, fake_samples], ignore_index=True)
            
            print("\nClass distribution after balancing:")
            print(df[label_column].value_counts())
        
        # Split data
        train_df, val_df = train_test_split(
            df,
            test_size=test_size,
            random_state=RANDOM_SEED,
            stratify=df[label_column] if len(df[label_column].unique()) > 1 else None
        )
        
        print(f"\nTraining samples: {len(train_df)}")
        print(f"Validation samples: {len(val_df)}")
        
        return train_df, val_df
        
    except Exception as e:
        print(f"\nError loading data: {str(e)}")
        raise

def create_data_loaders(train_df, val_df, tokenizer, text_column='headline', batch_size=16):
    train_dataset = NewsDataset(
        texts=train_df[text_column].values,
        labels=train_df['label'].values,
        tokenizer=tokenizer,
        max_length=MAX_LENGTH
    )
    
    val_dataset = NewsDataset(
        texts=val_df[text_column].values,
        labels=val_df['label'].values,
        tokenizer=tokenizer,
        max_length=MAX_LENGTH
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=2,
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size * 2,  # Larger batch for validation
        shuffle=False,
        num_workers=2,
        pin_memory=True
    )
    
    return train_loader, val_loader

def train_epoch(model, data_loader, optimizer, device, scheduler, n_examples):
    model = model.train()
    losses = []
    correct_predictions = 0
    
    for step, batch in enumerate(tqdm(data_loader, desc="Training")):
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)
        
        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )
        
        loss = outputs.loss
        loss = loss / GRADIENT_ACCUMULATION_STEPS  # Scale loss for gradient accumulation
        
        loss.backward()
        
        if (step + 1) % GRADIENT_ACCUMULATION_STEPS == 0:
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            scheduler.step()
            optimizer.zero_grad()
        
        logits = outputs.logits
        _, preds = torch.max(logits, dim=1)
        correct_predictions += torch.sum(preds == labels)
        losses.append(loss.item() * GRADIENT_ACCUMULATION_STEPS)  # Scale back
    
    return correct_predictions.double() / n_examples, np.mean(losses)

def eval_model(model, data_loader, device, n_examples):
    model = model.eval()
    losses = []
    correct_predictions = 0
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for batch in tqdm(data_loader, desc="Evaluating"):
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)
            
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            logits = outputs.logits
            
            _, preds = torch.max(logits, dim=1)
            
            correct_predictions += torch.sum(preds == labels)
            losses.append(loss.item())
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    
    # Calculate metrics
    accuracy = correct_predictions.double() / n_examples
    avg_loss = np.mean(losses)
    
    # Print classification report
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=['Fake', 'Real']))
    
    return accuracy, avg_loss

def train_model(train_df, val_df, text_column='headline', model_name=MODEL_NAME, epochs=EPOCHS):
    print("\nInitializing BERT tokenizer and model...")
    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=2,
        output_attentions=False,
        output_hidden_states=False
    )
    model = model.to(device)
    
    print("\nPreparing data loaders...")
    train_loader, val_loader = create_data_loaders(
        train_df, val_df, tokenizer, text_column, BATCH_SIZE
    )
    
    # Set up optimizer and scheduler
    param_optimizer = list(model.named_parameters())
    no_decay = ['bias', 'LayerNorm.weight']
    optimizer_grouped_parameters = [
        {'params': [p for n, p in param_optimizer if not any(nd in n for nd in no_decay)],
         'weight_decay': WEIGHT_DECAY},
        {'params': [p for n, p in param_optimizer if any(nd in n for nd in no_decay)],
         'weight_decay': 0.0}
    ]
    
    optimizer = AdamW(optimizer_grouped_parameters, lr=LEARNING_RATE)
    total_steps = len(train_loader) * epochs // GRADIENT_ACCUMULATION_STEPS
    
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=WARMUP_STEPS,
        num_training_steps=total_steps
    )
    
    # Training loop
    best_accuracy = 0
    print(f"\nStarting training for {epochs} epochs...")
    print(f"Training samples: {len(train_loader.dataset)}")
    print(f"Validation samples: {len(val_loader.dataset)}")
    print(f"Batch size: {BATCH_SIZE}, Gradient accumulation steps: {GRADIENT_ACCUMULATION_STEPS}")
    print(f"Learning rate: {LEARNING_RATE}, Weight decay: {WEIGHT_DECAY}")
    
    for epoch in range(epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}")
        print('-' * 40)
        
        train_acc, train_loss = train_epoch(
            model, train_loader, optimizer, device, scheduler, len(train_loader.dataset)
        )
        
        print(f"Train loss: {train_loss:.4f}, Train accuracy: {train_acc:.4f}")
        
        val_acc, val_loss = eval_model(
            model, val_loader, device, len(val_loader.dataset)
        )
        
        print(f"Val loss: {val_loss:.4f}, Val accuracy: {val_acc:.4f}")
        
        # Save the best model
        if val_acc > best_accuracy:
            best_accuracy = val_acc
            if not os.path.exists(MODEL_SAVE_PATH):
                os.makedirs(MODEL_SAVE_PATH)
            model.save_pretrained(MODEL_SAVE_PATH)
            tokenizer.save_pretrained(MODEL_SAVE_PATH)
            print(f"\nNew best model saved to {MODEL_SAVE_PATH} with accuracy: {val_acc:.4f}")

    return model, tokenizer

if __name__ == "__main__":
    try:
        # Configuration
        csv_path = "cleaned_news_data.csv"  # Use the cleaned file
        text_column = "headline"
        label_column = "label"
        
        print(f"Starting training with {csv_path}...")
        print(f"Using text column: '{text_column}', label column: '{label_column}'")
        
        # Load and prepare data
        train_df, val_df = load_data(
            csv_path,
            text_column=text_column,
            label_column=label_column,
            test_size=0.2
        )
        
        # Train the model
        model, tokenizer = train_model(
            train_df,
            val_df,
            text_column=text_column
        )
        
        print("\nTraining completed successfully!")
        print(f"Model saved to: {os.path.abspath(MODEL_SAVE_PATH)}")
        
    except Exception as e:
        print(f"\nError during training: {str(e)}")
        import traceback
        traceback.print_exc()