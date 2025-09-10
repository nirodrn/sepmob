import React, { useState, useMemo } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { ErrorMessage } from '../../components/Common/ErrorMessage';
import { Badge } from '../../components/Common/Badge';
import { CreateRequestForm } from '../../components/Tracking/CreateRequestForm';
import { Plus, AlertTriangle } from 'lucide-react';

interface Request {
  id: string;
  product: string;
  quantity: number;
  status: string;
  date: string;
  urgent: boolean;
}

export function RequestTracker() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: requests, loading, error } = useFirebaseData<Record<string, Request>>('requests', refreshKey);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    const allRequests = Object.values(requests)
      .sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    if (!searchTerm) {
      return allRequests;
    }

    return allRequests.filter(req => 
      req.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.urgent && 'urgent'.includes(searchTerm.toLowerCase()))
    );
  }, [requests, searchTerm]);

  const handleRequestCreated = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  if (loading) return <LoadingSpinner text="Loading requests..." />;
  if (error) return <ErrorMessage message="Failed to load requests." />;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Product Requests</h1>
            <p className="text-gray-600 mt-1">Search, view, and create product requests.</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={20} className="mr-2" />
            Create New Request
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Search by ID, product, status, or 'urgent'..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {filteredRequests.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No requests found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request.id} className={`p-4 ${request.urgent ? 'bg-yellow-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        ID: <span className="font-medium text-gray-800">{request.id || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Product: <span className="font-medium text-gray-800">{request.product || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        On: {new Date(request.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.urgent && (
                        <div className="flex items-center text-yellow-600">
                          <AlertTriangle size={16} className="mr-1" />
                          <span className="font-semibold">Urgent</span>
                        </div>
                      )}
                      <Badge
                        color={
                          request.status === 'pending' ? 'yellow' :
                          request.status === 'approved' ? 'green' :
                          request.status === 'rejected' ? 'red' :
                          'gray'
                        }
                      >
                        {request.status || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700">
                      Quantity: {request.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isCreateModalOpen && (
        <CreateRequestForm 
          onClose={() => setCreateModalOpen(false)} 
          onSuccess={() => {
            setCreateModalOpen(false);
            handleRequestCreated();
          }}
        />
      )}
    </>
  );
}
