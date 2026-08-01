import React, { useState } from 'react';
import { InventoryItem, StoreLocation } from '../types';
import { ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  stores: StoreLocation[];
  onTransfer: (itemId: string, targetStoreId: string, qty: number) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  item,
  isOpen,
  onClose,
  stores,
  onTransfer,
}) => {
  const [targetStoreId, setTargetStoreId] = useState<string>(stores[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(1);

  if (!isOpen || !item) return null;

  const currentStore = stores.find((s) => s.id === item.storeLocationId);
  const availableTargetStores = stores.filter((s) => s.id !== item.storeLocationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferQty > 0 && transferQty <= item.stockQty && targetStoreId) {
      onTransfer(item.id, targetStoreId, transferQty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-white text-base">Inter-Store Vault Transfer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover bg-slate-800" />
          <div>
            <h4 className="font-bold text-sm text-white">{item.title}</h4>
            <p className="text-xs text-cyan-400 font-mono">{item.sku}</p>
            <p className="text-[11px] text-slate-400">Available: {item.stockQty} units at {currentStore?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Destination Store Vault</label>
            <select
              value={targetStoreId}
              onChange={(e) => setTargetStoreId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
            >
              {availableTargetStores.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Quantity to Reallocate</label>
            <input
              type="number"
              min="1"
              max={item.stockQty}
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transferQty <= 0 || transferQty > item.stockQty}
              className="w-1/2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
