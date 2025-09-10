import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Modal } from '../Common/Modal';
import { useFirebaseActions } from '../../hooks/useFirebaseData';
import { useAuth } from '../../context/AuthContext';
import { InvoiceItem } from '../../types';

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceGenerator({ isOpen, onClose, onSuccess }: InvoiceGeneratorProps) {
  const { userData } = useAuth();
  const { addData } = useFirebaseActions();
  const [loading, setLoading] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: '', productName: '', quantity: 1, unit: 'units', unitPrice: 0, total: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState('');

  const products = [
    { id: '-OZNw27pXcB5BJFTv7Na', name: 'M oil', unit: 'kg', price: 150 },
    { id: '-OZOixii7R2Gb725fbKQ', name: 'B oil', unit: 'L', price: 200 }
  ];

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unit: 'units', unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].unit = product.unit;
        updatedItems[index].unitPrice = product.price;
      }
    }
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice' || field === 'productId') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `INV-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    try {
      const validItems = items.filter(item => item.productId && item.quantity > 0);
      
      if (validItems.length === 0) {
        alert('Please add at least one valid product');
        return;
      }

      if (!customerName.trim()) {
        alert('Please enter customer name');
        return;
      }

      const { subtotal, tax, total } = calculateTotals();
      const invoiceNumber = generateInvoiceNumber();
      const dueDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days from now

      await addData('invoices', {
        invoiceNumber,
        createdBy: userData.id,
        createdByName: userData.name,
        customerName: customerName.trim(),
        customerContact: customerContact.trim(),
        items: validItems,
        subtotal,
        tax,
        total,
        status: 'draft',
        paymentStatus: 'pending',
        totalPaid: 0,
        remainingAmount: total,
        dueDate,
        notes: notes.trim()
      });

      onSuccess();
      onClose();
      
      // Reset form
      setCustomerName('');
      setCustomerContact('');
      setItems([{ productId: '', productName: '', quantity: 1, unit: 'units', unitPrice: 0, total: 0 }]);
      setNotes('');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Invoice" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Contact
            </label>
            <input
              type="text"
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone or email"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="w-20">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={item.unit}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <input
                    type="text"
                    value={`LKR ${item.total.toFixed(2)}`}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                  />
                </div>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Tax Rate:</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-600">Tax ({taxRate}%):</span>
                <span className="font-medium">LKR {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-8 text-lg font-bold border-t pt-1">
                <span>Total:</span>
                <span>LKR {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional notes or terms..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {loading ? 'Creating...' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}