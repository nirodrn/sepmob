import React, { useState } from 'react';
import { Package, AlertTriangle, Search, Filter, Eye } from 'lucide-react';
import { useFirebaseData } from '../../../hooks/useFirebaseData';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';

export function DSStockManagement() {
  const { data: inventoryData, loading, error } = useFirebaseData('finishedGoodsPackagedInventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('all');

  if (loading) return <LoadingSpinner text="Loading stock levels..." />;
  // CRITICAL FIX: The error object itself cannot be rendered. This now passes a string.
  if (error) return <ErrorMessage message={error.message || 'Failed to load stock data.'} />;

  // Defensively render loading and error states first.
  const inventoryArray = inventoryData
  ? Object.entries(inventoryData).map(([id, data]) => ({ id, ...(data as object) }))
  : [];
  
  // Filter for DS-relevant stock (showroom locations)
  const dsStock = inventoryArray.filter(item => 
    item.location?.includes('DS') || item.location?.includes('SHOWROOM')
  );

  const filteredStock = dsStock.filter(item => {
    const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === 'all' || item.location === filterLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = [...new Set(dsStock.map(item => item.location))].filter(Boolean);
  const totalUnits = dsStock.reduce((sum, item) => sum + (item.unitsInStock || 0), 0);
  const lowStockItems = dsStock.filter(item => (item.unitsInStock || 0) < 10);
  const totalProducts = new Set(dsStock.map(item => item.productName)).size;

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600 bg-red-50', label: 'Out of Stock' };
    if (stock < 10) return { color: 'text-amber-600 bg-amber-50', label: 'Low Stock' };
    if (stock < 50) return { color: 'text-blue-600 bg-blue-50', label: 'Normal' };
    return { color: 'text-green-600 bg-green-50', label: 'Good Stock' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Showroom Stock Levels</h1>
        <p className="text-gray-600 mt-1">Monitor available inventory for customer sales</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {/* ... (UI unchanged) ... */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* ... (UI unchanged) ... */}
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* ... (UI unchanged) ... */}
      </div>
    </div>
  );
}
