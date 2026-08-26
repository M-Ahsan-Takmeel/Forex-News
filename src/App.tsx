import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MarketTicker } from './components/MarketTicker';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NewsFeed } from './components/NewsFeed';
import { EconomicCalendar } from './components/EconomicCalendar';
import { AiInsights } from './components/AiInsights';
import { GlobalSearch } from './components/GlobalSearch';
import { ArticleDrawer } from './components/ArticleDrawer';
import { EventAnalysisModal } from './components/EventAnalysisModal';
import { SettingsModal } from './components/SettingsModal';
import { ShieldCheck, Activity } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, selectedArticle, setSelectedArticle, selectedEvent, setSelectedEvent } = useApp();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] flex flex-col font-sans selection:bg-[#2563EB]/30 selection:text-[#F2F2F2]">
      {/* Top Real-time Benchmark Ticker */}
      <MarketTicker />

      {/* Navigation Header */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'calendar' && <EconomicCalendar />}
        {activeTab === 'insights' && <AiInsights />}
        {activeTab === 'search' && <GlobalSearch />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#242424] py-5 text-xs text-[#777777]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] tracking-widest uppercase font-bold text-[#F2F2F2] bg-[#151515] px-2 py-0.5 border border-[#242424] rounded-sm">
              TERMINAL
            </span>
            <span className="font-bold tracking-tight text-[#F2F2F2] font-mono">FINETELI</span>
            <span className="text-[#555555] hidden md:inline">— AI-Powered Market Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-[#777777] text-[11px]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Multi-Source Corroborated</span>
            </span>
            <span className="text-[#333333]">•</span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#777777]" />
              <span>Institutional Research Grade</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ArticleDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <EventAnalysisModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
