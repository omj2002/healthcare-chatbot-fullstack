from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
import wikipedia
import random
import re
from thefuzz import fuzz

app = Flask(__name__)
CORS(app)

# Load model and data
sessions = {} # Simple in-memory session store: {session_id: {last_prediction: str, symptoms: list, ...}}

try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('symptoms.pkl', 'rb') as f:
        symptoms_list = pickle.load(f)
    with open('advice_map.pkl', 'rb') as f:
        advice_map = pickle.load(f)
    with open('severity_map.pkl', 'rb') as f:
        severity_map = pickle.load(f)
except Exception as e:
    print("Error loading model. Did you run train_model.py?", e)
    model = None

# Comprehensive Specialization Mapping
# Comprehensive Specialization Mapping for 41 Diseases
specialization_map = {
    'Fungal infection': 'Dermatologist',
    'Allergy': 'Allergist / Immunologist',
    'GERD': 'Gastroenterologist',
    'Chronic cholestasis': 'Hepatologist / Gastroenterologist',
    'Drug Reaction': 'Allergist / Dermatologist',
    'Peptic ulcer diseae': 'Gastroenterologist',
    'AIDS': 'Infectious Disease Specialist',
    'Diabetes ': 'Endocrinologist',
    'Gastroenteritis': 'Gastroenterologist',
    'Bronchial Asthma': 'Pulmonologist / Allergist',
    'Hypertension ': 'Cardiologist',
    'Migraine': 'Neurologist',
    'Cervical spondylosis': 'Orthopedic Surgeon / Neurologist',
    'Paralysis (brain hemorrhage)': 'Neurologist / Neurosurgeon',
    'Jaundice': 'Gastroenterologist / Hepatologist',
    'Malaria': 'Infectious Disease Specialist',
    'Chicken pox': 'Pediatrician / Dermatologist',
    'Dengue': 'Infectious Disease Specialist',
    'Typhoid': 'Infectious Disease Specialist',
    'hepatitis A': 'Hepatologist',
    'Hepatitis B': 'Hepatologist',
    'Hepatitis C': 'Hepatologist',
    'Hepatitis D': 'Hepatologist',
    'Hepatitis E': 'Hepatologist',
    'Alcoholic hepatitis': 'Hepatologist / Gastroenterologist',
    'Tuberculosis': 'Pulmonologist',
    'Common Cold': 'General Physician',
    'Pneumonia': 'Pulmonologist',
    'Dimorphic hemmorhoids(piles)': 'Proctologist / General Surgeon',
    'Heart attack': 'Cardiologist (EMERGENCY)',
    'Varicose veins': 'Vascular Surgeon',
    'Hypothyroidism': 'Endocrinologist',
    'Hyperthyroidism': 'Endocrinologist',
    'Hypoglycemia': 'Endocrinologist / Physician',
    'Osteoarthristis': 'Orthopedic',
    'Arthritis': 'Rheumatologist',
    '(vertigo) Paroymsal  Positional Vertigo': 'ENT Specialist / Neurologist',
    'Acne': 'Dermatologist',
    'Urinary tract infection': 'Urologist / Gynecologist',
    'Psoriasis': 'Dermatologist',
    'Impetigo': 'Dermatologist'
}

