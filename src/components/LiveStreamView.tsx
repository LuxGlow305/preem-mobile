import React, { useState } from 'react';
import { StockMovement, InventoryItem, StoreLocation } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Activity, 
  Play, 
  Pause, 
  ShoppingCart, 
  Truck, 
  ArrowRightLeft, 
  AlertOctagon, 
  PlusCircle, 
  Radio
} from 'lucide-react';

interface LiveStreamViewProps {
  movements: StockMovement[];
  inventory: InventoryItem[];
  stores: StoreLocation[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onSimulateSale: (item: InventoryItem) => void;
  onSimulateRestock: (item: InventoryItem, qty: number) => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({
  movements,
  inventory,
  isSimulating,
  onToggleSimulation,
  onSimulateSale,
  onSimulateRestock,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0]?.id || '');
  const [restockQty, setRestockQty] = useState<number>(10);

  const selectedItem = inventory.find((i) => i.id === selectedItemId);

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'Sale':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            POS SALE
          </span>
        );
      case 'Restock':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            RESTOCK
          </span>
        );
      case 'Transfer':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3" />
            HUB TRANSFER
          </span>
        );
      case 'Damage/Shrinkage':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" />
            SHRINKAGE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Real-time Status Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              {isSimulating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              {isSimulating ? 'POS TELEMETRY STREAM ACTIVE' : 'TELEMETRY STREAM PAUSED'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Real-Time Apple Store Inventory Movements
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live stream of customer purchases, logistics deliveries, inter-store vault reallocations, and shrinkage audits.
          </p>
        </div>

        <button
          onClick={onToggleSimulation}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-lg ${
            isSimulating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-4 h-4 fill-amber-300" />
              <span>Pause Auto Telemetry</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Real-Time Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Manual POS Transaction Injector */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="font-bold text-white text-base">
            Manual Inventory Event Trigger
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Select Target Device SKU</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.sku}) - Stock: {item.stockQty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Restock Batch Size</label>
            <input
              type="number"
              min="1"
              max="100"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => selectedItem && onSimulateSale(selectedItem)}
            disabled={!selectedItem || selectedItem.stockQty <= 0}
            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span>Simulate POS Customer Sale (-1)</span>
          </button>

          <button
            onClick={() => selectedItem && onSimulateRestock(selectedItem, restockQty)}
            disabled={!selectedItem}
            className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center space-x-1.5 transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span>Simulate Logistics Batch Restock (+{restockQty})</span>
          </button>
        </div>
      </div>

      {/* Movement Audit Stream */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Live Activity Audit Log</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {movements.length} total events recorded
          </span>
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {movements.map((mov) => (
            <div
              key={mov.id}
              className="bg-slate-950 border border-slate-800/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getMovementBadge(mov.type)}</div>
                <div>
                  <h4 className="font-semibold text-xs text-white">
                    {mov.itemTitle} <span className="font-mono text-[11px] text-cyan-400">({mov.sku})</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {mov.notes} • By <span className="text-slate-300 font-medium">{mov.performedBy}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    {mov.timestamp} • Location: {mov.locationFrom || mov.locationTo || 'Central Vault'}
                  </p>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="text-right self-end sm:self-center">
                {mov.type === 'Sale' ? (
                  <div>
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      +{formatCurrency(mov.revenueImpact)} Rev
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      COGS: {formatCurrency(Math.abs(mov.costImpact))}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-blue-400 font-mono block">
                      {mov.costImpact >= 0 ? '+' : ''}{formatCurrency(mov.costImpact)} Cost
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Qty: {mov.quantity} units
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
