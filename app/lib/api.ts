const BACKEND_URL = "https://api.ye0ngjae.com";

// 채팅 요청
export interface ChatRequest {
  content: string;
  analysis_type: "fake_detection" | "crowd_analysis";
  url?: string[];
}

// 채팅 응답
export interface ChatResponse {
  result: "true" | "false" | "controversial";
  trust_score?: number;
  result_string?: string;
  verified_sources?: string[];
}

// 채팅 히스토리
export interface ChatHistory {
  chat_id: number;
  title: string;
}

export interface ChatHistoryListResponse {
  history: ChatHistory[];
}

export const api = {
  chat: {
    submit: async (request: ChatRequest): Promise<ChatResponse> => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },

    getHistoryList: async (
      userId: number,
    ): Promise<ChatHistoryListResponse> => {
      const response = await fetch(`/api/chat/history?user_id=${userId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
  },

  auth: {
    googleLogin: () => {
      window.location.href = `${BACKEND_URL}/auth/google/login`;
    },
  },
};
