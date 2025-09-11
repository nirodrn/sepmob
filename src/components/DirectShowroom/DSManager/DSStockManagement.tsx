import React, { useState } from 'react';
import { useFirebaseData, useFirebaseActions } from '../../../hooks/useFirebaseData';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';
import { Package, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  product: string;
  quantity: number;
  status: string;
  date: string;
  price?: number;
}

// This is a shared component used by both Manager and Staff dashboards.
// It displays the showroom inventory from the 'dsinventory' collection.
// The Manager role will have the ability to edit prices.
export function DSStockManagement({ isManager = false }: { isManager?: boolean }) {
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
        const newPrices = { ...prices };
        delete newPrices[id];
        setPrices(newPrices);
      } catch (e) {
        console.error("Error updating price: ", e);
        alert('Failed to update price.');
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading stock..." />;
  if (error) return <ErrorMessage message="Failed to load stock data." />;

  const inventoryItems = inventory ? Object.entries(inventory).map(([id, item]) => ({ id, ...item })) : [];
  
  const filteredStock = inventoryItems.filter(item =>
    item.product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Quantity</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                {isManager && <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.product}</td>
                  <td className="py-3 px-4">{item.quantity || 0}</td>
                  <td className="py-3 px-4">
                    {isManager ? (
                      <input
                        type="number"
                        placeholder="Enter price"
                        value={prices[item.id] ?? item.price ?? ''}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        className="w-40 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span>{item.price ? `$${item.price.toFixed(2)}` : 'N/A'}</span>
                    )}
                  </td>
                  {isManager && (
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSavePrice(item.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save Price
                      </button>
                    </td>
                  )}
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
