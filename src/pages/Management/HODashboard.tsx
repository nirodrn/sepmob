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

  if (!userData) return null;

  const cards = getDashboardCards(userData.role);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  const requestsArray = salesRequests ? Object.entries(salesRequests).map(([id, data]) => ({ id, ...data })) : [];
  const pendingRequests = requestsArray.filter(req => req.status === 'pending');
  const approvedRequests = requestsArray.filter(req => req.status === 'approved');
  const rejectedRequests = requestsArray.filter(req => req.status === 'rejected');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getCurrentRequests = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingRequests;
      case 'approved':
        return approvedRequests;
      case 'rejected':
        return rejectedRequests;
      default:
        return pendingRequests;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Head of Operations Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor and approve sales requests across all channels
        </p>
      </div>

      <DashboardCards cards={cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Sales Requests Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Requests</h2>
              
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === 'pending'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pending ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setSelectedTab('approved')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === 'approved'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>
                <button
                  onClick={() => setSelectedTab('rejected')}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    selectedTab === 'rejected'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rejected ({rejectedRequests.length})
                </button>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {getCurrentRequests().map((request) => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {request.requestedByName} ({request.requestedByRole})
                        </h3>
                        <p className="text-sm text-gray-500">
                          {request.items?.length || 0} items • {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.notes && (
                          <p className="text-sm text-gray-600 mt-1">{request.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={getPriorityBadge(request.priority)}>
                        {request.priority}
                      </span>
                      <span className={getStatusBadge(request.status)}>
                        {request.status}
                      </span>
                      {selectedTab === 'pending' && (
                        <div className="flex gap-1 ml-2">
                          <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {getCurrentRequests().length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No {selectedTab} requests found
                </div>
              )}
            </div>
            </div>
            
            {/* DS Request Approval Section */}
            <DSRequestApproval />
          </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Management Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">All Representatives</p>
                  <p className="text-sm text-blue-700">Manage sales team</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Sales Analytics</p>
                  <p className="text-sm text-green-700">Performance insights</p>
                </div>
              </div>
            </button>
            
            <button className="w-full text-left p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Inventory Overview</p>
                  <p className="text-sm text-amber-700">Stock levels & alerts</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <RecentActivity activities={[]} />
    </div>
  );
}