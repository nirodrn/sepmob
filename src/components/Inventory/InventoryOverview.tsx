import React, { useState } from 'react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Badge } from '../Common/Badge';
import { Package, AlertTriangle, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  product: string;
  quantity: number;
  status: string;
  date: string;
  price?: number;
}

export function InventoryOverview() {
  const { data: inventory, loading, error } = useFirebaseData<Record<string, InventoryItem>>('dsinventory');
  const { updateData } = useFirebaseActions('dsinventory');
  const [prices, setPrices] = useState<Record<string, number | string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handlePriceChange = (id: string, value: string) => {
    setPrices({ ...prices, [id]: value });
  };

  const handleSavePrice = async (id: string) => {
    const price = prices[id];
    if (price !== undefined && price !== '') {
      try {
        await updateData(id, { price: parseFloat(price as string) });
        alert('Price updated successfully!');
        //-clear price from state after saving
        const newPrices = { ...prices };
        delete newPrices[id];
        setPrices(newPrices);

      } catch (e) {
        console.error("Error updating price: ", e);
        alert('Failed to update price.');
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading stock levels..." />;
  if (error) return <ErrorMessage message={"Failed to load stock data."} />;

  const inventoryItems = inventory ? Object.values(inventory).map(item => ({...item})) : [];

  const filteredStock = inventoryItems.filter(item => {
    return item.product?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalUnits = inventoryItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockItems = inventoryItems.filter(item => (item.quantity || 0) < 10);
  const totalProducts = new Set(inventoryItems.map(item => item.product)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Showroom Stock Management</h1>
        <p className="text-gray-600 mt-1">Monitor and manage product stock and pricing.</p>
      </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Units</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalUnits.toLocaleString()}</p>
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
      </div>


      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{item.product}</p>
                    </td>
                     <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{item.quantity || 0}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge color={item.status === 'in-inventory' ? 'blue' : 'gray'}>
                          {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                       <input
                        type="number"
                        placeholder="Enter price"
                        value={prices[item.id] ?? item.price ?? ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                       <button
                        onClick={() => handleSavePrice(item.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Price
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {filteredStock.length === 0 && (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
