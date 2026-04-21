import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { 
  ChevronLeft, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  Euro, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Clock
} from "lucide-react";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchVehicle() {
      if (!id) return;
      try {
        const docRef = doc(db, "inventory", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate("/buy-sell");
        }
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicle();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="bg-anthracite min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vehicle) return null;

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.img];

  return (
    <div className="bg-anthracite min-h-screen">
      {/* breadcrumbs & actions */}
      <div className="bg-darker border-b border-white/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à l'inventaire
          </button>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-white/30 text-xs uppercase font-bold tracking-widest">Partager :</span>
            {/* simple share buttons could go here */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video bg-darker overflow-hidden rounded border border-white/5 shadow-2xl">
                <img 
                  src={images[activeImage]} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {images.map((img: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                        activeImage === idx ? "border-primary scale-95" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${vehicle.name} thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* General Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-darker p-6 rounded border border-white/5 flex flex-col items-center text-center">
                <Calendar className="w-6 h-6 text-primary mb-3" />
                <span className="text-[10px] uppercase font-bold text-white/30 mb-1">Année</span>
                <span className="text-white font-bold">{vehicle.year}</span>
              </div>
              <div className="bg-darker p-6 rounded border border-white/5 flex flex-col items-center text-center">
                <Gauge className="w-6 h-6 text-primary mb-3" />
                <span className="text-[10px] uppercase font-bold text-white/30 mb-1">Kilométrage</span>
                <span className="text-white font-bold">{vehicle.km}</span>
              </div>
              <div className="bg-darker p-6 rounded border border-white/5 flex flex-col items-center text-center">
                <Fuel className="w-6 h-6 text-primary mb-3" />
                <span className="text-[10px] uppercase font-bold text-white/30 mb-1">Carburant</span>
                <span className="text-white font-bold">{vehicle.fuel}</span>
              </div>
              <div className="bg-darker p-6 rounded border border-white/5 flex flex-col items-center text-center">
                <Settings className="w-6 h-6 text-primary mb-3" />
                <span className="text-[10px] uppercase font-bold text-white/30 mb-1">Boîte</span>
                <span className="text-white font-bold">{vehicle.gearbox}</span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-darker p-8 md:p-10 rounded border border-white/5">
              <h2 className="text-2xl font-sans font-black uppercase text-white mb-6 border-l-4 border-primary pl-4">
                Description du véhicule
              </h2>
              <div className="prose prose-invert max-w-none text-white/70 leading-relaxed whitespace-pre-line">
                {vehicle.details || "Aucun détail supplémentaire disponible pour ce véhicule."}
              </div>
            </div>

            {/* Reassurance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-darker/50 p-6 flex gap-4 items-start">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-xs uppercase mb-1">Véhicule Contrôlé</h4>
                  <p className="text-[11px] text-white/50">Chaque véhicule passe par une inspection rigoureuse avant la vente.</p>
                </div>
              </div>
              <div className="bg-darker/50 p-6 flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-xs uppercase mb-1">Garantie Disponbile</h4>
                  <p className="text-[11px] text-white/50">Possibilité d'extension de garantie européenne jusqu'à 24 mois.</p>
                </div>
              </div>
              <div className="bg-darker/50 p-6 flex gap-4 items-start">
                <Clock className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h4 className="text-white font-bold text-xs uppercase mb-1">Financement</h4>
                  <p className="text-[11px] text-white/50">Solutions de financement adaptées à votre profil et budget.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price & Contact Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-darker p-8 rounded border border-white/5 sticky top-24">
              <div className="mb-8">
                <h1 className="text-3xl font-sans font-black uppercase text-white mb-2 leading-tight">
                  {vehicle.brand} <span className="text-primary">{vehicle.model}</span>
                </h1>
                <p className="text-white/50 text-sm font-medium">{vehicle.name}</p>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-anthracite py-4 px-6 rounded border border-white/5">
                <Euro className="w-8 h-8 text-primary" />
                <div>
                  <span className="text-[10px] uppercase font-black text-white/30 block tracking-[2px]">Prix de vente</span>
                  <span className="text-3xl text-white font-black">{vehicle.price}</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-xs uppercase font-black text-white tracking-[2px] mb-4">Ce véhicule m'intéresse</h3>
                <div className="flex flex-col gap-3">
                  <a 
                    href="tel:+33781787360"
                    className="flex justify-center items-center gap-3 bg-primary hover:bg-primary-hover text-white py-4 rounded font-black uppercase tracking-[1px] text-xs transition-colors shadow-lg"
                  >
                    <Phone className="w-4 h-4" /> Appeler le conseiller
                  </a>
                  <Link 
                    to="/contact"
                    className="flex justify-center items-center gap-3 bg-transparent border-2 border-white/10 hover:border-white hover:bg-white/5 text-white py-4 rounded font-black uppercase tracking-[1px] text-xs transition-colors"
                  >
                    <Mail className="w-4 h-4" /> Envoyer un message
                  </Link>
                </div>
                <div className="pt-6 flex items-center gap-4 text-white/40 text-[10px] uppercase font-bold tracking-[1px] justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Disponible immédiatement
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
