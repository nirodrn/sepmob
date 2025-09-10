
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFirebaseActions, useFirebaseData } from '../../hooks/useFirebaseData';
import { Modal } from '../Common/Modal';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';

interface DSNewRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RequestItem {
  productId: string;
  productName: string;
  quantity: number;
  urgent: boolean;
  location: string;
}

export function DSNewRequest({ isOpen, onClose, onSuccess }: DSNewRequestProps) {
  const { userData } = useAuth();
  const { updateData } = useFirebaseActions();
  const { data: inventoryData, loading: inventoryLoading, error: inventoryError } = useFirebaseData('finishedGoodsPackagedInventory');

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([
    { productId: '', productName: '', quantity: 1, urgent: false, location: '' }
  ]);
  const [notes, setNotes] = useState('');

  const products = useMemo(() => {
    if (!inventoryData) return [];
    const productMap = new Map();
    Object.values(inventoryData).forEach((item: any) => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          id: item.productId,
          name: item.productName,
          variant: item.variantName
        });
      }
    });
    return Array.from(productMap.values());
  }, [inventoryData]);

  const handleItemChange = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    (item[field] as any) = value;

    if (field === 'productId') {
        const selectedProduct = products.find(p => p.id === value);
        item.productName = selectedProduct ? `${selectedProduct.name} - ${selectedProduct.variant}` : '';
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, urgent: false, location: '' }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (!userData || items.length === 0 || !items[0].productId) return;
    setLoading(true);

    try {
      const firstItem = items[0];
      const selectedProduct = products.find(p => p.id === firstItem.productId);
      const variantName = selectedProduct ? selectedProduct.variant.replace(/\s/g, '') : 'item';
      const newId = `DSR-${Date.now()}-${variantName}-${Math.floor(Math.random() * 1000)}`;

      const requestData = {
        requestedBy: userData.id,
        requestedByName: userData.name,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        items,
        notes,
        approveStatus: null,
      };

      await updateData(`dsreqs/${newId}`, requestData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Product Request">
      {inventoryLoading ? (
        <LoadingSpinner />
      ) : inventoryError ? (
        <ErrorMessage message={inventoryError.message} />
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.variant}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                className="p-2 border rounded w-24"
                min="1"
              />
               <input
                type="text"
                value={item.location}
                onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                placeholder="Location"
                className="p-2 border rounded w-32"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={item.urgent}
                  onChange={(e) => handleItemChange(index, 'urgent', e.target.checked)}
                />
                <span>Urgent</span>
              </label>
              <button onClick={() => removeItem(index)} className="text-red-500">X</button>
            </div>
          ))}
          <button onClick={addItem}>+ Add Item</button>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes..."
            className="w-full p-2 border rounded"
          />
          <button onClick={handleSubmit} disabled={loading} className="w-full p-2 bg-blue-500 text-white rounded">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      )}
    </Modal>
  );
}
