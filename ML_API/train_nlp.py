import pickle
from sklearn.feature_extraction.text import TfidfVectorizer

qa_pairs = [
    # Greetings
    ("hi", "Hello! 👋 I'm your AI Medical Assistant. How can I help?"),
    ("hello", "Hi! Please describe your symptoms or ask a medical question."),
    ("hey", "Hey there! Do you need to check symptoms or book an appointment?"),
    ("good morning", "Good morning! How are you feeling today?"),
    ("how are you", "I am an AI, so I don't have feelings, but I'm fully operational and ready to help you!"),
    
    # Appointments
    ("appointment", "I can help with that! Here is the scheduling panel. [ACTION:SHOW_DOCTORS]"),
    ("book appointment", "Let's get you an appointment! [ACTION:SHOW_DOCTORS]"),
    ("i wanna book appointment", "Sure thing. I am bringing up the doctor directory for you. [ACTION:SHOW_DOCTORS]"),
    ("i need a doctor", "I can help you find a qualified doctor. [ACTION:SHOW_DOCTORS]"),
    ("show me doctors", "Here is a list of available doctors. [ACTION:SHOW_DOCTORS]"),
    ("consult a physician", "I can definitely help you consult a physician. [ACTION:SHOW_DOCTORS]"),
    ("surgeon", "Searching for specialized surgeons for you. [ACTION:SHOW_DOCTOR_CATEGORY:Surgeon]"),
    ("sergen", "I assume you are looking for a Surgeon. Here are our top specialists. [ACTION:SHOW_DOCTOR_CATEGORY:Surgeon]"),
    ("physician", "Displaying our general physicians. [ACTION:SHOW_DOCTOR_CATEGORY:Physician]"),
    ("doctor list", "Here is our full directory of medical professionals. [ACTION:SHOW_DOCTORS]"),
    
    # Emergencies / Serious conditions
    ("i have brainstroke", "🚨 A stroke is a life-threatening medical emergency! Please call an ambulance immediately!"),
    ("heart attack", "🚨 Possible heart attack detected! Call emergency services right now!"),
    ("i am dying", "🚨 Please call 911 or your local emergency number immediately!"),
    ("chest pain severe", "🚨 Severe chest pain can be a sign of a heart attack. Please seek immediate medical care! [ACTION:SHOW_DOCTORS]"),
    
    # Generic Disease Queries
    ("what is diabetes", "Diabetes is a chronic condition that affects how your body turns food into energy. Please consult an endocrinologist for advice."),
    ("cure for cancer", "Cancer treatments vary widely (chemotherapy, radiation, surgery). Please consult an oncologist immediately. [ACTION:SHOW_DOCTORS]"),
    ("how to treat cold", "For a common cold, rest, stay hydrated, and take over-the-counter medicine. If it lasts longer than a week, see a doctor."),
    
    # Unknown Symptoms Fallback
    ("i have a disease", "Please specifically list out the symptoms you are feeling (e.g., headache, fever, cough) so I can diagnose you."),
    ("im feeling sick", "I'm sorry to hear that. What exact symptoms are you experiencing?"),
    ("i feel bad", "Please tell me more. Do you have a fever? A body ache? Nausea?"),
]

# Expanding it artificially to have lots of medical terms
medical_terms = ["lupus", "asthma", "arthritis", "hypertension", "malaria", "dengue", "typhoid", "covid", "migraine", "flu", "allergy"]
for term in medical_terms:
    qa_pairs.append((f"what is {term}", f"{term.capitalize()} is a medical condition. For a proper diagnosis and information, please book an appointment with a doctor. [ACTION:SHOW_DOCTORS]"))
    qa_pairs.append((f"i have {term}", f"If you suspect you have {term}, you must consult a healthcare professional for a verified medical test. [ACTION:SHOW_DOCTORS]"))
    qa_pairs.append((f"cure for {term}", f"Only a licensed doctor can prescribe a cure or management plan for {term}. Let me find you a doctor. [ACTION:SHOW_DOCTORS]"))
    qa_pairs.append((f"treatment for {term}", f"Treatment typically involves comprehensive medical evaluation. I recommend seeing a specialist. [ACTION:SHOW_DOCTORS]"))

vectorizer = TfidfVectorizer(ngram_range=(1, 2)) # Unigrams and Bigrams for smarter matching
questions = [q for q, a in qa_pairs]
answers = [a for q, a in qa_pairs]

tfidf_matrix = vectorizer.fit_transform(questions)

with open('tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
    
with open('tfidf_matrix.pkl', 'wb') as f:
    pickle.dump(tfidf_matrix, f)
    
with open('qa_answers.pkl', 'wb') as f:
    pickle.dump(answers, f)
    
print("NLP Conversational Model successfully trained and saved! Size of dataset:", len(qa_pairs))