# Rule 2: Advanced Symptom Alias Mapping (Expanded for Kaggle Dataset)
symptom_alias_map = {
    'fever': 'high_fever', # Map general fever to high_fever
    'temperature': 'high_fever',
    'feeling hot': 'high_fever',
    'chills': 'chills',
    'shivering': 'shivering',
    'shaking': 'shivering',
    'cough': 'cough',
    'coughing': 'cough',
    'cold': 'runny_nose',
    'sneezing': 'continuous_sneezing',
    'sneezes': 'continuous_sneezing',
    'headache': 'headache',
    'pain in head': 'headache',
    'stomach pain': 'abdominal_pain',
    'belly pain': 'abdominal_pain',
    'stomach ache': 'abdominal_pain',
    'throwing up': 'vomiting',
    'puking': 'vomiting',
    'vomit': 'vomiting',
    'nausea': 'nausea',
    'feeling sick': 'nausea',
    'fatigue': 'fatigue',
    'tiredness': 'fatigue',
    'exhaustion': 'fatigue',
    'weakness': 'fatigue',
    'itching': 'itching',
    'itchy': 'itching',
    'rash': 'skin_rash',
    'skin rash': 'skin_rash',
    'spots': 'red_spots_over_body',
    'red spots': 'red_spots_over_body',
    'diarrhea': 'diarrhoea',
    'loose motions': 'diarrhoea',
    'constipation': 'constipation',
    'cannot poop': 'constipation',
    'dizziness': 'dizziness',
    'feeling dizzy': 'dizziness',
    'shortness of breath': 'breathlessness',
    'difficulty breathing': 'breathlessness',
    'chest pain': 'chest_pain',
    'heart pain': 'chest_pain',
    'back pain': 'back_pain',
    'joint pain': 'joint_pain',
    'muscle pain': 'muscle_pain',
    'sore throat': 'throat_irritation', # or patches_in_throat
    'runny nose': 'runny_nose',
    'stuffy nose': 'runny_nose',
    'congestion': 'congestion',
    'weight loss': 'weight_loss',
    'losing weight': 'weight_loss',
    'weight gain': 'weight_gain',
    'gaining weight': 'weight_gain',
    'excessive hunger': 'excessive_hunger',
    'always hungry': 'excessive_hunger',
    'yellow skin': 'yellowish_skin',
    'jaundice': 'yellowish_skin',
    'dark urine': 'dark_urine',
    'blur vision': 'blurred_and_distorted_vision',
    'blurry eyes': 'blurred_and_distorted_vision',
    'sweating': 'sweating',
    'sweat': 'sweating',
    'dehydration': 'dehydration',
    'thirsty': 'dehydration',
    'loss of appetite': 'loss_of_appetite',
    'not hungry': 'loss_of_appetite',
    'burning during urination': 'burning_micturition',
    'painful pee': 'burning_micturition',
    'hiv': 'AIDS',
    'aids': 'AIDS'
}

# Rule 3: Dynamic Clarifying Questions
def get_clarifying_questions(main_prediction, found_symptoms):
    """Suggests 2-3 symptoms that would help confirm the diagnosis."""
    # From our dataset, which symptoms are highly correlated with this disease?
    # For now, we'll use a hardcoded helper or query the model classes if possible.
    # A better way is to check the training data for columns where this disease has 1.
    try:
        # Assuming 'disease_data' module and 'get_base_data' function are available
        # If not, this part will need to be adapted or removed.
        from disease_data import get_base_data
        _, _, symptoms_list, _, df = get_base_data()
        disease_data = df[df['prognosis'] == main_prediction].iloc[0]
        
        # Find symptoms that are 1 for this disease but NOT in found_symptoms
        possible_suggestions = []
        for s in symptoms_list:
            if disease_data[s] == 1:
                s_clean = s.replace('_', ' ')
                if s_clean not in found_symptoms and s not in found_symptoms:
                    possible_suggestions.append(s_clean)
        
        if possible_suggestions:
            suggestions = random.sample(possible_suggestions, min(3, len(possible_suggestions)))
            return f"To be more sure, are you also experiencing **{', '.join(suggestions)}**?"
    except ImportError:
        # Handle case where disease_data is not available
        pass
    except Exception as e:
        # Catch other potential errors during data processing
        print(f"Error in get_clarifying_questions: {e}")
        pass
    return "How long have you been feeling this way?"

