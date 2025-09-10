
import React, { useState, useMemo } from 'react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Common/Modal';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Badge } from '../Common/Badge';

interface Request {
  id: string;
  customId: string;
  requestedAt: string;
  requestedByName: string;
  items: any[];
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function HORequestApproval() {
  const { userData } = useAuth();
  const { data: requests, loading, error } = useFirebaseData<Record<string, Request>>('dsreqs');
  const { updateData, addData } = useFirebaseActions();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const pendingRequests = useMemo(() => {
    if (!requests) return [];
    return Object.values(requests)
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [requests]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load requests." />;
  if (!userData) return null;

  const handleApprovalAction = (request: Request, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const processApproval = async () => {
    if (!selectedRequest) return;
    setProcessing(true);

    try {
      await updateData(`dsreqs/${selectedRequest.id}`, {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        approvedBy: userData.id,
        approvedByName: userData.name,
        approvedAt: new Date().toISOString(),
        approvalNotes: approvalNotes,
      });

      await addData('activities', {
        type: approvalAction === 'approve' ? 'ds_request_approved' : 'ds_request_rejected',
        timestamp: new Date().toISOString(),
        userId: userData.id,
        userName: userData.name,
        userRole: userData.role,
        details: {
          requestId: selectedRequest.customId || selectedRequest.id,
          requestedBy: selectedRequest.requestedByName,
          action: approvalAction,
          notes: approvalNotes,
        },
      });

      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Approve Product Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.customId || request.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">
                      Request ID: <span className="font-medium text-gray-800">{request.customId || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Requested by <span className="font-medium text-gray-800">{request.requestedByName}</span> on {new Date(request.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge color={request.status === 'pending' ? 'yellow' : 'gray'}>
                    {request.status}
                  </Badge>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-800">Requested Items:</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    {request.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} - Quantity: {item.quantity}
                        {item.urgent && <Badge color="red" className="ml-2">Urgent</Badge>}
                      </li>
                    ))}
                  </ul>
                  {request.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {request.notes}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => handleApprovalAction(request, 'approve')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApprovalAction(request, 'reject')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRequest && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={`Confirm Request ${approvalAction === 'approve' ? 'Approval' : 'Rejection'}`}
        >
          <div className="space-y-4">
            <p>
              Are you sure you want to {approvalAction} this request from {selectedRequest.requestedByName}?
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              className="w-full p-2 border rounded"
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 rounded-md">
                Cancel
              </button>
              <button
                onClick={processApproval}
                disabled={processing}
                className={`px-4 py-2 text-white rounded-md ${
                  approvalAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${approvalAction}`}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
