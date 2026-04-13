'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import { toast } from "sonner";
import { Store, Loader2, User, Building2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        store_name: '',
        store_address: '',
        owner_name: '',
        email: '',
        password: '',
    })

    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post('/users/register-store', formData)
            toast.success('Pendaftaran berhasil! Silakan periksa email Anda.');
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Terjadi Kesalahan saat mendaftarkan akun")
            setIsLoading(false)   
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/25">
                        <Store className="w-8 h-8" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Daftarkan Toko Anda</h2>
                <p className="mt-2 text-sm text-zinc-500 font-medium">Buat akun NexPOS untuk mulai mengelola bisnis</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white py-8 px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-3xl sm:px-10 border border-zinc-100">
                    
                    <form onSubmit={handleRegister} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                            {/* Data Toko */}
                            <div className="space-y-5 sm:col-span-2 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 mb-4">
                                    <Building2 className="w-4 h-4" /> Informasi Toko
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Nama Toko *</label>
                                    <input required type="text" value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" placeholder="Contoh: Toko Sejahtera" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Alamat Toko *</label>
                                    <textarea required rows={2} value={formData.store_address} onChange={(e) => setFormData({...formData, store_address: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium resize-none" placeholder="Jl. Raya Depok No.1" />
                                </div>
                            </div>

                            {/* Data Owner */}
                            <div className="space-y-5 sm:col-span-2 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4" /> Informasi Pemilik
                                </h3>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Nama Lengkap *</label>
                                    <input required type="text" value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" placeholder="Reza Aditya" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Alamat Email *</label>
                                        <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" placeholder="owner@toko.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password *</label>
                                        <input required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isLoading} className="w-full py-4 font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-2 shadow-lg shadow-emerald-500/25">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Mendaftarkan...
                                    </>
                                ) : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm font-medium text-zinc-500">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-emerald-600 font-bold hover:underline decoration-2 underline-offset-2">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}