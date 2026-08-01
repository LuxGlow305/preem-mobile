import React, { useState, useEffect, useMemo } from 'react';
import { 
  InventoryItem, 
  StoreLocation, 
  StockMovement, 
  CostSummaryMetrics, 
  AICostAdvice 
} from './types';
import { 
  INITIAL_STORES, 
  INITIAL_INVENTORY, 
  INITIAL_MOVEMENTS, 
  INITIAL_AI_ADVICE 
} from './data/mockData';
import { HeaderNav } from './components/HeaderNav';
import { MobileFooterNav } from './components/MobileFooterNav';
import { CostAnalyticsView } from './components/CostAnalyticsView';
import { InventoryView } from './components/InventoryView';
import { LiveStreamView } from './components/LiveStreamView';
import { AICostAdvisorView } from './components/AICostAdvisorView';
import { StoreNetworkView } from './components/StoreNetworkView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { AddItemModal } from './components/AddItemModal';
import { TransferModal } from './components/TransferModal';
import { playBeep } from './utils/audio';

export default function App() {
  // Local storage persistence helpers
  const [stores] = useState<StoreLocation[]>(INITIAL_STORES);
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('apple_inventory_v1');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch (e) {
      return INITIAL_INVENTORY;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('apple_movements_v1');
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch (e) {
      return INITIAL_MOVEMENTS;
    }
  });

  const [aiAdvices, setAiAdvices] = useState<AICostAdvice[]>(INITIAL_AI_ADVICE);

  // App UI State
  const [selectedStoreId, setSelectedStoreId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [transferTargetItem, setTransferTargetItem] = useState<InventoryItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('apple_inventory_v1', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('apple_movements_v1', JSON.stringify(movements));
  }, [movements]);

  // Real-Time POS Telemetry Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Pick random item from inventory
      if (inventory.length === 0) return;
      const randomIndex = Math.floor(Math.random() * inventory.length);
      const item = inventory[randomIndex];

      const isSale = Math.random() > 0.35 && item.stockQty > 0;
      const delta = isSale ? -1 : Math.floor(Math.random() * 5) + 2;
      const newQty = Math.max(0, item.stockQty + delta);

      const store = stores.find((s) => s.id === item.storeLocationId);

      const newMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        itemId: item.id,
        itemTitle: item.title,
        sku: item.sku,
        type: isSale ? 'Sale' : 'Restock',
        quantity: Math.abs(delta),
        costImpact: isSale ? -item.costPrice : item.costPrice * delta,
        revenueImpact: isSale ? item.srp : 0,
        locationFrom: isSale ? store?.name : undefined,
        locationTo: !isSale ? store?.name : undefined,
        performedBy: isSale ? 'Express Retail POS' : 'Supply Chain Inbound Logistics',
        notes: isSale ? 'Walk-in Apple Pay Sale' : 'Automated Hub Restock Delivery',
      };

      setInventory((prev) =>
        prev.map((i) => {
          if (i.id === item.id) {
            const updatedQty = Math.max(0, i.stockQty + delta);
            let status = i.status;
            if (updatedQty === 0) status = 'Out of Stock';
            else if (updatedQty <= i.reorderPoint) status = 'Low Stock';
            else if (updatedQty > 35) status = 'Overstocked';
            else status = 'In Stock';

            return {
              ...i,
              stockQty: updatedQty,
              status,
            };
          }
          return i;
        })
      );

      setMovements((prev) => [newMovement, ...prev.slice(0, 49)]);
    }, 7000);

    return () => clearInterval(interval);
  }, [isSimulating, inventory, stores]);

  // Dynamic Cost & Profit Metrics
  const metrics: CostSummaryMetrics = useMemo(() => {
    const activeInventory = selectedStoreId === 'ALL' 
      ? inventory 
      : inventory.filter((i) => i.storeLocationId === selectedStoreId);

    const totalCapitalTied = activeInventory.reduce((acc, i) => acc + i.costPrice * i.stockQty, 0);
    const totalMonthlyHoldingCost = activeInventory.reduce((acc, i) => acc + i.holdingCostPerUnitMonth * i.stockQty, 0);
    const totalUnitsInStock = activeInventory.reduce((acc, i) => acc + i.stockQty, 0);

    const marginSums = activeInventory.reduce((acc, i) => acc + ((i.srp - i.costPrice) / i.srp), 0);
    const averageMarginPercent = (marginSums / (activeInventory.length || 1)) * 100;

    const deadStockValue = activeInventory
      .filter((i) => i.daysInVault > 60 && i.stockQty > 0)
      .reduce((acc, i) => acc + i.costPrice * i.stockQty, 0);

    const lowStockCount = activeInventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
    const overstockCount = activeInventory.filter((i) => i.status === 'Overstocked').length;

    // Simulated 30-day COGS and Revenue
    const revenue30Days = activeInventory.reduce((acc, i) => acc + i.srp * Math.max(2, Math.round(i.stockQty * 0.4)), 0);
    const cogs30Days = activeInventory.reduce((acc, i) => acc + i.costPrice * Math.max(2, Math.round(i.stockQty * 0.4)), 0);
    const estimatedMargin30Days = revenue30Days - cogs30Days - totalMonthlyHoldingCost;

    return {
      totalCapitalTied,
      totalMonthlyHoldingCost,
      averageMarginPercent,
      deadStockValue,
      totalUnitsInStock,
      lowStockCount,
      overstockCount,
      cogs30Days,
      revenue30Days,
      estimatedMargin30Days,
    };
  }, [inventory, selectedStoreId]);

  // Stock update handler
  const handleUpdateStock = (itemId: string, delta: number, reason: string) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const updatedQty = Math.max(0, i.stockQty + delta);
          let status = i.status;
          if (updatedQty === 0) status = 'Out of Stock';
          else if (updatedQty <= i.reorderPoint) status = 'Low Stock';
          else if (updatedQty > 35) status = 'Overstocked';
          else status = 'In Stock';

          return { ...i, stockQty: updatedQty, status };
        }
        return i;
      })
    );

    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      const store = stores.find((s) => s.id === item.storeLocationId);
      const isSale = delta < 0;
      const newMov: StockMovement = {
        id: `mov-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        itemId: item.id,
        itemTitle: item.title,
        sku: item.sku,
        type: isSale ? 'Sale' : 'Restock',
        quantity: Math.abs(delta),
        costImpact: isSale ? -item.costPrice : item.costPrice * delta,
        revenueImpact: isSale ? item.srp : 0,
        locationFrom: store?.name,
        performedBy: 'Store Specialist App',
        notes: reason || 'Manual Stock Level Adjustment',
      };
      setMovements((prev) => [newMov, ...prev.slice(0, 49)]);
    }
  };

  // Inter-store transfer handler
  const handleTransferStock = (itemId: string, targetStoreId: string, qty: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const sourceStore = stores.find((s) => s.id === item.storeLocationId);
    const targetStore = stores.find((s) => s.id === targetStoreId);

    // Deduct from source store
    handleUpdateStock(itemId, -qty, `Inter-store transfer to ${targetStore?.name}`);

    // Create or add to target store
    setInventory((prev) => {
      const existingInTarget = prev.find(
        (i) => i.sku === item.sku && i.storeLocationId === targetStoreId
      );

      if (existingInTarget) {
        return prev.map((i) =>
          i.id === existingInTarget.id ? { ...i, stockQty: i.stockQty + qty } : i
        );
      } else {
        const newItem: InventoryItem = {
          ...item,
          id: `item-tr-${Date.now()}`,
          storeLocationId: targetStoreId,
          stockQty: qty,
          status: 'In Stock',
        };
        return [...prev, newItem];
      }
    });

    const newMov: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      itemId: item.id,
      itemTitle: item.title,
      sku: item.sku,
      type: 'Transfer',
      quantity: qty,
      costImpact: 0,
      revenueImpact: 0,
      locationFrom: sourceStore?.name,
      locationTo: targetStore?.name,
      performedBy: 'Supply Chain Inter-Store Dispatch',
      notes: `Vault rebalancing: ${qty} units sent from ${sourceStore?.name} to ${targetStore?.name}`,
    };
    setMovements((prev) => [newMov, ...prev.slice(0, 49)]);
    playBeep('success');
  };

  // Add Item handler
  const handleAddItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
    playBeep('success');
  };

  // Execute AI Directive handler
  const handleApplyAiAdvice = (adv: AICostAdvice) => {
    if (adv.suggestedAction) {
      const { type, sku, qty = 10, targetLocationId } = adv.suggestedAction;
      const item = inventory.find((i) => i.sku === sku);

      if (type === 'reorder' && item) {
        handleUpdateStock(item.id, qty, `AI Directive: Emergency Restock`);
      } else if (type === 'transfer' && item && targetLocationId) {
        handleTransferStock(item.id, targetLocationId, qty);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation */}
      <HeaderNav
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAddItem={() => setIsAddItemOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAiAlertsCount={aiAdvices.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'analytics' && (
          <CostAnalyticsView
            inventory={inventory}
            metrics={metrics}
            onNavigateToCategory={(cat) => {
              setActiveCategoryFilter(cat);
              setActiveTab('inventory');
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            stores={stores}
            selectedStoreId={selectedStoreId}
            onUpdateStock={handleUpdateStock}
            onOpenTransferModal={(item) => setTransferTargetItem(item)}
            onOpenAddItem={() => setIsAddItemOpen(true)}
            onOpenScanner={() => setIsScannerOpen(true)}
            activeCategoryFilter={activeCategoryFilter}
            setActiveCategoryFilter={setActiveCategoryFilter}
          />
        )}

        {activeTab === 'livestream' && (
          <LiveStreamView
            movements={movements}
            inventory={inventory}
            stores={stores}
            isSimulating={isSimulating}
            onToggleSimulation={() => setIsSimulating(!isSimulating)}
            onSimulateSale={(item) => handleUpdateStock(item.id, -1, 'Manual Simulator Sale')}
            onSimulateRestock={(item, q) => handleUpdateStock(item.id, q, 'Manual Simulator Restock')}
          />
        )}

        {activeTab === 'ai-advisor' && (
          <AICostAdvisorView
            advices={aiAdvices}
            inventory={inventory}
            metrics={metrics}
            selectedStoreId={selectedStoreId}
            onApplyAdvice={handleApplyAiAdvice}
            onSetAdvices={setAiAdvices}
          />
        )}

        {activeTab === 'stores' && (
          <StoreNetworkView
            stores={stores}
            inventory={inventory}
            onOpenTransferModal={(item) => setTransferTargetItem(item)}
            onSelectStore={(sId) => {
              setSelectedStoreId(sId);
              setActiveTab('inventory');
            }}
          />
        )}
      </main>

      {/* Mobile Footer Navigation */}
      <MobileFooterNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        unreadAiAlertsCount={aiAdvices.length}
      />

      {/* Interactive Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        inventory={inventory}
        onUpdateStock={handleUpdateStock}
      />

      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        stores={stores}
        onAddItem={handleAddItem}
      />

      <TransferModal
        item={transferTargetItem}
        isOpen={!!transferTargetItem}
        onClose={() => setTransferTargetItem(null)}
        stores={stores}
        onTransfer={handleTransferStock}
      />

    </div>
  );
}
