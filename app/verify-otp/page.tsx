'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";

function VerifyOTPForm () {
    const router = useRouter();
    const searchParams = useSearchParams();

    const emailFromUrl = searchParams.get('email') || ''
    const [email, setEmail] = useState(emailFromUrl);
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        if (emailFromUrl) setEmail(emailFromUrl)
    }, [emailFromUrl])

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('users/verify-otp', {
                email: email,
                otp_code: otpCode
            })
            setSuccessMsg('Verifikasi berhasil! Silahkan login')
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err: any) {
            setError(err.response?.data?.error || "Kode OTP salah atau kadaluarsa.")
            setIsLoading(false)
        }
    }
    return (
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 max-w-md w-full mx-auto mt-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Verifikasi Email</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Masukkan 6 digit kode OTP yang telah kami kirimkan ke email Anda.
                </p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center font-bold">{successMsg}</div>}

            <form onSubmit={handleVerify} className="space-y-6 text-center">
                <div>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-center border-b border-gray-300 p-2 focus:border-blue-500 focus:outline-none mb-4 text-gray-600 bg-gray-50"
                        readOnly={!!emailFromUrl} // Jika ada dari URL, tidak bisa diedit
                        placeholder="Email Anda"
                    />
                </div>
                
                <div>
                    <input 
                        type="text" 
                        required 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Hanya angka
                        className="w-full text-center text-4xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                        placeholder="000000"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading || otpCode.length < 6 || !!successMsg} 
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi Akun'}
                </button>
            </form>
        </div>
    )
}

export default function VerifyOTPPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-black text-blue-600 tracking-tighter">NexPOS</h2>
            
            <Suspense fallback={<div className="text-center mt-10">Memuat form verifikasi...</div>}>
                <VerifyOTPForm />
            </Suspense>
        </div>
    )
}
