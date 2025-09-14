import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth, appId } from '../../config/firebase'; // Correctly import from the central config

// --- Helper Components & SVGs ---
const Trash2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const X = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const History = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>);
const Backspace = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>);
const Search = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white flex items-center z-[100]";
  const typeClasses = { success: "bg-green-500", error: "bg-red-500" };
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold"><X className="w-5 h-5" /></button>
    </div>
  );
};

// --- Interfaces ---
interface Item { p: string; q: number; u: number; t: number; }
interface Invoice { id: string; date: string; customer: string; items: Item[]; total: number; pay: 'cash' | 'card' | 'credit'; status: 'paid' | 'unpaid'; createdAt?: any; }

// --- Mock Data ---
const mockProducts = [
    { name: 'Espresso', price: 250.00 }, { name: 'Latte', price: 350.00 }, { name: 'Cappuccino', price: 350.00 },
    { name: 'Iced Coffee', price: 400.00 }, { name: 'Croissant', price: 300.00 }, { name: 'Muffin', price: 280.00 },
    { name: 'Sandwich', price: 550.00 }, { name: 'Mineral Water', price: 100.00 }, { name: 'Orange Juice', price: 450.00 },
];

// --- Main App Component ---
export function DSInvoices() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [inputBuffer, setInputBuffer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // --- Auth & Data Fetching ---
  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (!user) { signInAnonymously(auth); }
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    const collectionPath = `/artifacts/${appId}/public/data/dsinvoices`;
    const q = query(collection(db, collectionPath));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      invoicesData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setInvoices(invoicesData);
    }, (error) => {
      console.error("Error fetching invoices:", error);
      handleNotification("Failed to load invoices.", "error");
    });
    return () => unsubscribe();
  }, [isAuthReady]);
  
  // --- Sale & Calculation Logic ---
  const calculateTotal = useCallback(() => {
    const totalAmount = items.reduce((acc, item) => acc + item.t, 0);
    setTotal(totalAmount);
  }, [items]);

  useEffect(() => {
    calculateTotal();
  }, [items, calculateTotal]);

  const resetSale = useCallback(() => {
    setItems([]);
    setInputBuffer('');
    setTotal(0);
  }, []);
  
  const handleInput = useCallback((value: string) => {
    if (value === 'C') {
      setInputBuffer('');
      return;
    }
    const operators = ['+', '-', '*', '/'];
    const lastChar = inputBuffer.slice(-1);

    if (operators.includes(value) && operators.includes(lastChar)) {
      setInputBuffer(prev => prev.slice(0, -1) + value);
      return;
    }

    if (value === '.' && inputBuffer.split(/[\+\-\*\/]/).pop()?.includes('.')) {
        return;
    }

    setInputBuffer(prev => prev + value);
  }, [inputBuffer]);
  
  const handleEquals = useCallback(() => {
    if (!inputBuffer) return;
    const operators = ['+', '-', '*', '/'];
    const lastChar = inputBuffer.slice(-1);
    if (operators.includes(lastChar)) return;

    try {
      const sanitized = inputBuffer.replace(/[^0-9+\-*/.]/g, '');
      if (sanitized !== inputBuffer) {
        setInputBuffer('Error');
        return;
      }
      const result = new Function('return ' + sanitized)();
      setInputBuffer(String(result === Infinity ? 'Error' : result));
    } catch (e) {
      setInputBuffer('Error');
    }
  }, [inputBuffer]);

  const addProduct = (product: { name: string, price: number }) => {
    const qty = parseFloat(inputBuffer);
    if (isNaN(qty) || qty <= 0) {
      handleNotification('Please enter a valid quantity.', 'error');
      setInputBuffer('');
      return;
    }

    const existingItemIndex = items.findIndex(item => item.p === product.name);

    if (existingItemIndex > -1) {
      const newItems = [...items];
      const existingItem = newItems[existingItemIndex];
      existingItem.q += qty;
      existingItem.t = existingItem.q * existingItem.u;
      setItems(newItems);
    } else {
      setItems(prev => [...prev, { p: product.name, q: qty, u: product.price, t: qty * product.price }]);
    }
    setInputBuffer('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const saveSale = useCallback(async (paymentMethod: 'cash' | 'card' | 'credit') => {
    if (items.length === 0) {
      handleNotification('Cannot save an empty sale.', 'error');
      return;
    }
    setIsLoading(true);
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}${ (date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`;
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const invoiceId = `INV-${formattedDate}-${randomNum}`;
    
    const invoiceData: Omit<Invoice, 'id'> = { date: date.toISOString(), customer: 'Walk-in', items, total, pay: paymentMethod, status: 'paid' };

    try {
      const collectionPath = `/artifacts/${appId}/public/data/dsinvoices`;
      await setDoc(doc(db, collectionPath, invoiceId), { ...invoiceData, id: invoiceId, createdAt: serverTimestamp() });
      handleNotification(`Sale ${invoiceId} saved!`, 'success');
      resetSale();
    } catch (error) {
      console.error('Error saving sale: ', error);
      handleNotification('Failed to save sale.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [items, total, resetSale]);

  // --- Keyboard Support ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't interfere if user is typing in the search bar
      if (document.activeElement?.id === 'product-search') return;

      const { key } = event;
      if (showInvoices) return;

      if ((key >= '0' && key <= '9') || key === '.' || ['+', '-', '*', '/'].includes(key)) { handleInput(key); } 
      else if (key === 'Backspace') { setInputBuffer(prev => prev.slice(0, -1)); } 
      else if (key.toLowerCase() === 'c') { setInputBuffer(''); } 
      else if (key === 'Enter' || key === '=') { event.preventDefault(); handleEquals(); } 
      else if (key === 'Escape') { resetSale(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEquals, resetSale, showInvoices]);
  
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render ---
  return (
    <div className="h-screen w-screen bg-gray-100 flex font-sans overflow-hidden">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: '', type: 'success' })} />
      
      <div className="w-2/5 bg-white flex flex-col shadow-lg">
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center"><h2 className="text-xl font-bold">Current Sale</h2><div className="bg-white text-gray-800 font-mono text-lg px-3 py-1 rounded min-h-[36px] flex items-center">{inputBuffer || '0.00'}</div></div>
        <div className="flex-grow overflow-y-auto">{items.length === 0 ? <div className="h-full flex items-center justify-center text-gray-400">Select products to start</div> : <ul className="divide-y divide-gray-200">{items.map((item, index) => <li key={index} className="p-3 flex justify-between items-center"><div><p className="font-semibold">{item.p}</p><p className="text-sm text-gray-600">{item.q} x LKR {item.u.toFixed(2)}</p></div><div className="text-right flex items-center"><p className="font-bold mr-4">LKR {item.t.toFixed(2)}</p><button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5"/></button></div></li>)}</ul>}</div>
        <div className="bg-gray-50 p-4 border-t"><div className="flex justify-between items-center text-2xl font-bold"><span>Total</span><span>LKR {total.toFixed(2)}</span></div></div>
      </div>

      <div className="w-3/5 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4 gap-4">
            <div className="relative flex-grow">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5"/></span>
                <input
                    id="product-search"
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white p-2 pl-10 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button onClick={() => setShowInvoices(true)} className="bg-white p-2 rounded-md shadow hover:bg-gray-50 flex items-center shrink-0"><History className="w-5 h-5 mr-2"/>Recent Sales</button>
        </div>
        <div className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.length > 0 ? (
                filteredProducts.map(p => <button key={p.name} onClick={() => addProduct(p)} className="bg-white rounded-lg shadow hover:bg-blue-500 hover:text-white transition-all duration-200 p-4 flex flex-col justify-center items-center text-center"><span className="font-bold">{p.name}</span><span className="text-sm">LKR {p.price.toFixed(2)}</span></button>)
            ) : (
                <div className="col-span-full text-center text-gray-500 flex items-center justify-center">No products found.</div>
            )}
        </div>
        <div className="pt-4 flex gap-4">
            <div className="w-3/5 grid grid-cols-4 grid-rows-4 gap-2">
                {['C','/','*'].map(k => <button key={k} onClick={() => handleInput(k)} className={`p-4 rounded-md shadow text-xl font-bold ${k === 'C' ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{k}</button>)}
                <button onClick={() => setInputBuffer(p=>p.slice(0,-1))} className="bg-gray-200 p-4 rounded-md shadow text-xl font-bold hover:bg-gray-300 flex justify-center items-center"><Backspace className="w-6 h-6"/></button>
                {['7','8','9','-'].map(k => <button key={k} onClick={() => handleInput(k)} className={`p-4 rounded-md shadow text-xl font-bold ${'789'.includes(k) ? 'bg-white hover:bg-gray-200' : 'bg-gray-200 hover:bg-gray-300'}`}>{k}</button>)}
                {['4','5','6'].map(k => <button key={k} onClick={() => handleInput(k)} className="bg-white p-4 rounded-md shadow text-xl font-bold hover:bg-gray-200">{k}</button>)}
                <button onClick={() => handleInput('+')} className="bg-gray-200 p-4 rounded-md shadow text-xl font-bold hover:bg-gray-300 row-span-2">+</button>
                {['1','2','3'].map(k => <button key={k} onClick={() => handleInput(k)} className="bg-white p-4 rounded-md shadow text-xl font-bold hover:bg-gray-200">{k}</button>)}
                <button onClick={() => handleInput('0')} className="bg-white p-4 rounded-md shadow text-xl font-bold hover:bg-gray-200 col-span-2">0</button>
                <button onClick={() => handleInput('.')} className="bg-white p-4 rounded-md shadow text-xl font-bold hover:bg-gray-200">.</button>
            </div>
            <div className="w-2/5 flex flex-col gap-2">
                <button onClick={handleEquals} className="bg-orange-400 text-white p-4 rounded-md shadow text-xl font-bold flex-grow hover:bg-orange-500">=</button>
                <button onClick={() => saveSale('cash')} disabled={isLoading} className="bg-green-500 text-white p-4 rounded-md shadow text-xl font-bold flex-grow hover:bg-green-600 disabled:bg-green-300">CASH</button>
                <button onClick={() => saveSale('card')} disabled={isLoading} className="bg-blue-500 text-white p-4 rounded-md shadow text-xl font-bold flex-grow hover:bg-blue-600 disabled:bg-blue-300">CARD</button>
            </div>
        </div>
      </div>
      
      {showInvoices && <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"><div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Recent Invoices</h2><button onClick={() => setShowInvoices(false)} className="text-gray-500 hover:text-gray-800"><X className="w-6 h-6"/></button></div><div className="overflow-y-auto">{invoices.length > 0 ? <table className="w-full"><thead className="bg-gray-50 sticky top-0"><tr><th className="p-3 text-left text-sm font-semibold">ID</th><th className="p-3 text-left text-sm font-semibold">Date</th><th className="p-3 text-right text-sm font-semibold">Total</th><th className="p-3 text-center text-sm font-semibold">Status</th></tr></thead><tbody>{invoices.map(inv => <tr key={inv.id} className="border-b"><td className="p-3 font-mono text-blue-600 text-sm">{inv.id}</td><td className="p-3 text-sm">{new Date(inv.date).toLocaleString()}</td><td className="p-3 text-right font-medium">LKR {inv.total.toFixed(2)}</td><td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${inv.pay==='cash' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{inv.pay}</span></td></tr>)}</tbody></table> : <p className="p-8 text-center text-gray-500">No recent invoices.</p>}</div></div></div>}
    </div>
  );
}
