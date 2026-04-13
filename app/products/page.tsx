"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Image as ImageIcon, Loader2, PackageSearch } from "lucide-react";

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

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    image_url: ''
  });

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
      return;
    }
    try {
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))

      if (decodedPayload.role !== 'owner' && decodedPayload.can_manage_products !== true) {
        toast.error('Akses Ditolak: Anda tidak memiliki akses ke fitur ini');
        router.push('/dashboard')
        return;
      }
      fetchProducts();
    } catch (error) {
      toast.error('Sesi tidak valid, silakan login kembali');
      router.push('/login')
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data.data || []); 
    } catch (error) {
      toast.error("Gagal mengambil data produk. Pastikan Anda sudah login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        name: (formData.name),
        sku: (formData.sku),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: (formData.category),
        description: (formData.description),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success("Produk berhasil diperbarui!");
      } else {
        await api.post("/products/", payload);
        toast.success("Produk berhasil ditambahkan!");
      }
      
      closeModal();
      fetchProducts(); 
    } catch (error) {
      toast.error("Gagal menyimpan produk. Periksa kembali data Anda.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Produk berhasil dihapus");
      fetchProducts();
    } catch (error) {
      toast.error("Gagal menghapus produk. Akses ditolak.");
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || "", 
        description: product.description || "",
        image_url: product.image_url || "" 
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", sku: "", price: 0, stock: 0, category: "", description: "", image_url: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    setIsUploading(true);

    try {
      const res = await api.post('/products/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setFormData(prev => ({ ...prev, image_url: res.data.data.image_url }));
      toast.success("Gambar berhasil diupload!");
    } catch (error) {
      toast.error("Gagal mengupload gambar.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />
      <div className="flex-1 px-4 sm:px-8 py-8 w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Manajemen Produk</h1>
            <p className="text-sm text-zinc-500 mt-1">Kelola katalog produk, harga, dan stok inventaris Anda.</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Produk
          </button>
        </div>

        {/* Tabel Produk */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-bold">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4 text-center">Gambar</th>
                  <th className="p-4">Nama Produk</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4 text-right">Harga</th>
                  <th className="p-4 text-center">Stok</th>
                  <th className="p-4 pr-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-medium text-sm">Memuat data produk...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                        <PackageSearch className="w-10 h-10 mb-2 opacity-50" />
                        <span className="font-semibold text-zinc-600">Belum ada produk</span>
                        <span className="text-sm">Klik "Tambah Produk" untuk mulai mengelola katalog.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors group">
                      <td className="p-4 pl-6 text-zinc-500 font-medium text-sm">{p.id}</td>
                      <td className="p-4 flex justify-center">
                          {p.image_url ? (
                              <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}${p.image_url}`} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shadow-sm" />
                          ) : (
                              <div className="w-12 h-12 bg-zinc-100 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400">
                                <ImageIcon className="w-5 h-5 opacity-50" />
                              </div>
                          )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-800 text-sm">{p.name}</div>
                      </td>
                      <td className="p-4 text-zinc-500 font-medium text-sm">{p.sku || "-"}</td>
                      <td className="p-4 text-zinc-500 text-sm">
                        <span className="bg-zinc-100 px-2.5 py-1 rounded-md font-semibold">{p.category}</span>
                      </td>
                      <td className="p-4 text-right font-bold text-zinc-800 text-sm">Rp {p.price.toLocaleString("id-ID")}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 text-xs font-bold rounded-md ${p.stock <= 5 ? (p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700') : 'bg-green-100 text-green-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openModal(p)}
                              className="p-2 bg-white text-zinc-600 border border-zinc-200 rounded-lg hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all shadow-sm"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-2 bg-white text-red-500 border border-zinc-200 rounded-lg hover:text-red-700 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold mb-6 text-zinc-900 tracking-tight">
                {editingId ? "Edit Info Produk" : "Buat Produk Baru"}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* --- AREA UPLOAD GAMBAR BARU --- */}
                <div className="p-4 border border-zinc-200 rounded-2xl bg-zinc-50">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">Foto Produk</label>
                  <div className="flex items-center gap-4">
                    {/* Preview Gambar */}
                    {formData.image_url ? (
                       <img src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'}${formData.image_url}`} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-zinc-200 shadow-sm" />
                    ) : (
                       <div className="w-16 h-16 bg-white border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400">
                          <ImageIcon className="w-6 h-6 opacity-30" />
                       </div>
                    )}
                    
                    {/* Input File */}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={isUploading}
                        className="text-xs text-zinc-500 w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-200 file:text-zinc-700 hover:file:bg-zinc-300 transition-colors cursor-pointer" 
                      />
                      {isUploading && <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Mengunggah...</p>}
                    </div>
                  </div>
                </div>
                {/* -------------------------------- */}

                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Nama Produk *</label>
                    <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">SKU *</label>
                    <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Harga (Rp) *</label>
                    <input required type="number" min="0" value={formData.price === 0 ? "" : formData.price} onChange={(e) => setFormData({...formData, price: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Stok *</label>
                    <input required type="number" min="0" value={formData.stock === 0 ? "" : formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Kategori *</label>
                  <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Deskripsi</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-400 font-medium resize-none" placeholder="Masukkan deskripsi produk..." />
                </div>

                <div className="mt-4 flex gap-3 justify-end pt-6 border-t border-zinc-100">
                  <button type="button" onClick={closeModal} className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-xl font-bold transition-colors">
                    Batal
                  </button>
                  <button type="submit" disabled={isUploading} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-zinc-300 disabled:to-zinc-300 disabled:text-zinc-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                    {editingId ? "Simpan Perubahan" : "Tambah Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}