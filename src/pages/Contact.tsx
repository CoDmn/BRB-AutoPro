import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { submitContactRequest } from "../lib/firebaseUtils";

export default function Contact() {
  const [formData, setFormData] = useState({
    subject: "Demande d'information générale",
    name: "",
    phone: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactRequest(formData);
      alert('Message envoyé avec succès. Nous vous contacterons rapidement.');
      setFormData({
        subject: "Demande d'information générale",
        name: "",
        phone: "",
        email: "",
        message: ""
      });
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue lors de l\'envoi du message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-anthracite min-h-screen">
      {/* Intro section */}
      <section className="bg-darker py-20 text-center border-b border-white/10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-sans font-black text-white uppercase mb-4">
            Contact & <span className="text-primary">Accès</span>
          </h1>
          <p className="text-gray-300 font-light max-w-2xl mx-auto">
            Notre showroom et studio detailing vous accueillent à Nîmes. N'hésitez pas à nous contacter pour un projet automobile sur-mesure.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info & Map */}
            <div>
              <h2 className="text-2xl font-sans font-black uppercase text-white mb-8 border-l-4 border-l-primary pl-4 inline-block">Nos Coordonnées</h2>
              
              <ul className="space-y-8 mb-12">
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-darker flex items-center justify-center shrink-0 border border-white/5 rounded">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-[1px] text-xs text-white/50 mb-1 border-b border-white/5 pb-1">Adresse</h3>
                    <p className="text-white">BRB Auto Pro<br/>Zone d'Activité Kilomètre Delta<br/>30900 Nîmes, France</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-darker flex items-center justify-center shrink-0 border border-white/5 rounded">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-[1px] text-xs text-white/50 mb-1 border-b border-white/5 pb-1">Téléphone & WhatsApp</h3>
                    <a href="tel:+33466000000" className="text-white font-bold text-lg hover:text-primary transition-colors block mt-1">04 66 00 00 00</a>
                    <a href="#" className="text-green-500 text-[11px] uppercase tracking-wider font-bold flex items-center mt-1">Discuter sur WhatsApp</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-darker flex items-center justify-center shrink-0 border border-white/5 rounded">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-[1px] text-xs text-white/50 mb-1 border-b border-white/5 pb-1">Horaires</h3>
                    <p className="text-white/80 text-sm mt-2">Lundi - Vendredi : 09:00 - 18:30</p>
                    <p className="text-white/80 text-sm">Samedi : 09:00 - 12:00 (Sur Rendez-vous)</p>
                    <p className="text-primary font-bold text-sm">Dimanche : Fermé</p>
                  </div>
                </li>
              </ul>

              {/* Mapframe - Since we can't use real iframe maps without a key easily, we use a styled div resembling a map container */}
              <div className="h-64 bg-darker w-full relative group border border-white/5 rounded overflow-hidden">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-30 grayscale" alt="Map" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 flex items-center justify-center bg-anthracite/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href="https://maps.google.com/?q=Nîmes" target="_blank" rel="noreferrer" className="bg-primary text-white px-6 py-3 font-bold uppercase text-xs rounded transition-colors hover:bg-primary-hover">Ouvrir dans Google Maps</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-darker p-8 md:p-12 border border-white/5 h-fit rounded">
              <h2 className="text-2xl font-sans font-black uppercase text-white mb-2">Envoyez-nous un message</h2>
              <p className="text-white/50 text-sm mb-8 leading-[1.6]">Nous traitons vos demandes d'import, d'achat et de prestation detailing sous 24h ouvrées.</p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Sujet</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:outline-none focus:border-primary transition-colors"
                  >
                    <option>Demande d'information générale</option>
                    <option>Projet d'importation</option>
                    <option>Véhicule en vente</option>
                    <option>Prestation Detailing</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Nom / Prénom</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:outline-none focus:border-primary transition-colors" 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Téléphone</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:outline-none focus:border-primary transition-colors" 
                      />
                   </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Email</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[1px] text-white/50 mb-2">Votre Message</label>
                  <textarea 
                    rows={5} 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-anthracite text-white border border-white/10 focus:outline-none focus:border-primary resize-none transition-colors"
                  ></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white py-4 font-bold uppercase tracking-[1px] text-xs transition-colors flex justify-center items-center gap-2 rounded disabled:opacity-50">
                  <Mail className="w-5 h-5"/> {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
