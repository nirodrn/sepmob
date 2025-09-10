import React, { useState, useMemo } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { ErrorMessage } from '../../components/Common/ErrorMessage';
import { Badge } from '../../components/Common/Badge';

interface Request {
  id: string;
  customId: string;
  requestedAt: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  items: any[];
  notes: string;
}

export function RequestTracker() {
  const { data: requests, loading, error } = useFirebaseData<Record<string, Request>>('dsreqs');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    
    const allRequests = Object.values(requests).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    if (!searchTerm) {
      return allRequests;
    }

    return allRequests.filter(req => 
      req.customId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  if (loading) return <LoadingSpinner text="Loading requests..." />;
  if (error) return <ErrorMessage message="Failed to load requests." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track Product Requests</h1>
        <p className="text-gray-600 mt-1">Search and view the status of all product requests.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search by ID, name, or status..."
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
              <div key={request.id || request.customId} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      ID: <span className="font-medium text-gray-800">{request.customId || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      By: <span className="font-medium text-gray-800">{request.requestedByName || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      On: {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    color={
                      request.status === 'pending' ? 'yellow' :
                      request.status === 'approved' ? 'green' :
                      'red'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
                <div className="mt-3">
                  <ul className="text-sm text-gray-700 list-disc list-inside">
                    {request.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} (Qty: {item.quantity})
                      </li>
                    ))}
                  </ul>
                  {request.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic">
                      Notes: {request.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
