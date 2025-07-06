"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Newspaper,
  GraduationCap,
  Settings,
  User,
  LogOut,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Logo } from "@/components/ui/logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Market Sentiment", href: "/market", icon: TrendingUp },
  { name: "News Stream", href: "/news", icon: Newspaper },
  { name: "Learn", href: "/learn", icon: GraduationCap },
];

const settingsNavigation = [
  { name: "Profile", href: "/settings/profile", icon: User },
  { name: "Security", href: "/settings/security", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <Link href={"/"} className="flex items-center justify-between p-4 border-b border-border">
            <Logo size="sm" />
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </Link>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Settings section */}
            <div className="px-2 mt-6">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Settings
              </div>
              <ul className="space-y-1">
                {settingsNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}