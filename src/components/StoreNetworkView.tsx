import React from 'react';
import { StoreLocation, InventoryItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Building2, Package, MapPin, ArrowRightLeft } from 'lucide-react';

interface StoreNetworkViewProps {
  stores: StoreLocation[];
  inventory: InventoryItem[];
  onOpenTransferModal: (item: InventoryItem) => void;
  onSelectStore: (storeId: string) => void;
}

export const StoreNetworkView: React.FC<StoreNetworkViewProps> = ({
  stores,
  inventory,
  onOpenTransferModal,
  onSelectStore,
}) => {
  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-extrabold text-white">Apple Store Network & Hub Vaults</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Monitor multi-store inventory allocation, vault capacities, and rebalance stock levels across global flagships.
        </p>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stores.map((store) => {
          const storeItems = inventory.filter((i) => i.storeLocationId === store.id);
          const totalUnits = storeItems.reduce((acc, i) => acc + i.stockQty, 0);
          const totalCapital = storeItems.reduce((acc, i) => acc + i.costPrice * i.stockQty, 0);
          const totalHolding = storeItems.reduce((acc, i) => acc + i.holdingCostPerUnitMonth * i.stockQty, 0);

          return (
            <div
              key={store.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    store.isHub
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {store.isHub ? 'DISTRIBUTION HUB' : 'RETAIL FLAGSHIP'}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{store.code}</span>
                </div>

                <h3 className="font-bold text-lg text-white">{store.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{store.address}</span>
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 my-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Stock Vault Units</span>
                    <span className="font-bold text-slate-100">{formatNumber(totalUnits)} units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Capital Tied</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(totalCapital)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Monthly Carrying</span>
                    <span className="font-bold text-rose-400">{formatCurrency(totalHolding)}/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Unique SKUs</span>
                    <span className="font-bold text-cyan-400">{storeItems.length} SKUs</span>
                  </div>
                </div>

                {/* Top Stocked Items in Store */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-semibold block">
                    Vault Highlights
                  </span>
                  {storeItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-300 font-medium truncate max-w-[180px]">{item.title}</span>
                      <span className="font-mono text-cyan-400 font-bold">{item.stockQty} in stock</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 mt-4 flex gap-2">
                <button
                  onClick={() => onSelectStore(store.id)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700/80 transition"
                >
                  View Inventory
                </button>
                {storeItems[0] && (
                  <button
                    onClick={() => onOpenTransferModal(storeItems[0])}
                    className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-medium border border-cyan-500/30 transition flex items-center gap-1 shrink-0"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
