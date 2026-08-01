import React from 'react';
import { StoreLocation } from '../types';
import { 
  Building2, 
  Scan, 
  Activity, 
  Zap, 
  Sparkles,
  Plus
} from 'lucide-react';

interface HeaderNavProps {
  stores: StoreLocation[];
  selectedStoreId: string;
  onSelectStore: (id: string) => void;
  onOpenScanner: () => void;
  onOpenAddItem: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAiAlertsCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  stores,
  selectedStoreId,
  onSelectStore,
  onOpenScanner,
  onOpenAddItem,
  isSimulating,
  onToggleSimulation,
  activeTab,
  setActiveTab,
  unreadAiAlertsCount,
}) => {
  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-lg shadow-black/40">
              {/* Apple SVG Icon */}
              <svg className="w-5 h-5 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.83.13-9.67-1.92-14.54-6.13-3.23-2.8-7.13-7.53-11.72-14.19-6.93-10.05-12.23-21.2-15.89-33.45-3.66-12.25-5.49-24.08-5.49-35.48 0-14.28 3.58-26.06 10.74-35.34 7.16-9.28 16.27-14.05 27.33-14.31 4.71 0 9.97 1.2 15.78 3.6 5.81 2.4 9.68 3.63 11.61 3.63 1.58 0 5.48-1.23 11.72-3.69 6.23-2.46 11.39-3.63 15.48-3.51 9.38.39 17.29 3.51 23.73 9.36 4.98 4.54 8.79 9.97 11.43 16.29-10.53 6.35-15.68 15.11-15.44 26.29.24 8.82 3.62 16.22 10.14 22.2 6.52 5.98 14.34 9.27 23.46 9.87-2.1 6.13-4.87 12.39-8.31 18.78zM119.22 31.84c0-6.93 2.5-13.43 7.5-19.5 5-6.07 11.23-9.76 18.69-11.07.26 1.05.39 2.1.39 3.15 0 7.06-2.58 13.68-7.74 19.86-5.17 6.18-11.48 9.77-18.94 10.77-.13-1.06-.19-2.13-.19-3.21z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold tracking-tight text-base text-slate-100">
                  Apple Inventory
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Cost Analytics & Vault Operations
              </p>
            </div>
          </div>

          {/* Store Location Selector */}
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 hover:border-slate-700 transition">
              <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <select
                value={selectedStoreId}
                onChange={(e) => onSelectStore(e.target.value)}
                className="bg-transparent border-none text-slate-200 focus:ring-0 focus:outline-none pr-3 font-medium cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">
                  🌐 All Global Retail Stores
                </option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                    {s.isHub ? '🏭' : '🏬'} {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons & Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Cost Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'inventory'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Stock Items
            </button>
            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'ai-advisor'
                  ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-cyan-200 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Cost Advisor</span>
              {unreadAiAlertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-black font-bold text-[10px] flex items-center justify-center">
                  {unreadAiAlertsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('livestream')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'livestream'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Stream</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Live POS Telemetry Toggle */}
            <button
              onClick={onToggleSimulation}
              title={isSimulating ? 'Pause Live Telemetry Simulation' : 'Start Live Telemetry Simulation'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition border ${
                isSimulating
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-900/30'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 fill-emerald-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="hidden md:inline">{isSimulating ? 'POS Live' : 'POS Paused'}</span>
            </button>

            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Scan SKU</span>
            </button>

            {/* Add Item Button */}
            <button
              onClick={onOpenAddItem}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1 shadow-md shadow-blue-900/30 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
