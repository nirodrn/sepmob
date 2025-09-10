import React from 'react';
import { useFirebaseData, useFirebaseActions } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';

interface Request {
  id: string;
  customId: string;
  requestedAt: string;
  requestedByName: string;
  status: 'pending' | 'approved' | 'rejected';
  items: any[];
  notes: string;
}

export function DSRequestApproval() {
  const { userData } = useAuth();
  const { data: requests, loading, error } = useFirebaseData<Record<string, Request>>('dsreqs');
  const { updateData } = useFirebaseActions('dsreqs');

  const handleUpdateRequest = async (id: string, status: 'approved' | 'rejected') => {
    if (!userData) return;
    try {
      await updateData(id, {
        status: status,
        approvedBy: userData.id,
        approvedByName: userData.name,
        approvedAt: new Date().toISOString(),
      });
      // Add a success toast notification here if you want
    } catch (e) {
      console.error("Failed to update request", e);
      // Add an error toast notification here
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load requests." />;

  const pendingRequests = requests
    ? Object.values(requests).filter(r => r.status === 'pending')
    : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Approve Product Requests</h2>
      
      {pendingRequests.length === 0 ? (
        <p className="text-gray-600">There are no pending requests to review.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.customId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedByName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.requestedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {request.items.map((item, index) => (
                        <li key={index}>{item.productName} (x{item.quantity})</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.notes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleUpdateRequest(request.id, 'approved')} 
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateRequest(request.id, 'rejected')} 
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
