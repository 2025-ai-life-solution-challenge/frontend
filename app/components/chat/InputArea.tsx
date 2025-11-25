"use client";

import {
  PaperPlaneRight, // 아이콘 이름 확인 (최신버전이면 PaperPlaneRight, 구버전이면 PaperPlaneRightIcon)
  Plus,
  Spinner,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type { ChangeEvent, FormEvent } from "react";
import { useAppStore } from "../../store/useAppStore";

interface InputAreaProps {
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: FormEvent) => void;
  isLoading: boolean;
}

export default function InputArea({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: InputAreaProps) {
  const { mode, setMode } = useAppStore();

  return (
    <footer className="w-full pb-6 pt-4 px-4">
      <div className="flex flex-col gap-4">
        {/* 모드 토글 */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-full flex h-10 w-full sm:w-auto sm:min-w-[300px]">
            <button
              type="button"
              onClick={() => setMode("fake-news")}
              className={clsx(
                "flex-1 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                mode === "fake-news"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              가짜 뉴스 탐지
            </button>
            <button
              type="button"
              onClick={() => setMode("crowd-psychology")}
              className={clsx(
                "flex-1 px-4 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                mode === "crowd-psychology"
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              군중심리 분석
            </button>
          </div>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition shrink-0"
          >
            <Plus size={20} weight="bold" />
          </button>

          <div className="flex-1 bg-gray-100 rounded-3xl flex items-center px-5 py-3 focus-within:ring-2 focus-within:ring-factos/50 transition">
            <input
              value={input}
              onChange={handleInputChange}
              type="text"
              placeholder={
                mode === "fake-news"
                  ? "팩트 체크가 필요한 내용을 입력하세요..."
                  : "분석하고 싶은 여론 주제를 입력하세요..."
              }
              className="w-full bg-transparent border-none outline-none text-base placeholder-gray-400 text-gray-800"
            />
          </div>

          <button
            type="submit"
            // input이 없거나 로딩 중이면 비활성화
            disabled={!input || isLoading}
            className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 hover:bg-factos hover:text-white disabled:opacity-50 disabled:hover:bg-gray-200 transition shrink-0 group"
          >
            {isLoading ? (
              <Spinner className="animate-spin" size={20} />
            ) : (
              <PaperPlaneRight
                size={20}
                weight="fill"
                className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
              />
            )}
          </button>
        </form>
      </div>
    </footer>
  );
}
