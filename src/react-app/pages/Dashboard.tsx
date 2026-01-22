import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Plus, Calendar, User, Package, FileText, Phone } from 'lucide-react';

interface LineItem {
  id: string;
  lineItem: string;
  partNumber: string;
  description: string;
  unit: string;
  quantity: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [supplierName, setSupplierName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [responsiblePhone, setResponsiblePhone] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      lineItem: '',
      partNumber: '',
      description: '',
      unit: '',
      quantity: ''
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleLineItemChange = (id: string, lineItemValue: string) => {
    // Update the line item value immediately
    setLineItems(items => items.map(item => 
      item.id === id ? { ...item, lineItem: lineItemValue } : item
    ));
    
    // Clear any existing timer for this item
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }
    
    if (!lineItemValue.trim()) {
      return;
    }

    // Set a new timer to fetch data after user stops typing (500ms delay)
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        const response = await fetch(`/api/parts/${encodeURIComponent(lineItemValue)}`);
        
        if (response.ok) {
          const data = await response.json();
          setLineItems(items => items.map(item => 
            item.id === id ? { 
              ...item, 
              partNumber: data.partNumber || item.partNumber,
              description: data.description || item.description,
              unit: data.unit || item.unit
            } : item
          ));
        }
      } catch (error) {
        console.error('Error fetching part data:', error);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    if (!supplierName || !dueDate || !responsiblePerson || !responsiblePhone || lineItems.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate that all line items have required data
    const hasEmptyFields = lineItems.some(item => 
      !item.lineItem || !item.partNumber || !item.quantity
    );
    
    if (hasEmptyFields) {
      alert('يرجى ملء جميع بيانات البنود (Line Item, رقم القطعة, الكمية)');
      return;
    }

    try {
      const response = await fetch('/api/pricing-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierName,
          dueDate,
          responsiblePerson,
          responsiblePhone,
          lineItems: lineItems.map(item => ({
            lineItem: item.lineItem,
            partNumber: item.partNumber,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Reset form
        setSupplierName('');
        setDueDate('');
        setResponsiblePerson('');
        setResponsiblePhone('');
        setLineItems([]);
        
        // Navigate to PDF preview
        navigate(`/pdf/${result.id}`);
      } else {
        alert('حدث خطأ أثناء إنشاء الطلب');
      }
    } catch (error) {
      console.error('Error submitting pricing request:', error);
      alert('حدث خطأ أثناء إنشاء الطلب');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">شركة قرطبة للتوريدات</h1>
                <p className="text-sm text-gray-600">نظام طلبات التسعير</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/requests')}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>جميع الطلبات</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">طلب تسعير جديد</h2>

          <div className="space-y-6">
            {/* Supplier Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المورد
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم المورد"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ انتهاء الطلب
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشخص المسؤول
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم المسؤول"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={responsiblePhone}
                    onChange={(e) => setResponsiblePhone(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">البنود</h3>
                <button
                  onClick={addLineItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة بند</span>
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">البند #{index + 1}</span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <input
                        type="text"
                        value={item.lineItem}
                        onChange={(e) => handleLineItemChange(item.id, e.target.value)}
                        placeholder="Line Item"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={item.partNumber}
                        onChange={(e) => updateLineItem(item.id, 'partNumber', e.target.value)}
                        placeholder="رقم القطعة"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="التوصيف"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        placeholder="وحدة القياس"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                        placeholder="الكمية"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {lineItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد بنود بعد. انقر على "إضافة بند" للبدء</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
              >
                إصدار الطلب
              </button>
            </div>
          </div>
        </div>

        {/* Company Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600 bg-white rounded-xl p-6 shadow">
          <p className="font-medium text-gray-900 mb-2">شركة قرطبة للتوريدات</p>
          <p>شارع علم الروم خلف الشق الثعبان، مرسي مطروح</p>
          <p className="mt-1">هاتف: +201009988569</p>
          <p className="mt-1">البريد الإلكتروني: info@Cortoba-supplies.com</p>
        </div>
      </main>
    </div>
  );
}
