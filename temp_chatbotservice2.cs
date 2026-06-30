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
            
            var pythonUrl = _config["PythonApi:BaseUrl"] + "/chat";
            var pythonRequest = new { message = msg };
            var content = new StringContent(JsonSerializer.Serialize(pythonRequest), Encoding.UTF8, "application/json");
            
            try 
            {
                var response = await _httpClient.PostAsync(pythonUrl, content);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<JsonElement>(responseString);
                    if (result.TryGetProperty("reply", out var replyProp) || result.TryGetProperty("Reply", out replyProp))
                    {
                        return replyProp.GetString() ?? "I am having trouble processing that right now.";
                    }
                }
            }
            catch (Exception ex)
            { 
               return "My medical database connection is currently offline. " + ex.Message; 
            }
            
            return "Server disconnected.";
        }
    }
}
