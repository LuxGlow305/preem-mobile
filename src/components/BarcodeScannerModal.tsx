import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { playBeep } from '../utils/audio';
import { formatCurrency } from '../utils/formatters';
import { 
  Scan, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  Plus, 
  Minus, 
  Package 
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, delta: number, reason: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUpdateStock,
}) => {
  const [scannedSku, setScannedSku] = useState<string>(inventory[0]?.sku || '');
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(inventory[0] || null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scanSuccessAnim, setScanSuccessAnim] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTriggerScan = (skuToScan?: string) => {
    const targetSku = skuToScan || scannedSku;
    const found = inventory.find(
      (item) => item.sku.toLowerCase() === targetSku.toLowerCase()
    );

    if (found) {
      setScannedItem(found);
      setScanSuccessAnim(true);
      if (soundEnabled) playBeep('scan');
      setTimeout(() => setScanSuccessAnim(false), 800);
    } else {
      setScannedItem(null);
      if (soundEnabled) playBeep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative space-y-4">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Apple Laser Vault Scanner</h3>
              <p className="text-xs text-slate-400">Simulate handheld barcode scan for stock updates</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              title={soundEnabled ? 'Mute Scanner Sound' : 'Enable Scanner Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Laser Scanner Camera Viewfinder Simulation */}
        <div className="p-5 space-y-4">
          <div className={`relative h-56 bg-slate-950 rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center transition-colors ${
            scanSuccessAnim ? 'border-emerald-500 bg-emerald-950/20' : 'border-cyan-500/50'
          }`}>
            
            {/* Corner Crosshairs */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

            {/* Red Scanning Laser Bar */}
            <div className="absolute w-full h-0.5 bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse" />

            {/* Barcode Graphic */}
            <div className="flex items-center space-x-1 opacity-60">
              <div className="w-1 h-16 bg-white" />
              <div className="w-2 h-16 bg-white" />
              <div className="w-0.5 h-16 bg-white" />
              <div className="w-3 h-16 bg-white" />
              <div className="w-1 h-16 bg-white" />
              <div className="w-2.5 h-16 bg-white" />
              <div className="w-1 h-16 bg-white" />
              <div className="w-3 h-16 bg-white" />
            </div>

            <p className="text-[11px] font-mono text-cyan-300 bg-slate-900/90 px-3 py-1 rounded-full border border-cyan-500/30 mt-3">
              {scannedItem ? `BARCODE: ${scannedItem.sku}` : 'ALIGN BARCODE WITH LASER'}
            </p>
          </div>

          {/* Quick SKU Picker for Instant Simulation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Select Apple SKU to Scan:</label>
            <div className="flex gap-2">
              <select
                value={scannedSku}
                onChange={(e) => {
                  setScannedSku(e.target.value);
                  handleTriggerScan(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.sku}>
                    {item.sku} — {item.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleTriggerScan()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition shrink-0"
              >
                Scan Now
              </button>
            </div>
          </div>

          {/* Scanned Result Card */}
          {scannedItem && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle className="w-3 h-3" />
                  VERIFIED SKU MATCH
                </span>
                <span className="font-mono text-xs text-slate-400">COGS {formatCurrency(scannedItem.costPrice)}</span>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={scannedItem.image}
                  alt={scannedItem.title}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">{scannedItem.title}</h4>
                  <p className="text-xs text-slate-400">{scannedItem.color} • {scannedItem.category}</p>
                </div>
              </div>

              {/* Adjust Stock Controls */}
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Vault Level</span>
                  <span className="font-mono font-bold text-base text-cyan-400">
                    {scannedItem.stockQty} units
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onUpdateStock(scannedItem.id, -1, 'Barcode POS Scan');
                      if (soundEnabled) playBeep('scan');
                    }}
                    disabled={scannedItem.stockQty <= 0}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 hover:bg-rose-500/30 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Deduct Sale (-1)</span>
                  </button>

                  <button
                    onClick={() => {
                      onUpdateStock(scannedItem.id, 1, 'Barcode Restock Scan');
                      if (soundEnabled) playBeep('success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 hover:bg-emerald-500/30 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock (+1)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
          >
            Close Scanner Modal
          </button>
        </div>

      </div>
    </div>
  );
};
