// src/app/staff/page.js
'use client'; // 🌟 จำเป็นมากสำหรับ Next.js เพื่อบอกว่าเป็น Client Component (ใช้ useState/useEffect ได้)

import { useState, useEffect } from 'react';

interface Course {
  course_id: number;
  course_code: string;
  course_name_th: string;
  course_name_en: string;
  credits: number;
  proposer_first_name: string;
  proposer_email: string;
  status?: string;
}

export default function StaffDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // ฟังก์ชันดึงข้อมูลวิชาที่ค้างตรวจสอบ
  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/courses/pending`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลรายวิชาได้');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่รู้จัก');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  // ฟังก์ชันอัปเดตสถานะ อนุมัติ / ปฏิเสธ
  const handleUpdateStatus = async (courseId: number, newStatus: 'Approved' | 'Rejected') => {
    const comment = newStatus === 'Rejected' ? prompt('กรุณาระบุเหตุผลที่ปฏิเสธ:') : 'อนุมัติผ่านเกณฑ์';
    if (newStatus === 'Rejected' && comment === null) return; // กดยกเลิก Prompt

    try {
      const res = await fetch(`${API_URL}/api/courses/${courseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comments: comment, action_by: 999 }) // สมมติ ID เจ้าหน้าที่เป็น 999
      });

      if (!res.ok) throw new Error('ไม่สามารถอัปเดตสถานะได้');
      
      // ดึงข้อมูลใหม่หลังจากอัปเดตสำเร็จเพื่อรีเฟรชหน้าจอ
      fetchPendingCourses();
      alert(`ดำเนินการ ${newStatus === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ'} เรียบร้อยแล้ว`);
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('เกิดข้อผิดพลาดที่ไม่รู้จัก');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">กำลังโหลดข้อมูลหลักสูตร...</div>;
  if (error) return <div className="p-8 text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Staff Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">ระบบตรวจสอบและอนุมัติรายวิชาในหลักสูตร</p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            รอตรวจสอบ {courses.length} วิชา
          </span>
        </header>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border text-gray-500">
            🎉 ไม่มีรายวิชาที่ค้างตรวจสอบในขณะนี้
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm font-semibold uppercase">
                  <th className="p-4">รหัสวิชา</th>
                  <th className="p-4">ชื่อวิชา (TH / EN)</th>
                  <th className="p-4">หน่วยกิต</th>
                  <th className="p-4">ผู้เสนอวิชา</th>
                  <th className="p-4 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {courses.map((course) => (
                  <tr key={course.course_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-600">{course.course_code}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{course.course_name_th}</div>
                      <div className="text-gray-400 text-xs">{course.course_name_en}</div>
                    </td>
                    <td className="p-4">{course.credits} หน่วยกิต</td>
                    <td className="p-4">
                      <div className="font-medium">{course.proposer_first_name}</div>
                      <div className="text-gray-400 text-xs">{course.proposer_email}</div>
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleUpdateStatus(course.course_id, 'Approved')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        อนุมัติ
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(course.course_id, 'Rejected')}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}