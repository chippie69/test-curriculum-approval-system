import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-2xl text-center space-y-6">
        
        {/* ส่วนหัวแสดงชื่อระบบ */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-300 text-sm font-medium">
            <span>✨</span> ระบบจัดการหลักสูตรเวอร์ชันใหม่ (Next.js)
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
            Curriculum Management System
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base">
            กรุณาเลือกประเภทผู้ใช้งานด้านล่าง เพื่อเข้าสู่ระบบการเสนอและพิจารณาอนุมัติรายวิชาตามสิทธิ์ของคุณ
          </p>
        </header>

        {/* ปุ่มเลือกบทบาท 2 ฝั่ง */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-6">
          
          {/* ปุ่มเข้าหน้าอาจารย์ */}
          <Link 
            href="/teacher"
            className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="text-2xl mb-2">👨‍🏫</div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                สำหรับอาจารย์
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                ยื่นเสนอรายวิชาใหม่ เข้าสู่ระบบ, ติดตามสถานะตรวจสอบ และดูฟีดแบ็กการตีกลับแก้ไข
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-400 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              เข้าสู่ระบบเสนอวิชา ➔
            </div>
          </Link>

          {/* ปุ่มเข้าหน้าเจ้าหน้าที่ */}
          <Link 
            href="/staff"
            className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <div className="text-2xl mb-2">🧑‍💻</div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                สำหรับเจ้าหน้าที่หลักสูตร
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                พิจารณารายวิชาที่ค้างในระบบ, ตรวจสอบรายละเอียด พร้อมกดอนุมัติหรือระบุเหตุผลเพื่อปฏิเสธ
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-400 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              เข้าสู่ระบบตรวจสอบ ➔
            </div>
          </Link>

        </div>

        {/* ฟุตเตอร์ด้านล่าง */}
        <footer className="text-xs text-slate-600 pt-8 font-mono">
          Powered by Next.js & Tailwind CSS
        </footer>

      </div>
    </div>
  );
}