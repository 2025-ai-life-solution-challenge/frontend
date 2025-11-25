"use client";

import {
  ArrowRight,
  Article,
  Check,
  CircleNotch,
  TrendUp,
  WarningOctagon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useMemo } from "react";

// 타입 정의
interface AnalysisData {
  verdict: "true" | "false" | "controversial";
  confidence: number;
  summary: string;
  sources: {
    title: string;
    desc: string;
    url: string;
    type: "news" | "data";
  }[];
}

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({ role, content }: MessageProps) {
  const isUser = role === "user";

  // JSON 파싱 로직
  const parsedAnalysis = useMemo(() => {
    if (isUser) return null;
    try {
      // 마크다운 제거
      const cleanContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      // 필수 필드 확인
      if (parsed?.verdict) {
        return parsed as AnalysisData;
      }
      return null;
    } catch {
      return null; // 아직 완성되지 않음 -> 로딩 상태
    }
  }, [content, isUser]);

  // JSON 형식으로 스트리밍 중인지 확인 (시작이 { 또는 ```json으로 시작하면 JSON 응답으로 간주)
  const isStreamingJson = useMemo(() => {
    if (isUser || parsedAnalysis) return false;
    const trimmed = content.trim();
    return trimmed.startsWith("{") || trimmed.startsWith("```json");
  }, [content, isUser, parsedAnalysis]);

  // 1. 유저 메시지
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="bg-gray-900 text-white px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[85%] text-[15px] leading-relaxed shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  // 2. AI 메시지
  return (
    <div className="flex flex-col gap-2 max-w-[95%]">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-factos rounded-full flex items-center justify-center text-white shadow-sm">
          <Check size={12} weight="bold" />
        </div>
        <span className="text-xs font-bold text-gray-500">Factos AI</span>
      </div>

      {/* CASE A: JSON 파싱 성공 (카드 UI) */}
      {parsedAnalysis ? (
        <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4">
            <span
              className={clsx(
                "px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border",
                parsedAnalysis.verdict === "false"
                  ? "bg-red-100 text-red-600 border-red-200"
                  : parsedAnalysis.verdict === "true"
                    ? "bg-green-100 text-green-600 border-green-200"
                    : "bg-yellow-100 text-yellow-600 border-yellow-200",
              )}
            >
              {parsedAnalysis.verdict === "false" ? (
                <WarningOctagon weight="fill" />
              ) : (
                <Check weight="fill" />
              )}
              {parsedAnalysis.verdict === "false"
                ? "거짓 (False)"
                : parsedAnalysis.verdict === "true"
                  ? "진실 (Verified)"
                  : "논란 (Controversial)"}
            </span>
            <span className="text-[11px] text-gray-400">
              신뢰도 {parsedAnalysis.confidence}%
            </span>
          </div>

          <h3 className="font-bold text-gray-800 text-[15px] mb-2">
            분석 결과 요약
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
            {parsedAnalysis.summary}
          </p>

          {parsedAnalysis.sources &&
            Array.isArray(parsedAnalysis.sources) &&
            parsedAnalysis.sources.length > 0 && (
              <>
                <div className="h-px bg-gray-100 w-full my-3"></div>
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Verified Sources
                  </p>
                  {parsedAnalysis.sources.map((source, idx) => (
                    <a
                      key={`${source.url}-${idx}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-factos/50 transition shadow-sm group"
                    >
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          source.type === "news"
                            ? "bg-blue-100 text-blue-500"
                            : "bg-green-100 text-green-600",
                        )}
                      >
                        {source.type === "news" ? (
                          <Article size={18} weight="fill" />
                        ) : (
                          <TrendUp size={18} weight="fill" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition">
                          {source.title}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {source.desc}
                        </p>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-gray-300"
                        weight="bold"
                      />
                    </a>
                  ))}
                </div>
              </>
            )}
        </div>
      ) : (
        // CASE B: 파싱 실패 (로딩 중)
        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-sm text-gray-600 shadow-sm">
          {/* JSON 스트리밍 중이거나 내용이 적으면 로딩 표시 */}
          {isStreamingJson || !content || content.length < 10 ? (
            <div className="flex items-center gap-2 text-gray-500">
              <CircleNotch size={18} className="animate-spin text-factos" />
              <span>AI가 데이터를 분석하고 있습니다...</span>
            </div>
          ) : (
            // JSON 형식이 아닌 일반 텍스트 응답인 경우에만 표시
            <div className="flex flex-col gap-2">
              <p className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
