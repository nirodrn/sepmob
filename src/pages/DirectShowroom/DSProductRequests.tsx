import React, { useState } from 'react';
import { DSNewRequest } from '../../components/DirectShowroom/DSManager/DSNewRequest';
import { DSRequestHistory } from '../../components/DirectShowroom/DSManager/DSRequestHistory';
import { Plus } from 'lucide-react';

export function DSProductRequests() {
  const [showNewRequest, setShowNewRequest] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product Requests</h2>
        <button
          onClick={() => setShowNewRequest(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <DSRequestHistory />

      {showNewRequest && (
        <DSNewRequest
          isOpen={showNewRequest}
          onClose={() => setShowNewRequest(false)}
          onSuccess={() => {
            setShowNewRequest(false);
            // Optionally, you can add a toast notification here
          }}
        />
      )}
    </div>
  );
}
