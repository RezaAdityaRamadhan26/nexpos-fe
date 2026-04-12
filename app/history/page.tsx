'use client'

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "@/utils/api";

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
    const [isReceiptLoading, setIsReceiptLoading] = useState(false)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/transactions/');
            setTransactions(res.data.data || [])
        } catch (error: any) {
            console.error('gagal memuat riwayat transaksi');
            alert('gagal memuat riwayat transaksi')
        } finally {
            setIsLoading(false)
        }
    }

    const openReceipt = async (id: number) => {
        try {
            setIsReceiptLoading(true);
            const res = await api.get(`/transactions/${id}`)
            setSelectedTrx(res.data.data)
        } catch (error) {
            console.error('gagal memuat struk')
            alert('gagal memuat struk')
        } finally {
            setIsReceiptLoading(false)
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
        <div className="min-h-screen bg-gray-50">
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
            <Navbar />

            <div className="p-8 max-w-7xl mx-auto print:hidden">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Transaksi</h1>

                {/* Tabel Riwayat */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                                <th className="p-4 font-semibold">ID Transaksi</th>
                                <th className="p-4 font-semibold">Tanggal & Waktu</th>
                                <th className="p-4 font-semibold">Metode Pembayaran</th>
                                <th className="p-4 font-semibold">Total Nilai</th>
                                <th className="p-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Belum ada transaksi hari ini.</td></tr>
                            ) : (
                                transactions.map((trx) => (
                                    <tr key={trx.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 text-gray-800 font-medium">#TRX-{trx.id.toString().padStart(4, '0')}</td>
                                        <td className="p-4 text-gray-600">{formatDate(trx.created_at)}</td>
                                        <td className="p-4 text-gray-600 capitalize">{trx.payment_method}</td>
                                        <td className="p-4 text-green-600 font-bold">Rp {trx.total_amount.toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => openReceipt(trx.id)}
                                                className="bg-blue-50 text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-100 transition"
                                            >
                                                Lihat Struk
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Struk (Tampil jika selectedTrx tidak null) */}
            {selectedTrx && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0">
                    
                    {/* CONTAINER STRUK UTAMA */}
                    <div className="bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
                        
                        {/* Area yang akan di-print (Area Struk 58mm) */}
                        <div id="printable-receipt" className="p-6 w-full max-w-[350px] overflow-y-auto font-mono text-sm">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold uppercase tracking-widest">NEXPOS</h2>
                                <p className="text-xs text-gray-500">{selectedTrx.store?.address}</p>
                                <p className="text-xs text-gray-500">{selectedTrx.user?.email}</p>
                            </div>

                            <div className="border-t border-dashed border-gray-400 py-2 mb-2 text-xs">
                                <div className="flex justify-between">
                                    <span>No: TRX-{selectedTrx.id.toString().padStart(4, '0')}</span>
                                    <span>{formatDate(selectedTrx.created_at)}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span>Kasir: {selectedTrx.user?.name}</span>
                                    <span className="uppercase">{selectedTrx.payment_method}</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-400 py-2 mb-2">
                                {/* Looping Detail Barang */}
                                {selectedTrx.details?.map((detail, index) => (
                                    <div key={index} className="mb-2 text-xs">
                                        <div className="font-bold">{detail.products?.name || `Produk ID: ${detail.product_id}`}</div>
                                        <div className="flex justify-between">
                                            <span>{detail.quantity} x {detail.price.toLocaleString('id-ID')}</span>
                                            <span>{(detail.quantity * detail.price).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>TOTAL</span>
                                    <span>Rp {selectedTrx.total_amount.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="text-center text-xs text-gray-500 mt-4">
                                <p>Terima Kasih Atas Kunjungan Anda</p>
                                <p>Barang yang dibeli tidak dapat ditukar</p>
                            </div>
                        </div>

                        {/* Area Tombol Bawah (Akan disembunyikan saat print) */}
                        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between gap-4 print:hidden">
                            <button 
                                onClick={closeReceipt}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300"
                            >
                                Tutup
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex justify-center items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                Cetak Struk
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}