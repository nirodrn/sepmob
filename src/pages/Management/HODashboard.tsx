import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCards, getDashboardCards } from '../../components/Dashboard/DashboardCards';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { useAuth } from '../../context/AuthContext';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { CheckCircle, XCircle, Clock, Users, TrendingUp, Package, FileCheck } from 'lucide-react';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { ErrorMessage } from '../../components/Common/ErrorMessage';

export function HODashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { data: salesRequests, loading, error } = useFirebaseData('salesRequests');
  const [selectedTab, setSelectedTab] = useState('pending');

  if (!userData) return <LoadingSpinner text="Finalizing session..." />;

  const cards = getDashboardCards(userData.role);

  if (loading) return <LoadingSpinner text="Loading dashboard data..." />;
  if (error) return <ErrorMessage message={`Failed to load sales requests: ${error.message || 'Unknown error'}`} />;

  const requestsArray = (salesRequests && typeof salesRequests === 'object')
    ? Object.entries(salesRequests).map(([id, data]) => {
        const requestData = (data && typeof data === 'object') ? data : {};
        return { id, ...requestData };
      })
    : [];

  const pendingRequests = requestsArray.filter(req => req.status === 'pending');
  const approvedRequests = requestsArray.filter(req => req.status === 'approved');
  const rejectedRequests = requestsArray.filter(req => req.status === 'rejected');

  const getCurrentRequests = () => {
    if (selectedTab === 'approved') return approvedRequests;
    if (selectedTab === 'rejected') return rejectedRequests;
    return pendingRequests;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Head of Operations Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor and approve sales requests across all channels</p>
      </div>
      <DashboardCards cards={cards} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Sales Requests</h2>
              {/* Tabs and other UI can go here */}
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {getCurrentRequests().length === 0 ? (
                <div className="p-8 text-center text-gray-500">No {selectedTab} requests found</div>
              ) : (
                getCurrentRequests().map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">{/* Request item content */}</div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Management Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/ho/product-requests')}
              className="w-full text-left p-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors block"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="font-medium text-cyan-900">Product Requests</p>
                  <p className="text-sm text-cyan-700">View and approve requests</p>
                </div>
              </div>
            </button>
            {/* Other management actions can be added here */}
          </div>
        </div>
      </div>
      <RecentActivity activities={[]} />
    </div>
  );
}
