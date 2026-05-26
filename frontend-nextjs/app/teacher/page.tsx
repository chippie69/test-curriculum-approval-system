// src/app/teacher/page.js
'use client';

import { useState, useEffect } from 'react';

interface CourseFormData {
  course_code: string;
  course_name_th: string;
  course_name_en: string;
  description: string;
  credits: number;
}

interface Course {
  course_id: number;
  course_code: string;
  course_name_th: string;
  course_name_en: string;
  credits: number;
  status?: string;
  description?: string;
  comments?: string;
}

export default function TeacherDashboard() {
  // State สำหรับฟอร์มกรอกข้อมูลวิชา
  const [formData, setFormData] = useState<CourseFormData>({
    course_code: '',
    course_name_th: '',
    course_name_en: '',
    description: '',
    credits: 3,
  });

  // State สำหรับรายชื่อวิชาของฉัน
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const TEACHER_ID = 101; // สมมติรหัสอาจารย์ผู้ใช้งานปัจจุบันเป็น 101

  // 1. ฟังก์ชันดึงข้อมูลวิชาทั้งหมดที่อาจารย์คนนี้เคยเสนอไว้
  const fetchMyCourses = async () => {
    try {
      // หมายเหตุ: ในระบบจริงควรยิงไปที่ API ที่รองรับการกรองตาม id ผู้สร้าง 
      // รอบนี้ดึงข้อมูลภาพรวมมาเพื่ออัปเดตสถานะให้เห็นบนหน้าจอก่อนครับ
      const res = await fetch(`${API_URL}/api/courses/teacher/${TEACHER_ID}`); 
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลประวัติวิชาได้');
      const data = await res.json();
      setMyCourses(data);
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
    fetchMyCourses();
  }, []);

  // 2. ฟังก์ชันส่งข้อมูลฟอร์มเมื่ออาจารย์กดปุ่มส่งตรวจสอบ
  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.course_code || !formData.course_name_th || !formData.course_name_en) {
      alert('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'Pending Review', // ตั้งค่าสถานะเริ่มต้นให้วิ่งไปหา Staff
          created_by: TEACHER_ID
        }),
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลรายวิชาได้');

      alert('🚀 ส่งข้อมูลวิชาเข้าสู่ระบบตรวจสอบเรียบร้อยแล้ว!');
      
      // ล้างข้อมูลในฟอร์มหลังจากส่งสำเร็จ
      setFormData({
        course_code: '',
        course_name_th: '',
        course_name_en: '',
        description: '',
        credits: 3,
      });

      // รีเฟรชตารางประวัติด้านล่าง
      fetchMyCourses();

    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('เกิดข้อผิดพลาดที่ไม่รู้จัก');
      }
    }
  };

  // ฟังก์ชันช่วยจัดการสีของป้ายสถานะ (Badge)
  const getStatusBadge = (status: string) => {
  // 🌟 ปรับให้เป็นตัวพิมพ์เล็ก-ใหญ่เทียบได้หมด และตัดช่องว่างออก
  const normalizedStatus = status.trim().toLowerCase(); 

  switch (normalizedStatus) {
    case 'approved':
      return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">อนุมัติแล้ว</span>;
    case 'rejected':
      return <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-full">ปฏิเสธ / ให้แก้ไข</span>;
    default:
      return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">รอตรวจสอบ</span>;
  }
};

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === ฝั่งซ้าย: ฟอร์มเสนอรายวิชาใหม่ === */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">เสนอรายวิชาใหม่</h2>
            <p className="text-gray-400 text-xs mb-6">กรอกข้อมูลรายละเอียดวิชาเพื่อส่งให้ฝ่ายหลักสูตรตรวจสอบ</p>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-600 font-medium mb-1">รหัสวิชา *</label>
                <input
                  type="text"
                  placeholder="เช่น 01204223"
                  value={formData.course_code}
                  onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">ชื่อวิชา (ภาษาไทย) *</label>
                <input
                  type="text"
                  placeholder="เช่น การเขียนโปรแกรมเว็บ"
                  value={formData.course_name_th}
                  onChange={(e) => setFormData({...formData, course_name_th: e.target.value})}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">ชื่อวิชา (ภาษาอังกฤษ) *</label>
                <input
                  type="text"
                  placeholder="เช่น Web Programming"
                  value={formData.course_name_en}
                  onChange={(e) => setFormData({...formData, course_name_en: e.target.value})}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">หน่วยกิต *</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value) || 3})}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">คำอธิบายรายวิชาย่อ</label>
                <textarea
                  rows={3}
                  placeholder="อธิบายเนื้อหาโครงสร้างวิชาพอสังเขป..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded-lg transition-colors mt-2 shadow-sm"
              >
                ส่งตรวจสอบหลักสูตร 🚀
              </button>
            </form>
          </div>
        </div>

        {/* === ฝั่งขวา: ตารางติดตามสถานะวิชาที่เคยส่ง === */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">ประวัติการเสนอวิชาของฉัน</h2>
                <p className="text-gray-400 text-xs mt-0.5">ติดตามสถานะและการตีกลับแก้ไขจากเจ้าหน้าที่</p>
              </div>
              <button 
                onClick={fetchMyCourses}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
              >
                🔄 รีเฟรชสถานะ
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">กำลังโหลดรายการวิชา...</div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-20 text-gray-400 border border-dashed rounded-xl">
                📥 ยังไม่มีการเสนอวิชาเข้ามาในระบบในขณะนี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b">
                      <th className="p-3">รหัสวิชา</th>
                      <th className="p-3">ชื่อรายวิชา</th>
                      <th className="p-3">หน่วยกิต</th>
                      <th className="p-3 text-center">สถานะระบบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myCourses.map((course) => (
  <tr key={course.course_id} className="hover:bg-slate-50/50 transition-colors">
    {/* 1. รหัสวิชา */}
    <td className="p-3 font-mono font-bold text-slate-700 alignment-top vertical-align-top pt-4">
      {course.course_code}
    </td>

    {/* 2. ชื่อรายวิชา + แสดงคอมเมนต์กรณีถูกปฏิเสธ */}
    <td className="p-3 pt-4">
      <div className="font-semibold text-gray-800">{course.course_name_th}</div>
      <div className="text-gray-400 text-xs">{course.course_name_en}</div>
      
      {/* 🌟 บล็อกเพิ่มใหม่: แสดงเหตุผลการตีกลับ (Comments) ถ้าสถานะเป็น Rejected */}
      {course.status === 'Rejected' && course.comments && (
    <div className="mt-2.5 bg-rose-50 border border-rose-200/60 rounded-lg p-2.5 text-xs text-rose-700 flex items-start gap-2 max-w-md animate-fadeIn">
      <span className="text-base mt-0.5 leading-none">💬</span>
      <div>
        <span className="font-bold block text-rose-800 mb-0.5">เหตุผลที่ต้องแก้ไข:</span>
        <p className="font-medium text-rose-600/90 leading-relaxed">
          {course.comments}
        </p>
      </div>
    </div>
  )}
    </td>

    {/* 3. หน่วยกิต */}
    <td className="p-3 text-slate-600 pt-4 vertical-align-top">
      {course.credits} นก.
    </td>

    {/* 4. สถานะระบบ */}
    <td className="p-3 text-center pt-4 vertical-align-top">
      {getStatusBadge(course.status || 'Pending Review')}
    </td>
  </tr>
))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}