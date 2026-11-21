"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { TopNav } from "../TopNav/TopNav";

export function Layout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={`min-h-screen transition-[padding] duration-200 lg:pl-[260px] ${
          collapsed ? "lg:pl-[80px]" : ""
        }`}
      >
        <TopNav
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
