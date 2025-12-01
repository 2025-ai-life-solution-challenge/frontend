"use client";

import { useState } from "react";
import InputArea from "./components/chat/InputArea";
import MessageBubble from "./components/chat/MessageBubble";
import Header from "./components/layout/Header";
import MainLayout from "./components/layout/MainLayout";
import { api, type ChatResponse } from "./lib/api";
import { useAppStore } from "./store/useAppStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
}

export default function Home() {
  const { mode } = useAppStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.chat.submit({
        content: input,
        analysis_type:
          mode === "fake-news" ? "fake_detection" : "crowd_analysis",
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.result_string || "",
        response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* ... (나머지 JSX 코드는 기존과 동일) ... */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto w-full">
          <Header />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div
          className={`max-w-3xl mx-auto w-full p-4 pb-10 space-y-6 ${
            messages.length === 0 ? "flex-1 flex flex-col" : ""
          }`}
        >
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              {mode === "fake-news" ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    가짜 뉴스 탐지
                  </h2>
                  <p className="text-gray-500 leading-relaxed">
                    의심스러운 뉴스나 정보를 입력하면
                    <br />
                    AI가 신뢰도를 분석하고 객관적인 정보를 제공합니다.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    군중심리 분석
                  </h2>
                  <p className="text-gray-500 leading-relaxed">
                    특정 주제에 대한 여론이나 대중의 의견을 입력하면
                    <br />
                    군중심리 패턴을 분석해드립니다.
                  </p>
                </>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              response={msg.response}
            />
          ))}

          {isLoading && <MessageBubble role="assistant" content="" />}
        </div>
      </main>

      <div className="sticky bottom-0 z-40 bg-white border-t border-gray-50">
        <div className="max-w-3xl mx-auto w-full">
          <InputArea
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
}
