export type AppleCategory = 
  | 'iPhone'
  | 'Mac'
  | 'iPad'
  | 'Watch'
  | 'AirPods'
  | 'Vision'
  | 'Home'
  | 'Accessories';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';

export interface StoreLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  isHub: boolean;
  code: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  title: string;
  category: AppleCategory;
  model: string;
  storage?: string;
  color: string;
  srp: number; // Suggested Retail Price ($)
  costPrice: number; // Wholesale/COGS Cost ($)
  stockQty: number;
  reorderPoint: number;
  reorderQty: number;
  holdingCostPerUnitMonth: number; // Monthly storage + depreciation cost ($)
  storeLocationId: string;
  status: StockStatus;
  image: string;
  serialNumbers: string[];
  lastRestocked: string;
  daysInVault: number; // Average days sitting in stock
}

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  itemTitle: string;
  sku: string;
  type: 'Sale' | 'Restock' | 'Transfer' | 'Adjustment' | 'Damage/Shrinkage';
  quantity: number;
  costImpact: number; // Financial cost impact ($)
  revenueImpact: number; // Revenue impact ($)
  locationFrom?: string;
  locationTo?: string;
  performedBy: string;
  notes?: string;
}

export interface CostSummaryMetrics {
  totalCapitalTied: number;
  totalMonthlyHoldingCost: number;
  averageMarginPercent: number;
  deadStockValue: number; // Overstocked items > 60 days
  totalUnitsInStock: number;
  lowStockCount: number;
  overstockCount: number;
  cogs30Days: number;
  revenue30Days: number;
  estimatedMargin30Days: number;
}

export interface AICostAdvice {
  id: string;
  title: string;
  category: 'Holding Cost' | 'Stockout Risk' | 'Inter-Store Transfer' | 'Dead Stock';
  impactAmount: number;
  impactType: 'savings' | 'revenue_risk' | 'margin_boost';
  urgency: 'high' | 'medium' | 'low';
  description: string;
  actionItem: string;
  relatedSku?: string;
  suggestedAction?: {
    type: 'reorder' | 'transfer' | 'discount';
    sku: string;
    qty?: number;
    targetLocationId?: string;
  };
}
