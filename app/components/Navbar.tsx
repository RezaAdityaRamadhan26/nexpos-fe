'use client'

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";


export default function Navbar() {
    const router = useRouter();
    const pathName = usePathname();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [canManageProducts, setCanManageProducts] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token')
        if (token) {
            try {
                const payloadBase64 = token.split('.')[1]
                const decodedPayload = JSON.parse(atob(payloadBase64))
                setUserRole(decodedPayload.role)
                setCanManageProducts(decodedPayload.can_manage_products === true)
            } catch (error) {
                console.error('gagal membaca token', error)
            }
        }
    })

    const handleLogout = () => {
        Cookies.remove('token')
        router.push('/login')
    }

    const isActive = (path: string) => pathName === path ? "text-blue-600 font-bold" : "text-gray-600 hover:text-blue-600"

return (
        <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
            <div className="flex items-center gap-8">
                <h2 className="text-2xl font-black text-blue-600 tracking-tighter">NexPOS</h2>
                
                <div className="flex gap-6 font-medium">
                    {/* Menu Produk: Bisa dilihat Owner ATAU Kasir yang diberi izin */}
                    {(userRole === 'owner' || canManageProducts) && (
                        <>
                        <Link href="/products" className={isActive('/products')}>Produk</Link>
                        <Link href="/history" className={isActive('/history')}>Riwayat</Link>
                        </>
                    )}

                    {/* Menu RAHASIA yang HANYA bisa dilihat OWNER mutlak */}
                    {userRole === 'owner' && (
                        <>
                            <Link href="/reports" className={isActive('/reports')}>Laporan</Link>
                            <Link href="/staff" className={isActive('/staff')}>Pegawai</Link>
                            <Link href="/settings" className={isActive('/settings')}>Pengaturan</Link>
                        </>
                    )}                
                    </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Menampilkan badge kecil agar tahu sedang login sebagai apa */}
                {userRole && (
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                        {userRole}
                    </span>
                )}
                <button 
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
                >
                    Logout
                </button>
            </div>
        </nav>
    )}