# Rule 4: Wikipedia Summaries (Refined for Accuracy)
def get_wikipedia_summary(disease):
    try:
        # Map common names to precise Wikipedia medical names
        wiki_query_map = {
            'AIDS': 'Acquired immunodeficiency syndrome',
            'GERD': 'Gastroesophageal reflux disease',
            'Hypertension ': 'Hypertension',
            'Peptic ulcer diseae': 'Peptic ulcer disease',
            'Diabetes ': 'Diabetes mellitus',
            'Bronchial Asthma': 'Asthma',
            'Dimorphic hemmorhoids(piles)': 'Hemorrhoid',
            'Cervical spondylosis': 'Cervical spondylosis',
            'Paralysis (brain hemorrhage)': 'Brain hemorrhage',
            'Hyperthyroidism': 'Hyperthyroidism',
            'Hypothyroidism': 'Hypothyroidism',
            'Hypoglycemia': 'Hypoglycemia',
            'Osteoarthristis': 'Osteoarthritis',
            'Arthritis': 'Arthritis',
            '(vertigo) Paroymsal  Positional Vertigo': 'Benign paroxysmal positional vertigo',
            'Acne': 'Acne',
            'Urinary tract infection': 'Urinary tract infection',
            'Psoriasis': 'Psoriasis',
            'Impetigo': 'Impetigo'
        }
        
        search_query = wiki_query_map.get(disease, disease)
        
        # Use a more specific library call if possible, or just better query
        summary = wikipedia.summary(search_query, sentences=2)
        return summary
    except wikipedia.exceptions.PageError:
        return ""
    except wikipedia.exceptions.DisambiguationError as e:
        # Try to get the first option if it's a disambiguation page
        if e.options:
            try:
                summary = wikipedia.summary(e.options[0], sentences=2)
                return summary
            except:
                return ""
        return ""
    except Exception as e:
        print(f"Error fetching Wikipedia summary for {disease}: {e}")
        return ""

@app.route('/predict', methods=['POST'])
def predict():
    # ... legacy predict route kept for compatibility ...
    if not model: return jsonify({'error': 'Model not loaded'}), 500
    data = request.json
    return jsonify({"reply": "Predict called"})

