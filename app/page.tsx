'use client'

import Link from "next/link";
import { ArrowRight, CheckCircle2, LayoutDashboard, Users, Box, BarChart3, ShieldCheck, Zap, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/* ───────── Scroll-Animated Wrapper ───────── */
function FadeInWhenVisible({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

function StaggerChildren({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                visible: { transition: { staggerChildren: 0.12 } },
                hidden: {},
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ───────── MAIN PAGE ───────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* ═══ Background Grid Pattern ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-zinc-200/60 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
              N
            </div>
            <span className="text-xl font-black tracking-tight">NexPOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-500">
            <Link href="/features" className="hover:text-emerald-600 transition-colors">Fitur</Link>
            <a href="#cara-kerja" className="hover:text-emerald-600 transition-colors">Cara Kerja</a>
            <a href="#harga" className="hover:text-emerald-600 transition-colors">Harga</a>
            <a href="#testimoni" className="hover:text-emerald-600 transition-colors">Testimoni</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 flex items-center gap-2">
              Daftar Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto text-center">
        {/* Ambient Glow Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-60 -left-20 w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -right-20 w-[300px] h-[300px] bg-teal-300/10 rounded-full blur-[80px] pointer-events-none" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative z-10"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8 border border-emerald-200/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Kasir Digital Siap Pakai
            </div>
        </motion.div>

        <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-5xl md:text-7xl font-black tracking-tight text-zinc-900 max-w-5xl mx-auto leading-tight md:leading-tight mb-6"
        >
          Transaksi Toko Jadi Mudah dengan{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            NexPOS
          </span>.
        </motion.h1>

        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="relative z-10 text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto mb-10"
        >
          Udah nggak zaman catat penjualan di buku. NexPOS bantu kamu kelola stok, cek laporan, dan proses transaksi dari mana aja — tinggal buka browser.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register" className="group h-14 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-95 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 w-full sm:w-auto text-lg">
            Coba Gratis Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/features" className="h-14 px-8 bg-white border-2 border-zinc-200 text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-emerald-400 hover:text-emerald-600 transition-colors w-full sm:w-auto text-lg">
            Lihat Fiturnya
          </Link>
        </motion.div>

        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative z-10 mt-6 text-sm text-zinc-400 font-medium text-center"
        >
          Cocok untuk kafe, toko kelontong, warung, sampai UMKM Besar!.
        </motion.p>

        {/* Floating Dashboard Mockup */}
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mt-20"
        >
            <div className="mx-auto max-w-5xl relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-2xl scale-95 translate-y-6" />
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative rounded-3xl md:rounded-[2.5rem] border border-zinc-200/80 bg-white/80 backdrop-blur-sm shadow-2xl overflow-hidden p-8 md:p-12"
                >
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Pendapatan Hari Ini</div>
                            <div className="text-2xl font-black text-zinc-900">Rp 2.450.000</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Transaksi</div>
                            <div className="text-2xl font-black text-zinc-900">47 Struk</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Produk Terjual</div>
                            <div className="text-2xl font-black text-zinc-900">128 Item</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Produk Populer</span>
                            </div>
                            <div className="space-y-2">
                                {["Kopi Susu Gula Aren", "Matcha Latte", "Croissant Butter"].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                                        <span className="text-sm font-medium text-zinc-700">{item}</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{32 - i * 8}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-48 bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-3 hidden md:block" style={{ animationDuration: '3s' }} />
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Realtime</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section className="py-24 bg-white border-y border-zinc-100 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <FadeInWhenVisible>
            <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">Fitur Andalan</div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-zinc-900">Semua yang Kamu Butuhkan, <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Ada di Sini</span></h2>
                <p className="text-zinc-500 font-medium text-lg">Nggak perlu ribet mikirin nota hilang atau stok yang nggak sesuai lagi. Semuanya udah dihandle otomatis.</p>
            </div>
          </FadeInWhenVisible>
          
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={<Zap className="w-6 h-6" />} title="Checkout Kilat" desc="Pelanggan nggak perlu nunggu lama. Proses belanja jadi super cepat karena tinggal klik atau scan." color="emerald" />
            <FeatureCard icon={<Users className="w-6 h-6" />} title="Atur Hak Akses" desc="Kasir cuma bisa transaksi, yang bisa ubah harga dan produk cuma kamu sebagai owner. Aman, kan?" color="blue" />
            <FeatureCard icon={<Box className="w-6 h-6" />} title="Stok Auto Update" desc="Setiap ada penjualan, stok langsung berkurang sendiri. Nggak perlu cek manual satu-satu lagi." color="violet" />
            <FeatureCard icon={<BarChart3 className="w-6 h-6" />} title="Laporan Instan" desc="Nggak usah repot rekap di akhir bulan. Semua data penjualan udah tersusun rapi, tinggal download." color="amber" />
            <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Data Kamu Aman" desc="Informasi penjualan dan akun cuma bisa diakses sama kamu. Nggak ada yang bisa intip sembarangan." color="rose" />
            <FeatureCard icon={<LayoutDashboard className="w-6 h-6" />} title="Siap Scale Up" desc="Mau buka cabang baru? Tinggal tambah akun kasir aja, semua tetap terpusat di satu dashboard." color="teal" />
          </StaggerChildren>

          <FadeInWhenVisible delay={0.3} className="mt-12 text-center">
             <Link href="/features" className="inline-flex items-center gap-2 font-bold text-emerald-600 border-b-2 border-emerald-500 pb-1 hover:text-emerald-700 hover:border-emerald-700 transition-colors group">
                Lihat Semua Fitur Lengkap <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </Link>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="cara-kerja" className="py-24 relative">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
                <FadeInWhenVisible>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-100">Cara Kerja</div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-zinc-900">Cuma 3 Langkah <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Doang</span>.</h2>
                    <p className="text-zinc-500 font-medium text-lg mb-12">Nggak perlu panggil orang IT. Daftar, masukin produk, terus langsung jualan. Sesimpel itu.</p>
                </FadeInWhenVisible>
                
                <div className="space-y-8">
                    <FadeInWhenVisible delay={0.1}>
                        <StepItem number="01" title="Daftar Toko" desc="Isi nama toko, alamat, dan bikin akun. Langsung jadi, nggak pakai lama." color="emerald" />
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.2}>
                        <StepItem number="02" title="Tambahin Produk" desc="Masukin daftar barang, pasang harga, dan invite kasir kamu buat bantu jaga." color="blue" />
                    </FadeInWhenVisible>
                    <FadeInWhenVisible delay={0.3}>
                        <StepItem number="03" title="Mulai Jualan!" desc="Tinggal scan barcode atau pilih produk, bayar, selesai. Laporan otomatis dibuatin." color="violet" />
                    </FadeInWhenVisible>
                </div>
            </div>
            
            <FadeInWhenVisible delay={0.2} className="flex-1 w-full">
                <div className="bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-3xl p-8 md:p-12 border border-zinc-200 relative overflow-hidden shadow-inner min-h-[420px] flex flex-col justify-center items-center">
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl" />
                    <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/50 rounded-full blur-3xl" />
                    
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] rounded-2xl border border-zinc-200 p-6 max-w-sm w-full z-10"
                    >
                         <div className="flex justify-between items-center mb-6">
                             <div className="font-bold text-zinc-900 tracking-tight">Checklist Setup</div>
                             <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">Beres Semua ✓</div>
                         </div>
                         <div className="space-y-4">
                             {["Bikin Akun & Atur Role", "Upload Daftar Produk", "Coba Proses Transaksi"].map((text, i) => (
                                 <div key={i} className="flex items-center gap-3">
                                     <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                     <span className="font-medium text-zinc-500 line-through">{text}</span>
                                 </div>
                             ))}
                         </div>
                         <Link href="/register" className="mt-8 block w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl text-center shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 active:scale-95">
                            Cobain Sekarang
                         </Link>
                    </motion.div>
                </div>
            </FadeInWhenVisible>
         </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="harga" className="py-24 bg-white border-y border-zinc-100 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <FadeInWhenVisible>
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">Harga</div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-zinc-900">Harga yang <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Masuk Akal</span></h2>
                    <p className="text-zinc-500 font-medium text-lg">Pilih paket yang sesuai kebutuhan kamu. Mau mulai gratis dulu juga boleh banget.</p>
                </div>
            </FadeInWhenVisible>

            <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <motion.div variants={staggerItem} className="p-8 rounded-3xl border-2 border-zinc-100 bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 flex flex-col group">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Starter</h3>
                    <p className="text-sm text-zinc-500 mb-6 font-medium">Buat kamu yang mau coba-coba dulu tanpa keluar biaya.</p>
                    <div className="mb-6"><span className="text-4xl font-black tracking-tighter text-zinc-900">Gratis</span></div>
                    <ul className="space-y-4 mb-8 flex-1 text-zinc-600 font-medium">
                        {["1 Akun kasir tambahan", "Maksimal 50 produk", "Transaksi tanpa batas", "Download struk PDF", "Akses forum komunitas"].map((text, i) => (
                            <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">{text}</span></li>
                        ))}
                    </ul>
                    <Link href="/register" className="block w-full py-3.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 font-bold rounded-xl text-center transition-colors">Mulai Gratis</Link>
                </motion.div>

                {/* Pro Plan */}
                <motion.div variants={staggerItem} className="p-8 rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-zinc-900 to-zinc-950 text-white shadow-2xl shadow-emerald-500/10 relative flex flex-col scale-100 md:scale-105 z-10 group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">Paling Populer</div>
                    <h3 className="text-xl font-bold mb-2">Pro</h3>
                    <p className="text-sm text-zinc-400 mb-6 font-medium">Buat toko yang udah jalan dan butuh fitur lebih lengkap.</p>
                    <div className="mb-6 flex items-baseline gap-1">
                        <span className="text-xl font-bold opacity-80">Rp</span>
                        <span className="text-4xl font-black tracking-tighter">149K</span>
                        <span className="text-zinc-400 font-medium">/bulan</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 text-zinc-300 font-medium">
                        {["Sampai 5 akun kasir", "Produk tanpa batas", "Dashboard laporan lengkap", "Export ke Excel", "Bantuan prioritas via chat"].map((text, i) => (
                            <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> <span className="text-sm text-white">{text}</span></li>
                        ))}
                    </ul>
                    <Link href="/register" className="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-bold rounded-xl text-center transition-all shadow-lg shadow-emerald-500/25">Coba 14 Hari Gratis</Link>
                </motion.div>

                {/* Enterprise */}
                <motion.div variants={staggerItem} className="p-8 rounded-3xl border-2 border-zinc-100 bg-white transition-all hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 flex flex-col group">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Enterprise</h3>
                    <p className="text-sm text-zinc-500 mb-6 font-medium">Buat bisnis besar dengan banyak cabang dan kebutuhan khusus.</p>
                    <div className="mb-6"><span className="text-4xl font-black tracking-tighter text-zinc-900">Khusus</span></div>
                    <ul className="space-y-4 mb-8 flex-1 text-zinc-600 font-medium">
                        {["Tim kasir tanpa batas", "Kelola banyak cabang sekaligus", "Akses API untuk integrasi", "Custom branding", "Engineer support khusus"].map((text, i) => (
                            <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-sm">{text}</span></li>
                        ))}
                    </ul>
                    <Link href="/register" className="block w-full py-3.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 font-bold rounded-xl text-center transition-colors">Hubungi Kami</Link>
                </motion.div>
            </StaggerChildren>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimoni" className="py-24 bg-zinc-50 relative">
        <div className="max-w-7xl mx-auto px-6">
            <FadeInWhenVisible>
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-100">Testimoni</div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-zinc-900">Kata Mereka yang Udah <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Pakai NexPOS</span></h2>
                    <p className="text-zinc-500 font-medium text-lg">Bukan cuma klaim kita — ini cerita nyata dari pengguna yang udah ngerasain manfaatnya.</p>
                </div>
            </FadeInWhenVisible>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TestimonialCard quote="Dulu tiap akhir bulan pusing ngitung nota satu-satu. Sekarang tinggal buka laporan di NexPOS, udah rapi semua. Nggak kebayang balik ke cara lama lagi!" name="Suriati Nurul" role="Pemilik Toko Skincare" />
                <TestimonialCard quote="Yang paling saya suka itu sistem login kasir terpisah. Jadi nggak khawatir lagi soal manipulasi di kasir, semuanya kerekam dan transparan." name="Kiki Ardiansyah" role="Owner Kedai Jajanan" />
                <TestimonialCard quote="Saya punya 3 kios di beda lokasi. Pake NexPOS, nggak perlu bolak-balik dateng ke setiap tempat cuma buat cek omset. Mantap banget sih." name="Fahri Mahendra" role="Pengusaha Grosir Pakaian" />
            </StaggerChildren>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="py-24 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <FadeInWhenVisible className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Yuk, Tinggalin Cara Lama dan <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Mulai Lebih Cerdas</span></h2>
            <p className="text-lg text-zinc-400 font-medium mb-10 max-w-2xl mx-auto">Nggak perlu install apa-apa, nggak perlu beli mesin kasir mahal. Cukup buka browser, daftar, dan toko kamu langsung siap beroperasi.</p>
            <Link href="/register" className="inline-flex h-16 items-center justify-center px-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black text-lg transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-95 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50">
                Daftar Gratis Sekarang
            </Link>
        </FadeInWhenVisible>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-md shadow-emerald-500/20">N</div>
                    <span className="font-black tracking-tight text-zinc-900">NexPOS</span>
                </div>
                <p className="text-sm text-zinc-500 font-medium mb-6">Aplikasi kasir online yang bikin hidup pedagang jadi lebih simpel.</p>
            </div>
            <div>
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider text-xs">Navigasi</h4>
                <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                    <li><Link href="/features" className="hover:text-emerald-600 transition-colors">Semua Fitur</Link></li>
                    <li><a href="#harga" className="hover:text-emerald-600 transition-colors">Daftar Harga</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Changelog</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider text-xs">Bantuan</h4>
                <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Dokumentasi</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Kontak Kami</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Pusat Bantuan</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-wider text-xs">Legal</h4>
                <ul className="space-y-3 text-sm text-zinc-500 font-medium">
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Kebijakan Privasi</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Syarat & Ketentuan</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-400 font-medium">© {new Date().getFullYear()} NexPOS. All rights reserved.</p>
            <p className="text-xs text-zinc-400 font-medium">Dibuat dengan ☕ dan semangat dari Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════ COMPONENTS ═══════════ */

const colorMap: Record<string, { bg: string, border: string, text: string, iconBg: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-100 hover:border-emerald-300", text: "text-emerald-600", iconBg: "bg-emerald-100 group-hover:bg-emerald-500" },
    blue:    { bg: "bg-blue-50",    border: "border-blue-100 hover:border-blue-300",    text: "text-blue-600",    iconBg: "bg-blue-100 group-hover:bg-blue-500" },
    violet:  { bg: "bg-violet-50",  border: "border-violet-100 hover:border-violet-300",  text: "text-violet-600",  iconBg: "bg-violet-100 group-hover:bg-violet-500" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-100 hover:border-amber-300",   text: "text-amber-600",   iconBg: "bg-amber-100 group-hover:bg-amber-500" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-100 hover:border-rose-300",    text: "text-rose-600",    iconBg: "bg-rose-100 group-hover:bg-rose-500" },
    teal:    { bg: "bg-teal-50",    border: "border-teal-100 hover:border-teal-300",    text: "text-teal-600",    iconBg: "bg-teal-100 group-hover:bg-teal-500" },
};

function FeatureCard({ icon, title, desc, color = "emerald" }: { icon: React.ReactNode, title: string, desc: string, color?: string }) {
    const c = colorMap[color] || colorMap.emerald;
    return (
        <motion.div variants={staggerItem} className={`p-7 rounded-3xl ${c.bg} border ${c.border} transition-all group cursor-default hover:shadow-lg hover:-translate-y-1`}>
            <div className={`w-12 h-12 ${c.iconBg} rounded-2xl flex items-center justify-center ${c.text} group-hover:text-white shadow-sm mb-5 transition-colors duration-300`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed">{desc}</p>
        </motion.div>
    )
}

function StepItem({ number, title, desc, color = "emerald" }: { number: string, title: string, desc: string, color?: string }) {
    const c = colorMap[color] || colorMap.emerald;
    return (
        <div className="flex gap-5 group">
            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} font-black text-lg group-hover:scale-110 transition-all shadow-sm relative z-10`}>
                    {number}
                </div>
            </div>
            <div className="pt-1">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function TestimonialCard({ quote, name, role }: { quote: string, name: string, role: string }) {
    return (
        <motion.div variants={staggerItem} className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all">
            <div>
                <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-zinc-600 font-medium italic mb-8 leading-relaxed">&ldquo;{quote}&rdquo;</p>
            </div>
            <div className="flex items-center gap-4 border-t border-zinc-100 pt-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex justify-center items-center font-bold text-white text-sm shadow-md shadow-emerald-500/20">
                    {name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-zinc-900 text-sm tracking-tight">{name}</h4>
                    <p className="text-xs font-medium text-zinc-400">{role}</p>
                </div>
            </div>
        </motion.div>
    )
}