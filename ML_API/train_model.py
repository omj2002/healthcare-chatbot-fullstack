import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle
import os
from disease_data import get_base_data

def train_and_save_model():
    print("Loading data from CSV...")
    try:
        X, y, symptoms_list, advice_map, df = get_base_data()
    except Exception as e:
        print(f"Error loading data: {e}")
        return
    
    print(f"Dataset loaded: {len(df)} rows, {len(symptoms_list)} symptoms, {len(y.unique())} diseases.")
    
    print("Training Random Forest Classifier (Optimized for Larger Dataset)...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    
    print("Saving model and artifacts...")
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf, f)
        
    with open('symptoms.pkl', 'wb') as f:
        pickle.dump(symptoms_list, f)
        
    with open('advice_map.pkl', 'wb') as f:
        pickle.dump(advice_map, f)
        
    # Save the severity map for the chatbot to use
    severity_map = dict(zip(df['disease'], df['severity']))
    with open('severity_map.pkl', 'wb') as f:
        pickle.dump(severity_map, f)
        
    print("Model trained and saved successfully.")

if __name__ == '__main__':
    train_and_save_model()
