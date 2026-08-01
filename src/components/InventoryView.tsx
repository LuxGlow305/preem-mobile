import React, { useState } from 'react';
import { InventoryItem, StoreLocation, AppleCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  LayoutGrid, 
  List, 
  QrCode, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers
} from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  stores: StoreLocation[];
  selectedStoreId: string;
  onUpdateStock: (itemId: string, delta: number, reason: string) => void;
  onOpenTransferModal: (item: InventoryItem) => void;
  onOpenAddItem: () => void;
  onOpenScanner: () => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  stores,
  selectedStoreId,
  onUpdateStock,
  onOpenTransferModal,
  onOpenAddItem,
  onOpenScanner,
  activeCategoryFilter,
  setActiveCategoryFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSerialItem, setSelectedSerialItem] = useState<InventoryItem | null>(null);

  const categories: AppleCategory[] = [
    'iPhone',
    'Mac',
    'iPad',
    'Watch',
    'AirPods',
    'Vision',
    'Home',
    'Accessories',
  ];

  // Filtering
  const filteredItems = React.useMemo(() => {
    return inventory.filter((item) => {
      const matchesStore = selectedStoreId === 'ALL' || item.storeLocationId === selectedStoreId;
      const matchesCat = activeCategoryFilter === 'ALL' || item.category === activeCategoryFilter;
      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStore && matchesCat && matchesSearch;
    });
  }, [inventory, selectedStoreId, activeCategoryFilter, searchTerm]);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </span>
        );
      case 'Overstocked':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Overstocked
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top Search & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Apple SKUs, devices, models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls: Scanner & Add & View Mode Toggle */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={onOpenScanner}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-medium border border-slate-700/80 flex items-center space-x-1.5 transition"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Simulate Scan</span>
            </button>

            <button
              onClick={onOpenAddItem}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center space-x-1 shadow-md shadow-blue-900/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Compact Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
              activeCategoryFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            All Products ({inventory.length})
          </button>
          {categories.map((cat) => {
            const count = inventory.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  activeCategoryFilter === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Item Count & Active Location Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{filteredItems.length}</strong> Apple store items
        </p>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filtered by: {selectedStoreId === 'ALL' ? 'Global Stores' : stores.find((s) => s.id === selectedStoreId)?.name}</span>
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const store = stores.find((s) => s.id === item.storeLocationId);
            const totalItemHolding = item.holdingCostPerUnitMonth * item.stockQty;

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-xl group"
              >
                {/* Product Card Top Image & Details */}
                <div>
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 text-[10px] font-mono text-slate-300">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                        SKU: {item.sku}
                      </span>
                      <h4 className="font-bold text-sm text-white line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {item.color} {item.storage ? `• ${item.storage}` : ''}
                      </p>
                    </div>

                    {/* Price & Margin Breakdown */}
                    <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Retail SRP</span>
                        <span className="font-bold text-slate-100 font-mono">{formatCurrency(item.srp)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Wholesale COGS</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatCurrency(item.costPrice)}</span>
                      </div>
                    </div>

                    {/* Store Location & Holding Overhead */}
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span>Store Location:</span>
                        <span className="font-medium text-slate-300">{store?.name || 'Central Hub'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vault Dwell Time:</span>
                        <span className={`font-mono font-medium ${item.daysInVault > 30 ? 'text-amber-400' : 'text-slate-300'}`}>
                          {item.daysInVault} days
                        </span>
                      </div>
                      <div className="flex justify-between text-rose-400/90 font-mono">
                        <span>Carrying Overhead:</span>
                        <span>{formatCurrency(totalItemHolding)}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Controls & Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 mt-3">
                  <div className="flex items-center justify-between mb-3 pt-3">
                    <span className="text-xs text-slate-400 font-medium">Vault Quantity</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateStock(item.id, -1, 'POS Sale / Adjustment')}
                        disabled={item.stockQty <= 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 flex items-center justify-center border border-slate-700 disabled:opacity-40 transition active:scale-95"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-sm text-white px-2 min-w-[2rem] text-center">
                        {item.stockQty}
                      </span>
                      <button
                        onClick={() => onUpdateStock(item.id, 1, 'Store Restock')}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 flex items-center justify-center border border-slate-700 transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Bottom Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenTransferModal(item)}
                      className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-medium border border-slate-700/80 flex items-center justify-center space-x-1 transition"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                      <span>Transfer</span>
                    </button>
                    <button
                      onClick={() => setSelectedSerialItem(item)}
                      className="w-full py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-[11px] font-medium border border-slate-800 flex items-center justify-center space-x-1 transition"
                    >
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>Serials ({item.serialNumbers.length})</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table Mode View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Device Product</th>
                  <th className="py-3.5 px-3">SKU / Model</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">SRP / COGS</th>
                  <th className="py-3.5 px-3">Vault Qty</th>
                  <th className="py-3.5 px-3">Dwell Days</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredItems.map((item) => {
                  const store = stores.find((s) => s.id === item.storeLocationId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-medium text-white flex items-center space-x-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-9 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-100">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.color} • {item.category}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-mono text-[11px] text-cyan-400">{item.sku}</p>
                        <p className="text-[10px] text-slate-400">{item.model}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">{store?.name || 'Central Hub'}</td>
                      <td className="py-3 px-3">
                        <p className="font-mono text-white font-bold">{formatCurrency(item.srp)}</p>
                        <p className="font-mono text-[10px] text-emerald-400">COGS {formatCurrency(item.costPrice)}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => onUpdateStock(item.id, -1, 'POS Sale')}
                            disabled={item.stockQty <= 0}
                            className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-300 disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-slate-100 px-1">{item.stockQty}</span>
                          <button
                            onClick={() => onUpdateStock(item.id, 1, 'Restock')}
                            className="p-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-300">{item.daysInVault}d</td>
                      <td className="py-3 px-3">{getStatusBadge(item.status)}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => onOpenTransferModal(item)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-[11px] font-medium border border-slate-700/80"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Serial Number Inspector Drawer/Modal */}
      {selectedSerialItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Apple Vault Serial Register</h3>
                <p className="text-xs text-slate-400">{selectedSerialItem.title}</p>
              </div>
              <button
                onClick={() => setSelectedSerialItem(null)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedSerialItem.serialNumbers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No registered serial numbers for bulk item or out of stock.
                </p>
              ) : (
                selectedSerialItem.serialNumbers.map((sn, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                    <span className="text-cyan-400 font-bold">{sn}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      VERIFIED VAULT
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedSerialItem(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Close Vault Register
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
