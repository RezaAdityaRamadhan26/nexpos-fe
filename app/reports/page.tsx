'use client'

import { useState, useEffect } from "react";
import api from "@/utils/api";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Loader2, TrendingUp, Receipt, AlertCircle, ChevronDown } from "lucide-react";

interface DashboardData {
    total_revenue: number;
    total_transactions: number;
}

export default function ReportsPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    
    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        const token = Cookies.get("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1]
            const decodedPayload = JSON.parse(atob(payloadBase64));
            
            if (decodedPayload.role !== "owner") {
                toast.error('Peringatan: Halaman ini khusus untuk owner!');
                router.push('/dashboard')
                return;
            }
        } catch (error) {
            router.push('/login');
            return;
        }

        const fetchDashboard = async () => {
            try {
                const res = await api.get('/transactions/dashboard');
                setData(res.data.data)
            } catch (error) {
                toast.error('Gagal mengambil data laporan penjualan');
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboard()
    }, [router])


    const handleExportExcel = async () => {
        try {   
            setIsExporting(true);

            const res = await api.get('/transactions/');
            const txs = res.data.data || []

            if (txs.length === 0) {
                toast.error('Belum ada transaksi untuk diekspor')
                return
            }

            const dataToExport = txs.map((trx: any) => ({
                    "ID Transaksi": `TRX-${trx.id.toString().padStart(4, '0')}`,
                    "Tanggal": new Date(trx.created_at).toLocaleString('id-ID'),
                    "Metode Pembayaran": trx.payment_method.toUpperCase(),
                    "Total Belanja (Rp)": trx.total_amount
                }))

            const worksheet = XLSX.utils.json_to_sheet(dataToExport)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan")

            XLSX.writeFile(workbook, `Laporan_NexPOS_${new Date().toISOString().slice(0, 10)}.xlsx`)
            toast.success('Laporan Excel berhasil diunduh');
        } catch (error) {
            toast.error('Terjadi kesalahan saat membuat file Excel')
        } finally {
            setIsExporting(false)
        }
    }

    const toggleHistory = async () => {
        if (!isHistoryOpen) {
            setIsHistoryOpen(true);
            if (transactions.length === 0) {
                setIsLoadingHistory(true);
                try {
                    const res = await api.get('/transactions/');
                    const sorted = (res.data.data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                    setTransactions(sorted);
                } catch (error) {
                    toast.error('Gagal mengambil riwayat transaksi');
                } finally {
                    setIsLoadingHistory(false);
                }
            }
        } else {
            setIsHistoryOpen(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <Navbar />
            
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Laporan Penjualan</h1>
                        <p className="text-sm text-zinc-500 mt-1">Pantau performa dan ringkasan pendapatan toko Anda.</p>
                    </div>
                    
                    <button 
                        onClick={handleExportExcel}
                        disabled={isExporting || isLoading || !data}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95"
                    >
                        {isExporting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengekspor...</> : <><Download className="w-5 h-5" /> Unduh XLSX</>}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-zinc-400 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="font-medium">Memuat data laporan...</p>
                    </div>
                ) : !data ? (
                    <div className="flex flex-col items-center justify-center bg-white p-12 rounded-3xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center text-zinc-500">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900">Akses Ditolak</h3>
                        <p className="mt-2 text-sm">Gagal memuat data. Pastikan Anda memiliki akses Owner.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Kartu Total Pendapatan */}
                            <div 
                                onClick={toggleHistory}
                                className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden group hover:border-zinc-300 transition-all cursor-pointer active:scale-[0.99]"
                            >
                                <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] text-zinc-900 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                    <TrendingUp className="w-48 h-48" />
                                </div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-colors">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Total Pendapatan</h3>
                                    </div>
                                    <div className={`p-2 rounded-full border border-zinc-200 text-zinc-400 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180 bg-emerald-50' : 'group-hover:bg-zinc-50'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-4xl md:text-5xl font-black text-zinc-900 relative z-10 tracking-tight">
                                    Rp {data.total_revenue.toLocaleString('id-ID')}
                                </p>
                            </div>

                            {/* Kartu Jumlah Transaksi */}
                            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden transition-colors">
                                <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] text-zinc-900">
                                    <Receipt className="w-48 h-48" />
                                </div>
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                        <Receipt className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Jumlah Transaksi</h3>
                                </div>
                                <p className="text-4xl md:text-5xl font-black text-zinc-900 relative z-10 tracking-tight flex items-baseline gap-2">
                                    {data.total_transactions} <span className="text-xl text-zinc-400 font-bold uppercase tracking-wider">struk</span>
                                </p>
                            </div>
                        </div>

                        {/* History Dropdown Section */}
                        {isHistoryOpen && (
                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                                <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-zinc-400" /> Riwayat Transaksi Pendapatan
                                </h3>
                                
                                {isLoadingHistory ? (
                                    <div className="flex items-center justify-center py-10 text-zinc-400">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="ml-2 font-medium">Memuat riwayat...</span>
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-10 text-zinc-500 font-medium bg-zinc-50 rounded-2xl border border-zinc-100">
                                        Belum ada history transaksi.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead>
                                                <tr className="text-zinc-500 border-b border-zinc-100">
                                                    <th className="pb-4 font-bold uppercase tracking-wider">ID Transaksi</th>
                                                    <th className="pb-4 font-bold uppercase tracking-wider">Tanggal</th>
                                                    <th className="pb-4 font-bold uppercase tracking-wider">Metode</th>
                                                    <th className="pb-4 font-bold uppercase tracking-wider text-right">Total (Rp)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-50">
                                                {transactions.map((trx) => (
                                                    <tr key={trx.id} className="hover:bg-zinc-50 transition-colors">
                                                        <td className="py-4 font-bold text-zinc-900">
                                                            TRX-{trx.id.toString().padStart(4, '0')}
                                                        </td>
                                                        <td className="py-4 text-zinc-500 font-medium">
                                                            {new Date(trx.created_at).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-100 text-zinc-600">
                                                                {trx.payment_method.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-right font-black text-zinc-900">
                                                            {trx.total_amount.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}