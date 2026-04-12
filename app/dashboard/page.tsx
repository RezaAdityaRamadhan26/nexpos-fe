'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import api from "@/utils/api"
import Navbar from "../components/Navbar"

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    description: string;
}

interface CartItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/products/')
            setProducts(res.data.data)
        } catch (error) {
            console.error('gagal mengambil data produk', error)

            if  (Cookies.get('token') === undefined) {
                router.push('/login')
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [router]); 

    const addToCart = (product: Product) => {
        if (product.stock === 0) return;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product_id === product.id);
            if (existingItem) {
                return prevCart.map((item) => 
                item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
                );
            }
            return [...prevCart, {product_id: product.id, name: product.name, price: product.price, quantity: 1}]
        });
    };

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        try {
            const payload = {
                user_id: 1,
                payment_method: "tunai",
                details: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,   
                })),    
            };

            await api.post('/transactions/', payload);

            alert('transaksi berhasil! stok otomatis terpotong');
            setCart([]);
            fetchProducts();
        } catch (error: any) {
            alert('gagal transaksi:' + (error.response?.data?.message || 'kesalahan jaringan')) ;
        } finally {
            setIsCheckingOut(false)
        }
    }

    return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      <Navbar />
      {/* Bungkus sisa layout dashboard sebelumnya di dalam div flex-1 */}
      <div className="flex flex-1 overflow-hidden">
        {/* Kiri: Katalog Produk (70%) */}
        <div className="w-2/3 p-6 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">NexPOS</h1>
          
          {isLoading ? (
            <p>Memuat produk...</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`p-4 bg-white rounded-xl shadow cursor-pointer transition hover:shadow-lg ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-lg text-gray-800">{product.name}</div>
                  <div className="text-blue-600 font-bold mt-1">Rp {product.price.toLocaleString('id-ID')}</div>
                  <div className="text-sm text-gray-500 mt-2">Sisa Stok: {product.stock}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kanan: Keranjang Belanja (30%) */}
        <div className="w-1/3 bg-white shadow-xl flex flex-col">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">Keranjang Pesanan</h2>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">Keranjang masih kosong</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="font-bold text-gray-800">
                    Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total & Tombol Bayar */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-800">
              <span>Total:</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {isCheckingOut ? 'Memproses...' : 'BAYAR SEKARANG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}