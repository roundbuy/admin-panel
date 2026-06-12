import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon, Image, List } from 'lucide-react';
import api from '../../services/api';

const TrendingManagement = () => {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGallery, setCurrentGallery] = useState(null);
    const [formData, setFormData] = useState({
        name: '', slug: '', gallery_type: 'general', category_slug: '', description: '', hero_image_url: '', is_active: 1, sort_order: 0
    });

    const [itemsModalOpen, setItemsModalOpen] = useState(false);
    const [currentGalleryItems, setCurrentGalleryItems] = useState([]);
    const [newItemAdId, setNewItemAdId] = useState('');

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        try {
            const res = await api.get('/admin/trending/galleries');
            if (res.data.success) {
                setGalleries(res.data.data.galleries);
            }
        } catch (error) {
            console.error('Error fetching galleries', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (gallery = null) => {
        if (gallery) {
            setCurrentGallery(gallery);
            setFormData(gallery);
        } else {
            setCurrentGallery(null);
            setFormData({
                name: '', slug: '', gallery_type: 'general', category_slug: '', description: '', hero_image_url: '', is_active: 1, sort_order: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentGallery) {
                await api.put(`/admin/trending/galleries/${currentGallery.id}`, formData);
            } else {
                await api.post('/admin/trending/galleries', formData);
            }
            fetchGalleries();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving gallery', error);
            alert('Failed to save gallery');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this gallery? All items inside will be unlinked.')) {
            try {
                await api.delete(`/admin/trending/galleries/${id}`);
                fetchGalleries();
            } catch (error) {
                console.error('Error deleting gallery', error);
            }
        }
    };

    const handleOpenItemsModal = async (gallery) => {
        setCurrentGallery(gallery);
        await fetchGalleryItems(gallery.id);
        setItemsModalOpen(true);
    };

    const fetchGalleryItems = async (galleryId) => {
        try {
            const res = await api.get(`/admin/trending/galleries/${galleryId}/items`);
            if (res.data.success) {
                setCurrentGalleryItems(res.data.data.items);
            }
        } catch (error) {
            console.error('Error fetching items', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemAdId) return;
        try {
            await api.post(`/admin/trending/galleries/${currentGallery.id}/items`, {
                advertisement_id: newItemAdId,
                sort_order: currentGalleryItems.length
            });
            setNewItemAdId('');
            fetchGalleryItems(currentGallery.id);
        } catch (error) {
            console.error('Error adding item', error);
            alert(error.response?.data?.message || 'Failed to add item. Maybe invalid ID or already in gallery.');
        }
    };

    const handleRemoveItem = async (adId) => {
        if (window.confirm('Remove this item from the gallery?')) {
            try {
                await api.delete(`/admin/trending/galleries/${currentGallery.id}/items/${adId}`);
                fetchGalleryItems(currentGallery.id);
            } catch (error) {
                console.error('Error removing item', error);
            }
        }
    };

    if (loading) return <div className="p-6">Loading trending galleries...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Trending Galleries</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <Plus size={18} /> New Gallery
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image & Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {galleries.map(g => (
                            <tr key={g.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden">
                                            {g.hero_image_url ? (
                                                <img src={g.hero_image_url} alt={g.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Image className="w-full h-full p-2 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="font-medium text-gray-900">{g.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="capitalize text-blue-600 font-medium">{g.gallery_type}</span>
                                    <div className="text-xs text-gray-400">/{g.slug}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${g.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {g.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenItemsModal(g)} className="text-green-600 hover:text-green-900 mr-4" title="Manage Items">
                                        <List size={18} />
                                    </button>
                                    <button onClick={() => handleOpenModal(g)} className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {galleries.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No trending galleries found. Create one above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit/Create Gallery Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{currentGallery ? 'Edit Gallery' : 'New Gallery'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gallery Name</label>
                                <input required type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm border p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input required type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm border p-2" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select className="mt-1 block w-full rounded border-gray-300 shadow-sm border p-2" value={formData.gallery_type} onChange={e => setFormData({...formData, gallery_type: e.target.value})}>
                                        <option value="general">General</option>
                                        <option value="women">Women</option>
                                        <option value="men">Men</option>
                                        <option value="children">Children</option>
                                        <option value="category">Category-specific</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Image URL</label>
                                <input type="text" className="mt-1 block w-full rounded border-gray-300 shadow-sm border p-2" value={formData.hero_image_url} onChange={e => setFormData({...formData, hero_image_url: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select className="mt-1 block w-full rounded border-gray-300 shadow-sm border p-2" value={formData.is_active} onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}>
                                    <option value={1}>Active</option>
                                    <option value={0}>Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Items Modal */}
            {itemsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Manage Items: {currentGallery?.name}</h2>
                            <button onClick={() => setItemsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>

                        <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                            <input 
                                type="number" 
                                placeholder="Enter Advertisement ID to add..." 
                                className="flex-1 border border-gray-300 rounded p-2"
                                value={newItemAdId}
                                onChange={e => setNewItemAdId(e.target.value)}
                            />
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium">Add Item</button>
                        </form>

                        <div className="flex-1 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentGalleryItems.map(item => (
                                        <tr key={item.mapping_id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">#{item.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.currency_code} {item.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentGalleryItems.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No items in this gallery. Add some using the input above.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendingManagement;
