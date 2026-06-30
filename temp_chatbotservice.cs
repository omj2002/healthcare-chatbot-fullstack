using HealthcareBackend.DTOs;
using System.Text.Json;
using System.Text;

namespace HealthcareBackend.Services
{
    public interface IChatbotService
    {
        Task<string> GetResponseAsync(int userId, ChatRequest request);
    }

    public class ChatbotService : IChatbotService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public ChatbotService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetResponseAsync(int userId, ChatRequest request)
        {
            string msg = request.Message.ToLower();
            
            // Flow Logic Based on Context
            if (msg == "yes" && request.ContextMode == "General")
            {
                return "Please choose an option:\n1. Check Symptoms\n2. Get Cure\n3. Book Appointment\n4. Health Tips";
            }
            
            if (msg.Contains("1") || msg.Contains("symptom"))
            {
                return "Please list your symptoms (e.g., fever, cough, headache).";
            }
            
            if (request.ContextMode == "General" && msg != "yes" && !msg.Contains("1") && !msg.Contains("symptom") && !msg.Contains("2") && !msg.Contains("cure") && !msg.Contains("3") && !msg.Contains("doctor") && !msg.Contains("4") && !msg.Contains("tips"))
            {
                // ChatGPT Like Smart Detect: The user likely typed their symptoms without selecting an option first!
                var pythonUrl = _config["PythonApi:BaseUrl"] + "/predict";
                var pythonRequest = new PythonPredictRequest { symptoms = new List<string> { msg } };
                var content = new StringContent(JsonSerializer.Serialize(pythonRequest), Encoding.UTF8, "application/json");
                try 
                {
                    var response = await _httpClient.PostAsync(pythonUrl, content);
                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        var result = JsonSerializer.Deserialize<PythonPredictResponse>(responseString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (result != null && result.confidence > 0 && result.disease != "Unknown" && result.extracted_symptoms.Any())
                        {
                            var reply = $"🧠 **Smart Detection:** You bypassed the menu! I analyzed those symptoms automatically.\n\n" +
                                        $"Possible Disease: **{result.disease}** (Confidence: {result.confidence}%)\n" +
                                        $"Severity: **{result.severity}**\n\n" +
                                        $"Advice: {result.advice}\n\n";
                            
                            if (result.severity == "Emergency" || result.severity == "High")
                            {
                                reply = "🚨 **ALERT: EMERGENCY/HIGH SEVERITY SYMPTOMS DETECTED** 🚨\n\n" + reply;
                            }
                            
                            reply += "Do you want to (1) Get Cure details, or (2) Find a Doctor?";
                            return reply;
                        }
                    }
                }
                catch { /* Ignore and revert to general error */ }
            }
            
            if (request.ContextMode == "Symptoms")
            {
                if (string.IsNullOrWhiteSpace(msg)) return "Please tell me your symptoms.";

                var pythonUrl = _config["PythonApi:BaseUrl"] + "/predict";
                var pythonRequest = new PythonPredictRequest { symptoms = new List<string> { msg } };
                var content = new StringContent(JsonSerializer.Serialize(pythonRequest), Encoding.UTF8, "application/json");
                try 
                {
                    var response = await _httpClient.PostAsync(pythonUrl, content);
                    if (response.IsSuccessStatusCode)
                    {
                        var responseString = await response.Content.ReadAsStringAsync();
                        var result = JsonSerializer.Deserialize<PythonPredictResponse>(responseString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        
                        if (result != null)
                        {
                            var reply = $"I have analyzed your symptoms.\n\n" +
                                        $"Possible Disease: **{result.disease}** (Confidence: {result.confidence}%)\n" +
                                        $"Severity: **{result.severity}**\n\n" +
                                        $"Advice: {result.advice}\n\n";
                            
                            if (result.severity == "Emergency" || result.severity == "High")
                            {
                                reply = "🚨 **ALERT: EMERGENCY/HIGH SEVERITY SYMPTOMS DETECTED** 🚨\n\n" + reply;
                            }
                            
                            reply += "Do you want to (1) Get Cure details, or (2) Find a Doctor?";
                            return reply;
                        }
                    }
                }
                catch (Exception ex)
                {
                    return "Sorry, I am having trouble connecting to the symptom analysis engine right now. " + ex.Message;
                }
                
                return "I couldn't identify the disease from those symptoms.";
            }

            if (msg.Contains("2") || msg.Contains("cure") || request.ContextMode == "Cure")
            {
                return "Based on common treatments:\n- Medicines: Paracetamol (if fever), Antihistamines (if allergies).\n- Home Remedies: Drink plenty of warm fluids, rest, honey ginger tea.\n- Diet: Light, easy-to-digest food like soups.";
            }

            if (msg.Contains("3") || msg.Contains("doctor") || msg.Contains("find a doctor"))
            {
                return "Great! Let's find a doctor. You can navigate to our 'Book Appointment' section or tell me your disease to find a specialist.";
            }

            if (msg.Contains("4") || msg.Contains("tips"))
            {
                return "Health Tips:\n1. Drink 8 glasses of water daily.\n2. Exercise for at least 30 mins a day.\n3. Eat a balanced diet with lots of vegetables.\n4. Get 7-8 hours of sleep.";
            }

            return "I am a healthcare assistant. Say 'YES' to see the main menu options, or directly type your symptoms!";
        }
    }
}
