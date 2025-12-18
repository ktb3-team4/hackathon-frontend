import type { Metadata } from "next";
import "./globals.css";

import KakaoScript from "./components/KakaoScript";

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
      <body>
        {/* 👇 2. 여기에 추가 (children 위나 아래 상관없음) */}
        <KakaoScript /> 
        
        {children}
      </body>
    </html>
  );
}
