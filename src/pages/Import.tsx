import React, { useState } from "react";
import { CheckCircle2, Globe, FileText, Truck, ShieldCheck, Mail } from "lucide-react";
import { submitImportRequest } from "../lib/firebaseUtils";

export default function Import() {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    budget: "",
    options: "",
    email: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitImportRequest(formData);
      alert("Votre demande d'importation a été envoyée avec succès. Nous vous contacterons sous 48h.");
      setFormData({ brand: "", model: "", year: "", budget: "", options: "", email: "", phone: "" });
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'envoi de votre demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-anthracite min-h-screen">
      {/* Hero Header */}
      <section className="bg-darker text-white py-24 relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,_#D11242_0%,_transparent_40%)] opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-black uppercase tracking-tighter mb-4">
            Recherche & <span className="text-primary">Importation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
            Votre véhicule de rêve venu d'Europe (Allemagne, Italie, etc.), sécurisé, garanti et livré clés en main à Nîmes.
          </p>
        </div>
      </section>

      {/* Explication du processus */}
      <section className="py-24 bg-anthracite">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-sans font-black uppercase text-white mb-4">
              Notre processus 100% sécurisé
            </h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Globe className="w-8 h-8"/>, title: "1. Recherche Exigeante", desc: "Analyse du marché européen selon vos critères stricts." },
              { icon: <FileText className="w-8 h-8"/>, title: "2. Historique & Expertise", desc: "Vérification carnet d'entretien, kilométrage et sinistres (CarVertical, etc)." },
              { icon: <Truck className="w-8 h-8"/>, title: "3. Rapatriement", desc: "Transport par plateau professionnel assuré de porte à porte." },
              { icon: <ShieldCheck className="w-8 h-8"/>, title: "4. Livraison & Démarches", desc: "Contrôle technique, plaques WW, et carte grise définitive inclus." },
            ].map((step, idx) => (
              <div key={idx} className="bg-darker p-8 border border-white/5 relative group overflow-hidden transition hover:border-primary">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />
                <div className="text-primary mb-6 relative z-10">{step.icon}</div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-wider mb-3 text-white relative z-10">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Qualification Form */}
      <section className="py-24 bg-darker border-t border-white/10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-anthracite p-8 md:p-12 border border-white/10 rounded">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading font-black uppercase text-white mb-2">
                Qualifiez votre recherche
              </h2>
              <p className="text-white/50">Un expert BRB configurera une sélection de véhicules sur-mesure pour vous.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Marque ciblée</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Porsche" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Modèle</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 911 (991) Carrera 4S" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Année souhaitée</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 2018 - 2021" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Budget maximum (TTC)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 85 000 €" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Téléphone</label>
                  <input 
                    type="tel" 
                    placeholder="06 00 00 00 00" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Email de contact</label>
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Options indispensables (Couleur, Toit ouvrant, PSE...)</label>
                <textarea 
                  rows={4}
                  placeholder="Détaillez vos attentes..." 
                  className="w-full px-4 py-3 bg-darker text-white border border-white/10 focus:outline-none focus:border-primary transition-colors resize-none"
                  value={formData.options}
                  onChange={(e) => setFormData({...formData, options: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded transition-colors disabled:opacity-50">
                  <Mail className="w-5 h-5" /> {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
