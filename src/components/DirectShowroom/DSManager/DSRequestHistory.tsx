import React from 'react';
import { useFirebaseData, useFirebaseActions } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';

interface Request {
  id: string;
  product: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  date: string;
  urgent: boolean;
  requestedBy: string;
  requestedByName: string;
  notes?: string;
}

export function DSRequestHistory() {
  const { userData } = useAuth();
  const { data: allRequests, loading, error } = useFirebaseData<Record<string, Omit<Request, 'id'>>>('dsreqs');
  const { addData: addToInventory } = useFirebaseActions('dsinventory');
  const { deleteData: deleteRequest } = useFirebaseActions('dsreqs');

  const handleAccept = async (request: Request) => {
    try {
      const inventoryItem = {
        product: request.product,
        quantity: request.quantity,
        status: 'in-inventory',
        date: new Date().toISOString(),
        price: 0,
      };

      await addToInventory(request.id, inventoryItem);
      await deleteRequest(request.id);

      alert('Request accepted and transferred to inventory!');

    } catch (e) {
      console.error("Error accepting request: ", e);
      alert('Failed to accept the request. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load request history." />;
  if (!userData) return <p>Please log in to see your request history.</p>;

  // A more robust way to process requests to prevent crashes from malformed data.
  const userRequests: Request[] = allRequests
    ? Object.entries(allRequests)
        .reduce((acc: Request[], [id, data]) => {
          // Ensure that the data for a request is a valid object before processing
          if (data && typeof data === 'object') {
            const requestItem = { id, ...data } as Request;
            if (requestItem.requestedBy === userData.id) {
              acc.push(requestItem);
            }
          }
          return acc;
        }, [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 p-4 border-b border-gray-200">Request History</h3>
      {userRequests.length === 0 ? (
        <p className="text-gray-600 p-4">You haven't made any requests yet.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {userRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{request.product}</p>
                  <p className="text-sm text-gray-500">Request ID: <span className="font-medium text-gray-700">{request.id}</span></p>
                  <p className="text-sm text-gray-500">Requested on {new Date(request.date).toLocaleString()}</p>
                </div>
                <Badge
                  color={
                    request.status === 'pending' ? 'yellow' :
                    request.status === 'approved' ? 'green' :
                    request.status === 'completed' ? 'blue' :
                    'red'
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Quantity:</span> {request.quantity}
                  {request.urgent && <span className='text-red-600 font-bold ml-4'>(Urgent)</span>}
                </p>
                {request.notes && (
                  <p className="mt-2 text-xs text-gray-500 italic">Notes: {request.notes}</p>
                )}
              </div>
              {request.status === 'completed' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleAccept(request)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept & Move to Inventory
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
