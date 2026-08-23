import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Sparkles,
  Search,
  Settings,
  Sliders
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSettingsOpen } = useApp();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'news' as const, label: 'News Feed', icon: Newspaper },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'insights' as const, label: 'AI Intelligence', icon: Sparkles },
    { id: 'search' as const, label: 'Search', icon: Search }
  ];

  return (
    <header id="main-navigation-header" className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-[#242424] text-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-7 h-7 rounded bg-[#151515] border border-[#242424] flex items-center justify-center text-[#3B82F6] group-hover:border-[#3B82F6]/50 transition-colors">
                <span className="font-mono font-bold text-xs">M</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-[#F2F2F2] uppercase font-mono">
                    MACRO INTELLIGENCE
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.2 bg-[#151515] text-[#A0A0A0] border border-[#242424] rounded-xs">
                    LIVE
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav id="nav-tabs-container" className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#151515] text-[#3B82F6] border border-[#242424] font-semibold'
                      : 'text-[#A0A0A0] hover:text-[#F2F2F2] hover:bg-[#101010]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3B82F6]' : 'text-[#777777]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              id="btn-quick-search"
              onClick={() => setActiveTab('search')}
              className={`p-1.5 rounded-md border text-xs flex items-center gap-1.5 transition-colors ${
                activeTab === 'search'
                  ? 'bg-[#151515] text-[#3B82F6] border-[#3B82F6]/40'
                  : 'bg-[#101010] border-[#242424] text-[#A0A0A0] hover:text-[#F2F2F2] hover:bg-[#151515]'
              }`}
              title="Global Search"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] text-[#777777]">Search</span>
              <kbd className="hidden sm:inline text-[9px] font-mono bg-[#151515] px-1 py-0.2 rounded border border-[#242424] text-[#777777]">
                /
              </kbd>
            </button>

            <button
              id="btn-open-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-md border border-[#242424] bg-[#101010] text-[#A0A0A0] hover:text-[#F2F2F2] hover:bg-[#151515] transition-colors flex items-center gap-1.5 text-xs"
              title="Personalization & API Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-1.5 border-t border-[#242424] no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-mobile-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-[#151515] text-[#3B82F6] border border-[#242424]'
                    : 'text-[#777777] hover:text-[#A0A0A0]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

