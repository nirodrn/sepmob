import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFirebaseData, useFirebaseActions } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';
import { DashboardCards, getDashboardCards } from '../../Dashboard/DashboardCards';
import DSCustomerInvoice from './DSCustomerInvoice';
import { FileText, Package, Users, Eye, FileCheck, Search, PlusCircle, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  product: string;
  quantity: number;
  status: string;
  date: string;
  price?: number;
}

function InventoryDisplay() {
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

  const inventoryItems = inventory ? Object.values(inventory).map(item => ({...item})) : [];
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4"><p className="font-medium text-gray-900">{item.product}</p></td>
                  <td className="py-3 px-4"><p className="font-medium text-gray-900">{item.quantity || 0}</p></td>
                  <td className="py-3 px-4"><Badge color={item.status === 'in-inventory' ? 'blue' : 'gray'}>{item.status}</Badge></td>
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

export function DSManagerDashboard() {
  const { userData } = useAuth();
  const [showCustomerInvoice, setShowCustomerInvoice] = useState(false);

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userData.name}</h1>
        <p className="text-gray-600 mt-1">Manage showroom operations and customer sales</p>
      </div>

      <DashboardCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Showroom Stock</h3>
          <InventoryDisplay />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manager Actions</h3>
          <div className="space-y-3">
             <Link to="requests/history" className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors block">
                <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="font-medium text-blue-900">Product Request History</p>
                        <p className="text-sm text-blue-700">View past requests</p>
                    </div>
                </div>
            </Link>
            <Link to="requests" className="w-full text-left p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors block">
                <div className="flex items-center gap-3">
                    <PlusCircle className="w-5 h-5 text-teal-600" />
                    <div>
                        <p className="font-medium text-teal-900">New Product Request</p>
                        <p className="text-sm text-teal-700">Create a new request</p>
                    </div>
                </div>
            </Link>
            <button onClick={() => setShowCustomerInvoice(true)} className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                        <p className="font-medium text-green-900">Customer Sale</p>
                        <p className="text-sm text-green-700">Generate customer invoice</p>
                    </div>
                </div>
            </button>
          </div>
        </div>
      </div>

      <DSCustomerInvoice
        isOpen={showCustomerInvoice}
        onClose={() => setShowCustomerInvoice(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
