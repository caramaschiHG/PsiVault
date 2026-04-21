"use client";

import { SearchBar } from "./search-bar";
import { NotificationBell } from "@/components/ui/notification-bell";

export function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {/* Reserved for breadcrumbs/page titles */}
      </div>
      
      <div className="top-bar-center">
        <SearchBar />
      </div>
      
      <div className="top-bar-right">
        <NotificationBell />
        <div className="avatar-placeholder" aria-label="User menu">U</div>
      </div>
    </header>
  );
}
