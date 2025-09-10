import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Search, Filter } from 'lucide-react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';

export function InventoryOverview() {
  const { data: inventory, loading, error } = useFirebaseData('finishedGoodsPackagedInventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');

  if (loading) return <LoadingSpinner text="Loading inventory..." />;
  if (error) return <ErrorMessage message={error} />;

  const inventoryArray = inventory ? Object.entries(inventory).map(([id, data]) => ({ id, ...data })) : [];
  
  const filteredInventory = inventoryArray.filter(item => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || item.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(inventoryArray.map(item => item.location))].filter(Boolean);
  const totalItems = inventoryArray.reduce((sum, item) => sum + (item.unitsInStock || 0), 0);
  const lowStockItems = inventoryArray.filter(item => (item.unitsInStock || 0) < 10);
  const totalProducts = new Set(inventoryArray.map(item => item.productName)).size;

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
    if (stock < 10) return { color: 'text-amber-600 bg-amber-50', label: 'Low Stock' };
    if (stock < 50) return { color: 'text-blue-600 bg-blue-50', label: 'Normal' };
    return { color: 'text-green-600 bg-green-50', label: 'Good Stock' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Overview</h1>
        <p className="text-gray-600 mt-1">Monitor finished goods inventory levels and locations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalItems.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalProducts}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{lowStockItems.length}</p>
            </div>
            <div className="p-3 rounded-full bg-amber-500">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locations</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{locations.length}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or batch numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Variant</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item.unitsInStock || 0);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Grade: {item.qualityGrade}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{item.batchNumber}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">{item.location}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{item.unitsInStock || 0}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {item.variantName} ({item.variantSize} {item.variantUnit})
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inventory items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}