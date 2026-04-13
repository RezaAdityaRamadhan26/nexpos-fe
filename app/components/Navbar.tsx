'use client'

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { Store, LogOut, LayoutDashboard, Package, RotateCcw, BarChart3, Users, Settings } from "lucide-react";
import { toast } from "sonner";

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
    }, [])

    const handleLogout = () => {
        toast('Apakah Anda yakin ingin keluar?', {
            action: {
                label: 'Ya, Logout',
                onClick: () => {
                    Cookies.remove('token');
                    router.push('/login');
                },
            },
            cancel: {
                label: 'Batal',
                onClick: () => {},
            },
            duration: 8000,
        });
    }

    const isActive = (path: string) => pathName === path 
        ? "text-emerald-700 font-semibold flex items-center gap-2" 
        : "text-zinc-500 hover:text-emerald-600 flex items-center gap-2 transition-colors";

    return (
        <nav className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-zinc-200/60 px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-10">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
                        <Store className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">NexPOS</h2>
                </Link>
                
                <div className="flex gap-6 text-sm">
                    <Link href="/dashboard" className={isActive('/dashboard')}>
                        <LayoutDashboard className="w-4 h-4" /> Kasir
                    </Link>

                    {(userRole === 'owner' || canManageProducts) && (
                        <>
                            <Link href="/products" className={isActive('/products')}>
                                <Package className="w-4 h-4" /> Produk
                            </Link>
                            <Link href="/history" className={isActive('/history')}>
                                <RotateCcw className="w-4 h-4" /> Riwayat
                            </Link>
                        </>
                    )}

                    {userRole === 'owner' && (
                        <>
                            <Link href="/reports" className={isActive('/reports')}>
                                <BarChart3 className="w-4 h-4" /> Laporan
                            </Link>
                            <Link href="/staff" className={isActive('/staff')}>
                                <Users className="w-4 h-4" /> Pegawai
                            </Link>
                            <Link href="/settings" className={isActive('/settings')}>
                                <Settings className="w-4 h-4" /> Pengaturan
                            </Link>
                        </>
                    )}                
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {userRole && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            {userRole}
                        </span>
                    </div>
                )}
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </nav>
    )
}