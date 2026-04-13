'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/utils/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Users, Plus, Edit2, Trash2, KeyRound, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";

export default function StaffDashboard() {
    const router = useRouter();
    
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState (true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        id: 0, 
        name: '',
        email: '',
        password: '',
        can_manage_products: false
    });

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

    try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            if (decoded.role !== "owner") {
                toast.error("Akses Ditolak!"); 
                router.push("/dashboard");
            } else {
                fetchStaff()
            }    
        } catch {
            router.push('/login');
        }
    }, [router])

    const fetchStaff = async () => {
        try {
            const res = await api.get('/users/staff');
            setStaffList(res.data.data  || [])
        } catch (error) {
            toast.error('Gagal mengambil data pegawai');
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegisterStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/users/staff', addForm)
            toast.success(`OTP Terkirim ke ${addForm.email}`)
            setIsOtpStep(true)
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Gagal Mendaftar')
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/users/verify-otp', {email: addForm.email, otp_code: otpCode})
            toast.success('Kasir Berhasil Ditambahkan')
            setIsOtpStep(false);
            setIsAddModalOpen(false);
            setAddForm({name: '', email: '', password: ''})
            setOtpCode('')
            fetchStaff()
        } catch (error: any) {
            toast.error(error.response?.data?.error || "OTP Salah")
        } finally {
            setIsSubmitting(false);
        }
    }

    const openEditModal = (staff: any) => {
        setEditForm({
            id: staff.id, 
            name: staff.name,
            email: staff.email,
            password: '',
            can_manage_products: staff.can_manage_products
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/users/staff/${editForm.id}`, editForm);
            toast.success('Data Pegawai Diperbarui!');
            setIsEditModalOpen(false);
            fetchStaff();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Gagal Memperbarui Data Pegawai')
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDeleteStaff = async (id: number, name: string) => {
        if (!confirm(`Yakin Ingin menghapus kasir ${name}? Akses Login-nya akan dihapus permanen!`))
            return;

        try {
            await api.delete(`/users/staff/${id}`);
            toast.success(`Kasir ${name} berhasil dihapus`);
            fetchStaff();
        } catch (error) {
            toast.error('Gagal Menghapus Kasir')
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            <Navbar />
            <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Manajemen Pegawai</h1>
                        <p className="text-sm text-zinc-500 mt-1">Kelola kasir, hak akses, dan data pegawai.</p>
                    </div>
                    <button 
                        onClick={() => {
                            setIsOtpStep(false);
                            setAddForm({name:'', email:'', password:''});
                            setOtpCode('');
                            setIsAddModalOpen(true);
                        }} 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Tambah Kasir Baru
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                    <th className="p-4 pl-6">Nama</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4 text-center">Hak Akses Produk</th>
                                    <th className="p-4 pr-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span className="font-medium text-sm">Memuat data pegawai...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                                                <Users className="w-10 h-10 mb-2 opacity-50" />
                                                <span className="font-semibold text-zinc-600">Belum ada kasir terdaftar</span>
                                                <span className="text-sm">Silakan daftarkan kasir Anda.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    staffList.map(staff => (
                                    <tr key={staff.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 group transition-colors">
                                        <td className="p-4 pl-6 font-bold text-zinc-800 text-sm flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold">
                                                {staff.name.charAt(0).toUpperCase()}
                                            </div>
                                            {staff.name}
                                        </td>
                                        <td className="p-4 text-zinc-500 font-medium text-sm">{staff.email}</td>
                                        <td className="p-4 text-center">
                                            {staff.can_manage_products 
                                                ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold leading-none"><ShieldCheck className="w-3 h-3"/> DIIZINKAN</span>
                                                : <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-md text-xs font-bold leading-none"><ShieldAlert className="w-3 h-3"/> DILARANG</span>
                                            }
                                        </td>
                                        <td className="p-4 pr-6">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(staff)} 
                                                    className="p-2 bg-white text-zinc-600 border border-zinc-200 rounded-lg hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm"
                                                    title="Edit Data"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteStaff(staff.id, staff.name)} 
                                                    className="p-2 bg-white text-red-500 border border-zinc-200 rounded-lg hover:text-red-700 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                                                    title="Hapus Kasir"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL TAMBAH STAFF */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-zinc-100 p-2.5 rounded-xl">
                                {isOtpStep ? <KeyRound className="w-6 h-6 text-zinc-900" /> : <Users className="w-6 h-6 text-zinc-900" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{isOtpStep ? "Verifikasi OTP" : "Tambah Kasir Baru"}</h2>
                                <p className="text-xs font-medium text-zinc-500">{isOtpStep ? "Cek kode di email Anda" : "Masukkan data kasir"}</p>
                            </div>
                        </div>

                        {!isOtpStep ? (
                            <form onSubmit={handleRegisterStep1} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Nama Lengkap *</label>
                                    <input required placeholder="Budi Santoso" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Email Kasir *</label>
                                    <input required type="email" placeholder="budi@kasir.com" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password (Min 6 Karakter) *</label>
                                    <input required type="password" minLength={6} placeholder="••••••••" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-zinc-100">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-5 py-3 bg-white text-zinc-700 border border-zinc-300 rounded-xl font-bold hover:bg-zinc-50 transition-colors">Batal</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-400 disabled:to-zinc-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Kode OTP"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-zinc-600 text-center mb-4">
                                        Masukkan kode OTP 6 digit yang telah dikirimkan ke <span className="font-bold text-zinc-900">{addForm.email}</span>
                                    </p>
                                    <input 
                                        required 
                                        maxLength={6} 
                                        className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-center text-4xl font-black tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                                        value={otpCode} 
                                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                                        placeholder="000000"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-3 bg-white text-zinc-700 border border-zinc-300 rounded-xl font-bold hover:bg-zinc-50 transition-colors">Batal</button>
                                    <button type="submit" disabled={isSubmitting || otpCode.length !== 6} className="flex-[2] px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verifikasi OTP"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL EDIT STAFF & IZIN AKSES */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-zinc-100 p-2.5 rounded-xl">
                                <Edit2 className="w-5 h-5 text-zinc-900" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Edit Data & Izin Kasir</h2>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateStaff} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Nama Lengkap</label>
                                <input required className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Email</label>
                                <input required type="email" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Password Baru (Opsional)</label>
                                <input type="password" placeholder="Kosongkan jika tidak diubah" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium placeholder:text-zinc-400" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                            </div>
                            
                            {/* TOGGLE IZIN AKSES MANAJEMEN PRODUK */}
                            <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 mt-2 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-zinc-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-zinc-600" /> Akses Kelola Produk</h4>
                                    <p className="text-xs font-medium text-zinc-500 mt-1 pr-4">Berikan izin pegawai untuk menambah dan mengedit produk di katalog.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" checked={editForm.can_manage_products} onChange={e => setEditForm({...editForm, can_manage_products: e.target.checked})} />
                                    <div className="w-12 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 border border-transparent peer-checked:border-emerald-500 shadow-inner"></div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-zinc-100">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-5 py-3 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-bold hover:bg-zinc-50 transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-400 disabled:to-zinc-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}