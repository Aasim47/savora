"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ArrowLeft, Plus, X, Trash2, Pencil, CopyPlus, UploadCloud } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/utils/currency";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuName, setEditingMenuName] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState({
    categoryId: "", name: "", description: "", imageUrl: "", 
    portions: [{ id: "", portionSize: "", price: "" }]
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [updatingMenuGroups, setUpdatingMenuGroups] = useState<Set<string>>(new Set());

  const resetMenuState = () => {
    setEditingMenuName(null);
    setNewMenu({ categoryId: "", name: "", description: "", imageUrl: "", portions: [{ id: "", portionSize: "", price: "" }] });
    setImageFile(null);
    setIsMenuModalOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setNewMenu({ ...newMenu, imageUrl: previewUrl });
  };

  const fetchRestaurant = async () => {
    try {
      const res = await api.get(`/restaurants/${id}`);
      const restaurantData = res.data.data || res.data;
      setRestaurant(restaurantData);
    } catch (error) {
      console.error(error);
      alert("Failed to load restaurant details");
      router.push("/admin/restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.put(`/restaurants/${id}`, { isActive: !restaurant.isActive });
      fetchRestaurant();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      alert(`Failed to toggle status: ${msg}\n\n(If you see a Network Error, please restart your backend terminal!)`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete this restaurant? This cannot be undone.")) return;
    try {
      await api.delete(`/restaurants/${id}`);
      router.push("/admin/restaurants");
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.message) {
        alert(`Failed to delete restaurant: ${error.response.data.message}`);
      } else {
        alert("Failed to delete restaurant");
      }
    }
  };

  const [orders, setOrders] = useState<any[]>([]);
  const [salesDuration, setSalesDuration] = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      // Filter orders belonging to this restaurant only
      setOrders(res.data.filter((o: any) => o.restaurantId === id));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRestaurant();
    fetchOrders();
  }, [id]);

  const calculateSales = () => {
    const now = new Date();
    const filteredOrders = orders.filter(o => {
      if (o.status === "CANCELLED") return false;
      const orderDate = new Date(o.createdAt);
      if (salesDuration === "TODAY") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (salesDuration === "WEEK") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      }
      if (salesDuration === "MONTH") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= monthAgo;
      }
      return true; // ALL
    });

    const totalSales = filteredOrders.reduce((sum, o) => {
      const delivery = o.deliveryFee || 0;
      return sum + (o.totalAmount - delivery);
    }, 0);

    return { amount: totalSales, count: filteredOrders.length };
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/categories", { restaurantId: id, name: newCategoryName });
      setIsCatModalOpen(false);
      setNewCategoryName("");
      fetchRestaurant();
    } catch (error) {
      console.error(error);
      alert("Failed to create category");
    }
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMenu(true);
    try {
      if (editingMenuName) {
        const originalItems = restaurant.menuItems.filter((i: any) => i.name === editingMenuName);
        
        for (const p of newMenu.portions) {
          const formData = new FormData();
          formData.append("restaurantId", id as string);
          formData.append("categoryId", newMenu.categoryId);
          formData.append("name", newMenu.name);
          formData.append("description", newMenu.description);
          formData.append("price", p.price);
          if (p.portionSize) formData.append("portionSize", p.portionSize);
          if (imageFile) formData.append("image", imageFile);

          if (p.id) {
            await api.put(`/menu/${p.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
          } else {
            await api.post("/menu", formData, { headers: { "Content-Type": "multipart/form-data" } });
          }
        }
        
        const currentIds = newMenu.portions.map(p => p.id).filter(Boolean);
        const toDelete = originalItems.filter((oi: any) => !currentIds.includes(oi.id));
        for (const oi of toDelete) {
          try { await api.delete(`/menu/${oi.id}`); } 
          catch(e: any) { alert(`Warning: Could not delete old variant '${oi.portionSize}': ${e.response?.data?.message}`); }
        }
      } else {
        for (const p of newMenu.portions) {
          const formData = new FormData();
          formData.append("restaurantId", id as string);
          formData.append("categoryId", newMenu.categoryId);
          formData.append("name", newMenu.name);
          formData.append("description", newMenu.description);
          formData.append("price", p.price);
          if (p.portionSize) formData.append("portionSize", p.portionSize);
          if (imageFile) formData.append("image", imageFile);

          await api.post("/menu", formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
      }

      resetMenuState();
      fetchRestaurant();
    } catch (error) {
      console.error(error);
      alert("Failed to save menu items");
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("Are you sure you want to delete this category? All its menu items will be deleted.")) return;
    try {
      await api.delete(`/categories/${catId}`);
      fetchRestaurant();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleDeleteMenuItemGroup = async (groupName: string) => {
    if (!confirm(`Are you sure you want to delete all variants of ${groupName}?`)) return;
    try {
      const items = restaurant.menuItems.filter((i: any) => i.name === groupName);
      for (const item of items) {
        await api.delete(`/menu/${item.id}`);
      }
      fetchRestaurant();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete menu item completely.");
    }
  };

  const handleToggleAvailable = async (group: any[]) => {
    const groupName = group[0].name;
    const newState = !group[0].available;
    const groupIds = group.map(i => i.id);

    // Show loading buffer
    setUpdatingMenuGroups(prev => new Set(prev).add(groupName));

    try {
      // Fire all API requests in parallel
      await Promise.all(group.map(item => api.put(`/menu/${item.id}`, { available: newState })));
      
      // Update local state after API returns successfully
      setRestaurant((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          menuItems: prev.menuItems.map((item: any) => 
            groupIds.includes(item.id) ? { ...item, available: newState } : item
          )
        };
      });
    } catch (error) {
      console.error(error);
      alert("Failed to update availability. Changes reverted.");
      fetchRestaurant(); // Revert to actual state on failure
    } finally {
      setUpdatingMenuGroups(prev => {
        const next = new Set(prev);
        next.delete(groupName);
        return next;
      });
    }
  };

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading restaurant...</div>;
  if (!restaurant) return null;

  const salesStats = calculateSales();

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/restaurants" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Restaurants
      </Link>

      <div className="bg-surface rounded-[14px] border border-divider p-8 mb-10 flex gap-6 items-center">
        {restaurant.imageUrl && (
          <img src={restaurant.imageUrl} alt={restaurant.name} className="w-24 h-24 rounded-lg object-cover border border-divider flex-shrink-0" />
        )}
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-primary mb-1">{restaurant.name}</h1>
          <p className="text-secondary text-sm mb-2">{restaurant.description || "No description provided."}</p>
          <div className="flex items-center gap-4 text-xs text-secondary">
            <span>{restaurant.address}</span>
            <span>•</span>
            <span>{restaurant.phone}</span>
            <span>•</span>
            <span className={restaurant.isActive ? "text-[#065F46] font-medium" : "text-secondary"}>{restaurant.isActive ? "Online" : "Offline"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${restaurant.isActive ? 'bg-base border border-divider text-secondary hover:text-primary' : 'bg-primary text-white hover:bg-primary/90'}`}
            style={!restaurant.isActive ? { color: "var(--base)" } : {}}
          >
            {restaurant.isActive ? "Set Offline" : "Set Online"}
          </button>
          <button 
            onClick={handleDelete}
            className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-error/20"
          >
            Delete Restaurant
          </button>
        </div>
      </div>

      {/* Sales Dashboard */}
      <div className="bg-surface rounded-[14px] border border-divider p-6 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-primary">Sales Dashboard</h2>
            <p className="text-xs text-secondary">Track performance and revenue for this restaurant.</p>
          </div>
          <select 
            value={salesDuration}
            onChange={(e: any) => setSalesDuration(e.target.value)}
            className="bg-base border border-divider rounded-lg px-3 py-1.5 text-sm text-primary outline-none focus:border-accent cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base border border-divider/50 rounded-xl p-5">
            <h3 className="text-xs font-medium uppercase tracking-widest text-secondary mb-2">Total Revenue</h3>
            <p className="text-3xl font-serif text-primary">{formatCurrency(salesStats.amount)}</p>
          </div>
          <div className="bg-base border border-divider/50 rounded-xl p-5">
            <h3 className="text-xs font-medium uppercase tracking-widest text-secondary mb-2">Total Orders</h3>
            <p className="text-3xl font-serif text-primary">{salesStats.count}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Sidebar */}
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Categories</h2>
            <button onClick={() => setIsCatModalOpen(true)} className="text-xs font-medium text-accent hover:underline cursor-pointer flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="bg-surface rounded-[14px] border border-divider p-2">
            {restaurant.categories?.length === 0 ? (
              <div className="p-4 text-center text-xs text-secondary">No categories yet.</div>
            ) : (
              restaurant.categories?.map((cat: any) => (
                <div key={cat.id} className="flex justify-between items-center p-3 text-sm text-primary font-medium border-b border-divider/50 last:border-0 hover:bg-base/50 rounded-lg cursor-pointer transition-colors group">
                  <span>{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menu Items Main */}
        <div className="col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Menu Items</h2>
            <button 
              onClick={() => {
                if (!restaurant.categories || restaurant.categories.length === 0) {
                  alert("Please create a category first!");
                  return;
                }
                setEditingMenuName(null);
                setNewMenu({...newMenu, categoryId: restaurant.categories[0].id, portions: [{ id: "", portionSize: "", price: "" }]});
                setIsMenuModalOpen(true);
              }} 
              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-1"
              style={{ color: "var(--base)" }}
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>
          
          <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-divider bg-base/50">
                  <th className="py-3 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Item</th>
                  <th className="py-3 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Category</th>
                  <th className="py-3 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
                  <th className="py-3 px-4 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {restaurant.menuItems?.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-sm text-secondary">No menu items found.</td></tr>
                ) : (
                  (() => {
                    const grouped = new Map<string, any[]>();
                    restaurant.menuItems?.forEach((item: any) => {
                      const key = item.name.trim().toLowerCase();
                      if (!grouped.has(key)) grouped.set(key, []);
                      grouped.get(key)!.push(item);
                    });

                    return Array.from(grouped.values()).map((group: any[]) => {
                      const baseItem = group[0];
                      const isGroup = group.length > 1;
                      const catName = restaurant.categories?.find((c: any) => c.id === baseItem.categoryId)?.name || "Unknown";
                      
                      return (
                        <tr key={baseItem.name} className="border-b border-divider/60 hover:bg-base/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-base rounded-md overflow-hidden flex-shrink-0 border border-divider">
                                {baseItem.imageUrl && <img src={baseItem.imageUrl} alt={baseItem.name} className="w-full h-full object-cover" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-primary">
                                  {baseItem.name} 
                                  {isGroup ? (
                                    <span className="inline-block text-[10px] bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded-full ml-2 translate-y-[-1px]">{group.length} Options</span>
                                  ) : (
                                    baseItem.portionSize && <span className="inline-block text-[10px] bg-divider/30 text-secondary px-1.5 py-0.5 rounded-full ml-2 translate-y-[-1px]">{baseItem.portionSize}</span>
                                  )}
                                </div>
                                <div className="text-xs text-secondary line-clamp-1">{baseItem.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-secondary">{catName}</td>
                          <td className="py-3 px-4">
                            <button 
                              onClick={() => handleToggleAvailable(group)}
                              disabled={updatingMenuGroups.has(baseItem.name)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider transition-colors border ${
                                updatingMenuGroups.has(baseItem.name) 
                                  ? 'bg-base text-secondary cursor-wait opacity-70 border-divider' 
                                  : baseItem.available 
                                    ? 'bg-[#D1FAE5]/50 text-[#065F46] border-transparent hover:bg-error/10 hover:text-error cursor-pointer' 
                                    : 'bg-surface text-secondary border-divider hover:bg-[#D1FAE5]/50 hover:text-[#065F46] cursor-pointer'
                              }`}
                            >
                              {updatingMenuGroups.has(baseItem.name) ? 'Updating...' : baseItem.available ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-end items-center gap-4">
                              <span className="text-sm font-medium text-primary">
                                {isGroup ? "Multiple Options" : formatCurrency(baseItem.price)}
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingMenuName(baseItem.name);
                                    setNewMenu({
                                      categoryId: baseItem.categoryId,
                                      name: baseItem.name,
                                      description: baseItem.description || "",
                                      imageUrl: baseItem.imageUrl || "",
                                      portions: group.map(i => ({ id: i.id, portionSize: i.portionSize || "", price: i.price.toString() }))
                                    });
                                    setIsMenuModalOpen(true);
                                  }} 
                                  className="text-secondary hover:text-accent transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteMenuItemGroup(baseItem.name)} className="text-secondary hover:text-error transition-colors cursor-pointer">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-sm border border-divider overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <h2 className="font-serif text-lg text-primary">New Category</h2>
              <button onClick={() => setIsCatModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreateCategory} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Category Name</label>
                <input required type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. Starters, Mains, Drinks" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="px-4 py-2 text-sm text-secondary hover:text-primary cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors" style={{ color: "var(--base)" }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-md border border-divider overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-divider">
              <h2 className="font-serif text-lg text-primary">{editingMenuName ? "Edit Menu Item" : "New Menu Item"}</h2>
              <button onClick={resetMenuState} className="text-secondary hover:text-primary cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveMenuItem} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Category</label>
                <select value={newMenu.categoryId} onChange={e => setNewMenu({...newMenu, categoryId: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent">
                  {restaurant.categories?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Name</label>
                <input required type="text" value={newMenu.name} onChange={e => setNewMenu({...newMenu, name: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Description</label>
                <textarea value={newMenu.description} onChange={e => setNewMenu({...newMenu, description: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" rows={2} />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {newMenu.imageUrl ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-divider group flex-shrink-0">
                      <img src={newMenu.imageUrl} alt="Menu Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewMenu({...newMenu, imageUrl: ""})} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ) : (
                    <label className="flex-1 border-2 border-dashed border-divider rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                      <UploadCloud className="w-5 h-5 text-secondary mb-1"/>
                      <span className="text-xs text-secondary font-medium">Click to upload image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                  {newMenu.imageUrl && (
                    <label className="flex-1 border-2 border-dashed border-divider rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-secondary mb-1"/>
                      <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">Replace</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="border-t border-divider pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary">Portions & Pricing</label>
                  <button type="button" onClick={() => setNewMenu({...newMenu, portions: [...newMenu.portions, { id: "", portionSize: "", price: "" }]})} className="text-xs text-accent hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3 h-3"/> Add Portion
                  </button>
                </div>
                {newMenu.portions.map((p, idx) => (
                  <div key={idx} className="flex gap-3 mb-3 items-center">
                    <div className="flex-1">
                      <input type="text" value={p.portionSize} onChange={e => {
                        const newP = [...newMenu.portions]; newP[idx].portionSize = e.target.value; setNewMenu({...newMenu, portions: newP});
                      }} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. Small, Half..." />
                    </div>
                    <div className="w-24">
                      <input required type="number" step="0.01" value={p.price} onChange={e => {
                        const newP = [...newMenu.portions]; newP[idx].price = e.target.value; setNewMenu({...newMenu, portions: newP});
                      }} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="Price" />
                    </div>
                    {newMenu.portions.length > 1 && (
                      <button type="button" onClick={() => {
                        const newP = newMenu.portions.filter((_, i) => i !== idx);
                        setNewMenu({...newMenu, portions: newP});
                      }} className="text-secondary hover:text-error">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={resetMenuState} className="px-4 py-2 text-sm text-secondary hover:text-primary cursor-pointer transition-colors" disabled={isSavingMenu}>Cancel</button>
                <button type="submit" disabled={isSavingMenu} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2" style={{ color: "var(--base)" }}>
                  {isSavingMenu ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-base border-t-transparent animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    editingMenuName ? "Save Changes" : "Add Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
