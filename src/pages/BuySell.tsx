import React, { useState, useEffect, useMemo } from "react";
import { Filter, Search, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { submitEstimationRequest } from "../lib/firebaseUtils";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function BuySell() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [sellForm, setSellForm] = useState({ brand: "", model: "", year: "", km: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);

  // Filter States
  const [filters, setFilters] = useState({
    brand: "Toutes les marques",
    budgetMin: "",
    budgetMax: "",
    yearMin: "",
    yearMax: "",
    kmMin: "",
    kmMax: "",
    gearboxAuto: true,
    gearboxManual: true,
    fuel: "Tous",
    doors: "",
    type: ""
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Compute unique brands from current inventory for the dropdown
  const uniqueBrands = useMemo(() => {
    const brands = inventory.map(car => car.brand).filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [inventory]);

  // Handle Input Changes for Filters
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Compute filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(car => {
      // Brand
      if (filters.brand !== "Toutes les marques" && car.brand !== filters.brand) return false;
      
      // Price (removing spaces and €)
      const price = parseInt(String(car.price || "0").replace(/\D/g, "")) || 0;
      if (filters.budgetMin && price < parseInt(filters.budgetMin)) return false;
      if (filters.budgetMax && price > parseInt(filters.budgetMax)) return false;

      // Year
      const year = parseInt(car.year) || 0;
      if (filters.yearMin && year < parseInt(filters.yearMin)) return false;
      if (filters.yearMax && year > parseInt(filters.yearMax)) return false;

      // KM
      const km = parseInt(String(car.km || "0").replace(/\D/g, "")) || 0;
      if (filters.kmMin && km < parseInt(filters.kmMin)) return false;
      if (filters.kmMax && km > parseInt(filters.kmMax)) return false;

      // Gearbox
      const isAuto = car.gearbox?.toLowerCase().includes("auto");
      const isManual = car.gearbox?.toLowerCase().includes("manuel");
      // If neither filter is checked, don't show the respective cars
      if (!filters.gearboxAuto && isAuto) return false;
      if (!filters.gearboxManual && isManual) return false;

      // Advanced Filters
      const carFuel = car.fuel?.toLowerCase() || "";
      if (filters.fuel !== "Tous") {
        if (!carFuel.includes(filters.fuel.toLowerCase())) return false;
      }
      
      const carType = car.type?.toLowerCase() || "";
      if (filters.type && !carType.includes(filters.type.toLowerCase())) return false;

      if (filters.doors && car.doors !== filters.doors) return false;

      return true;
    });
  }, [inventory, filters]);

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEstimationRequest(sellForm);
      alert("Estimation envoyée avec succès !");
      setSellForm({ brand: "", model: "", year: "", km: "", email: "" });
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-anthracite min-h-screen">
      <div className="bg-darker py-12 border-b border-white/10">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-sans font-black text-white uppercase mb-8">
              Achat & <span className="text-primary">Vente</span>
            </h1>
            
            <div className="inline-flex bg-anthracite rounded p-1 border border-white/5">
              <button 
                onClick={() => setActiveTab("buy")}
                className={`px-8 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${activeTab === "buy" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}
              >
                Stock Disponible
              </button>
              <button 
                onClick={() => setActiveTab("sell")}
                className={`px-8 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${activeTab === "sell" ? "bg-primary text-white" : "text-gray-300 hover:text-white"}`}
              >
                Vendre ou Faire estimer
              </button>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {activeTab === "buy" && (
          <div className="animate-fade-in flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4 bg-darker p-6 border border-white/5 lg:sticky lg:top-24 rounded">
              <div className="flex items-center gap-2 mb-6 text-white border-b border-white/10 pb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="font-sans font-bold uppercase tracking-[1px] text-sm">Filtres</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Marque</label>
                  <select 
                    className="w-full p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  >
                    <option>Toutes les marques</option>
                    {uniqueBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Budget Max</label>
                  <div className="flex gap-2 text-white items-center">
                    <input type="range" min="0" max="300000" step="5000" 
                      value={filters.budgetMax || "300000"} 
                      onChange={(e) => handleFilterChange('budgetMax', e.target.value)} 
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <span className="text-xs font-bold min-w-[60px] text-right">{filters.budgetMax ? `${filters.budgetMax}€` : 'Max'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Année Min / Max</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="De" value={filters.yearMin} onChange={(e) => handleFilterChange('yearMin', e.target.value)} className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                    <input type="number" placeholder="À" value={filters.yearMax} onChange={(e) => handleFilterChange('yearMax', e.target.value)} className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Kilométrage Min / Max</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="De" value={filters.kmMin} onChange={(e) => handleFilterChange('kmMin', e.target.value)} className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                    <input type="number" placeholder="À" value={filters.kmMax} onChange={(e) => handleFilterChange('kmMax', e.target.value)} className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Boîte de vitesse</label>
                  <div className="flex gap-4 text-white text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.gearboxAuto} onChange={(e) => handleFilterChange('gearboxAuto', e.target.checked)} className="accent-primary w-4 h-4" />
                      Auto
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={filters.gearboxManual} onChange={(e) => handleFilterChange('gearboxManual', e.target.checked)} className="accent-primary w-4 h-4" />
                      Manuelle
                    </label>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-[1px] text-white/70 hover:text-white transition-colors"
                  >
                    Filtres avancés
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[1px] text-white/50 mb-2">Carburant</label>
                        <select 
                          value={filters.fuel} onChange={(e) => handleFilterChange('fuel', e.target.value)}
                          className="w-full p-2 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                        >
                          <option>Tous</option>
                          <option>Essence</option>
                          <option>Diesel</option>
                          <option>Hybride</option>
                          <option>Électrique</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[1px] text-white/50 mb-2">Type (ex: SUV, Coupé)</label>
                        <input type="text" placeholder="Tous" value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="w-full p-2 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-[1px] text-white/50 mb-2">Nombre de portes</label>
                        <input type="number" placeholder="Peu importe" value={filters.doors} onChange={(e) => handleFilterChange('doors', e.target.value)} className="w-full p-2 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setFilters({
                    brand: "Toutes les marques", budgetMin: "", budgetMax: "", yearMin: "", yearMax: "", kmMin: "", kmMax: "", gearboxAuto: true, gearboxManual: true, fuel: "Tous", doors: "", type: ""
                  })} 
                  className="w-full bg-transparent border border-white/10 text-white/50 py-3 font-bold uppercase tracking-[1px] text-[10px] hover:bg-white/5 hover:text-white transition-colors flex justify-center items-center gap-2 rounded mt-4"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="w-full lg:w-3/4">
               {filteredInventory.length === 0 ? (
                 <div className="bg-darker p-8 border border-white/5 rounded text-center text-white/50">
                    Aucun véhicule disponible en stock pour le moment.
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredInventory.map((car) => (
                      <div key={car.id} className="bg-darker group overflow-hidden border border-white/10 shadow-sm hover:border-primary transition-all duration-300 rounded flex flex-col">
                        <div className="relative h-60 overflow-hidden bg-anthracite">
                          {car.images && car.images[0] ? (
                            <img src={car.images[0]} alt={car.name || `${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          ) : (
                            <img src={car.img} alt={car.name || `${car.brand} ${car.model}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          )}
                          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase shadow-lg">
                            {car.price}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-sans font-bold text-base uppercase mb-4 h-12 overflow-hidden text-white">{car.name || `${car.brand} ${car.model}`}</h3>
                          <div className="grid grid-cols-2 gap-y-2 text-xs text-white/50 uppercase tracking-[1px] mb-6 flex-1">
                            <p>Année: <span className="font-bold text-white">{car.year}</span></p>
                            <p>KM: <span className="font-bold text-white">{car.km}</span></p>
                            <p>Carbu: <span className="font-bold text-white">{car.fuel}</span></p>
                            <p>Boîte: <span className="font-bold text-white">{car.gearbox}</span></p>
                          </div>
                          <Link to={`/vehicle/${car.id}`} className="block w-full text-center border border-white/10 text-white hover:bg-white/5 py-3 font-bold uppercase text-xs transition-colors rounded mt-auto">
                            Plus de détails
                          </Link>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === "sell" && (
          <div className="animate-fade-in max-w-3xl mx-auto">
             <div className="bg-darker p-8 md:p-12 border border-white/10 rounded">
                <div className="text-center mb-10">
                  <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-sans font-black uppercase text-white mb-2">
                    Estimation en 24H
                  </h2>
                  <p className="text-white/50 text-sm">Reprise cash ou dépôt-vente. Nous valorisons votre passion auto.</p>
                </div>

                <form onSubmit={handleSellSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Marque</label>
                      <input 
                        type="text" 
                        required 
                        value={sellForm.brand} 
                        onChange={(e)=>setSellForm({...sellForm, brand: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:border-primary focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Modèle / Moteur</label>
                      <input 
                        type="text" 
                        required 
                        value={sellForm.model} 
                        onChange={(e)=>setSellForm({...sellForm, model: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:border-primary focus:outline-none transition-colors" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Année</label>
                      <input 
                        type="number" 
                        required 
                        value={sellForm.year} 
                        onChange={(e)=>setSellForm({...sellForm, year: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:border-primary focus:outline-none transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Kilométrage</label>
                      <input 
                        type="number" 
                        required 
                        value={sellForm.km} 
                        onChange={(e)=>setSellForm({...sellForm, km: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:border-primary focus:outline-none transition-colors" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Email de contact</label>
                    <input 
                      type="email" 
                      required 
                      value={sellForm.email} 
                      onChange={(e)=>setSellForm({...sellForm, email: e.target.value})}
                      className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white py-4 font-bold uppercase tracking-[1px] text-xs transition-colors rounded disabled:opacity-50">
                    {isSubmitting ? "Envoi en cours..." : "Faire estimer mon véhicule"}
                  </button>
                  <p className="text-center text-[11px] uppercase tracking-wider text-white/30 mt-4">Nous vous répondrons avec l'estimation la plus juste selon les prix du marché Nîmois/National.</p>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
