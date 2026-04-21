import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-darker text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              {!logoError ? (
                <img 
                  src="/logo.jpg" 
                  alt="BRB Auto Pro Logo" 
                  className="h-24 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-sans font-black text-2xl tracking-tighter uppercase">
                  BRB<span className="text-primary font-normal">AUTO</span> PRO
                </span>
              )}
            </Link>
            <p className="text-white/50 text-xs leading-[1.6] mb-6">
              Votre expert automobile de confiance dans le Gard. Spécialiste en import de véhicules premium, achat-vente multimarque et detailing sur-mesure.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/brbautopro?igsh=MXdmd3p3aDZrdXZheQ==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded bg-anthracite flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded bg-anthracite flex items-center justify-center hover:bg-primary transition-colors text-white">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-[1px]">Liens Rapides</h4>
            <ul className="space-y-3 text-xs">
              {[
                { name: "Accueil", path: "/" },
                { name: "Service Import", path: "/import" },
                { name: "Achat & Vente", path: "/buy-sell" },
                { name: "Detailing", path: "/detailing" },
                { name: "Contact & Localisation", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/50 hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-[1px]">Nous Contacter</h4>
            <ul className="space-y-4 text-xs text-white/50">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>6 Chemin des Moulins<br />30300 Beaucaire, France</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+33781787360" className="hover:text-white transition-colors">07 81 78 73 60</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:brbautopro@gmail.com" className="hover:text-white transition-colors">brbautopro@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-sans font-bold text-sm mb-6 uppercase tracking-[1px]">Horaires</h4>
            <ul className="space-y-3 text-xs text-white/50">
              <li className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Lun - Sam</span>
                <span>08:00 - 20:00</span>
              </li>
              <li className="flex justify-between items-center text-primary pt-1">
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Dimanche</span>
                <span className="font-bold">08:00 - 20:00 (RDV)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-white/30 uppercase tracking-wider">
          <p>
            &copy; {new Date().getFullYear()} BRB Auto Pro. Tous droits réservés.
          </p>
          <div className="flex gap-4 items-center">
            <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span className="text-white/10">|</span>
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
