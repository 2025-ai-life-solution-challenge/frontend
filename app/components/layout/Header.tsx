"use client";

import { ListIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="h-14 px-5 flex items-center justify-between bg-white shrink-0 z-30">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 text-gray-900 hover:bg-gray-100 rounded-full transition"
        >
          <ListIcon size={24} weight="bold" />
        </button>

        <div className="flex items-center justify-center">
          <Image
            src="/iogo.svg"
            alt="Factos"
            width={100}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </div>

        <UserMenu />
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
