import React, { useState } from 'react';
import { InventoryItem, CostSummaryMetrics } from '../types';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  DollarSign, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  ArrowUpRight, 
  ShieldAlert,
  Flame
} from 'lucide-react';

interface CostAnalyticsViewProps {
  inventory: InventoryItem[];
  metrics: CostSummaryMetrics;
  onNavigateToCategory?: (category: string) => void;
}

export const CostAnalyticsView: React.FC<CostAnalyticsViewProps> = ({
  inventory,
  metrics,
}) => {
  // Simulator slider state for reducing days in vault
  const [targetVaultDays, setTargetVaultDays] = useState<number>(20);

  // Category breakdown for charts
  const categoryData = React.useMemo(() => {
    const map: Record<string, { category: string; value: number; holdingCost: number; items: number }> = {};
    inventory.forEach((item) => {
      const cat = item.category;
      if (!map[cat]) {
        map[cat] = { category: cat, value: 0, holdingCost: 0, items: 0 };
      }
      map[cat].value += item.costPrice * item.stockQty;
      map[cat].holdingCost += item.holdingCostPerUnitMonth * item.stockQty;
      map[cat].items += item.stockQty;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [inventory]);

  // Stock status breakdown for pie chart
  const statusData = React.useMemo(() => {
    const map = {
      'In Stock': 0,
      'Low Stock': 0,
      'Overstocked': 0,
      'Out of Stock': 0,
    };
    inventory.forEach((item) => {
      map[item.status] += 1;
    });
    return [
      { name: 'In Stock', value: map['In Stock'], color: '#10b981' },
      { name: 'Low Stock', value: map['Low Stock'], color: '#f59e0b' },
      { name: 'Overstocked', value: map['Overstocked'], color: '#ef4444' },
      { name: 'Out of Stock', value: map['Out of Stock'], color: '#6b7280' },
    ];
  }, [inventory]);

  // Top costly idle items (> 30 days in vault)
  const costlyIdleItems = React.useMemo(() => {
    return [...inventory]
      .filter((item) => item.daysInVault > 20 && item.stockQty > 0)
      .map((item) => ({
        ...item,
        totalHoldingCost: item.holdingCostPerUnitMonth * item.stockQty,
        capitalTied: item.costPrice * item.stockQty,
      }))
      .sort((a, b) => b.totalHoldingCost - a.totalHoldingCost)
      .slice(0, 5);
  }, [inventory]);

  // Simulation calculations
  const avgDaysInVault = Math.round(
    inventory.reduce((acc, i) => acc + i.daysInVault, 0) / (inventory.length || 1)
  );
  const currentTotalMonthlyHolding = metrics.totalMonthlyHoldingCost;
  const simulatedMonthlyHolding = Math.max(
    500,
    Math.round(currentTotalMonthlyHolding * (targetVaultDays / Math.max(10, avgDaysInVault)))
  );
  const potentialMonthlySavings = Math.max(0, currentTotalMonthlyHolding - simulatedMonthlyHolding);
  const potentialAnnualSavings = potentialMonthlySavings * 12;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Context */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 font-mono text-xs font-semibold border border-blue-500/30">
                REAL-TIME COST TELEMETRY
              </span>
              <span className="text-xs text-slate-400">Vault & Holding Audit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1.5 tracking-tight">
              Inventory Holding & Capital Cost Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitor capital tied up in high-tier Apple hardware, prevent dead-stock storage drain, and eliminate costly stockout revenue loss.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Monthly Holding Overhead
              </p>
              <p className="text-lg font-extrabold text-amber-400 font-mono">
                {formatCurrency(metrics.totalMonthlyHoldingCost)}
                <span className="text-xs text-slate-400 font-normal ml-1">/mo</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Capital Tied Up */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Capital Tied Up</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
            {formatCurrency(metrics.totalCapitalTied)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>{formatNumber(metrics.totalUnitsInStock)} units total</span>
            <span className="text-emerald-400 font-medium">{formatPercent(metrics.averageMarginPercent)} Avg Margin</span>
          </div>
        </div>

        {/* Card 2: Holding Costs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Carrying Cost</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
            {formatCurrency(metrics.totalMonthlyHoldingCost)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>Est. {formatCurrency(metrics.totalMonthlyHoldingCost * 12)} /yr</span>
            <span className="text-amber-300 font-medium">Vault Overhead</span>
          </div>
        </div>

        {/* Card 3: Dead Stock at Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Dead Stock (&gt; 60 days)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono tracking-tight">
            {formatCurrency(metrics.deadStockValue)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>{metrics.overstockCount} overstocked items</span>
            <span className="text-rose-400 font-medium">High Depreciation</span>
          </div>
        </div>

        {/* Card 4: 30-Day Gross Profit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">30-Day Estimated Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {formatCurrency(metrics.estimatedMargin30Days)}
          </p>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>Sales: {formatCurrency(metrics.revenue30Days)}</span>
            <span className="text-emerald-400 font-medium">COGS {formatCurrency(metrics.cogs30Days)}</span>
          </div>
        </div>
      </div>

      {/* Cost Reduction Interactive Simulator */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Interactive Carrying Cost Optimization Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Simulate financial savings by reducing average device days sitting in storage vault
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30 font-bold">
              Current Avg: {avgDaysInVault} Days
            </span>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
              <span>Target Vault Dwell Time (Days): <strong className="text-cyan-300 font-mono text-sm">{targetVaultDays} days</strong></span>
              <span className="text-slate-400">Benchmark: 15-20 Days</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={targetVaultDays}
              onChange={(e) => setTargetVaultDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>10 Days (Ultra Fast Turnover)</span>
              <span>30 Days (Standard)</span>
              <span>60 Days (High Overhead)</span>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">New Monthly Holding Overhead</p>
              <p className="text-lg font-bold text-slate-200 font-mono mt-0.5">
                {formatCurrency(simulatedMonthlyHolding)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Potential Monthly Savings</p>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {formatCurrency(potentialMonthlySavings)} / mo
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Annual Profit Boost</p>
              <p className="text-lg font-extrabold text-cyan-300 font-mono mt-0.5">
                +{formatCurrency(potentialAnnualSavings)} / yr
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Capital Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Inventory Capital by Product Category</span>
                </h3>
                <p className="text-xs text-slate-400">Total wholesale dollar value tied up in store vaults</p>
              </div>
            </div>

            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="category" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => `$${val / 1000}k`} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(val: any) => [formatCurrency(Number(val)), 'Capital Value']}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#fbbf24'][index % 6]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Highest Value</p>
              <p className="font-bold text-slate-200 mt-0.5">{categoryData[0]?.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Categories Active</p>
              <p className="font-bold text-slate-200 mt-0.5">{categoryData.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Avg Cost / Cat</p>
              <p className="font-bold text-cyan-400 mt-0.5">
                {formatCurrency(metrics.totalCapitalTied / (categoryData.length || 1))}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Status Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Stock Health Ratio</h3>
            <p className="text-xs text-slate-400 mb-4">Store inventory balance across stock statuses</p>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1 mt-2">
            <div className="flex justify-between text-slate-300">
              <span>Low Stock Alerts:</span>
              <span className="font-bold text-amber-400">{metrics.lowStockCount} items</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Overstocked Items:</span>
              <span className="font-bold text-rose-400">{metrics.overstockCount} items</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Costly Idle Devices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Highest Carrying Cost Idle Items (&gt; 20 Days in Vault)
              </h3>
              <p className="text-xs text-slate-400">
                Devices accumulating monthly holding fees and storage depreciation
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Stock Qty</th>
                <th className="py-3 px-3">Vault Dwell</th>
                <th className="py-3 px-3">Capital Tied</th>
                <th className="py-3 px-3">Monthly Overhead</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {costlyIdleItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-medium text-white flex items-center space-x-2.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                    />
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.color} • {item.storage || 'Std'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{item.sku}</td>
                  <td className="py-3 px-3 font-bold text-slate-200">{item.stockQty} units</td>
                  <td className="py-3 px-3 font-mono text-amber-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.daysInVault} days
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">{formatCurrency(item.capitalTied)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-400">
                    {formatCurrency(item.totalHoldingCost)} /mo
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
