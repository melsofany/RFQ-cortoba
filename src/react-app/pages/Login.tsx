import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Cor@temp-2026') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <img 
                src="https://019be38d-faad-7027-baef-c286b35cf88b.mochausercontent.com/71B407EC-88D2-4CAE-8268-EBD61FB8A6C0.png" 
                alt="شعار قرطبة"
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">شركة قرطبة للتوريدات</h1>
            <p className="text-gray-600">نظام طلبات التسعير</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>شارع علم الروم خلف الشق الثعبان، مرسي مطروح</p>
            <p className="mt-1">+201009988569</p>
            <p className="mt-1">info@Cortoba-supplies.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
