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
import { ShieldCheck, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, selectedArticle, setSelectedArticle, selectedEvent, setSelectedEvent } = useApp();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Real-time Benchmark Ticker */}
      <MarketTicker />

      {/* Navigation Header */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'calendar' && <EconomicCalendar />}
        {activeTab === 'insights' && <AiInsights />}
        {activeTab === 'search' && <GlobalSearch />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800">EconIntel</span>
            <span>— AI-Powered Financial News & Economic Intelligence</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Source Verification & Deduplication</span>
            </span>
            <span>•</span>
            <span>Educational & Macro Intelligence Purpose</span>
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
