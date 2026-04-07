'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/utils/api";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/users/login', {email, password});

            Cookies.set('token', response.data.token); // token abis pas session browser abis

            router.push('/dashboard');
        } catch (err : any) {
            setError(err.response?.data?.error || 'terjadi kesalahan saat login')
        } finally {
            setIsLoading(false)
        }
    };

    
}