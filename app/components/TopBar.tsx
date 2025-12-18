"use client";

import { useRouter } from "next/navigation";

type Props = {
  title?: string;           // 필요하면 확장용
  showAdd?: boolean;        // + 버튼 보일지
  onAddClick?: () => void;  // + 클릭 동작
};

export default function TopBar({ showAdd = false, onAddClick }: Props) {
  const router = useRouter();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <img src="/images/logo.png" alt="두드림" className="topbar-logo" />
          <span className="topbar-title">두드림</span>
        </div>

        {showAdd ? (
          <button
            type="button"
            className="topbar-add"
            aria-label="추가"
            onClick={onAddClick}
          >
            +
          </button>
        ) : (
          <div className="topbar-right-spacer" />
        )}
      </div>
    </header>
  );
}
