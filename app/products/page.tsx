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
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
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
  }, []);

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
      alert("Gagal menyimpan produk. Pastikan Anda adalah Owner.");
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
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", sku: "", price: 0, stock: 0, category: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

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
              <th className="p-4 font-semibold">Nama Produk</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Kategori</th>
              <th className="p-4 font-semibold">Deskripsi</th>
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
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.sku || "-"}</td>
                  <td className="p-4 text-gray-600">{p.category}</td>
                  <td className="p-4 text-gray-600 max-w-[200px] truncate" title={p.description || ""}>{p.description || "-"}</td>
                  <td className="p-4 text-gray-800">Rp {p.price.toLocaleString("id-ID")}</td>
                  <td className="p-4 text-gray-800">{p.stock}</td>
                  <td className="p-4 flex justify-center gap-2">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form (Hanya Tampil Jika isModalOpen === true) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              {editingId ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
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