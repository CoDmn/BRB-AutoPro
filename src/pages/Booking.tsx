import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Car, User, Phone, Mail, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { submitBooking } from "../lib/firebaseUtils";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { format, isSameDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Custom styles for react-calendar to match our theme
const calendarStyles = `
  .react-calendar {
    width: 100%;
    background: #1A1A1A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: inherit;
    border-radius: 8px;
    padding: 1rem;
    color: white;
  }
  .react-calendar__navigation button {
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.8rem;
  }
  .react-calendar__month-view__weekdays {
    text-transform: uppercase;
    font-size: 0.6rem;
    font-weight: bold;
    color: #D11242;
  }
  .react-calendar__tile {
    color: white;
    padding: 1rem 0.5rem;
    font-size: 0.9rem;
    border-radius: 4px;
  }
  .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
    background-color: rgba(209, 18, 66, 0.15);
    color: white;
  }
  .react-calendar__tile--now {
    background: transparent;
    border: 1px solid #D11242;
  }
  .react-calendar__tile--active {
    background: #D11242 !important;
    color: white;
  }
  .react-calendar__tile--disabled {
    background-color: transparent !important;
    color: rgba(255, 255, 255, 0.1) !important;
  }
  .react-calendar__month-view__days__tile--neighboringMonth {
    color: rgba(255, 255, 255, 0.2) !important;
  }
`;

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedAppointments, setAcceptedAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    // We listen to appointments that are not refused to block available slots
    const q = query(collection(db, "appointments"), where("status", "in", ["accepted", "pending"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAcceptedAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    carModel: "",
    service: "nettoyage-interieur",
    message: ""
  });

  const services = [
    { id: "nettoyage-interieur", name: "Nettoyage Intérieur Premium" },
    { id: "polissage", name: "Polissage & Lustrage" },
    { id: "ceramique", name: "Protection Céramique" },
    { id: "autre", name: "Autre / Devis Personnalisé" }
  ];

  const timeSlots = ["08:00", "10:00", "14:00", "16:00"];

  const isSlotTaken = (time: string) => {
    const checkDateString = format(selectedDate, "yyyy-MM-dd");
    return acceptedAppointments.some(appointment => {
      const appDate = new Date(appointment.date);
      const appDateString = format(appDate, "yyyy-MM-dd");
      const appTimeString = format(appDate, "HH:mm");
      return appDateString === checkDateString && appTimeString === time;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Veuillez sélectionner un créneau horaire.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const dateTime = new Date(`${dateStr}T${selectedSlot}`);
      
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
      setError("Une erreur est survenue lors de la réservation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-anthracite min-h-screen py-24 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-darker p-12 rounded-lg border border-primary/20 shadow-2xl animate-fade-in text-white">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-sans font-black uppercase mb-4">Demande Envoyée !</h1>
            <p className="text-white/70 mb-8 leading-relaxed text-lg">
              Votre demande de rendez-vous a bien été reçue. Nous vous contacterons rapidement pour confirmer le créneau.
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
      <style>{calendarStyles}</style>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-sans font-black uppercase text-white mb-4">
              Prendre <span className="text-primary">Rendez-vous</span>
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Choisissez votre date et votre créneau pour votre prestation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Step 1: Date & Time */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-darker p-6 rounded border border-white/5 shadow-xl">
                <div className="flex items-center gap-3 mb-6 text-white border-b border-white/5 pb-4">
                  <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-xs font-black">01</span>
                  <h3 className="text-sm font-black uppercase tracking-widest">Choisir Date & Heure</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Calendar 
                      onChange={(val) => {
                        setSelectedDate(val as Date);
                        setSelectedSlot(null);
                      }} 
                      value={selectedDate}
                      minDate={new Date()}
                      locale="fr-FR"
                      className="rounded-lg overflow-hidden border-0"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-white/50 mb-4 tracking-widest flex items-center gap-2">
                       <Clock className="w-4 h-4 text-primary" /> Créneaux disponibles
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot) => {
                        const taken = isSlotTaken(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={taken}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded border text-sm font-bold transition-all duration-300 ${
                              selectedSlot === slot 
                                ? "bg-primary border-primary text-white scale-105 shadow-lg" 
                                : taken
                                  ? "bg-transparent border-white/5 text-white/10 cursor-not-allowed"
                                  : "bg-anthracite border-white/10 text-white hover:border-primary hover:text-primary"
                            }`}
                          >
                            {slot}
                            {taken && <span className="block text-[8px] opacity-50">Complet</span>}
                          </button>
                        );
                      })}
                    </div>
                    {selectedSlot && (
                      <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded">
                        <p className="text-xs text-white uppercase font-bold text-center">
                          Sélectionné : <span className="text-primary">{format(selectedDate, "dd MMMM yyyy", { locale: fr })} à {selectedSlot}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Information */}
              <div className={`bg-darker p-8 rounded border border-white/10 shadow-xl transition-all duration-500 ${!selectedSlot ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-8 text-white border-b border-white/5 pb-4">
                  <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-xs font-black">02</span>
                  <h3 className="text-sm font-black uppercase tracking-widest">Vos Informations</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Prénom</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nom</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Téléphone</label>
                    <input
                      required
                      type="tel"
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Véhicule</label>
                    <input
                      required
                      type="text"
                      placeholder="ex: Porsche 911"
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.carModel}
                      onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Prestation</label>
                    <select
                      className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2 mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Détails supplémentaires</label>
                  <textarea
                    rows={4}
                    className="w-full bg-anthracite border border-white/10 rounded px-4 py-4 text-white focus:outline-none focus:border-primary text-sm resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar: Summary & CTA */}
            <div className="lg:col-span-4">
              <div className="bg-darker p-8 rounded border border-white/10 shadow-2xl sticky top-24">
                <h3 className="text-lg font-black uppercase text-white mb-8">Récapitulatif</h3>
                
                <div className="space-y-6 mb-8 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase font-bold text-[10px]">Date</span>
                    <span className="text-white font-bold">{format(selectedDate, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase font-bold text-[10px]">Heure</span>
                    <span className="text-primary font-bold">{selectedSlot || "--:--"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40 uppercase font-bold text-[10px]">Service</span>
                    <span className="text-white font-bold truncate ml-4">
                      {services.find(s => s.id === formData.service)?.name}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedSlot}
                  className="w-full bg-primary hover:bg-primary-hover disabled:bg-white/5 disabled:text-white/20 text-white py-5 rounded font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
                >
                  {loading ? "Confirmation..." : "Confirmer la Réservation"}
                </button>
                
                <p className="text-[9px] text-white/30 text-center mt-6 uppercase leading-relaxed font-bold tracking-widest">
                  Confirmation envoyée sous 24h<br/>Aucun paiement requis maintenant
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

