'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import api from "@/utils/api"
import Navbar from "../components/Navbar"
import { toast } from "sonner"
import { ScanBarcode, ShoppingBag, Plus, Minus, X, Trash2, ImageOff, Banknote, QrCode, CreditCard, Smartphone } from "lucide-react"

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
    image_url?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('tunai');

    const paymentMethods = [
        { value: 'tunai', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
        { value: 'qris', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
        { value: 'debit', label: 'Debit', icon: <CreditCard className="w-4 h-4" /> },
        { value: 'e-wallet', label: 'E-Wallet', icon: <Smartphone className="w-4 h-4" /> },
    ];

    const productsRef = useRef<Product[]>([]);
    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    useEffect(() => {
        let scanner: any = null;
        let isMounted = true;

        if (isScannerOpen) {
            import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
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
                                toast.error(`Stok produk ${product.name} telah habis!`);
                                return;
                            }
                            setCart((prevCart) => {
                                const existingItem = prevCart.find((item) => item.product_id === product.id);
                                if (existingItem) {
                                    if (existingItem.quantity >= product.stock) {
                                        toast.warning(`Stok ${product.name} tidak mencukupi!`);
                                        return prevCart;
                                    }
                                    return prevCart.map((item) => 
                                        item.product_id === product.id
                                        ? { ...item, quantity: item.quantity + 1 }
                                        : item
                                    );
                                }
                                toast.success(`${product.name} ditambahkan ke keranjang`);
                                return [...prevCart, {product_id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url}];
                            });
                        } else {
                            toast.error(`Produk dengan SKU ${decodedText} tidak ditemukan.`);
                        }
                        setIsScannerOpen(false); // Close scanner after success
                    },
                    (error: any) => {
                        // ignore continuous errors
                    }
                );
            });
        }

        return () => {
            isMounted = false;
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
            toast.error('Gagal mengambil data produk');
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
        if (product.stock === 0) {
            toast.error('Stok produk habis!');
            return;
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product_id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    toast.warning('Mencapai batas stok produk!');
                    return prevCart;
                }
                return prevCart.map((item) => 
                item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
                );
            }
            return [...prevCart, {product_id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url}]
        });
    };

    const reduceFromCart = (productId: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product_id === productId);
            if (!existingItem) return prevCart;
            
            if (existingItem.quantity <= 1) {
                return prevCart.filter((item) => item.product_id !== productId);
            }
            
            return prevCart.map((item) => 
                item.product_id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            );
        });
    };

    const getCartQuantity = (productId: number) => {
        return cart.find(item => item.product_id === productId)?.quantity || 0;
    };

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    const processCheckout = async () => {
        setIsCheckingOut(true);

        try {
            const payload = {
                user_id: 1,
                payment_method: paymentMethod,
                details: cart.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,   
                })),    
            };

            await api.post('/transactions/', payload);

            toast.success('Transaksi berhasil! Stok otomatis terpotong', { duration: 4000 });
            setCart([]);
            setPaymentMethod('tunai');
            fetchProducts();
        } catch (error: any) {
            toast.error('Gagal transaksi: ' + (error.response?.data?.error || 'Kesalahan Server'));
        } finally {
            setIsCheckingOut(false)
        }
    }

    const handleCheckout = () => {
        if (cart.length === 0) return;

        const methodLabel = paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod;

        toast(
            `Proses pembayaran Rp ${totalAmount.toLocaleString('id-ID')} via ${methodLabel}?`,
            {
                action: {
                    label: 'Ya, Bayar',
                    onClick: () => processCheckout(),
                },
                cancel: {
                    label: 'Batal',
                    onClick: () => {},
                },
                duration: 10000,
            }
        );
    }

    return (
    <div className="flex flex-col h-screen w-full bg-zinc-50 overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden h-full">
        {/* KIRI: Katalog Produk & Scanner (70%) */}
        <div className="w-2/3 p-6 overflow-y-auto flex flex-col hide-scrollbar">
          
          {/* Header Area */}
          <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 backdrop-blur-sm">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Katalog Produk</h1>
                <p className="text-sm text-zinc-500 mt-1">Pilih produk atau scan barcode untuk menambahkan ke keranjang.</p>
            </div>
            
            {/* Tombol Buka Scanner */}
            <button 
                onClick={() => setIsScannerOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center gap-2 active:scale-95"
            >
                <ScanBarcode className="w-5 h-5" />
                Scan Barcode
            </button>
          </div>
          
          {/* Grid Produk UI Baru */}
          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium">Memuat produk...</p>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-20">
              {products.map((product) => {
                const qtyInCart = getCartQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl shadow-sm border ${qtyInCart > 0 ? 'border-emerald-400 ring-1 ring-emerald-400' : 'border-zinc-200 hover:border-zinc-300'} overflow-hidden transition-all hover:shadow-xl flex flex-col justify-between ${product.stock === 0 ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                  >
                    {/* Area Gambar */}
                    <div 
                        className="h-44 bg-zinc-100 relative cursor-pointer group"
                        onClick={() => product.stock > 0 && addToCart(product)}
                    >
                        {product.image_url ? (
                            <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}${product.image_url}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full text-zinc-400 font-medium text-sm">
                                <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                                Tanpa Gambar
                            </div>
                        )}
                        
                        {/* Overlay to click Add */}
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm text-zinc-900 p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Plus className="w-6 h-6" />
                            </div>
                        </div>
                        
                        {/* Badge Stok */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[10px] uppercase font-bold px-2 py-1.5 rounded-lg shadow-sm text-zinc-700 tracking-wider">
                            Sisa {product.stock}
                        </div>

                        {qtyInCart > 0 && (
                            <div className="absolute top-3 left-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md shadow-emerald-500/30 animate-in zoom-in">
                                {qtyInCart}
                            </div>
                        )}
                    </div>
                    
                    {/* Area Teks & Aksi */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <div className="font-semibold text-zinc-800 line-clamp-2 leading-tight text-sm mb-1">{product.name}</div>
                        <div className="text-xs text-zinc-400 font-medium tracking-wide">{product.sku || "Tanpa SKU"}</div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-bold text-zinc-900">Rp {product.price.toLocaleString('id-ID')}</div>
                      </div>

                      {/* Kontrol Kuantitas Inline */}
                      {product.stock > 0 ? (
                        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-lg p-1 mt-2">
                            <button 
                                onClick={() => reduceFromCart(product.id)}
                                disabled={qtyInCart === 0}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold text-zinc-800 tabular-nums min-w-[2ch] text-center">
                                {qtyInCart}
                            </span>
                            <button 
                                onClick={() => addToCart(product)}
                                disabled={qtyInCart >= product.stock}
                                className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                      ) : (
                        <div className="bg-zinc-100 text-zinc-500 text-xs font-bold text-center py-2.5 rounded-lg mt-2 uppercase tracking-wider">
                            Habis
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* KANAN: Keranjang Belanja (30%) */}
        <div className="w-1/3 bg-white shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.1)] flex flex-col z-10 border-l border-zinc-200">
          <div className="p-6 border-b border-zinc-100 bg-white sticky top-0 z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Keranjang
              </h2>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">{cart.length} Item Terpilih</p>
            </div>
            {cart.length > 0 && (
                <button 
                    onClick={() => setCart([])}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                    title="Kosongkan Keranjang"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3 hide-scrollbar bg-zinc-50/50">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-zinc-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-zinc-600">Keranjang Kosong</p>
                    <p className="text-xs mt-1 text-zinc-400">Pilih produk di katalog untuk memulai</p>
                  </div>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex flex-col bg-white p-3 rounded-xl border border-zinc-200 shadow-sm gap-3 animate-in slide-in-from-right-4 duration-300">
                   <div className="flex gap-3 items-center">
                       {/* Mini Image */}
                        <div className="w-14 h-14 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                            {item.image_url ? (
                                <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <ImageOff className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-zinc-800 text-sm truncate">{item.name}</div>
                            <div className="text-xs font-semibold text-zinc-500 mt-0.5">Rp {item.price.toLocaleString('id-ID')}</div>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="font-bold text-zinc-900 text-sm">
                                Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                            </div>
                        </div>
                   </div>

                   {/* Cart Row Controls */}
                   <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-1">
                        <button 
                            onClick={() => {
                                setCart(prev => prev.filter(c => c.product_id !== item.product_id))
                            }}
                            className="text-xs font-semibold text-red-500 flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-md transition-colors"
                        >
                            Hapus
                        </button>
                        
                        <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-lg">
                            <button 
                                onClick={() => reduceFromCart(item.product_id)}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold text-zinc-800 tabular-nums w-4 text-center">
                                {item.quantity}
                            </span>
                            <button 
                                onClick={() => {
                                    const product = products.find(p => p.id === item.product_id);
                                    if (product && product.stock > item.quantity) {
                                        addToCart(product);
                                    } else {
                                        toast.warning("Batas stok maksimum");
                                    }
                                }}
                                className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                   </div>
                </div>
              ))
            )}
          </div>

          {/* Metode Pembayaran & Tombol Bayar */}
          <div className="p-6 bg-white border-t border-zinc-200 space-y-4">
            {/* Payment Method Selector */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Metode Pembayaran</p>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                      paymentMethod === method.value
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-emerald-300'
                    }`}
                  >
                    {method.icon}
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-zinc-500 font-semibold text-sm uppercase tracking-wider">Total</span>
              <span className="text-3xl font-black text-zinc-900 tracking-tight">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isCheckingOut}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:from-zinc-200 disabled:to-zinc-200 disabled:text-zinc-400 disabled:shadow-none transition-all active:scale-[0.98] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/25"
            >
              {isCheckingOut ? 'Memproses Transaksi...' : 'BAYAR SEKARANG'}
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL SCANNER KAMERA --- */}
      {isScannerOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900">Scan Barcode</h2>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">Lengkapi izin kamera jika diminta.</p>
                      </div>
                      <button 
                          onClick={() => setIsScannerOpen(false)}
                          className="text-zinc-400 hover:text-zinc-800 bg-zinc-50 hover:bg-zinc-100 rounded-full p-2.5 transition-colors absolute top-6 right-6"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50"></div>
                  
                  <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex gap-3 text-sm text-zinc-600">
                     <ScanBarcode className="w-5 h-5 text-zinc-400 shrink-0" />
                     <p>Arahkan kamera tepat ke tengah barcode atau QR Code pada produk (SKU).</p>
                  </div>
              </div>
          </div>
      )}

      {/* Styles for scrollbar hidden but scrollable */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}