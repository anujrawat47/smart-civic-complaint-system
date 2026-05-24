package com.civic.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Gemini AI Service
 * 
 * Communicates securely with Google's Gemini Pro API.
 * Uses a prompt-engineered system instruction and history injection.
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key:YOUR_API_KEY_HERE}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_API_URL = 
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    /**
     * Sends user message & history to Gemini API and returns the response
     */
    public String getChatResponse(String message, List<Map<String, String>> history) {
        // Safe check for placeholder key
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_API_KEY")) {
            return "Hello! I am CivicResolve AI, your municipal assistant. 🌟\n\n" +
                   "It looks like my Gemini API Key has not been configured in the backend yet. " +
                   "To activate my real-time AI responses, please add your Google AI Studio API key to " +
                   "`backend/src/main/resources/application.properties` as `gemini.api.key=YOUR_KEY`!";
        }

        try {
            // Prompt construction
            StringBuilder prompt = new StringBuilder();
            prompt.append("System Instructions:\n");
            prompt.append("You are CivicResolve AI, a helpful, friendly, and knowledgeable municipal assistant. ");
            prompt.append("Your goal is to help citizens report and track civic complaints, suggest appropriate complaint categories, and provide advice on community issues (such as road damage, sanitation, public safety, street lighting, and water supply). ");
            prompt.append("Keep your responses structured, clear, and professional. Avoid answering non-civic topics, or politely steer the user back to municipal and civic engagement.\n\n");

            // Load Chat History
            if (history != null) {
                for (Map<String, String> chat : history) {
                    String role = chat.get("role"); // "user" or "model"
                    String text = chat.get("text");
                    if (role != null && text != null) {
                        prompt.append(role.equals("user") ? "User: " : "Assistant: ")
                              .append(text).append("\n");
                    }
                }
            }

            // Append User Question
            prompt.append("User: ").append(message).append("\nAssistant: ");

            // Construct Gemini REST Payload
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", prompt.toString());

            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(partMap));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", Collections.singletonList(contentMap));

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Execute HTTP Request
            String url = GEMINI_API_URL + apiKey;
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return extractResponseText(response.getBody());
            }

            return "I encountered an error connecting to my cognitive model. Please try again.";

        } catch (Exception e) {
            return "Failed to fetch response: " + e.getMessage() + ". Please verify the API key and connection.";
        }
    }

    /**
     * Safely parse Google Gemini candidate response structure
     */
    @SuppressWarnings("unchecked")
    private String extractResponseText(Map responseBody) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        } catch (Exception e) {
            // ignore parsing bugs
        }
        return "I received an unparseable response from the AI model.";
    }
}
