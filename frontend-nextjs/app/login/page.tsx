'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleLogin = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      // 🌟 บันทึกข้อมูล Session เบื้องต้นลง LocalStorage เพื่อนำไปใช้หน้าอื่นต่อ
      localStorage.setItem('user_id', data.user.id.toString());
      localStorage.setItem('user_name', `${data.user.first_name} ${data.user.last_name}`);
      localStorage.setItem('user_role', data.user.role_name);

      // 🚀 วิ่งแยกย้ายไปตามสิทธิ์การใช้งาน
      if (data.user.role_name === 'teacher') {
        router.push('/teacher');
      } else if (data.user.role_name === 'staff') {
        router.push('/staff');
      } else {
        setError('บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบนี้');
      }

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-gray-800">
      <div className="sm:mx-auto w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          ระบบเสนออนุมัติหลักสูตร 🎓
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          ลงชื่อเข้าใช้งานสำหรับอาจารย์และเจ้าหน้าที่หลักสูตร
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm font-medium animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">ชื่อผู้ใช้งาน (Username)</label>
              <div className="mt-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น teacher_somchai"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">รหัสผ่าน (Password)</label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none border-gray-300"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-400"
              >
                {loading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ 🚀'}
              </button>
            </div>
          </form>

          {/* กล่องข้อความช่วยเหลือสำหรับคนเทสระบบ */}
          <div className="mt-6 border-t pt-4 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">
            <span className="font-bold text-slate-500 block mb-1">💡 บัญชีสำหรับทดสอบระบบ (รหัสผ่านเดียวกัันทั้งหมด):</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>อาจารย์: <code className="text-indigo-600 font-mono">teacher_somchai</code> / <code className="font-mono text-slate-600">password123</code></li>
              <li>เจ้าหน้าที่: <code className="text-indigo-600 font-mono">staff_wipa</code> / <code className="font-mono text-slate-600">password123</code></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}