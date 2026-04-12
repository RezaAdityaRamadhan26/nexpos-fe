'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/utils/api";
import Navbar from "../components/Navbar";

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
                alert("Akses Ditolak!"); router.push("/dashboard");
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
            console.error('Gagal Load Staff', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegisterStep1 = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post('/users/staff', addForm)
            alert(`OTP Terkirim ke ${addForm.email}`)
            setIsOtpStep(true)
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal Mendaftar')
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.post('/users/verify-otp', {email: addForm.email, otp_code: otpCode})
            alert('Kasir Berhasil Ditambahkan')
            setIsOtpStep(false);
            setIsAddModalOpen(false);
            setAddForm({name: '', email: '', password: ''})
            setOtpCode('')
            fetchStaff()
        } catch (error: any) {
            alert(error.response?.data?.error || "OTP Salah")
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

        try {
            await api.put(`/users/staff/${editForm.id}`, editForm);
            alert('Data Pegawai Diperbarui!');
            setIsEditModalOpen(false);
            fetchStaff();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Gagal Update')
        }
    }

    const handleDeleteStaff = async (id: number, name: string) => {
        if (!confirm(`Yakin Ingin menghapus kasir ${name}?, Akses Loginnya akan dihapus permanen!`))
            return;

        try {
            await api.delete(`/users/staff/${id}`);
            fetchStaff();
        } catch (error) {
            alert('Gagal Menghapus Kasir')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pegawai</h1>
                        <p className="text-gray-500 mt-2">Kelola kasir, hak akses, dan data pegawai.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                        + Tambah Kasir Baru
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                                <th className="p-4 font-semibold">Nama</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold text-center">Akses Kelola Produk</th>
                                <th className="p-4 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Memuat...</td></tr> : 
                             staffList.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Belum ada kasir terdaftar.</td></tr> :
                             staffList.map(staff => (
                                <tr key={staff.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{staff.name}</td>
                                    <td className="p-4 text-gray-600">{staff.email}</td>
                                    <td className="p-4 text-center">
                                        {staff.can_manage_products 
                                            ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">DIIZINKAN</span>
                                            : <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">DILARANG</span>
                                        }
                                    </td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => openEditModal(staff)} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-medium hover:bg-yellow-200">Edit</button>
                                        <button onClick={() => handleDeleteStaff(staff.id, staff.name)} className="bg-red-100 text-red-700 px-3 py-1 rounded font-medium hover:bg-red-200">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TAMBAH STAFF (SAMA SEPERTI SEBELUMNYA, TAPI DALAM POPUP) */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">{isOtpStep ? "Verifikasi OTP" : "Tambah Kasir"}</h2>
                        {!isOtpStep ? (
                            <form onSubmit={handleRegisterStep1} className="space-y-4">
                                <input required placeholder="Nama Lengkap" className="w-full border p-3 rounded" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                                <input required type="email" placeholder="Email" className="w-full border p-3 rounded" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} />
                                <input required type="password" placeholder="Password (Min 6)" className="w-full border p-3 rounded" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} />
                                <div className="flex gap-2 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-200 p-3 rounded font-bold text-gray-700">Batal</button>
                                    <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded font-bold">Kirim OTP</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4 text-center">
                                <p className="text-sm">Masukkan OTP dari email {addForm.email}</p>
                                <input required maxLength={6} className="w-full border p-4 rounded text-center text-3xl tracking-widest" value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))} />
                                <button type="submit" className="w-full bg-green-600 text-white p-3 rounded font-bold">Verifikasi</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL EDIT STAFF & IZIN AKSES */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Edit Data & Izin Kasir</h2>
                        <form onSubmit={handleUpdateStaff} className="space-y-4">
                            <div><label className="text-sm text-gray-500">Nama</label><input required className="w-full border p-2 rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                            <div><label className="text-sm text-gray-500">Email</label><input required type="email" className="w-full border p-2 rounded" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                            <div><label className="text-sm text-gray-500">Password Baru (Opsional)</label><input type="password" placeholder="Kosongkan jika tidak diubah" className="w-full border p-2 rounded" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} /></div>
                            
                            {/* TOGGLE IZIN AKSES MANAJEMEN PRODUK */}
                            <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800">Izin Kelola Produk</h4>
                                    <p className="text-xs text-gray-500">Bisa menambah/mengedit produk.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={editForm.can_manage_products} onChange={e => setEditForm({...editForm, can_manage_products: e.target.checked})} />
                                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-200 p-3 rounded font-bold text-gray-700">Batal</button>
                                <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded font-bold">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}