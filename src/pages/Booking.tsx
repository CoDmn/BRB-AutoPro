import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Car, User, Phone, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { submitBooking } from "../lib/firebaseUtils";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedBookings, setAcceptedBookings] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "bookings"), where("status", "==", "accepted"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAcceptedBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    carModel: "",
    date: "",
    time: "10:00",
    service: "nettoyage-interieur",
    message: ""
  });

  const services = [
    { id: "nettoyage-interieur", name: "Nettoyage Intérieur Premium" },
    { id: "polissage", name: "Polissage & Lustrage" },
    { id: "ceramique", name: "Protection Céramique" },
    { id: "autre", name: "Autre / Devis Personnalisé" }
  ];

  const isSlotTaken = () => {
    if (!formData.date || !formData.time) return false;
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    return acceptedBookings.some(booking => {
      const bookingDate = new Date(booking.date);
      // For now, simple check: same day and same hour +/- 2 hours for buffer
      const diffHours = Math.abs(selectedDateTime.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
      return diffHours < 3; // Block 3 hours window
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSlotTaken()) {
      setError("Désolé, ce créneau est déjà réservé par un autre client. Veuillez choisir une autre heure ou une autre date.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      await submitBooking({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        carModel: formData.carModel,
        date: dateTime.toISOString(),
        service: formData.service,
        message: formData.message,
        status: 'pending'
      });

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la réservation. Veuillez réessayer ou nous contacter par téléphone.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-anthracite min-h-screen py-24 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-darker p-12 rounded-lg border border-primary/20 shadow-2xl animate-fade-in">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-sans font-black uppercase text-white mb-4">Demande Envoyée !</h1>
            <p className="text-white/70 mb-8 leading-relaxed text-lg">
              Votre demande de rendez-vous a bien été reçue. Nous vous contacterons par email ou téléphone sous 24h pour confirmer la date et l'heure.
            </p>
            <button 
              onClick={() => navigate("/")} 
              className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded font-bold uppercase text-xs transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-anthracite min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-sans font-black uppercase text-white mb-4">
              Prendre <span className="text-primary">Rendez-vous</span>
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Sélectionnez une date et remplissez vos informations pour réserver votre prestation detailing. Un membre de l'équipe BRB Auto Pro confirmera votre rendez-vous.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Info Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-darker p-8 rounded border border-white/5 h-full">
                <h3 className="text-xl font-heading font-bold text-white uppercase mb-6 border-l-4 border-primary pl-4">Informations</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase mb-1">Disponibilités</h4>
                      <p className="text-xs text-white/50 leading-relaxed font-sans">
                        Lundi au Samedi : 8h - 20h<br />
                        Dimanche : Sur RDV uniquement
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase mb-1">Durée des Prestations</h4>
                      <p className="text-xs text-white/50 leading-relaxed font-sans">
                        Nettoyage : 1/2 journée<br />
                        Céramique : 2 à 3 jours d'immobilisation
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-anthracite rounded border border-white/5 mt-8">
                    <p className="text-[11px] text-white/40 italic">
                      "Nous prenons soin de chaque détail. Pour les traitements céramiques, un acompte peut être demandé après confirmation par nos services."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-darker p-8 md:p-10 rounded border border-white/10 shadow-xl animate-fade-in">
                {error && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-500 text-sm rounded">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <User className="w-3 h-3" /> Prénom
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="Jean"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <User className="w-3 h-3" /> Nom
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="Dupont"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="jean.dupont@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Téléphone
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Car className="w-3 h-3" /> Modèle du véhicule
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.carModel}
                      onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="ex: Porsche 911"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Prestation souhaitée</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Date souhaitée</label>
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Créneau horaire</label>
                    <input
                      required
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className={`w-full bg-anthracite border rounded px-4 py-3 text-white focus:outline-none transition-colors text-sm ${isSlotTaken() ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary'}`}
                    />
                    {isSlotTaken() && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter mt-1 animate-pulse">
                        <AlertCircle className="w-3 h-3 inline mr-1" /> Créneau indisponible
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Message ou précisions (optionnel)</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-anthracite border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm"
                    placeholder="Précisez ici vos attentes ou l'état du véhicule..."
                  />
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white py-4 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    "Confirmer ma demande de rendez-vous"
                  )}
                </button>
                <p className="text-[10px] text-white/30 text-center mt-4 uppercase tracking-tighter">
                  En envoyant ce formulaire, vous acceptez d'être recontacté pour valider votre créneau de rendez-vous.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

