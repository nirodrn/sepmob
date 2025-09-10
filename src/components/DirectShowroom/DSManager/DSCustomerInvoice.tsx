import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calculator, User, Phone, MapPin } from 'lucide-react';
import { Modal } from '../../Common/Modal';
import { useFirebaseActions, useFirebaseData } from '../../../hooks/useFirebaseData';
import { useAuth } from '../../../context/AuthContext';
import { InvoiceItem } from '../../../types';
import { ErrorMessage } from '../../Common/ErrorMessage';

interface DSCustomerInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DSCustomerInvoice({ isOpen, onClose, onSuccess }: DSCustomerInvoiceProps) {
  const { userData } = useAuth();
  // Correctly scope actions to a base path
  const { addData, updateData } = useFirebaseActions('customerInvoices');
  const { data: inventoryData, loading: inventoryLoading, error: inventoryError } = useFirebaseData('finishedGoodsPackagedInventory');

  const [loading, setLoading] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: '', productName: '', quantity: 1, unit: 'units', unitPrice: 0, total: 0 }
  ]);
  
  const [taxRate, setTaxRate] = useState(10);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const productsArray = useMemo(() => 
    inventoryData ? Object.entries(inventoryData).map(([id, data]) => ({ id, ...(data as any) })) : [],
  [inventoryData]);

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
    const currentItem = { ...updatedItems[index], [field]: value };

    if (field === 'productId') {
      const product = productsArray.find(p => p.id === value);
      if (product) {
        // Corrected field names: productName, unitsInStock, productPrice
        currentItem.productName = product.productName;
        currentItem.unit = product.unit || 'units';
        currentItem.unitPrice = product.productPrice || 0;
        if (currentItem.quantity > product.unitsInStock) {
          currentItem.quantity = product.unitsInStock;
        }
      }
    }

    if (field === 'quantity') {
        const product = productsArray.find(p => p.id === currentItem.productId);
        if (product && value > product.unitsInStock) {
            alert(`Maximum stock available is ${product.unitsInStock}`);
            currentItem.quantity = product.unitsInStock;
        } else {
            currentItem.quantity = value;
        }
    }
    
    currentItem.total = currentItem.quantity * currentItem.unitPrice;
    updatedItems[index] = currentItem;
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const tax = (afterDiscount * taxRate) / 100;
    const total = afterDiscount + tax;
    return { subtotal, discountAmount, afterDiscount, tax, total };
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-4);
    return `DS-INV-${year}${month}${day}-${time}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    try {
      const validItems = items.filter(item => item.productId && item.quantity > 0);
      
      if (validItems.length === 0) {
        alert('Please add at least one valid product');
        setLoading(false);
        return;
      }

      if (!customerInfo.name.trim()) {
        alert('Please enter customer name');
        setLoading(false);
        return;
      }
      
      // Stock validation
      for (const item of validItems) {
        const product = productsArray.find(p => p.id === item.productId);
        if (!product || item.quantity > product.unitsInStock) {
          alert(`Not enough stock for ${item.productName}. Available: ${product ? product.unitsInStock : 0}, Requested: ${item.quantity}`);
          setLoading(false);
          return;
        }
      }

      const { subtotal, discountAmount, tax, total } = calculateTotals();
      const invoiceNumber = generateInvoiceNumber();
      const dueDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days from now

      const invoiceId = await addData('', {
        invoiceNumber,
        invoiceType: 'customer_sale',
        createdBy: userData.id,
        createdByName: userData.name,
        createdByRole: userData.role,
        showroomLocation: userData.department,
        customer: customerInfo,
        items: validItems,
        subtotal,
        discount,
        discountAmount,
        tax,
        taxRate,
        total,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        totalPaid: total,
        remainingAmount: 0,
        dueDate,
        notes: notes.trim()
      });

      // Use a separate actions hook for sales activities
      const salesActions = useFirebaseActions('salesActivities');
      await salesActions.addData('', {
        type: 'customer_sale',
        userId: userData.id,
        userName: userData.name,
        userRole: userData.role,
        description: `Customer sale invoice ${invoiceNumber} generated for ${customerInfo.name}`,
        amount: total,
        customerName: customerInfo.name,
        invoiceNumber,
        relatedId: invoiceId
      });

      // Use a separate actions hook for inventory updates
      const inventoryActions = useFirebaseActions('finishedGoodsPackagedInventory');
      const stockUpdatePromises = validItems.map(item => {
        const product = productsArray.find(p => p.id === item.productId);
        const newStock = (product?.unitsInStock || 0) - item.quantity;
        return inventoryActions.updateData(item.productId, { unitsInStock: newStock });
      });
      await Promise.all(stockUpdatePromises);

      onSuccess();
      onClose();
      
      // Reset form
      setCustomerInfo({ name: '', phone: '', address: '', email: '' });
      setItems([{ productId: '', productName: '', quantity: 1, unit: 'units', unitPrice: 0, total: 0 }]);
      setNotes('');
      setDiscount(0);
    } catch (error) {
      console.error('Error creating customer invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountAmount, tax, total } = calculateTotals();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Invoice" size="xl">
        {inventoryError && <ErrorMessage message="Failed to load product inventory."/>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Customer Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Customer address"
                />
              </div>
            </div>
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
                    disabled={inventoryLoading}
                  >
                    <option value="">{inventoryLoading ? 'Loading...' : 'Select Product'}</option>
                    {productsArray.map(product => (
                      <option key={product.id} value={product.id} disabled={product.unitsInStock <= 0}>
                        {product.productName} (Stock: {product.unitsInStock})
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Discount:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value || '0'))}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tax:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value || '0'))}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="flex justify-between gap-8">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between gap-8">
                  <span className="text-sm text-gray-600">Discount ({discount}%):</span>
                  <span className="font-medium text-red-600">-LKR {discountAmount.toFixed(2)}</span>
                </div>
              )}
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
            disabled={loading || inventoryLoading}
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
