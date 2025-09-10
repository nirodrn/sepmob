import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../Common/Badge';
import { Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { useFirebaseQuery } from '../../hooks/useFirebaseQuery';
import { getDatabase, ref, query, orderByChild, equalTo } from 'firebase/database';

const statusConfig = {
  pending: { icon: Clock, color: 'info', label: 'Pending' },
  approved: { icon: CheckCircle, color: 'success', label: 'Approved' },
  rejected: { icon: XCircle, color: 'danger', label: 'Rejected' },
};

export function DSRequestHistory() {
  const { userData } = useAuth();

  const requestsQuery = useMemo(() => {
    if (!userData) return null;
    const db = getDatabase();
    return query(
      ref(db, 'dsReqs'),
      orderByChild('requestedById'),
      equalTo(userData.id)
    );
  }, [userData]);

  const { data: requestsData, loading, error } = useFirebaseQuery(requestsQuery);

  // Hooks must be called unconditionally at the top level.
  const sortedRequests = useMemo(() => {
    if (!requestsData || typeof requestsData !== 'object') return [];
    const requestsArray = Object.entries(requestsData).map(([id, data]) => ({ id, ...(data as any) }));
    return requestsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requestsData]);

  // Conditional rendering can happen after all hooks are called.
  if (loading) {
    return <LoadingSpinner text="Loading request history..." />;
  }

  if (error) {
    return <ErrorMessage message={`Error loading history: ${error.message}`} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Requests</h3>
      {sortedRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="font-medium">No requests found.</p>
          <p className="text-sm">Your product requests will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {sortedRequests.map((request) => {
            const config = statusConfig[request.status] || { icon: Clock, color: 'default', label: 'Unknown' };
            const Icon = config.icon;
            return (
              <li key={request.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{request.items[0].productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {request.items[0].quantity} {request.items[0].unit}
                    </p>
                    {request.notes && <p className="text-sm text-gray-500 mt-1 italic">\"{request.notes}\"</p>}
                  </div>
                  <div className="flex items-center gap-4">
                  <Badge variant={config.color as any}>{config.label}</Badge>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
