import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, Eye, Trash2, ArrowRight, FileText } from 'lucide-react';

interface PricingRequest {
  id: number;
  request_number: string;
  supplier_name: string;
  due_date: string;
  responsible_person: string;
  issue_date: string;
}

export default function RequestsList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PricingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'request_number' | 'supplier' | 'responsible' | 'date'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, searchType, requests]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/pricing-requests');
      const data = await response.json();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (!searchTerm) {
      setFilteredRequests(requests);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = requests.filter(req => {
      switch (searchType) {
        case 'request_number':
          return req.request_number.toLowerCase().includes(term);
        case 'supplier':
          return req.supplier_name.toLowerCase().includes(term);
        case 'responsible':
          return req.responsible_person.toLowerCase().includes(term);
        case 'date':
          return req.issue_date.includes(term) || req.due_date.includes(term);
        case 'all':
        default:
          return (
            req.request_number.toLowerCase().includes(term) ||
            req.supplier_name.toLowerCase().includes(term) ||
            req.responsible_person.toLowerCase().includes(term) ||
            req.issue_date.includes(term) ||
            req.due_date.includes(term)
          );
      }
    });
    setFilteredRequests(filtered);
  };

  const handleDelete = async (id: number, requestNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف الطلب ${requestNumber}؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/pricing-requests/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRequests(requests.filter(req => req.id !== id));
      } else {
        alert('فشل حذف الطلب');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('حدث خطأ أثناء حذف الطلب');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة إلى لوحة التحكم</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">جميع الطلبات</h1>
              <p className="text-gray-600">
                إجمالي الطلبات: <span className="font-bold text-blue-600">{requests.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن طلب..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">بحث في جميع الحقول</option>
              <option value="request_number">رقم الطلب</option>
              <option value="supplier">اسم المورد</option>
              <option value="responsible">الشخص المسؤول</option>
              <option value="date">التاريخ</option>
            </select>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-3">
              عدد النتائج: <span className="font-bold text-blue-600">{filteredRequests.length}</span>
            </p>
          )}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold">رقم الطلب</th>
                    <th className="px-6 py-4 text-right font-semibold">اسم المورد</th>
                    <th className="px-6 py-4 text-right font-semibold">الشخص المسؤول</th>
                    <th className="px-6 py-4 text-right font-semibold">تاريخ الإصدار</th>
                    <th className="px-6 py-4 text-right font-semibold">تاريخ الانتهاء</th>
                    <th className="px-6 py-4 text-center font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {request.request_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-800">{request.supplier_name}</td>
                      <td className="px-6 py-4 text-right text-gray-800">{request.responsible_person}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatDate(request.issue_date)}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatDate(request.due_date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/pdf/${request.id}`)}
                            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            title="عرض الطلب"
                          >
                            <Eye className="w-4 h-4" />
                            <span>عرض</span>
                          </button>
                          <button
                            onClick={() => handleDelete(request.id, request.request_number)}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
