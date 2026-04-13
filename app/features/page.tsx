'use client'

import Link from "next/link";
import { ArrowRight, ArrowLeft, BarChartHorizontal, Search, Settings, Receipt, QrCode, MonitorSmartphone, LayoutDashboard } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white overflow-x-hidden pb-24">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-zinc-200/60 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xl tracking-tighter shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
              N
            </div>
            <span className="text-xl font-black tracking-tight">NexPOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-zinc-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
            </Link>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/register" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-2">
              Daftar Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="pt-40 pb-16 px-6 max-w-4xl mx-auto text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100">Semua Fitur</div>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative z-10 text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-tight mb-6">
          Kenali Lebih Dekat Apa Aja yang <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Bisa Dilakukan</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative z-10 text-lg text-zinc-500 font-medium leading-relaxed">
          Di sini kamu bisa eksplor semua kemampuan NexPOS, dari urusan kasir sampai manajemen toko — semuanya didesain biar kamu nggak pusing.
        </motion.p>
      </section>

      {/* CAPABILITY GRID */}
      <section className="px-6 max-w-6xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeInWhenVisible delay={0}>
            <DetailCard icon={<MonitorSmartphone className="w-8 h-8" />} title="Buka dari Perangkat Apa Aja" desc="Mau pake laptop di kasir, tablet di meja, atau cek omset lewat HP pas lagi di luar? Semua bisa. NexPOS jalan di browser mana pun, nggak perlu install aplikasi." color="emerald" />
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.1}>
            <DetailCard icon={<QrCode className="w-8 h-8" />} title="Scan Barcode Langsung Masuk" desc="Tinggal arahkan scanner ke barcode produk, langsung masuk ke keranjang dalam hitungan detik. Kasir nggak perlu ketik manual, antrean jadi lebih cepat." color="blue" />
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.15}>
            <DetailCard icon={<Receipt className="w-8 h-8" />} title="Cetak Struk Otomatis" desc="Nggak usah ribet soal format. Struk otomatis dibikin rapi dan siap cetak lewat printer thermal kamu. Mau ukuran 58mm atau 80mm, tinggal colok aja." color="violet" />
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.2}>
            <DetailCard icon={<Settings className="w-8 h-8" />} title="Pengaturan Toko Sesukamu" desc="Ubah harga, atur diskon, kelola siapa yang boleh ngapain — semua ada di satu halaman pengaturan. Cuma owner yang bisa akses, jadi aman." color="amber" />
          </FadeInWhenVisible>
        </div>
      </section>

      {/* WORKFLOW TIMELINE */}
      <section className="px-6 max-w-4xl mx-auto">
        <FadeInWhenVisible>
            <div className="mb-12 border-b border-zinc-200 pb-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-xs font-bold uppercase tracking-wider mb-4 border border-teal-100">Alur Kerja</div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Begini Alur <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Transaksinya</span></h2>
                <p className="text-zinc-500 font-medium mt-2">Gampang banget, ini gambaran singkat gimana proses jualan pakai NexPOS.</p>
            </div>
        </FadeInWhenVisible>

        <div className="relative border-l-2 border-emerald-200 ml-4 md:ml-0 space-y-12 pb-10">
          <FadeInWhenVisible delay={0.1}>
            <TimelineItem icon={<Search className="w-5 h-5 text-white" />} title="Cari & Pilih Produk" desc="Di halaman kasir, semua produk ditampilin dalam bentuk kartu yang rapi. Mau cari? Tinggal ketik nama atau scan barcode, langsung masuk keranjang." />
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.2}>
            <TimelineItem icon={<BarChartHorizontal className="w-5 h-5 text-white" />} title="Atur Jumlah Barang" desc="Pelanggan mau nambah atau ngurangin? Tinggal klik tombol + atau -. Total harga langsung ke-update otomatis tanpa perlu refresh halaman." />
          </FadeInWhenVisible>
          <FadeInWhenVisible delay={0.3}>
            <TimelineItem icon={<Receipt className="w-5 h-5 text-white" />} title="Bayar & Selesai" desc="Pilih metode pembayaran, konfirmasi, selesai! Kembalian langsung dihitung otomatis. Struk bisa langsung dicetak atau disimpan digital." />
          </FadeInWhenVisible>
        </div>
      </section>

      {/* CTA BOTTOM */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <FadeInWhenVisible>
         <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98110_1px,transparent_1px),linear-gradient(to_bottom,#10b98110_1px,transparent_1px)] bg-[size:32px_32px]" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
             <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-4">Udah Baca? Yuk Langsung Cobain!</h3>
                <p className="text-zinc-400 font-medium mb-8 max-w-lg mx-auto">Teorinya udah cukup, sekarang waktunya praktek. Daftar gratis dan rasain sendiri enaknya pakai NexPOS.</p>
                <Link href="/register" className="inline-flex h-14 items-center px-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-95 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40">
                    Daftar Gratis Sekarang
                </Link>
             </div>
         </div>
        </FadeInWhenVisible>
      </section>
    </div>
  )
}

const colorMap: Record<string, { bg: string, border: string, text: string }> = {
    emerald: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-100", text: "text-emerald-600" },
    blue:    { bg: "from-blue-50 to-indigo-50",   border: "border-blue-100",    text: "text-blue-600" },
    violet:  { bg: "from-violet-50 to-purple-50", border: "border-violet-100",  text: "text-violet-600" },
    amber:   { bg: "from-amber-50 to-orange-50",  border: "border-amber-100",   text: "text-amber-600" },
};

function DetailCard({ icon, title, desc, color = "emerald" }: { icon: React.ReactNode, title: string, desc: string, color?: string }) {
    const c = colorMap[color] || colorMap.emerald;
    return (
        <div className={`bg-gradient-to-br ${c.bg} p-8 md:p-10 rounded-3xl border ${c.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group`}>
            <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center ${c.text} mb-6 border ${c.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-2xl font-black text-zinc-900 mb-4">{title}</h3>
            <p className="text-zinc-500 font-medium leading-relaxed">{desc}</p>
        </div>
    )
}

function TimelineItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="relative pl-10 md:pl-12">
            <div className="absolute -left-[21px] bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-zinc-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                {icon}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-emerald-200 transition-colors shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <h4 className="text-xl font-bold text-zinc-900 mb-2">{title}</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
