"use client";

import {
  ArrowRight,
  Article,
  Check,
  CircleNotch,
  Question,
  WarningOctagon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type { ChatResponse } from "../../lib/api";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  response?: ChatResponse;
}

const getVerdictDisplay = (result: ChatResponse["result"]) => {
  switch (result) {
    case "true":
      return {
        label: "진실 (Verified)",
        icon: <Check weight="fill" />,
        className: "bg-green-100 text-green-600 border-green-200",
      };
    case "false":
      return {
        label: "거짓 (False)",
        icon: <WarningOctagon weight="fill" />,
        className: "bg-red-100 text-red-600 border-red-200",
      };
    case "controversial":
      return {
        label: "불확실 (Uncertain)",
        icon: <Question weight="fill" />,
        className: "bg-yellow-100 text-yellow-600 border-yellow-200",
      };
  }
};

export default function MessageBubble({
  role,
  content,
  response,
}: MessageProps) {
  const isUser = role === "user";

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

      {/* CASE A: 백엔드 응답 존재 (카드 UI) */}
      {response ? (
        <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-4">
            {(() => {
              const verdict = getVerdictDisplay(response.result);
              return (
                <span
                  className={clsx(
                    "px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border",
                    verdict.className,
                  )}
                >
                  {verdict.icon}
                  {verdict.label}
                </span>
              );
            })()}
            {response.trust_score !== undefined && (
              <span className="text-[11px] text-gray-400">
                신뢰도 {response.trust_score}%
              </span>
            )}
          </div>

          {response.result_string && (
            <>
              <h3 className="font-bold text-gray-800 text-[15px] mb-2">
                분석 결과 요약
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">
                {response.result_string}
              </p>
            </>
          )}

          {response.verified_sources &&
            response.verified_sources.length > 0 && (
              <>
                <div className="h-px bg-gray-100 w-full my-3" />
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Verified Sources
                  </p>
                  {response.verified_sources.map((source) => (
                    <a
                      key={source}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-factos/50 transition shadow-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-100 text-blue-500">
                        <Article size={18} weight="fill" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate group-hover:text-blue-600 transition">
                          {new URL(source).hostname}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {source}
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
        // CASE B: 로딩 중
        <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-sm text-gray-600 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <CircleNotch size={18} className="animate-spin text-factos" />
            <span>AI가 데이터를 분석하고 있습니다...</span>
          </div>
        </div>
      )}
    </div>
  );
}
