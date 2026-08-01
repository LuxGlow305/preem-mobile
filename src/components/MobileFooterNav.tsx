import React from 'react';
import { 
  BarChart3, 
  Package, 
  Scan, 
  Activity, 
  Sparkles, 
  Building2 
} from 'lucide-react';

interface MobileFooterNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScanner: () => void;
  unreadAiAlertsCount: number;
}

export const MobileFooterNav: React.FC<MobileFooterNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenScanner,
  unreadAiAlertsCount,
}) => {
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'scanner', label: 'Scan', icon: Scan, isAction: true },
    { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles, badge: unreadAiAlertsCount },
    { id: 'livestream', label: 'Live Stream', icon: Activity },
    { id: 'stores', label: 'Stores', icon: Building2 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 py-1.5 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenScanner}
                className="flex flex-col items-center justify-center text-slate-100 p-1 -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-slate-950 transition active:scale-90">
                  <Scan className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-medium text-cyan-400 mt-0.5">
                  Scan
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center p-1.5 min-w-[56px] rounded-lg transition ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
              
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-cyan-400 text-black text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
