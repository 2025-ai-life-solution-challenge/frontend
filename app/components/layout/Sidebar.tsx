"use client";

import {
  ChatCircleIcon,
  PlusIcon,
  UserCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockHistory = [
  { id: 1, title: "비트코인 상폐 루머 분석 요청", date: "오늘" },
  { id: 2, title: "OOO 연예인 학폭 논란 팩트체크", date: "어제" },
  { id: 3, title: "최근 주식 시장 폭락 원인 분석", date: "3일 전" },
  { id: 4, title: "AI 관련 법안 국회 통과 여부", date: "지난주" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-start">
      <button
        type="button"
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 cursor-default",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-label="Close sidebar"
      />

      <div
        className={clsx(
          "relative w-[85%] max-w-[320px] h-dvh bg-white shadow-2xl transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col",
          isVisible ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-5 flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md active:scale-95"
          >
            <PlusIcon size={18} weight="bold" />새 대화 시작
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 transition hover:bg-gray-100 rounded-full shrink-0"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 min-h-0">
          <p className="px-4 py-2 text-xs font-bold text-gray-400 mb-1">
            최근 대화 기록
          </p>

          <div className="space-y-1 px-2">
            {mockHistory.map((chat) => (
              <button
                type="button"
                key={chat.id}
                className="w-full text-left flex items-start gap-3 px-3 py-3 hover:bg-gray-50 rounded-xl transition group"
              >
                <ChatCircleIcon
                  size={20}
                  className="text-gray-400 group-hover:text-factos shrink-0 mt-0.5 transition"
                  weight="fill"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                    {chat.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {chat.date}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <UserCircleIcon size={32} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-900">Factos 유저</span>
            <span className="text-xs text-gray-500">무료 플랜 이용 중</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
