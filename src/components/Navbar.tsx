import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Sparkles,
  Search,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setIsSettingsOpen } = useApp();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'news' as const, label: 'News Feed', icon: Newspaper },
    { id: 'calendar' as const, label: 'Economic Calendar', icon: Calendar },
    { id: 'insights' as const, label: 'AI Intelligence Hub', icon: Sparkles },
    { id: 'search' as const, label: 'Search', icon: Search }
  ];

  return (
    <header id="main-navigation-header" className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
                <Sparkles className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">EconIntel</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                    AI Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Financial News & Macro Economic Intelligence
                </p>
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Sources & AI Reasoning</span>
            </div>

            <button
              id="btn-open-settings"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Preferences & Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-mobile-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
