import React, { useState } from "react";
import { Filter, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { submitEstimationRequest } from "../lib/firebaseUtils";

const INVENTORY = [
  { id: 1, name: "Porsche 911 (992) Carrera S", price: "135 000 â‚¬", year: "2020", km: "35 000 km", fuel: "Essence", gearbox: "Auto", img: "https://images.unsplash.com/photo-1503376713251-4045fbc555fa?q=80&w=800&auto=format&fit=crop" },
  { id: 2, name: "BMW M4 Competition (G82)", price: "85 000 â‚¬", year: "2021", km: "22 000 km", fuel: "Essence", gearbox: "Auto", img: "https://images.unsplash.com/photo-1617814076367-b7713d230e15?q=80&w=800&auto=format&fit=crop" },
  { id: 3, name: "Audi RS6 Avant (C8)", price: "128 000 â‚¬", year: "2022", km: "15 000 km", fuel: "Essence", gearbox: "Auto", img: "https://images.unsplash.com/photo-1603525281486-3ddebbc65476?q=80&w=800&auto=format&fit=crop" },
  { id: 4, name: "Mercedes-Benz Classe G 63 AMG", price: "185 000 â‚¬", year: "2021", km: "40 000 km", fuel: "Essence", gearbox: "Auto", img: "https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=800&auto=format&fit=crop" },
];

export default function BuySell() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [sellForm, setSellForm] = useState({ brand: "", model: "", year: "", km: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                  <select className="w-full p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary">
                    <option>Toutes les marques</option>
                    <option>Porsche</option>
                    <option>BMW</option>
                    <option>Audi</option>
                    <option>Mercedes-Benz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Budget Min / Max</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                    <input type="number" placeholder="Max" className="w-1/2 p-3 bg-anthracite border border-white/10 text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>
                <button className="w-full bg-primary text-white py-3 font-bold uppercase tracking-[1px] text-xs hover:bg-primary-hover transition-colors flex justify-center items-center gap-2 rounded">
                  <Search className="w-4 h-4" /> Rechercher
                </button>
              </div>
            </div>

            {/* Inventory Grid */}
            <div className="w-full lg:w-3/4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {INVENTORY.map((car) => (
                    <div key={car.id} className="bg-darker group overflow-hidden border border-white/10 shadow-sm hover:border-primary transition-all duration-300 rounded">
                      <div className="relative h-60 overflow-hidden bg-anthracite">
                        <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase shadow-lg">
                          {car.price}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-sans font-bold text-base uppercase mb-4 h-12 overflow-hidden text-white">{car.name}</h3>
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-white/50 uppercase tracking-[1px] mb-6">
                          <p>Année: <span className="font-bold text-white">{car.year}</span></p>
                          <p>KM: <span className="font-bold text-white">{car.km}</span></p>
                          <p>Carbu: <span className="font-bold text-white">{car.fuel}</span></p>
                          <p>Boîte: <span className="font-bold text-white">{car.gearbox}</span></p>
                        </div>
                        <Link to="/contact" className="block w-full text-center border-2 border-primary text-white hover:bg-primary py-3 font-bold uppercase text-xs transition-colors rounded">
                          Voir Détails
                        </Link>
                      </div>
                    </div>
                  ))}
               </div>
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
