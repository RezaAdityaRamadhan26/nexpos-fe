'use client'

import React, { useState, useEffect } from "react";
import api from "@/utils/api";

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({name: '', sku: '', price: 0, stock: 0})
    const [editingId, setEditingId] = useState<Number | null>(null);

    const fetchProducts = async() => {
        try {
            setIsLoading(true)
            const res = await api.get('/products/');
            setProducts(res.data.data);
        } catch (error) {
            console.error('gagal mengambil data produk', error)
        } finally {
            setIsLoading(false)
        }
    };

        useEffect(() => {
    fetchProducts();
  }, []);

    const openCreateModal = () => {
      setEditingId(null);
      setFormData({name: '', sku: '', price: 0, stock: 0});
      setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingId(product.id);
        setFormData({ name: product.name, sku: product.sku, price: product.price, stock: product.stock});
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if(!window.confirm('apakah yakin menghapus produk ini? Data tidak bisa dikembalikan')) return;

        try {
            await api.delete(`/products/${id}`)
            alert('produk berhasil dihapus!')
            fetchProducts();    
        } catch (error: any) {
            alert('gagal menghapus produk!' + (error.response?.data?.error || 'Erro'))
        }
    }
 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
            };

            if (editingId) {
                await api.put(`/products/${editingId}`, payload)
                alert('produk berhasil diperbarui!')
            } else {
                await api.post(`/products`, payload)
                alert('produk berhasil ditambahkan!')

            }

            setIsModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            alert('gagal menyimpan produk' + (error.response?.data?.error || 'Error'));
        }  
    };

    return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Gudang (Produk)</h1>
          <button 
            onClick={openCreateModal} // Panggil openCreateModal
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Tambah Produk Baru
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Nama Produk</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Stok</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center">Memuat data...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">Belum ada produk di gudang.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{p.id}</td>
                    <td className="p-4 font-semibold text-gray-800">{p.name}</td>
                    <td className="p-4 text-gray-500">{p.sku}</td>
                    <td className="p-4 text-green-600 font-medium">Rp {p.price.toLocaleString('id-ID')}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4 text-center space-x-2">
                      {/* Tombol Aksi yang sudah HIDUP */}
                      <button 
                        onClick={() => openEditModal(p)}
                        className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded hover:bg-yellow-500 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm font-medium transition"
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

        {/* Modal Pop-up (Bisa untuk Tambah atau Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              {/* Judul Modal berubah dinamis */}
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {editingId ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU (Kode Barang)</label>
                  <input type="text" required value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                    <input type="number" min="0" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stok Barang</label>
                    <input type="number" min="0" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full border p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                    {editingId ? "Update Data" : "Simpan Produk"}
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
