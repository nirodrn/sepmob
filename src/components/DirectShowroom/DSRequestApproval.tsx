import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Package } from 'lucide-react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Modal } from '../Common/Modal';

export function DSRequestApproval() {
  const { userData } = useAuth();
  const { data: dsRequestsData, loading, error } = useFirebaseData('dsReqs');
  const { updateData, addData } = useFirebaseActions();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  if (loading) return <LoadingSpinner text="Loading DS requests..." />;
  if (error) return <ErrorMessage message={error} />;

  // CRITICAL FIX: Ensure dsRequestsData is a non-null object before processing.
  // A non-object value (e.g., an array from a different part of the app) would crash Object.entries.
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
  
  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (priority) {
      case 'urgent': return `${baseClasses} bg-red-100 text-red-800`;
      case 'high': return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low': return `${baseClasses} bg-gray-100 text-gray-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">DS Product Requests</h2>
        <p className="text-gray-600 mt-1">Review and approve showroom product requests</p>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pending DS requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                   {/* ... (rest of the UI is unchanged) ... */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ... (Modal is unchanged) ... */}
    </div>
  );
}