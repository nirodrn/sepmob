import React from 'react';
import { DSRequestApproval } from '../../components/DirectShowroom/DSRequestApproval';
import { DSRequestHistory } from '../../components/DirectShowroom/DSRequestHistory';

export function DSProductRequests() {
  return (
    <div className="space-y-6">
      <DSRequestApproval />
      <div className="mt-8">
        <DSRequestHistory />
      </div>
    </div>
  );
}
