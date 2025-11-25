"use client";

import {
  GearIcon,
  SignOutIcon,
  UserCircleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 임시 로그인 상태 (true: 로그인됨)

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // CASE 1: 로그인 안 된 상태 -> 로그인 버튼 노출
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition"
      >
        로그인
      </Link>
    );
  }

  // CASE 2: 로그인 된 상태 -> 프로필 아이콘 + 드롭다운
  return (
    <div className="relative" ref={menuRef}>
      {/* 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition focus:outline-none"
      >
        <UserCircleIcon size={28} weight="bold" />
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* 간략 정보 */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-bold text-gray-900">Factos 유저</p>
            <p className="text-xs text-gray-500 truncate">user@example.com</p>
          </div>

          {/* 메뉴 리스트 */}
          <div className="py-1">
            <Link
              href="/mypage"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setIsOpen(false)}
            >
              <UserIcon size={18} />
              마이페이지
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setIsOpen(false)}
            >
              <GearIcon size={18} />
              계정 설정
            </Link>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              type="button"
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              onClick={() => {
                alert("로그아웃 되었습니다.");
                setIsOpen(false);
                setIsLoggedIn(false);
              }}
            >
              <SignOutIcon size={18} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
