import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Star, Shield, CarFront, Sparkles } from "lucide-react";
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export default function Home() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [galleryFavorites, setGalleryFavorites] = useState<any[]>([]);

  useEffect(() => {
    const qInv = query(
      collection(db, 'inventory'), 
      where('isFavorite', '==', true),
      limit(3)
    );
    const unInv = onSnapshot(qInv, (snap) => {
      setFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qGal = query(
      collection(db, 'detailingGalleries'),
      where('isFavorite', '==', true),
      limit(2)
    );
    const unGal = onSnapshot(qGal, (snap) => {
      setGalleryFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unInv();
      unGal();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden bg-anthracite">
        <div className="absolute right-0 top-0 w-2/3 h-full bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-darker from-40% to-transparent z-[1]" />
        
        <div className="container mx-auto px-4 relative z-10 w-full animate-fade-in flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-block text-primary font-bold uppercase tracking-[3px] text-sm mb-4">
              Passion & Excellence
            </span>
            <h1 className="text-[40px] md:text-[52px] font-sans font-black text-white uppercase mb-6 leading-[1.1]">
              L'EXPERTISE AUTOMOBILE SUR-MESURE DU GARD
            </h1>
            <p className="text-[18px] text-white/70 max-w-[400px] mb-10 font-sans">
              Accompagnement premium pour l'achat, l'importation et l'entretien de vos véhicules de prestige.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/buy-sell" className="bg-primary hover:bg-primary-hover text-white px-9 py-[18px] rounded font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2">
                Trouver mon véhicule
              </Link>
              <Link to="/detailing" className="bg-transparent border-2 border-white hover:bg-white hover:text-darker text-white px-6 py-3 rounded font-bold uppercase text-xs transition-colors flex items-center justify-center gap-2">
                Le Studio Detailing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance Banner */}
      <section className="bg-primary/95 flex items-center min-h-[100px]">
        <div className="container mx-auto px-4 h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 w-full py-6 md:py-0">
            <div className="text-center py-4 md:py-0 md:border-r border-white/20 flex flex-col justify-center">
              <span className="text-[24px] md:text-[28px] font-sans font-black text-white block uppercase">100% des clients</span>
              <span className="text-[11px] text-white/90 uppercase font-semibold text-center w-full">Satisfaits</span>
            </div>
            <a 
              href="https://maps.app.goo.gl/ZiKWnASSyADMPSHj8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-center py-4 md:py-0 md:border-r border-white/20 flex flex-col justify-center hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <span className="text-[32px] font-sans font-black text-white block group-hover:scale-105 transition-transform">5/5</span>
              <span className="text-[11px] text-white/90 uppercase font-semibold underline underline-offset-4 decoration-white/30 decoration-1">Avis Google Clients</span>
            </a>
            <div className="text-center py-4 md:py-0 flex flex-col justify-center">
              <span className="text-[32px] font-sans font-black text-white block">15 ans</span>
              <span className="text-[11px] text-white/90 uppercase font-semibold">D'Expertise Automobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Services */}
      <section className="py-20 bg-darker">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: "Import", icon: <Shield className="w-8 h-8 text-white" />, desc: "Recherche sur-mesure et sécurisation de l'import depuis l'Europe.", path: "/import" },
              { title: "Achat / Vente", icon: <CarFront className="w-8 h-8 text-white" />, desc: "Véhicules sélectionnés avec soin, révisés et garantis.", path: "/buy-sell" },
              { title: "Dépôt-Vente", icon: <CheckCircle2 className="w-8 h-8 text-white" />, desc: "Vendez votre véhicule au meilleur prix sans vous en occuper.", path: "/buy-sell" },
              { title: "Detailing", icon: <Sparkles className="w-8 h-8 text-white" />, desc: "Rénovation et protection céramique pour sublimer votre carrosserie.", path: "/detailing" },
            ].map((service, idx) => (
              <Link to={service.path} key={idx} className="group block">
                <div className="bg-anthracite border border-white/5 p-6 min-h-[220px] h-full flex flex-col justify-between transition-all duration-300 hover:border-primary hover:-translate-y-1">
                  <div>
                    <div className="text-primary mb-4">
                      {service.icon}
                    </div>
                    <h3 className="font-sans font-bold text-base uppercase mb-2 text-white">{service.title}</h3>
                    <p className="text-[12px] text-white/50 leading-[1.4]">{service.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-24 bg-anthracite border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-sans font-black uppercase text-white mb-4">
                Derniers <span className="text-primary">Arrivages</span>
              </h2>
            </div>
            <Link to="/buy-sell" className="mt-6 md:mt-0 text-white/70 hover:text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-colors">
              Voir tout le stock <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {favorites.length > 0 ? (
              favorites.map((car) => (
                <div key={car.id} className="bg-darker group overflow-hidden border border-white/10 shadow-sm hover:border-primary transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={car.images && car.images[0] ? car.images[0] : (car.img || 'https://images.unsplash.com/photo-1503376713251-4045fbc555fa?q=80&w=800&auto=format&fit=crop')} 
                      alt={`${car.brand} ${car.model}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 text-xs font-bold uppercase">
                      {car.price}€
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading font-bold text-lg uppercase mb-4 text-white line-clamp-1">{car.brand} {car.model}</h3>
                    <div className="flex flex-col gap-2 text-white/50 text-xs uppercase tracking-wider mb-6">
                      <p>Année: <strong className="text-white font-bold">{car.year}</strong></p>
                      <p>Kilométrage: <strong className="text-white font-bold">{car.km}</strong></p>
                    </div>
                    <Link to="/buy-sell" className="block w-full text-center border-2 border-primary text-white hover:bg-primary py-3 font-bold uppercase text-xs transition-colors">
                      Plus de détails
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded">
                <p className="text-white/30 uppercase tracking-[2px] text-xs font-bold font-sans">Sélectionnez vos favoris dans l'espace admin pour les afficher ici.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NOS TRANSFORMATIONS */}
      <section className="py-24 bg-darker border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-sans font-black uppercase text-white mb-4">
                Nos <span className="text-primary">Transformations</span>
              </h2>
            </div>
            <Link to="/detailing" className="mt-6 md:mt-0 text-white/70 hover:text-primary font-bold uppercase tracking-wider text-sm flex items-center gap-2 transition-colors">
              Voir toute la galerie <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {galleryFavorites.length > 0 ? (
              galleryFavorites.map((gal) => (
                <div key={gal.id} className="group overflow-hidden rounded-lg shadow-2xl bg-anthracite border border-white/5">
                  <div className="grid grid-cols-2 h-64 md:h-80 overflow-hidden">
                    <div className="relative group/before">
                      <img src={gal.beforeImg} className="w-full h-full object-cover grayscale group-hover/before:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 left-4 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 backdrop-blur-sm">Avant</div>
                    </div>
                    <div className="relative group/after">
                      <img src={gal.afterImg} className="w-full h-full object-cover group-hover/after:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute top-4 right-4 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">Après</div>
                    </div>
                  </div>
                  <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                       <Sparkles className="w-4 h-4 text-primary" />
                       <h3 className="font-heading font-bold text-white uppercase tracking-tight line-clamp-1">{gal.afterDesc}</h3>
                    </div>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">État initial: {gal.beforeDesc}</p>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded">
                  <p className="text-white/30 uppercase tracking-[2px] text-xs font-bold font-sans">Sélectionnez vos réalisations favorites dans l'espace admin pour les afficher ici.</p>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Social Proof & Lead Magnet */}
      <section className="py-24 bg-darker text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[radial-gradient(circle_at_100%_50%,_#fff_0%,_transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Reviews */}
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight mb-8">
                Ils nous font <span className="text-primary">confiance</span>
              </h2>
              <div className="space-y-6">
                {[
                  { name: "Julien M.", text: "Super accompagnement pour l'import de ma RS3. Rapide, transparent et pro. Je recommande les yeux fermés." },
                  { name: "Sophie L.", text: "Prestation de detailing exceptionnelle ! Mâcarrosserie est comme neuve après le traitement céramique." },
                ].map((review, idx) => (
                  <div key={idx} className="bg-anthracite p-6 border border-white/5 border-l-4 border-l-primary">
                    <div className="flex text-primary mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-white/80 italic mb-4">"{review.text}"</p>
                    <p className="font-bold text-white uppercase tracking-wider text-sm">- {review.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Magnet */}
            <div className="bg-anthracite border border-white/10 p-8 md:p-12 text-center rounded">
              <h3 className="text-2xl md:text-3xl font-heading font-black uppercase tracking-tight mb-4 text-white">
                Importer Sans Risque
              </h3>
              <p className="text-white/70 mb-8 font-light">
                Téléchargez notre guide gratuit : <strong className="font-bold text-white">"Les 6 points de contrôle essentiels avant d'importer une voiture d'Allemagne".</strong>
              </p>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Votre adresse email" 
                  className="px-4 py-3 bg-darker text-white w-full focus:outline-none focus:ring-1 focus:ring-primary border border-white/10"
                  required
                />
                <button 
                  type="submit" 
                  className="bg-primary text-white hover:bg-primary-hover px-6 py-3 font-bold uppercase tracking-wider transition-colors w-full rounded"
                >
                  Recevoir le Guide PDF
                </button>
              </form>
              <p className="text-xs text-white/50 mt-4">100% gratuit, désabonnement à tout moment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
