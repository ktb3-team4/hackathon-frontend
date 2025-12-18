import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import KakaoScript from "./components/KakaoScript";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "효도 메신저",
  description: "부모님께 마음을 전하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 👇 2. 여기에 추가 (children 위나 아래 상관없음) */}
        <KakaoScript /> 
        
        {children}
      </body>
    </html>
  );
}