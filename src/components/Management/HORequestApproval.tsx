import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Modal } from '../Common/Modal';

export function HORequestApproval() {
  const { userData } = useAuth();
  const { data: dsRequestsData, loading, error } = useFirebaseData('dsReqs');
  const { updateData, addData } = useFirebaseActions();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  if (loading) return <LoadingSpinner text="Loading product requests..." />;
  if (error) return <ErrorMessage message={error.message || 'Failed to load requests.'} />;

  const requestsArray = (dsRequestsData && typeof dsRequestsData === 'object') 
    ? Object.entries(dsRequestsData).map(([id, data]) => ({ id, ...data as object })) 
    : [];

  const pendingRequests = requestsArray.filter(req => req.status === 'pending');

  const handleApprovalAction = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const processApproval = async () => {
    if (!selectedRequest || !userData) return;

    setProcessing(true);
    try {
      const updatePayload: { [key: string]: any } = {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        [`${approvalAction}dBy`]: userData.id,
        [`${approvalAction}dByName`]: userData.name,
        [`${approvalAction}dAt`]: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (approvalAction === 'reject') {
        updatePayload.rejectionReason = approvalNotes;
      } else {
        updatePayload.approvalNotes = approvalNotes;
      }

      await updateData(`dsReqs/${selectedRequest.id}`, updatePayload);

      await addData('activities', {
        type: approvalAction === 'approve' ? 'ds_request_approved' : 'ds_request_rejected',
        timestamp: new Date().toISOString(),
        userId: userData.id,
        userName: userData.name,
        userRole: userData.role,
        details: {
          requestId: selectedRequest.id,
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
              <div key={request.id} className="p-6">{/* UI for each request */}
                <button onClick={() => handleApprovalAction(request, 'approve')}>Approve</button>
                <button onClick={() => handleApprovalAction(request, 'reject')}>Reject</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Approval Modal */}
      {showApprovalModal && (
        <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title={`Confirm ${approvalAction.charAt(0).toUpperCase() + approvalAction.slice(1)}`}>
          <div className="space-y-4">
            <p>Are you sure you want to {approvalAction} this request?</p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add notes..."
              className="w-full p-2 border rounded"
            />
            <button onClick={processApproval} disabled={processing}>{processing ? 'Processing...' : 'Confirm'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
