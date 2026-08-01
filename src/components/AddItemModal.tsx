import React, { useState } from 'react';
import { InventoryItem, StoreLocation, AppleCategory } from '../types';
import { Plus, Package } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: StoreLocation[];
  onAddItem: (item: InventoryItem) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  stores,
  onAddItem,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AppleCategory>('iPhone');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('256GB');
  const [color, setColor] = useState('Natural');
  const [srp, setSrp] = useState(1199);
  const [costPrice, setCostPrice] = useState(880);
  const [stockQty, setStockQty] = useState(20);
  const [holdingCost, setHoldingCost] = useState(25);
  const [storeId, setStoreId] = useState(stores[0]?.id || '');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const generatedSku = `AAPL-${category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      sku: generatedSku,
      title: title || `${category} ${model || 'Device'}`,
      category,
      model: model || title,
      storage,
      color,
      srp: Number(srp),
      costPrice: Number(costPrice),
      stockQty: Number(stockQty),
      reorderPoint: 10,
      reorderQty: 25,
      holdingCostPerUnitMonth: Number(holdingCost),
      storeLocationId: storeId,
      status: Number(stockQty) > 30 ? 'Overstocked' : Number(stockQty) < 5 ? 'Low Stock' : 'In Stock',
      image: image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
      serialNumbers: [`SN-${generatedSku}-001`],
      lastRestocked: new Date().toISOString().split('T')[0],
      daysInVault: 1,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white text-base">Register New Apple Device SKU</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. iPhone 16 Pro 512GB"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppleCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {['iPhone', 'Mac', 'iPad', 'Watch', 'AirPods', 'Vision', 'Home', 'Accessories'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Finish / Color</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Retail SRP ($)</label>
              <input
                type="number"
                value={srp}
                onChange={(e) => setSrp(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Wholesale COGS ($)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Initial Stock Qty</label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Monthly Holding Cost ($/unit)</label>
              <input
                type="number"
                value={holdingCost}
                onChange={(e) => setHoldingCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Assigned Store Location</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center justify-center space-x-1 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Register Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
