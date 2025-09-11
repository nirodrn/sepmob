import React, { useState, useMemo } from 'react';
import { useFirebaseData, useFirebaseActions } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../Common/LoadingSpinner';
import { ErrorMessage } from '../../Common/ErrorMessage';
import { Badge } from '../../Common/Badge';
import { Modal } from '../../Common/Modal';

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

interface Customer {
  id: string;
  name: string;
  contact: string;
}

export function DSRequestHistory() {
  const { userData } = useAuth();
  const { data: allRequests, loading, error } = useFirebaseData<Record<string, Omit<Request, 'id'>>>('dsreqs');
  const { addData: addToInventory } = useFirebaseActions('dsinventory');
  const { deleteData: deleteRequest } = useFirebaseActions('dsreqs');
  const { addData: addInvoice } = useFirebaseActions('invoices');

  const { data: customersData, loading: customersLoading } = useFirebaseData('customers');

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoicePrice, setInvoicePrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customers = useMemo(() => {
    if (!customersData || typeof customersData !== 'object') return [];
    return Object.entries(customersData).map(([id, data]) => ({ id, ...(data as any) }));
  }, [customersData]);

  const handleAccept = async (request: Request) => {
    try {
      const inventoryItem = {
        product: request.product,
        quantity: request.quantity,
        status: 'in-inventory',
        date: new Date().toISOString(),
        price: 0, // Default price, can be updated later
      };

      await addToInventory(request.id, inventoryItem);
      await deleteRequest(request.id);

      alert('Request accepted and transferred to inventory!');

    } catch (e) {
      console.error("Error accepting request: ", e);
      alert('Failed to accept the request. Please try again.');
    }
  };

  const openInvoiceModal = (request: Request) => {
    setSelectedRequest(request);
    setIsInvoiceModalOpen(true);
    setSelectedCustomer('');
    setInvoicePrice(0);
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedCustomer || invoicePrice <= 0 || !userData) return;

    setIsSubmitting(true);
    try {
      const customerDetails = customers.find(c => c.id === selectedCustomer);
      if (!customerDetails) throw new Error('Customer not found');

      const invoice = {
        requestId: selectedRequest.id,
        product: selectedRequest.product,
        quantity: selectedRequest.quantity,
        price: invoicePrice,
        total: invoicePrice * selectedRequest.quantity,
        customerId: selectedCustomer,
        customerName: customerDetails.name,
        issuedBy: userData.id,
        issuedByName: userData.name,
        issuedAt: new Date().toISOString(),
        status: 'unpaid',
      };
      await addInvoice(undefined, invoice);
      alert('Invoice created successfully!');
      setIsInvoiceModalOpen(false);
    } catch (error) {
      console.error("Error creating invoice: ", error);
      alert('Failed to create invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message="Failed to load request history." />;
  if (!userData) return <p>Please log in to see your request history.</p>;

  const userRequests: Request[] = allRequests
    ? Object.entries(allRequests)
        .reduce((acc: Request[], [id, data]) => {
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
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 p-4 border-b border-gray-200">Request History</h3>
        {userRequests.length === 0 ? (
          <p className="text-gray-600 p-4">You haven't made any requests yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {userRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-800">{request.product}</p>
                    <p className="text-xs text-gray-500">ID: <span className="font-medium text-gray-700">{request.id}</span></p>
                    <p className="text-xs text-gray-500">{new Date(request.date).toLocaleString()}</p>
                  </div>
                  <div className="self-start sm:self-center">
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
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Quantity:</span> {request.quantity}
                    {request.urgent && <span className='text-red-600 font-bold ml-4'>(Urgent)</span>}
                  </p>
                  {request.notes && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-md">Notes: {request.notes}</p>
                  )}
                </div>
                {request.status === 'completed' && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
                     <button
                      onClick={() => openInvoiceModal(request)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Customer Invoice
                    </button>
                    <button
                      onClick={() => handleAccept(request)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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

      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Create Customer Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <p className="mt-1 text-gray-900 font-semibold">{selectedRequest?.product} (x{selectedRequest?.quantity})</p>
            </div>
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
            <select 
                id="customer"
                value={selectedCustomer}
                onChange={e => setSelectedCustomer(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
            >
                <option value="" disabled>Select a customer</option>
                {customersLoading ? (
                    <option disabled>Loading customers...</option>
                ) : (
                    customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.contact}</option>)
                )}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (per item)</label>
            <input 
                type="number"
                id="price"
                value={invoicePrice}
                onChange={e => setInvoicePrice(Number(e.target.value))}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                required
                min="1"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50">
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
