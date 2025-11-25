import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        factos: {
          DEFAULT: "#84CC16", // 메인 라임
          dark: "#65A30D",
          bg: "#FFFFFF",
          text: "#1F2937",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "sans-serif"], // 폰트 설정 필요 시
      },
    },
  },
  plugins: [],
};
export default config;