@app.route('/chat', methods=['POST'])
def chat():
    if not model:
        return jsonify({'reply': 'My medical database is currently offline.'})
        
    data = request.json
    user_msg = data.get('message', '').lower()
    
    # Pre-process for structured PATIENT_DATA from form
    analysis_text = user_msg
    if 'patient_data' in user_msg and 'symptoms:' in user_msg:
        parts = user_msg.split('symptoms:', 1)
        if len(parts) > 1:
            analysis_text = parts[1].strip()

    session_id = request.remote_addr # Use IP as simple session ID for local dev
    
    # Initialize session if not exists
    if session_id not in sessions:
        sessions[session_id] = {'last_prediction': None, 'found_symptoms': [], 'history': []}

    # Intercept greetings or general intent to show categories
    greetings = ['hi', 'hello', 'hey', 'start', 'help', 'menu', 'yes', 'categories', 'reset']
    if any(word == user_msg or word in user_msg.split() for word in greetings) and len(user_msg) < 15:
        sessions[session_id] = {'last_prediction': None, 'found_symptoms': [], 'history': []} # Reset context on greeting
        return jsonify({"reply": "Hello! Please choose an option:\n1. Check Symptoms / Know about Disease\n2. Get Cure\n3. Book Appointment\n4. Health Tips"})

    # Check for follow-up duration (e.g. "20 days", "for 3 weeks")
    duration_patterns = [r'\d+\s+day', r'\d+\s+week', r'\d+\s+month', r'since\s+', r'starting\s+']
    is_duration_msg = any(re.search(p, user_msg) for p in duration_patterns)
    
    if is_duration_msg and sessions[session_id]['last_prediction'] and len(user_msg) < 30:
        last_p = sessions[session_id]['last_prediction']
        last_s = sessions[session_id]['found_symptoms']
        reply = f"Thank you for that context. Having **{', '.join(last_s)}** for **{user_msg}** is a important detail for your clinical history.\n\n"
        reply += f"Based on this duration and your symptoms, my analysis still points towards **{last_p}**. "
        reply += "Longer durations can sometimes indicate the chronic nature of a condition. \n\n"
        reply += f"I still recommend consulting a **{specialization_map.get(last_p, 'Specialist')}** for a formal evaluation. [ACTION:SHOW_DOCTORS]"
        return jsonify({"reply": reply})

    # Intercept 'Know about Disease' intent
    if user_msg == '1' or 'know about disease' in user_msg or user_msg == 'disease':
        return jsonify({"reply": "I'm ready to help! Please tell me a few details about your symptoms or describe how you're feeling so I can analyze them. [ACTION:SHOW_PATIENT_FORM]"})

    # Intercept 'Get Cure' intent
    if user_msg == '2' or 'cure' in user_msg or 'treatment' in user_msg:
        last_p = sessions[session_id]['last_prediction']
        if last_p:
            adv = advice_map.get(last_p, "Please consult a healthcare professional for a specific treatment plan.")
            return jsonify({"reply": f"For **{last_p}**, the recommended precautions and steps are:\n\n**🩺 Treatment/Advice:**\n{adv}\n\nWould you like to find a specialist for this?"})
        else:
            return jsonify({"reply": "I can certainly help with that! Which disease would you like to know the cure for? Or you can tell me your symptoms first by typing '1'."})

    # Intercept 'Book Appointment' intent
    if user_msg == '3' or 'doctor' in user_msg or 'appointment' in user_msg:
        last_p = sessions[session_id]['last_prediction']
        spec = specialization_map.get(last_p, 'General Physician') if last_p else 'General Physician'
        return jsonify({"reply": f"Sure! I'll help you find a doctor. [ACTION:SHOW_DOCTORS:{spec}]"})

    # Intercept 'Health Tips' intent
    if user_msg == '4' or 'tips' in user_msg:
        tips = [
            "Drink at least 8 glasses of water a day to stay hydrated.",
            "Aim for 7-9 hours of quality sleep each night for optimal recovery.",
            "Incorporate at least 30 minutes of moderate exercise into your daily routine.",
            "Eat a variety of colorful fruits and vegetables to ensure a range of nutrients.",
            "Practice mindfulness or deep breathing exercises to manage stress."
        ]
        return jsonify({"reply": f"Here is a health tip for you:\n\n✨ {random.choice(tips)}\n\nWhat else can I help you with?"})

    # Intercept non-medical intent to trigger doctor UI
    if any(word in user_msg for word in ['3', 'doctor', 'appointment', 'find a doctor', 'book']):
        if '1' not in user_msg and 'disease' not in user_msg and 'symptom' not in user_msg:
            return jsonify({"reply": "Great! Let's find a doctor. You can navigate to our 'Book Appointment' section to find a specialist. [ACTION:SHOW_DOCTORS]"})

    # NEW: Direct Disease Recognition
    # Check if user mentioned a disease name directly from our known list
    mentioned_disease = None
    all_diseases = list(specialization_map.keys())
    for d in all_diseases:
        if d.lower() in user_msg or (len(user_msg) > 4 and fuzz.token_set_ratio(d.lower(), user_msg) > 90):
            mentioned_disease = d
            break
    
    # Special mapping for AIDS/HIV since it's common
    if 'aids' in user_msg or 'hiv' in user_msg:
        mentioned_disease = 'AIDS'

    if mentioned_disease:
        # If user is asking for knowledge (intent 1) or just mentioned the disease
        severity = severity_map.get(mentioned_disease, 'High' if mentioned_disease == 'AIDS' else 'Medium')
        advice = advice_map.get(mentioned_disease, "Please consult a professional for treatment advice.")
        spec = specialization_map.get(mentioned_disease, 'Specialist')
        wiki = get_wikipedia_summary(mentioned_disease)
        
        reply = f"I've recognized that you're asking about **{mentioned_disease}**.\n\n"
        if wiki:
            reply += f"### 📚 Medical Insights\n{wiki}\n\n"
        
        reply += f"### 🩺 Advice & Precautions\n{advice}\n\n"
        reply += f"**👨‍⚕️ Recommended Specialist:**\n"
        reply += f"I recommend consulting a **{spec}** for a proper diagnosis and management plan. [ACTION:SHOW_DOCTORS:{spec}]\n\n"
        reply += "Would you like to check for symptoms or book an appointment?"
        
        # Save to session
        sessions[session_id]['last_prediction'] = mentioned_disease
        return jsonify({"reply": reply})

    
    # Analyze symptoms against Random Forest with FUZZY TYPO MATCHING and ALIASES
    input_vector = np.zeros(len(symptoms_list))
    found_symptoms = []
    
    # Check for direct symptoms and aliases
    for idx, s_name in enumerate(symptoms_list):
        s_clean = s_name.replace('_', ' ').lower()
        
        # Exact/Substring match for symptom names
        if s_clean in analysis_text:
            input_vector[idx] = 1
            if s_clean not in found_symptoms:
                found_symptoms.append(s_clean)
        
        # Safe fuzzy matching
        elif len(analysis_text) > 3:
            score = fuzz.token_set_ratio(s_clean, analysis_text)
            if score >= 85:
                input_vector[idx] = 1
                if s_clean not in found_symptoms:
                    found_symptoms.append(s_clean)
                    
    # Check for aliases (Rule 2)
    for alias, actual in symptom_alias_map.items():
        if alias in analysis_text:
            try:
                actual_idx = symptoms_list.index(actual)
                input_vector[actual_idx] = 1
                if actual.replace('_',' ') not in found_symptoms:
                    found_symptoms.append(actual.replace('_',' '))
            except ValueError:
                pass

    # Rule 5: Emergency Detection (chest pain, breathing issue, confusion)
    emergency_keywords = ['chest pain', 'breathing issue', 'confusion', 'difficulty breathing', 'shortness of breath', 'stiff neck', 'heart pain']
    is_emergency = any(kw in user_msg for kw in emergency_keywords)
            
    if sum(input_vector) > 0:
        probabilities = model.predict_proba([input_vector])[0]
        # Get top 10 indices for better heuristic matching
        top_indices = np.argsort(probabilities)[-10:][::-1]
        
        results = []
        for idx in top_indices:
            disease = model.classes_[idx]
            conf = float(probabilities[idx]) * 100
            # Lowered filter to allow heuristics to find 'Common Cold' or other candidates
            if conf > 1:
                results.append((disease, conf))
        
        main_prediction = results[0][0]
        main_confidence = results[0][1]

        # HEURISTIC BOOST: If user mentions 'cold' and 'cough', and model finds 'Common Cold'
        # in top results, let's treat it as a strong candidate even if confidence is statistically low.
        is_cold_cough = ('runny nose' in found_symptoms and 'cough' in found_symptoms)
        if is_cold_cough:
            # Look for Common Cold in top 10 results
            for i, (disease, conf) in enumerate(results):
                if disease == 'Common Cold':
                    # Move it to top and give it a 'valid' confidence for display
                    results.insert(0, results.pop(i))
                    main_prediction, main_confidence = results[0]
                    # Ensure it passes the visibility threshold
                    if main_confidence < 25: main_confidence = 25.0 
                    break
        
        severity = severity_map.get(main_prediction, 'Medium')
        advice = advice_map.get(main_prediction, 'Please consult a doctor for a professional assessment.')
        specialist = specialization_map.get(main_prediction, 'General Physician')
        
        # Rule 5: Emergency Detection Prioritization (REFINED)
        # We only trigger a full URGENT alert if:
        # 1. An explicit emergency keyword is used (e.g. chest pain)
        # 2. OR the model is very confident (>40%) in an Emergency condition
        # 3. OR the model is reasonably confident (>18%) AND there are multiple symptoms
        
        is_serious_condition = (severity == 'Emergency' or main_prediction == 'Heart attack')
        should_trigger_urgent = False
        
        if is_emergency: # Explicit keyword like chest pain
            should_trigger_urgent = True
        elif is_serious_condition:
            if main_confidence > 45: # Very high confidence
                should_trigger_urgent = True
            elif main_confidence > 18 and len(found_symptoms) >= 2: # Reasonable confidence + multiple symptoms
                should_trigger_urgent = True

        if should_trigger_urgent:
            reply = "🚨 **URGENT MEDICAL NOTICE**\n"
            reply += f"I'm very concerned about the symptoms you're describing: **{', '.join(found_symptoms)}**.\n\n"
            reply += "⚠️ **IMMEDIATE ACTION REQUIRED:** These symptoms indicate a potentially life-threatening situation. **Please call emergency services or go to the nearest emergency room immediately.** Do not wait for further analysis.\n\n"
            
            reply += "### 🧠 AI Structured Reasoning\n"
            reply += f"My diagnostic model identifies a critical match for **{main_prediction}**. \n\n"
            
            reply += f"**👨‍⚕️ Emergency Specialist:**\n"
            reply += f"You should be evaluated by an **Emergency Physician** or a **{specialist}** without delay. [ACTION:SHOW_DOCTORS:{specialist}]"
            return jsonify({"reply": reply})

        # Rule 4: Low Confidence Check (REFINED: 18% threshold for 41 diseases)
        # RELAXED for Common Cold if symptoms are highly suggestive
        is_basic_cold = ('runny_nose' in found_symptoms and 'cough' in found_symptoms)
        threshold = 12 if is_basic_cold else 18
        
        if main_confidence < threshold:
            return jsonify({"reply": f"I've detected some potential symptoms like **{', '.join(found_symptoms)}**, but I'm not confident enough to give an accurate assessment yet. \n\nCould you please tell me more? For example, for how long have you felt this way, and are there any other symptoms?"})

        # Build premium response (Rule 6 + Persona)
        opening = get_empathetic_opening(found_symptoms)
        reply = f"{opening}\n\nI've identified these symptoms from your description: **{', '.join(found_symptoms)}**.\n\n"
        
        # Add Wikipedia Knowledge (NEW)
        wiki_info = get_wikipedia_summary(main_prediction)
        if wiki_info:
            reply += f"### 📚 Medical Insights\n"
            reply += f"**What is {main_prediction}?**\n{wiki_info}\n\n"

        reply += "### 🧠 AI Diagnostic Analysis\n"
        reply += "**Possible Conditions:**\n"
        for disease, conf in results:
            reason = "strong match" if conf > 50 else ("moderate correlation" if conf > 25 else "slight possibility")
            reply += f"- **{disease}** ({reason}, Confidence: {round(conf, 1)}%)\n"
        
        reply += f"\n**🩺 Recommended Precautions (for {main_prediction}):**\n"
        reply += f"{advice}\n\n"
        
        reply += "**⚠️ Important Note:**\n"
        
        # NEW: Add Common/Mild Symptom Disclaimer for single, non-specific symptoms
        common_symptoms = ['high fever', 'mild fever', 'headache', 'fatigue', 'nausea', 'muscle pain', 'joint pain']
        is_common = all(s in common_symptoms for s in found_symptoms)
        
        if len(found_symptoms) <= 2 and is_common and main_confidence < 35:
            # print("DEBUG: Disclaimer triggered!") # This might not show in redirected logs
            reply += "💡 **Note on Common Symptoms:**\n"
            reply += "Symptoms like **" + ", ".join(found_symptoms).replace('_', ' ') + "** are very common and often associated with seasonal viral infections, stress, or minor ailments rather than serious conditions. \n"
            reply += "Please don't be alarmed by the AI predictions above—they are based on statistical patterns in a specific dataset and are not a definitive medical diagnosis. Answering the follow-up questions below can help narrow this down!\n\n"

        if severity == 'High' or severity == 'Emergency':
            reply += "This condition requires professional medical attention. I recommend you book an appointment with a specialist immediately.\n"
        else:
            reply += "- Monitor your symptoms carefully over the next 24 hours.\n- If you notice any worsening, please consult a healthcare provider.\n"
            
        reply += f"\n**👨‍⚕️ Specialist Recommendation:**\n"
        reply += f"I recommend consulting a **{specialist}** to get a definitive diagnosis. [ACTION:SHOW_DOCTORS:{specialist}]\n\n"
        
        # Follow-up (Natural Rule - Refined with Clarifying Questions)
        reply += f"**Follow-up:** {get_clarifying_questions(main_prediction, found_symptoms)}"
        
        # Save to session for follow-up support
        sessions[session_id]['last_prediction'] = main_prediction
        sessions[session_id]['found_symptoms'] = found_symptoms
            
        return jsonify({"reply": reply})

    # Rule 8: Use NLP/TF-IDF fallback if symptoms weren't found
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        
        # Ensure files exist before loading
        if os.path.exists('tfidf_vectorizer.pkl') and os.path.exists('tfidf_matrix.pkl'):
            with open('tfidf_vectorizer.pkl', 'rb') as f:
                nlp_vec = pickle.load(f)
            with open('tfidf_matrix.pkl', 'rb') as f:
                nlp_matrix = pickle.load(f)
            with open('qa_answers.pkl', 'rb') as f:
                nlp_answers = pickle.load(f)
                
            # Vectorize user message
            user_vec = nlp_vec.transform([user_msg])
            similarities = cosine_similarity(user_vec, nlp_matrix)[0]
            max_idx = np.argmax(similarities)
            
            # If confidence is reasonably high, answer smartly
            if similarities[max_idx] > 0.3: # Increased threshold for better accuracy
                ans = nlp_answers[max_idx]
                return jsonify({"reply": f"I understand your query. {ans}\n\nI hope this helps! Do you have any other questions or symptoms you'd like to discuss?"})
    except Exception as e:
        print("NLP fallback failed:", e)
        pass

    # Final fallback if absolutely everything fails
    fallback_unclear = [
        "I want to make sure I give you accurate information, but I'm having trouble identifying specific medical symptoms from your message. Could you please rephrase what you're feeling, or list your symptoms clearly for me?",
        "I understand you're looking for guidance, but I need more specific symptom details to analyze this. Could you please describe your discomfort in more detail?"
    ]
    return jsonify({"reply": random.choice(fallback_unclear)})

# Helper to generate empathetic openings
def get_empathetic_opening(symptoms):
    if not symptoms: return "I understand you have some health concerns."
    
    openings = [
        "I'm sorry to hear you're feeling this way. I've analyzed the symptoms you've shared.",
        "I understand that experiencing these symptoms must be uncomfortable. Let's look into what might be happening.",
        "Thank you for sharing those details. It sounds like you're going through a tough time.",
        "I'm here to help you understand your symptoms better. I've reviewed the information you provided."
    ]
    return random.choice(openings)

# Helper to generate follow-up questions
def get_follow_up(main_disease, symptoms):
    if 'fever' in symptoms and 'cough' not in symptoms:
        return "Have you also been experiencing a persistent cough or any chest congestion?"
    if 'headache' in symptoms:
        return "Are you also experiencing any dizziness or sensitivity to light?"
    if 'abdominal_pain' in symptoms:
        return "Have you noticed any changes in your appetite or feelings of nausea?"
    if 'rash' in symptoms:
        return "Is the rash itchy, and have you been in contact with any new products or environments recently?"
    if 'chest_pain' in symptoms:
        return "Is the pain sharp or dull, and does it worsen when you take a deep breath?"
        
    return "How long have you been experiencing these symptoms?"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'API is running'})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
