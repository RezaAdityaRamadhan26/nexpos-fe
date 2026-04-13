'use client'

import { useState, useEffect, useRef } from "react"
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
    image_url?: string;
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
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const productsRef = useRef<Product[]>([]);
    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    useEffect(() => {
        let scanner: any = null;
        let isMounted = true;

        if (isScannerOpen) {
            import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
                // Jangan inisialisasi jika useEffect sudah di-cleanup oleh React Strict Mode
                if (!isMounted) return; 

                scanner = new Html5QrcodeScanner(
                    "reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );

                scanner.render(
                    (decodedText: string) => {
                        const product = productsRef.current.find(p => p.sku === decodedText);
                        if (product) {
                            if (product.stock === 0) {
                                alert(`Stok produk ${product.name} telah habis!`);
                                return;
                            }
                            setCart((prevCart) => {
                                const existingItem = prevCart.find((item) => item.product_id === product.id);
                                if (existingItem) {
                                    return prevCart.map((item) => 
                                        item.product_id === product.id
                                        ? { ...item, quantity: item.quantity + 1 }
                                        : item
                                    );
                                }
                                return [...prevCart, {product_id: product.id, name: product.name, price: product.price, quantity: 1}];
                            });
                        } else {
                            console.warn(`Produk dengan SKU ${decodedText} tidak ditemukan.`);
                        }
                    },
                    (error: any) => {
                        // Jangan alert di sini
                    }
                );
            });
        }

        return () => {
            isMounted = false;
            // Hentikan scanner dengan aman ketika komponen di-unmount atau ditutup
            if (scanner) {
                try {
                    scanner.clear().catch((e: any) => console.log('Scanner safely closed', e));
                } catch (e) {
                    console.log('Error clearing scanner', e);
                }
            }
        };
    }, [isScannerOpen]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/products/')
            setProducts(res.data.data || [])
        } catch (error) {
            console.error('gagal mengambil data produk', error)
            if (Cookies.get('token') === undefined) {
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
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* KIRI: Katalog Produk & Scanner (70%) */}
        <div className="w-2/3 p-6 overflow-y-auto flex flex-col">
          
          {/* Header Area */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-black text-blue-600 tracking-tighter">Mesin Kasir</h1>
            
            {/* Tombol Buka Scanner */}
            <button 
                onClick={() => setIsScannerOpen(true)}
                className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-700 transition shadow-md flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                Scan Barcode
            </button>
          </div>
          
          {/* Grid Produk UI Baru */}
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
                <p className="text-gray-500 font-medium animate-pulse">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-10">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${product.stock === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                >
                  {/* Area Gambar */}
                  <div className="h-40 bg-gray-100 relative">
                      {product.image_url ? (
                          <img src={`http://localhost:8080${product.image_url}`} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                          <div className="flex items-center justify-center w-full h-full text-gray-400 font-medium text-sm">Tanpa Gambar</div>
                      )}
                      
                      {/* Badge Stok */}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-gray-700">
                          Stok: {product.stock}
                      </div>
                  </div>
                  
                  {/* Area Teks */}
                  <div className="p-4">
                    <div className="font-bold text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</div>
                    <div className="text-sm text-gray-400 mt-1 mb-2">{product.sku || "Tanpa SKU"}</div>
                    <div className="text-lg text-blue-600 font-black">Rp {product.price.toLocaleString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KANAN: Keranjang Belanja (30%) */}
        <div className="w-1/3 bg-white shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] flex flex-col z-10">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-800">Pesanan</h2>
            <p className="text-sm text-gray-500 mt-1">Daftar belanja pelanggan</p>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <p className="font-medium">Keranjang masih kosong</p>
                  <p className="text-xs mt-1">Pilih produk atau scan barcode</p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 leading-tight">{item.name}</div>
                    <div className="text-sm font-medium text-blue-600 mt-1">Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="flex flex-col items-end pl-4">
                    <div className="font-black text-gray-800 text-lg mb-1">
                      Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                    </div>
                    <div className="bg-white border rounded-md px-3 py-1 text-sm font-bold text-gray-700 shadow-sm">
                        x {item.quantity}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total & Tombol Bayar */}
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium">Total Pembayaran</span>
              <span className="text-3xl font-black text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-4 bg-blue-600 text-white font-black text-lg rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-300 disabled:hover:shadow-none disabled:hover:translate-y-0 transition-all"
            >
              {isCheckingOut ? 'Memproses...' : 'BAYAR SEKARANG'}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL SCANNER KAMERA --- */}
      {isScannerOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Scan Barcode / QR</h2>
                      <button 
                          onClick={() => setIsScannerOpen(false)}
                          className="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 rounded-full p-2 transition"
                      >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  {/* Div ini adalah tempat dimana kamera html5-qrcode akan muncul */}
                  <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300"></div>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                      Arahkan kamera ke Barcode atau QR Code produk (SKU).
                  </p>
              </div>
          </div>
      )}

    </div>
  );
}