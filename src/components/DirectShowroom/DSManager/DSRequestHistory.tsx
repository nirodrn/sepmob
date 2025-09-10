import React, { useState } from 'react';
import { useFirebaseData } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';

interface Request {
  id: string;
  customId: string;
  requestedAt: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  items: any[];
  notes: string;
}

export function DSRequestHistory() {
  const { userData } = useAuth();
  const { data: allRequests, loading, error } = useFirebaseData<Record<string, Request>>('dsreqs');

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load request history." />;
  if (!userData) return <p>Please log in to see your request history.</p>;

  const userRequests = allRequests 
    ? Object.values(allRequests)
        .filter(r => r.requestedBy === userData.id)
        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 p-4 border-b border-gray-200">Request History</h3>
      {userRequests.length === 0 ? (
        <p className="text-gray-600 p-4">You haven't made any requests yet.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {userRequests.map((request) => (
            <div key={request.id || request.customId} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    Request ID: <span className="font-medium text-gray-800">{request.customId || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(request.requestedAt).toLocaleString()}
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
      )}
    </div>
  );
}
