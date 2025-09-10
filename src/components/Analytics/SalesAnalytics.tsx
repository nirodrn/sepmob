import React, { useState } from 'react';
import { TrendingUp, Users, Package, DollarSign, Calendar, Download } from 'lucide-react';

export function SalesAnalytics() {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [viewType, setViewType] = useState('overview');

  // Mock analytics data
  const analyticsData = {
    totalRevenue: 2400000,
    totalOrders: 156,
    totalCustomers: 89,
    avgOrderValue: 15385,
    growthRate: 18.5,
    topProducts: [
      { name: 'M oil', sales: 1200000, units: 800, growth: 15.2 },
      { name: 'B oil', sales: 800000, units: 400, growth: 22.1 }
    ],
    topRepresentatives: [
      { name: 'John Doe', role: 'DirectRepresentative', sales: 450000, orders: 28 },
      { name: 'Jane Smith', role: 'DirectShowroomManager', sales: 380000, orders: 24 },
      { name: 'Mike Wilson', role: 'Distributor', sales: 520000, orders: 32 }
    ],
    monthlyTrend: [
      { month: 'Jan', revenue: 180000, orders: 12 },
      { month: 'Feb', revenue: 220000, orders: 15 },
      { month: 'Mar', revenue: 280000, orders: 18 },
      { month: 'Apr', revenue: 320000, orders: 22 },
      { month: 'May', revenue: 380000, orders: 26 },
      { month: 'Jun', revenue: 420000, orders: 28 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive sales performance insights</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                LKR {analyticsData.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{analyticsData.growthRate}%
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{analyticsData.totalOrders}</p>
              <p className="text-sm text-gray-500 mt-2">This period</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{analyticsData.totalCustomers}</p>
              <p className="text-sm text-gray-500 mt-2">Unique customers</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                LKR {analyticsData.avgOrderValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">Per order</p>
            </div>
            <div className="p-3 rounded-full bg-amber-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart placeholder</p>
              <p className="text-sm text-gray-400">Chart library integration needed</p>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.units} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">LKR {product.sales.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{product.growth}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Representatives */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Representatives</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Representative</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Sales</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.topRepresentatives.map((rep, index) => (
                <tr key={rep.name} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <p className="font-medium text-gray-900">{rep.name}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {rep.role.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">LKR {rep.sales.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{rep.orders}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">LKR {Math.round(rep.sales / rep.orders).toLocaleString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}