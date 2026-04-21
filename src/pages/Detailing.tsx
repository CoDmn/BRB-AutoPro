import { useState } from "react";
import { Sparkles, Droplets, Shield, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Detailing() {
  const [activeTab, setActiveTab] = useState("ceramic");

  return (
    <div className="bg-anthracite min-h-screen">
      {/* Hero Header */}
      <section className="bg-darker text-white py-24 relative overflow-hidden border-b border-white/10" style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2000&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}>
        <div className="absolute inset-0 bg-darker/80" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-sans font-black uppercase text-white mb-4">
            Le Studio <span className="text-primary">Detailing</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-light mb-8">
            Polissage, lustrage et protection céramique. L'art de sublimer chaque courbe de votre carrosserie.
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold uppercase text-xs transition-colors inline-block">
            Réserver une prestation
          </button>
        </div>
      </section>

      {/* Prestations */}
      <section className="py-24 bg-anthracite">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12">
             {/* Tabs sidebar */}
            <div className="w-full md:w-1/3">
              <h2 className="text-2xl font-sans font-black uppercase text-white mb-8 border-l-4 border-primary pl-4">Nos Forfaits</h2>
              <div className="flex flex-col gap-2">
                {[
                  { id: "interior", name: "Nettoyage Intérieur Premium", icon: <Droplets className="w-5 h-5"/> },
                  { id: "polish", name: "Polissage & Lustrage", icon: <Sparkles className="w-5 h-5"/> },
                  { id: "ceramic", name: "Protection Céramique", icon: <Shield className="w-5 h-5"/> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full p-4 text-left font-bold uppercase tracking-wider text-xs transition-colors border border-white/5 ${
                      activeTab === tab.id 
                        ? "bg-darker border-l-4 border-l-primary text-white" 
                        : "bg-anthracite text-white/50 hover:bg-darker hover:text-white"
                    }`}
                  >
                    {tab.icon} {tab.name} <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === tab.id ? "opacity-100 text-primary" : "opacity-0"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="w-full md:w-2/3 bg-darker p-8 border border-white/5 min-h-[400px]">
              {activeTab === "ceramic" && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-sans font-black uppercase text-white mb-2">Protection Céramique 9H</h3>
                      <p className="text-primary font-bold">À partir de 690 €</p>
                    </div>
                    <span className="bg-primary/20 border border-primary/50 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded">Garanti 3 ans</span>
                  </div>
                  <p className="text-white/70 mb-8 leading-[1.6] text-sm">
                    Le traitement ultime pour votre carrosserie. Une couche de verre liquide qui fusionne avec le vernis pour offrir une dureté exceptionnelle (9H), une brillance extrême et un effet hydrophobe spectaculaire. Facilite grandement les lavages futurs.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Lavage complet méthode 2 seaux",
                      "Décontamination ferreuse et goudron",
                      "Polissage One-Step pour supprimer 70% des défauts",
                      "Dégraissage minutieux",
                      "Application traitement céramique Gtechniq / Krytex (1 couche)",
                      "Dressing complet des pneus et plastiques"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-white/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 font-bold uppercase text-xs transition-colors w-full sm:w-auto rounded">
                    Demander un devis
                  </button>
                </div>
              )}

              {activeTab === "polish" && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-sans font-black uppercase text-white mb-2">Polissage Correction (Stage 2)</h3>
                      <p className="text-primary font-bold">À partir de 450 €</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-8 leading-[1.6] text-sm">
                    Opération visant à retirer les micro-rayures, cheveux d'ange et hologrammes causés par de mauvais lavages (rouleaux). Votre peinture retrouve sa profondeur et son éclat d'origine.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Préparation esthétique complète (lavage + décontamination)",
                      "Masquage des plastiques et joints",
                      "Passage d'un compound (abrasif) pour les gros défauts",
                      "Passage d'un polish de finition pour la brillance",
                      "Application d'une cire synthétique (sealant) longue durée 6 mois"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-white/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 font-bold uppercase text-xs transition-colors w-full sm:w-auto rounded">
                    Demander un devis
                  </button>
                </div>
              )}

              {activeTab === "interior" && (
                <div className="animate-fade-in">
                  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-2xl font-sans font-black uppercase text-white mb-2">Nettoyage Intérieur Premium</h3>
                      <p className="text-primary font-bold">À partir de 120 €</p>
                    </div>
                  </div>
                  <p className="text-white/70 mb-8 leading-[1.6] text-sm">
                    Un habitacle sain et purifié. Nous allons dans les moindres recoins avec pinceaux, vapeur, et injecteur-extracteur pour retrouver la sensation du neuf.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Aspiration en profondeur (moquettes, sièges, coffre)",
                      "Shampouinage des tissus ou soin des cuirs (nettoyant + lotion hydratante)",
                      "Dépoussiérage et dressing des plastiques finition mate anti-UV",
                      "Nettoyage des vitres",
                      "Purification du circuit de climatisation"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-white/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 font-bold uppercase text-xs transition-colors w-full sm:w-auto rounded">
                    Réserver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galerie Avant / Après (Placeholder interactif) */}
      <section className="py-24 bg-darker text-white border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-sans font-black uppercase text-white mb-4">
            Galerie <span className="text-primary">Avant / Après</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-16"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-anthracite border border-white/5 p-2 rounded">
              <img src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop" className="w-full h-64 object-cover mb-2 opacity-50 grayscale" alt="Avant" referrerPolicy="no-referrer" loading="lazy" />
              <p className="uppercase tracking-wider font-bold text-xs text-white/50 pt-2 pb-1">Avant : Micro-rayures (Hologrammes)</p>
            </div>
            <div className="bg-anthracite border border-white/5 p-2 rounded">
              <img src="https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800&auto=format&fit=crop" className="w-full h-64 object-cover mb-2" alt="Après" referrerPolicy="no-referrer" loading="lazy" />
              <p className="uppercase tracking-wider font-bold text-xs text-primary pt-2 pb-1">Après : Polissage + Céramique</p>
            </div>
          </div>
          <p className="mt-8 text-white/50 font-light text-[11px] uppercase tracking-wider">* Les images sont données à titre d'illustration.</p>
        </div>
      </section>
    </div>
  );
}
