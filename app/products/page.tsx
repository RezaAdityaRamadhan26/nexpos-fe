"use client";

import { useState, useEffect } from "react";
import api from "@/utils/api";
import Navbar from "../components/Navbar";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

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
        alert('Akses Ditolak: anda tidak memiliki akses ke fitur ini  ')
        router.push('/dashboard')
        return;
      }
      fetchProducts();
    } catch (error) {
      console.error('Form Tidak Valid', error)
      router.push('/login')
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data.data || []); 
    } catch (error) {
      console.error("Gagal mengambil data produk", error);
      alert("Gagal mengambil data produk. Pastikan Anda sudah login.");
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
      } else {
        await api.post("/products/", payload);
      }
      
      closeModal();
      fetchProducts(); 
    } catch (error) {
      console.error("Gagal menyimpan produk", error);
      alert("Gagal menyimpan produk. Pastikan Anda memiliki izin.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Gagal menghapus produk", error);
      alert("Gagal menghapus produk. Akses ditolak.");
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
      
    } catch (error) {
      console.error('Upload Gagal', error)
      alert('Gagal Mengupload Gambar')
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Tambah Produk
        </button>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold text-center">Gambar</th>
              <th className="p-4 font-semibold">Nama Produk</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Harga</th>
              <th className="p-4 font-semibold">Stok</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">Loading data...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">Belum ada produk.</td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-500">{p.id}</td>
                  {/* Kolom Tampilan Gambar Mini */}
                  <td className="p-4 flex justify-center">
                      {p.image_url ? (
                          <img src={`http://localhost:8080${p.image_url}`} alt={p.name} className="w-12 h-12 object-cover rounded-md border" />
                      ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md border flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                      )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.sku || "-"}</td>
                  <td className="p-4 text-gray-600">{p.category}</td>
                  <td className="p-4 text-gray-800">Rp {p.price.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-gray-800">{p.stock}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                        <button 
                        onClick={() => openModal(p)}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                        >
                        Edit
                        </button>
                        <button 
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                        Hapus
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingId ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* --- AREA UPLOAD GAMBAR BARU --- */}
              <div className="mb-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                <div className="flex items-center gap-4">
                  {/* Preview Gambar */}
                  {formData.image_url ? (
                     <img src={`http://localhost:8080${formData.image_url}`} alt="Preview" className="w-16 h-16 object-cover rounded-lg border shadow-sm" />
                  ) : (
                     <div className="w-16 h-16 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">Kosong</div>
                  )}
                  
                  {/* Input File */}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={isUploading}
                      className="text-sm text-gray-500 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" 
                    />
                    {isUploading && <p className="text-xs text-blue-600 mt-2 font-medium animate-pulse">Sedang mengupload gambar...</p>}
                  </div>
                </div>
              </div>
              {/* -------------------------------- */}

              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input required type="number" min="0" value={formData.price === 0 ? "" : formData.price} onChange={(e) => setFormData({...formData, price: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input required type="number" min="0" value={formData.stock === 0 ? "" : formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value === "" ? 0 : Number(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Masukkan deskripsi produk... (opsional)" />
              </div>

              <div className="mt-4 flex gap-3 justify-end pt-4 border-t">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors shadow-md">
                  Simpan Produk
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