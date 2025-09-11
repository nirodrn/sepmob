import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface Item {
  p: string; // Product Name
  q: number; // Quantity
  u: number; // Unit Price
  t: number; // Total
}

interface Invoice {
  id: string;
  date: string;
  customer: string;
  items: Item[];
  total: number;
  pay: 'cash' | 'card' | 'credit';
  status: 'paid' | 'unpaid';
}

interface DSCustomerInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DSCustomerInvoice: React.FC<DSCustomerInvoiceProps> = ({ isOpen, onClose, onSuccess }) => {
  const [invoiceId, setInvoiceId] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in');
  const [items, setItems] = useState<Item[]>([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');

  useEffect(() => {
    if (isOpen) {
      generateInvoiceId();
    }
  }, [isOpen]);

  useEffect(() => {
    calculateTotal();
  }, [items]);

  const generateInvoiceId = () => {
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    setInvoiceId(`INV-${formattedDate}-${randomNum}`);
  };

  const addItem = () => {
    if (productName && quantity && unitPrice) {
      const newItem: Item = {
        p: productName,
        q: Number(quantity),
        u: Number(unitPrice),
        t: Number(quantity) * Number(unitPrice),
      };
      setItems([...items, newItem]);
      setProductName('');
      setQuantity('');
      setUnitPrice('');
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotal = () => {
    const totalAmount = items.reduce((acc, item) => acc + item.t, 0);
    setTotal(totalAmount);
  };

  const saveInvoice = async () => {
    if (items.length === 0) {
      alert('Please add items to the invoice.');
      return;
    }

    const invoiceData: Omit<Invoice, 'id'> = {
      date: new Date().toISOString(),
      customer: customerName,
      items,
      total,
      pay: paymentMethod,
      status,
    };

    try {
      const docRef = await addDoc(collection(db, 'dsinvoices'), {
        ...invoiceData,
        id: invoiceId,
        createdAt: serverTimestamp(),
      });
      console.log('Invoice saved with ID: ', docRef.id);
      alert(`Invoice ${invoiceId} saved successfully!`);
      onSuccess();
      resetInvoice();
      onClose();
    } catch (error) {
      console.error('Error saving invoice: ', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const resetInvoice = () => {
    generateInvoiceId();
    setCustomerName('Walk-in');
    setItems([]);
    setProductName('');
    setQuantity('');
    setUnitPrice('');
    setTotal(0);
    setPaymentMethod('cash');
    setStatus('paid');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">POS Invoice</h1>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="form-group">
              <label className="text-sm font-medium text-gray-600">Invoice ID</label>
              <p className="text-lg font-semibold text-gray-800">{invoiceId}</p>
            </div>
            <div className="form-group">
              <label className="text-sm font-medium text-gray-600">Date & Time</label>
              <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleString()}</p>
            </div>
            <div className="form-group">
              <label htmlFor="customerName" className="text-sm font-medium text-gray-600">
                Customer
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Item Entry */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="productName" className="text-sm font-medium text-gray-600">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="E.g., Product A"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="quantity" className="text-sm font-medium text-gray-600">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="0"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="unitPrice" className="text-sm font-medium text-gray-600">
                  Unit Price
                </label>
                <input
                  type="number"
                  id="unitPrice"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addItem}
                className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center h-10 mt-1"
              >
                <Plus className="w-5 h-5" />
                <span className="ml-2">Add</span>
              </button>
            </div>
          </div>

          {/* Item List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Invoice Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Product</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Unit Price</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Total</th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-3">{item.p}</td>
                      <td className="p-3">{item.q}</td>
                      <td className="p-3">LKR {item.u.toFixed(2)}</td>
                      <td className="p-3">LKR {item.t.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <p className="text-center p-4 text-gray-500">No items added yet.</p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="form-group mb-4">
                <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-600">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'credit')}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status" className="text-sm font-medium text-gray-600">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-gray-600">Total</span>
                <span className="text-2xl font-bold text-blue-600">LKR {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white z-10">
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveInvoice}
              className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              Save Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSCustomerInvoice;
