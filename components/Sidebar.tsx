import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Image, LayoutDashboard, DollarSign, User, BarChart2, CreditCard, LifeBuoy } from "lucide-react";
import type { UserProfile } from "../types";

type TabId = "home" | "create" | "gallery" | "plans" | "profile" | "usage" | "billing" | "support";

interface SidebarProps {
  user: UserProfile;
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navGroups: {
  title: string;
  items: { id: TabId; label: string; icon: React.ElementType }[];
}[] = [
  {
    title: "Main",
    items: [
      { id: "home", label: "Home", icon: Home },
      { id: "create", label: "Studio", icon: LayoutDashboard },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "gallery", label: "Gallery", icon: Image },
      { id: "plans", label: "Pricing", icon: DollarSign },
      { id: "profile", label: "Profile", icon: User },
    ],
  },
  {
    title: "Insights & Support",
    items: [
      { id: "usage", label: "Usage", icon: BarChart2 },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "support", label: "Support", icon: LifeBuoy },
    ],
  },
];

const SidebarNavList: React.FC<{
  title: string;
  items: { id: TabId; label: string; icon: React.ElementType }[];
  activeTab: TabId;
  onNavigate: (tab: TabId) => void;
  onAfterClick?: () => void;
}> = ({ title, items, activeTab, onNavigate, onAfterClick }) => {
  return (
    <div className="mb-6">
      <div className="text-xs font-semibold mb-3 px-3 uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onAfterClick?.();
              }}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-colors duration-100 ${
                isActive
                  ? "bg-red-900 text-white border border-red-700"
                  : "text-gray-300 hover:bg-black hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "U";

  const mobileSidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  } as const;

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div className="md:hidden fixed inset-0 z-40" initial="hidden" animate="visible" exit="hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              onClick={onCloseMobile}
              aria-hidden="true"
            />
            <motion.div
              variants={mobileSidebarVariants}
              transition={{ duration: 0.25 }}
              className="relative h-full w-72 bg-black shadow-2xl border-r border-gray-700"
            >
              <div className="flex flex-col h-full">
                {/* Navigation */}
                <nav className="flex-1 p-4 pt-12 overflow-y-auto">
                  {navGroups.map((group) => (
                    <SidebarNavList
                      key={group.title}
                      title={group.title}
                      items={group.items}
                      activeTab={activeTab}
                      onNavigate={onNavigate}
                      onAfterClick={onCloseMobile}
                    />
                  ))}
                </nav>

                {/* Footer / CTA */}
                <div className="p-4 border-t border-gray-700">
                  <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors"
                    onClick={() => {
                      onNavigate("profile");
                      onCloseMobile();
                    }}
                  >
                    View profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black border-r border-gray-700 shadow-lg z-40">
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {navGroups.map((group) => (
            <SidebarNavList
              key={group.title}
              title={group.title}
              items={group.items}
              activeTab={activeTab}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Footer / CTA */}
        <div className="p-4 border-t border-gray-700">
          <button
            className="w-full text-sm font-semibold py-2.5 rounded-xl transition-colors"
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
            }}
            onClick={() => onNavigate("profile")}
          >
            View profile
          </button>
        </div>
      </div>
    </>
  );
};

