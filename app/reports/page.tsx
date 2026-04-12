'use client'

import { useState, useEffect } from "react";
import api from "@/utils/api";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import * as XLSX from "xlsx"
import { useRouter } from "next/navigation";

interface DashboardData {
    total_revenue: number;
    total_transactions: number;
}

export default function ReportsPage() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false)

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
                alert('Peringatan: Halaman ini khusus untuk owner!');
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
                console.error('gagal mengambil data laporan', error);
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
        const transactions = res.data.data || []

        if (transactions.length === 0) {
            alert('belum ada transaksi untuk diexport')
            return
        }

        const dataToExport = transactions.map((trx: any) => ({
                "ID Transaksi": `TRX-${trx.id.toString().padStart(4, '0')}`,
                "Tanggal": new Date(trx.created_at).toLocaleString('id-ID'),
                "Metode Pembayaran": trx.payment_method.toUpperCase(),
                "Total Belanja (Rp)": trx.total_amount
            }))

        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan")

        XLSX.writeFile(workbook, `Laporan_NexPOS_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
        console.error('Gagal export excel', error)
        alert('Terjadi Kesalahan saat membuat file Excel')
    } finally {
        setIsExporting(false)
    }
}

return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Laporan Pendapatan</h1>
                    
                    {/* Tombol Download Excel */}
                    <button 
                        onClick={handleExportExcel}
                        disabled={isExporting || isLoading || !data}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2 shadow-md"
                    >
                        {isExporting ? 'Memproses...' : 'Export Excel'}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <p className="text-gray-500 font-medium animate-pulse">Memuat data laporan...</p>
                    </div>
                ) : !data ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center">
                        Gagal memuat data. Pastikan Anda memiliki akses Owner.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kartu Total Pendapatan */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-500 mb-2 relative z-10">Total Pendapatan Hari Ini</h3>
                            <p className="text-4xl md:text-5xl font-black text-green-600 relative z-10">
                                Rp {data.total_revenue.toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Kartu Jumlah Transaksi */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 pbu-4 opacity-5 text-blue-500">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-500 mb-2 relative z-10">Jumlah Transaksi Selesai</h3>
                            <p className="text-4xl md:text-5xl font-black text-blue-600 relative z-10">
                                {data.total_transactions} <span className="text-2xl text-gray-400 font-medium">struk</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )}