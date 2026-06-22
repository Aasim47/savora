"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, X, UploadCloud, Pencil, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "", description: "", imageUrl: "", phone: "", address: "", openingTime: "", closingTime: "",
    fssaiLicenseNumber: "", gstNumber: "", legalBusinessName: "", registeredAddress: ""
  });
  const [complianceOpen, setComplianceOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSavingRestaurant, setIsSavingRestaurant] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setNewRestaurant({ ...newRestaurant, imageUrl: previewUrl });
  };

  const fetchRestaurants = async () => {
    try {
      const res = await api.get("/restaurants");
      const restaurantList = Array.isArray(res.data) ? res.data : res.data.data;
      setRestaurants(restaurantList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRestaurant(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("name", newRestaurant.name);
      formData.append("description", newRestaurant.description);
      formData.append("phone", newRestaurant.phone);
      formData.append("address", newRestaurant.address);
      formData.append("openingTime", newRestaurant.openingTime);
      formData.append("closingTime", newRestaurant.closingTime);
      formData.append("fssaiLicenseNumber", newRestaurant.fssaiLicenseNumber);
      formData.append("gstNumber", newRestaurant.gstNumber);
      formData.append("legalBusinessName", newRestaurant.legalBusinessName);
      formData.append("registeredAddress", newRestaurant.registeredAddress);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingId) {
        await api.put(`/restaurants/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await api.post("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setImageFile(null);
      setNewRestaurant({ name: "", description: "", imageUrl: "", phone: "", address: "", openingTime: "", closingTime: "", fssaiLicenseNumber: "", gstNumber: "", legalBusinessName: "", registeredAddress: "" });
      fetchRestaurants();
    } catch (error: any) {
      console.error("Failed to save restaurant", error);
      const msg = error.response?.data?.message || "Failed to save restaurant. Please check your connection.";
      setErrorMessage(msg);
    } finally {
      setIsSavingRestaurant(false);
    }
  };

  const handleEditClick = (restaurant: any) => {
    setEditingId(restaurant.id);
    setImageFile(null);
    const hasCompliance = restaurant.fssaiLicenseNumber || restaurant.gstNumber || restaurant.legalBusinessName || restaurant.registeredAddress;
    setComplianceOpen(!!hasCompliance);
    setNewRestaurant({
      name: restaurant.name || "",
      description: restaurant.description || "",
      imageUrl: restaurant.imageUrl || "",
      phone: restaurant.phone || "",
      address: restaurant.address || "",
      openingTime: restaurant.openingTime || "",
      closingTime: restaurant.closingTime || "",
      fssaiLicenseNumber: restaurant.fssaiLicenseNumber || "",
      gstNumber: restaurant.gstNumber || "",
      legalBusinessName: restaurant.legalBusinessName || "",
      registeredAddress: restaurant.registeredAddress || ""
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setImageFile(null);
    setComplianceOpen(false);
    setNewRestaurant({ name: "", description: "", imageUrl: "", phone: "", address: "", openingTime: "", closingTime: "", fssaiLicenseNumber: "", gstNumber: "", legalBusinessName: "", registeredAddress: "" });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8 text-secondary flex items-center justify-center min-h-[50vh]">Loading restaurants...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-4xl text-primary mb-2">Restaurants</h1>
          <p className="text-secondary">Manage platform restaurants and availability.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          style={{ color: "var(--base)" }}
        >
          <Plus className="w-4 h-4" />
          New Restaurant
        </button>
      </div>

      <div className="bg-surface rounded-[14px] border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-base/50">
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Restaurant</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Contact</th>
                <th className="py-4 px-6 text-[10px] font-semibold text-secondary uppercase tracking-widest font-sans">Status</th>
                <th className="py-4 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length === 0 ? (
                <tr><td colSpan={3} className="py-8 text-center text-secondary">No restaurants found</td></tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr 
                    key={restaurant.id} 
                    className="border-b border-divider/60 hover:bg-base/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/restaurants/${restaurant.id}`)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-base overflow-hidden border border-divider">
                           {restaurant.imageUrl && <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="text-sm text-primary font-medium hover:underline">{restaurant.name}</div>
                          <div className="text-xs text-secondary line-clamp-1">{restaurant.address || "No address"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-secondary">{restaurant.phone || "No phone"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full ${restaurant.isActive ? 'bg-[#D1FAE5]/50 text-[#065F46]' : 'bg-surface border border-divider text-secondary'}`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(restaurant); }}
                        className="p-1.5 text-secondary hover:text-accent transition-colors cursor-pointer rounded-md hover:bg-accent/10"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[14px] shadow-xl w-full max-w-md border border-divider overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-divider flex-shrink-0">
              <h2 className="font-serif text-xl text-primary">{editingId ? "Edit Restaurant" : "New Restaurant"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary hover:text-primary cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            <div className="overflow-y-auto p-4">
              <form id="restaurantForm" onSubmit={handleSaveRestaurant} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Name</label>
                <input required type="text" value={newRestaurant.name} onChange={e => setNewRestaurant({...newRestaurant, name: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Description</label>
                <textarea value={newRestaurant.description} onChange={e => setNewRestaurant({...newRestaurant, description: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" rows={2} />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Image</label>
                <div className="flex items-center gap-4">
                  {newRestaurant.imageUrl ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-divider group flex-shrink-0">
                      <img src={newRestaurant.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewRestaurant({...newRestaurant, imageUrl: ""})} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
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
                  {newRestaurant.imageUrl && (
                    <label className="flex-1 border-2 border-dashed border-divider rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-secondary mb-1"/>
                      <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">Replace</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Phone</label>
                  <input type="text" value={newRestaurant.phone} onChange={e => setNewRestaurant({...newRestaurant, phone: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Address</label>
                  <input type="text" value={newRestaurant.address} onChange={e => setNewRestaurant({...newRestaurant, address: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Opening Time</label>
                  <input type="text" value={newRestaurant.openingTime} onChange={e => setNewRestaurant({...newRestaurant, openingTime: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. 09:00 AM" />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Closing Time</label>
                  <input type="text" value={newRestaurant.closingTime} onChange={e => setNewRestaurant({...newRestaurant, closingTime: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. 10:00 PM" />
                </div>
              </div>

              {/* Compliance Section (collapsible) */}
              <div className="border-t border-divider pt-4 mt-4">
                <button type="button" onClick={() => setComplianceOpen(!complianceOpen)} className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-widest text-secondary cursor-pointer hover:text-primary transition-colors">
                  <span>Compliance Information (Optional)</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${complianceOpen ? 'rotate-180' : ''}`} />
                </button>
                {complianceOpen && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">FSSAI License Number</label>
                      <input type="text" value={newRestaurant.fssaiLicenseNumber} onChange={e => setNewRestaurant({...newRestaurant, fssaiLicenseNumber: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. 12345678901234" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">GST Number</label>
                      <input type="text" value={newRestaurant.gstNumber} onChange={e => setNewRestaurant({...newRestaurant, gstNumber: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="e.g. 29AXXPX1234X1ZX" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Legal Business Name</label>
                      <input type="text" value={newRestaurant.legalBusinessName} onChange={e => setNewRestaurant({...newRestaurant, legalBusinessName: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" placeholder="If different from display name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-widest text-secondary mb-1">Registered Address</label>
                      <textarea value={newRestaurant.registeredAddress} onChange={e => setNewRestaurant({...newRestaurant, registeredAddress: e.target.value})} className="w-full bg-base border border-divider rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-accent" rows={2} placeholder="If different from delivery/operating address" />
                    </div>
                  </div>
                )}
              </div>
              </form>
            </div>
            <div className="p-4 border-t border-divider flex justify-end gap-3 bg-surface flex-shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-secondary hover:text-primary cursor-pointer transition-colors" disabled={isSavingRestaurant}>Cancel</button>
              <button type="submit" form="restaurantForm" disabled={isSavingRestaurant} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2" style={{ color: "var(--base)" }}>
                {isSavingRestaurant ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-base border-t-transparent animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  editingId ? "Save Changes" : "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
