'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";

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
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/users/register-store', formData)
            router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
        } catch (err: any) {
         setError(err.response?.data?.error || "Terjadi Kesalahan saat mendaftarkan akun")
         setIsLoading(false)   
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <h2 className="text-3xl font-black text-blue-600 tracking-tighter">NexPOS</h2>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Daftarkan Toko Anda</h2>
                <p className="mt-2 text-sm text-gray-600">
                    Sudah punya akun? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Login di sini</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Data Toko */}
                            <div className="space-y-4 sm:col-span-2 border-b pb-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Informasi Toko</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                    <input required type="text" value={formData.store_name} onChange={(e) => setFormData({...formData, store_name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Toko Berkah" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alamat Toko</label>
                                    <textarea required rows={2} value={formData.store_address} onChange={(e) => setFormData({...formData, store_address: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Jl. Raya Depok No.1" />
                                </div>
                            </div>

                            {/* Data Owner */}
                            <div className="space-y-4 sm:col-span-2">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Informasi Pemilik (Owner)</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap Owner</label>
                                    <input required type="text" value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
                                    <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input required type="password" minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors">
                                {isLoading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}