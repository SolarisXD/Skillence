import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ChatService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Increased to 60 seconds for Gemini API
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log("Making request to:", `${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log("Response received:", response.status);
        return response.data;
      },
      (error) => {
        console.error("API Error:", error);

        if (error.response) {
          // Server responded with error status
          throw new Error(
            error.response.data?.message || "Server error occurred",
          );
        } else if (error.request) {
          // Request was made but no response received
          throw new Error(
            "Unable to connect to the server. Please check your connection.",
          );
        } else {
          // Something else happened
          throw new Error("An unexpected error occurred");
        }
      },
    );
  }

  async sendMessage(data) {
    try {
      const response = await this.api.post("/api/chatbot/chat", data);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getChatHistory(sessionId) {
    try {
      const response = await this.api.get(`/api/chatbot/history/${sessionId}`);
      return response;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await this.api.get("/api/chatbot/health");
      return response;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
