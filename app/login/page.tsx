'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/utils/api";
import Link from "next/link";
import { Store, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/users/login', {email, password});

            Cookies.set('token', response.data.token); // token abis pas session browser abis
            toast.success('Login berhasil!');
            router.push('/dashboard');
        } catch (err : any) {
            toast.error(err.response?.data?.error || 'Terjadi kesalahan saat login');
            setIsLoading(false);
        }
    };

    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                <Store className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Selamat Datang Kembali</h1>
            <p className="mt-2 text-sm text-zinc-500 font-medium">Silakan masuk ke akun NexPOS Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Alamat Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    placeholder="nama@toko.com"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600">Password</label>
                </div>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/25"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses...
                    </>
                ) : 'Masuk ke Dasbor'}
            </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-zinc-500">
            Belum punya akun toko?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline decoration-2 underline-offset-2">
                Daftar sekarang
            </Link>
        </p>
      </div>
    </div>
  );
}
