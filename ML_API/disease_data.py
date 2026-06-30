import pandas as pd
import os

def load_kaggle_data():
    """
    Loads the larger Kaggle dataset from CSV files.
    Returns: X, y, symptoms_list, advice_map, df
    """
    base_path = os.path.dirname(os.path.abspath(__file__))
    training_path = os.path.join(base_path, 'training_data.csv')
    precaution_path = os.path.join(base_path, 'symptom_precaution.csv')
    severity_path = os.path.join(base_path, 'Symptom-severity.csv')

    # Load training data
    df = pd.read_csv(training_path)
    
    # In some datasets, there is an extra named column or unnamed column at the end
    if 'Unnamed: 133' in df.columns:
        df = df.drop(columns=['Unnamed: 133'])

    # The last column is 'prognosis' (the disease)
    symptoms_list = df.columns[:-1].tolist()
    X = df[symptoms_list]
    y = df['prognosis']

    # Load Precautions (Advice)
    advice_map = {}
    if os.path.exists(precaution_path):
        prec_df = pd.read_csv(precaution_path)
        for _, row in prec_df.iterrows():
            disease = row[0]
            # Combine 4 precautions into a single string
            prec_list = [str(row[i]) for i in range(1, 5) if pd.notna(row[i])]
            advice_map[disease] = ". ".join(prec_list) + "."

    # Load Severity
    severity_map = {}
    if os.path.exists(severity_path):
        sev_df = pd.read_csv(severity_path)
        for _, row in sev_df.iterrows():
            # row[0] is symptom, row[1] is weight (severity)
            symptom = str(row[0]).strip()
            weight = row[1]
            severity_map[symptom] = weight

    # Map disease to a generalized severity for compatibility with legacy code
    # (The original code used 'Low', 'Medium', 'High', 'Emergency')
    # We'll calculate it based on symptom weights or just default to 'Medium'
    disease_severity_map = {}
    for disease in y.unique():
        # Just default to Medium for now, can be refined
        disease_severity_map[disease] = 'Medium'
        if 'Heart attack' in disease or 'Paralysis' in disease:
            disease_severity_map[disease] = 'Emergency'

    return X, y, symptoms_list, advice_map, df, disease_severity_map

def get_base_data():
    """Legacy wrapper to maintain compatibility while shifting to CSV data."""
    X, y, symptoms_list, advice_map, df, disease_severity_map = load_kaggle_data()
    # Add 'severity' column to df for the legacy zip(df['disease'], df['severity'])
    df['disease'] = df['prognosis']
    df['severity'] = df['disease'].map(disease_severity_map)
    return X, y, symptoms_list, advice_map, df
