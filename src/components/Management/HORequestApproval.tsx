import React, { useState, useMemo } from 'react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../Common/Modal';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Badge } from '../Common/Badge';
import { Check, X } from 'lucide-react';

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
  const { updateData: updateRequest } = useFirebaseActions('dsreqs');
  const { addData: addActivity } = useFirebaseActions('activities');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const pendingRequests = useMemo(() => {
    if (!requests) return [];
    return Object.entries(requests)
      .map(([id, r]) => ({ ...r, id }))
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
      await updateRequest(selectedRequest.id, {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        approvedBy: userData.id,
        approvedByName: userData.name,
        approvedAt: new Date().toISOString(),
        approvalNotes: approvalNotes,
      });

      await addActivity(null, {
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
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Approve Product Requests</h1>
      {pendingRequests.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">There are no pending requests to review.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      ID: <span className="font-medium text-gray-800">{request.customId || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      From <span className="font-medium text-gray-800">{request.requestedByName}</span>
                    </p>
                     <p className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleString()}</p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <Badge color={request.status === 'pending' ? 'yellow' : 'gray'}>
                      {request.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 text-sm">Requested Items:</h4>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                    {request.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{item.productName} - <strong>Qty: {item.quantity}</strong></span>
                        {item.urgent && <Badge color="red" className="ml-2">Urgent</Badge>}
                      </li>
                    ))}
                  </ul>
                  {request.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <span className="font-medium">Notes:</span> {request.notes}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleApprovalAction(request, 'approve')}
                    className="w-full sm:w-auto flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleApprovalAction(request, 'reject')}
                    className="w-full sm:w-auto flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2 text-sm"
                  >
                    <X size={16} /> Reject
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
            <p className="text-sm text-gray-700">
              Are you sure you want to {approvalAction} this request from <span className="font-semibold">{selectedRequest.requestedByName}</span>?
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button onClick={() => setShowApprovalModal(false)} className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button
                onClick={processApproval}
                disabled={processing}
                className={`w-full sm:w-auto px-4 py-2 text-white rounded-md text-sm ${
                  approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
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
