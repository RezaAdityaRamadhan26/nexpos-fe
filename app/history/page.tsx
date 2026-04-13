'use client'

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "@/utils/api";
import { toast } from "sonner";
import { History, Receipt, Printer, X, Loader2 } from "lucide-react";

interface Transaction {
    id: number;
    total_amount: number;
    payment_method: string;
    created_at: string;
    details?: TransactionDetail[];
    user?: {
        name: string;
        email: string;
    };
    store?: {
        name: string;
        address: string;
    };
}

interface TransactionDetail {
    id: number;
    product_id: number;
    quantity: number;
    price: number
    sub_total: number;
    products?: {
        name: string;
    }
}

export default function HistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
    const [isReceiptLoading, setIsReceiptLoading] = useState<number | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/transactions/');
            setTransactions(res.data.data || [])
        } catch (error: any) {
            toast.error('Gagal memuat riwayat transaksi');
        } finally {
            setIsLoading(false)
        }
    }

    const openReceipt = async (id: number) => {
        try {
            setIsReceiptLoading(id);
            const res = await api.get(`/transactions/${id}`)
            setSelectedTrx(res.data.data)
        } catch (error) {
            toast.error('Gagal memuat struk transaksi')
        } finally {
            setIsReceiptLoading(null)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const closeReceipt = () => {
        setSelectedTrx(null)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* INJEKSI CSS KHUSUS PRINT THERMAL */}
            <style jsx global>{`
                @media print {
                    /* Sembunyikan semua elemen di layar */
                    body * {
                        visibility: hidden;
                    }
                    /* Tampilkan HANYA area struk */
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    /* Posisikan struk di pojok kiri atas kertas */
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 58mm; /* Ukuran standar kertas thermal UMKM */
                        margin: 0;
                        padding: 0;
                        color: black;
                    }
                    /* Hilangkan margin default dari browser saat print */
                    @page {
                        margin: 0;
                    }
                }
            `}</style>

            {/* Komponen Navbar akan otomatis disembunyikan saat print oleh CSS di atas */}
            <div className="print:hidden">
                <Navbar />
            </div>

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full print:hidden">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Riwayat Transaksi</h1>
                    <p className="text-sm text-zinc-500 mt-1">Lihat detail dan cetak ulang struk transaksi sebelumnya.</p>
                </div>

                {/* Tabel Riwayat */}
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                    <th className="p-4 pl-6">ID Transaksi</th>
                                    <th className="p-4">Tanggal & Waktu</th>
                                    <th className="p-4 text-center">Metode Pembayaran</th>
                                    <th className="p-4 text-right">Total Nilai</th>
                                    <th className="p-4 pr-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span className="font-medium text-sm">Memuat data riwayat...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                                                <History className="w-10 h-10 mb-2 opacity-50" />
                                                <span className="font-semibold text-zinc-600">Belum ada transaksi</span>
                                                <span className="text-sm">Riwayat transaksi akan muncul di sini.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr key={trx.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors group">
                                            <td className="p-4 pl-6 text-zinc-900 font-bold text-sm flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-zinc-400 hidden sm:block" />
                                                #TRX-{trx.id.toString().padStart(4, '0')}
                                            </td>
                                            <td className="p-4 text-zinc-500 font-medium text-sm">{formatDate(trx.created_at)}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 rounded-md">
                                                    {trx.payment_method}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-zinc-900 font-bold">Rp {trx.total_amount.toLocaleString('id-ID')}</td>
                                            <td className="p-4 pr-6 text-center">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => openReceipt(trx.id)}
                                                        disabled={isReceiptLoading === trx.id}
                                                        className="px-3 py-1.5 bg-white text-zinc-700 font-bold border border-zinc-200 rounded-lg hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
                                                    >
                                                        {isReceiptLoading === trx.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Receipt className="w-4 h-4" />}
                                                        Lihat Struk
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Struk (Tampil jika selectedTrx tidak null) */}
            {selectedTrx && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0 animate-in fade-in duration-200">
                    
                    {/* CONTAINER STRUK UTAMA */}
                    <div className="bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-in zoom-in-95 duration-200">
                        
                        {/* Area yang akan di-print (Area Struk 58mm) */}
                        <div id="printable-receipt" className="p-6 w-[350px] overflow-y-auto font-mono text-sm max-h-[calc(90vh-80px)] print:max-h-none">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900">NEXPOS</h2>
                                <p className="text-xs text-zinc-500 mt-1">{selectedTrx.store?.address}</p>
                                <p className="text-xs text-zinc-500">{selectedTrx.user?.email}</p>
                            </div>

                            <div className="border-t-2 border-dashed border-zinc-300 py-3 mb-3 text-xs font-medium text-zinc-600">
                                <div className="flex justify-between mb-1">
                                    <span>No: TRX-{selectedTrx.id.toString().padStart(4, '0')}</span>
                                    <span>{formatDate(selectedTrx.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Kasir: {selectedTrx.user?.name}</span>
                                    <span className="uppercase">{selectedTrx.payment_method}</span>
                                </div>
                            </div>

                            <div className="border-t-2 border-dashed border-zinc-300 py-3 mb-3">
                                {/* Looping Detail Barang */}
                                {selectedTrx.details?.map((detail, index) => (
                                    <div key={index} className="mb-3 text-xs">
                                        <div className="font-bold text-zinc-900 mb-1">{detail.products?.name || `Produk ID: ${detail.product_id}`}</div>
                                        <div className="flex justify-between text-zinc-600">
                                            <span>{detail.quantity} x {detail.price.toLocaleString('id-ID')}</span>
                                            <span className="font-bold text-zinc-900">{(detail.quantity * detail.price).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t-2 border-zinc-900 pt-3 mb-6">
                                <div className="flex justify-between font-black text-lg text-zinc-900">
                                    <span>TOTAL</span>
                                    <span>Rp {selectedTrx.total_amount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="text-center text-xs font-medium text-zinc-500 mt-8 mb-4">
                                <p>Terima Kasih Atas Kunjungan Anda</p>
                                <p className="mt-1">Barang yang dibeli tidak dapat ditukar</p>
                            </div>
                        </div>

                        {/* Area Tombol Bawah (Akan disembunyikan saat print) */}
                        <div className="p-5 border-t border-zinc-100 bg-zinc-50 rounded-b-3xl flex justify-between gap-3 print:hidden">
                            <button 
                                onClick={closeReceipt}
                                className="flex-1 px-4 py-3 bg-white text-zinc-700 font-bold border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" /> Tutup
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex-[2] px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                                <Printer className="w-5 h-5" /> Cetak Struk
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}