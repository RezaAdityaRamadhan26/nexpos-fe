'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import api from "@/utils/api";

export default function SettingsPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
                alert('Akses Ditolak: Halaman khusus untuk owner');
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
                console.error('Gagal mengambil profile!', error)
                setMessage({ type: 'error', text: 'Gagal mengambil data profil dari server.' })                    
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const payload: any = {
                name: formData.name,
                email: formData.email
            }
            if (formData.password.trim() !== '') {
                payload.password = formData.password
            }
            await api.put('/users/profile', payload)
            setMessage({
                type: 'success',
                text: 'Profil Berhasil Diperbarui!'
            })            
            setFormData(prev => ({...prev, password: ''}))
        } catch (error: any) {
            console.error('Gagal update profile!');
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Gagal memperbarui profil.' 
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Pengaturan Akun</h1>
                    <p className="text-gray-500 mt-2">Kelola informasi profil dan keamanan akun Owner Anda.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse font-medium">Memuat data profil...</div>
                    ) : (
                        <div className="p-8">
                            {message && (
                                <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Input Nama */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                        <input 
                                            required 
                                            type="text" 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" 
                                        />
                                    </div>

                                    {/* Input Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                                        <input 
                                            required 
                                            type="email" 
                                            value={formData.email} 
                                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" 
                                        />
                                    </div>
                                </div>

                                {/* Bagian Ubah Password */}
                                <div className="pt-6 border-t border-gray-100 mt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Keamanan</h3>
                                    <div className="max-w-md">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                        <input 
                                            type="password" 
                                            value={formData.password} 
                                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" 
                                            placeholder="Biarkan kosong jika tidak ingin mengubah"
                                            minLength={6}
                                        />
                                        <p className="text-xs text-gray-400 mt-2">Isi kolom ini HANYA jika Anda ingin mengganti password lama Anda dengan yang baru.</p>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm"
                                    >
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