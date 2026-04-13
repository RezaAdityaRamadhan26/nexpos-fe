'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import api from "@/utils/api";
import { toast } from "sonner";
import { UserCog, KeyRound, Save, Loader2, Mail, User } from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login')
            return;
        }

        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));

            if (decodedPayload.role !== 'owner') {
                toast.error('Akses Ditolak: Halaman khusus untuk owner');
                router.push('/dashboard');
                return;
            }
        } catch (error) {
            router.push('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                const userData = res.data.data
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    password: ''
                })
            } catch (error) {
                toast.error('Gagal mengambil data profil dari server.');
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email
            }
            if (formData.password.trim() !== '') {
                payload.password = formData.password
            }
            await api.put('/users/profile', payload)
            
            toast.success('Profil Berhasil Diperbarui!');
            setFormData(prev => ({...prev, password: ''}))
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Gagal memperbarui profil.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <Navbar />
            
            <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Pengaturan Akun</h1>
                    <p className="text-sm text-zinc-500 mt-1">Kelola informasi profil dan keamanan akun Owner Anda.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-zinc-400 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="font-medium text-sm">Memuat data profil...</p>
                        </div>
                    ) : (
                        <div className="p-8 sm:p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 mb-4">
                                        <UserCog className="w-5 h-5" /> Informasi Dasar
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Input Nama */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                                                <User className="w-3.5 h-3.5" /> Nama Lengkap
                                            </label>
                                            <input 
                                                required 
                                                type="text" 
                                                value={formData.name} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400" 
                                                placeholder="Nama Anda"
                                            />
                                        </div>

                                        {/* Input Email */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5" /> Alamat Email
                                            </label>
                                            <input 
                                                required 
                                                type="email" 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400" 
                                                placeholder="email@toko.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian Ubah Password */}
                                <div className="pt-8 border-t border-zinc-100">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 mb-6">
                                        <KeyRound className="w-5 h-5" /> Keamanan Akun
                                    </h3>
                                    <div className="max-w-md bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password Baru</label>
                                        <input 
                                            type="password" 
                                            value={formData.password} 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400" 
                                            placeholder="••••••••"
                                            minLength={6}
                                        />
                                        <p className="text-xs font-medium text-zinc-500 mt-3 flex items-start gap-1.5">
                                            <span className="text-zinc-400 mt-0.5">*</span> 
                                            Biarkan kosong jika Anda tidak ingin mengubah password lama.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end border-t border-zinc-100">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}