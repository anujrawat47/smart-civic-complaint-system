package com.civic.controller.api;

import com.civic.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * AI Chat REST Controller
 * 
 * Provides a secure API endpoint `/api/ai/chat` for frontend React chat widgets.
 * Proxies user questions securely to prevent exposing the Gemini API key.
 */
@RestController
@RequestMapping("/api/ai")
public class AiChatRestController {

    private final GeminiService geminiService;

    @Autowired
    public AiChatRestController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Post a new message and receive the AI chat response
     */
    @SuppressWarnings("unchecked")
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> getAiChatResponse(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();

        String message = (String) body.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) body.get("history");

        if (message == null || message.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "Message content is required");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String aiResponse = geminiService.getChatResponse(message, history);
            response.put("success", true);
            response.put("response", aiResponse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Failed to generate AI response: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
