import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, Package } from 'lucide-react';
import { useFirebaseData, useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { Modal } from '../Common/Modal';

export function DSRequestApproval() {
  const { userData } = useAuth();
  const { data: salesRequests, loading, error } = useFirebaseData('salesRequests');
  const { updateData, addData } = useFirebaseActions();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  if (loading) return <LoadingSpinner text="Loading requests..." />;
  if (error) return <ErrorMessage message={error} />;

  const requestsArray = salesRequests ? Object.entries(salesRequests).map(([id, data]) => ({ id, ...data })) : [];
  
  // Filter for DS requests that need approval
  const dsRequests = requestsArray.filter(req => 
    (req.requestedByRole === 'DirectShowroomManager' || req.requestedByRole === 'DirectShowroomStaff') &&
    req.status === 'pending'
  );

  const handleApprovalAction = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const processApproval = async () => {
    if (!selectedRequest || !userData) return;

    setProcessing(true);
    try {
      const updateData = {
        status: approvalAction === 'approve' ? 'approved' : 'rejected',
        [`${approvalAction}dBy`]: userData.id,
        [`${approvalAction}dByName`]: userData.name,
        [`${approvalAction}dAt`]: Date.now(),
        updatedAt: Date.now()
      };

      if (approvalAction === 'reject') {
        updateData.rejectionReason = approvalNotes;
      } else {
        updateData.approvalNotes = approvalNotes;
      }

      await updateData(`salesRequests/${selectedRequest.id}`, updateData);

      // Log activity
      await addData('salesActivities', {
        type: approvalAction === 'approve' ? 'approval' : 'rejection',
        userId: userData.id,
        userName: userData.name,
        userRole: userData.role,
        description: `DS request ${approvalAction}d: ${selectedRequest.items?.map(i => i.productName).join(', ')}`,
        relatedId: selectedRequest.id,
        requestedBy: selectedRequest.requestedByName
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
      case 'urgent':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'normal':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'low':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">DS Product Requests</h2>
        <p className="text-gray-600 mt-1">Review and approve showroom product requests</p>
      </div>

      {dsRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pending DS requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {dsRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-blue-50">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {request.requestedByName}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {request.requestedByRole}
                        </span>
                        <span className={getPriorityBadge(request.priority)}>
                          {request.priority}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Items:</strong> {request.items?.length || 0} products
                        </p>
                        
                        <div className="space-y-1">
                          {request.items?.map((item: any, index: number) => (
                            <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-gray-500 ml-2">
                                {item.quantity} {item.unit}
                              </span>
                              {item.urgency !== 'normal' && (
                                <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                                  item.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 
                                  item.urgency === 'high' ? 'bg-orange-100 text-orange-700' : 
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.urgency}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {request.notes && (
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleApprovalAction(request, 'approve')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => handleApprovalAction(request, 'reject')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <Modal 
        isOpen={showApprovalModal} 
        onClose={() => setShowApprovalModal(false)} 
        title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Request`}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
              <p className="text-sm text-gray-600">
                <strong>From:</strong> {selectedRequest.requestedByName} ({selectedRequest.requestedByRole})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Items:</strong> {selectedRequest.items?.map((item: any) => 
                  `${item.productName} (${item.quantity} ${item.unit})`
                ).join(', ')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {approvalAction === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={approvalAction === 'approve' ? 'Optional approval notes...' : 'Please provide reason for rejection...'}
                required={approvalAction === 'reject'}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processApproval}
                disabled={processing || (approvalAction === 'reject' && !approvalNotes.trim())}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  approvalAction === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' : 
                 approvalAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}