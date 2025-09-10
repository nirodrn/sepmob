import React, { useState } from 'react';
import { DashboardCards, getDashboardCards } from '../../components/Dashboard/DashboardCards';
import { RecentActivity } from '../../components/Dashboard/RecentActivity';
import { DSRequestApproval } from '../../components/DirectShowroom/DSRequestApproval';
import { useAuth } from '../../context/AuthContext';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { CheckCircle, XCircle, Clock, Users, TrendingUp, Package } from 'lucide-react';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { ErrorMessage } from '../../components/Common/ErrorMessage';

export function HODashboard() {
  const { userData } = useAuth();
  const { data: salesRequests, loading, error } = useFirebaseData('salesRequests');
  const [selectedTab, setSelectedTab] = useState('pending');

  // This check is a safeguard; ProtectedRoute should already handle this.
  if (!userData) return <LoadingSpinner text="Finalizing session..." />;

  const cards = getDashboardCards(userData.role);

  if (loading) return <LoadingSpinner text="Loading dashboard data..." />;
  if (error) return <ErrorMessage message={`Failed to load sales requests: ${error}`} />;

  // CRITICAL FIX: Ensure salesRequests is a processable object before mapping.
  // This prevents the entire dashboard from crashing if the data is malformed or not an object.
  const requestsArray = (salesRequests && typeof salesRequests === 'object')
    ? Object.entries(salesRequests).map(([id, data]) => {
        // Ensure the entry itself is a valid object before spreading
        const requestData = (data && typeof data === 'object') ? data : {};
        return { id, ...requestData };
      })
    : [];

  const pendingRequests = requestsArray.filter(req => req.status === 'pending');
  const approvedRequests = requestsArray.filter(req => req.status === 'approved');
  const rejectedRequests = requestsArray.filter(req => req.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending': return `${base} bg-amber-100 text-amber-800`;
      case 'approved': return `${base} bg-green-100 text-green-800`;
      case 'rejected': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (priority) {
      case 'urgent': return `${base} bg-red-100 text-red-800`;
      case 'high': return `${base} bg-orange-100 text-orange-800`;
      case 'normal': return `${base} bg-blue-100 text-blue-800`;
      case 'low': return `${base} bg-gray-100 text-gray-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Requests</h2>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {/* ... Tab buttons ... */}
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {getCurrentRequests().map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    {/* ... Request item UI ... */}
                  </div>
                ))}
                {getCurrentRequests().length === 0 && (
                  <div className="p-8 text-center text-gray-500">No {selectedTab} requests found</div>
                )}
              </div>
            </div>
            <DSRequestApproval />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* ... Management Actions ... */}
        </div>
      </div>
      <RecentActivity activities={[]} />
    </div>
  );
}