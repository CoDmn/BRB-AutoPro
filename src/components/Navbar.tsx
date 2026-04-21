import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Car, Info, Phone, Activity } from "lucide-react";
import { cn } from "../lib/utils";

const navLinks = [
  { name: "Accueil", path: "/" },
  { name: "Import", path: "/import" },
  { name: "Achat/Vente", path: "/buy-sell" },
  { name: "Detailing", path: "/detailing" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-darker text-white border-b border-white/10">
      <div className="container mx-auto px-4 h-28 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "font-semibold text-xs uppercase tracking-[1px] transition-colors relative group text-white/70 hover:text-white",
                location.pathname === link.path && "text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-darker border-t border-white/10 shadow-lg">
          <nav className="flex flex-col py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-3 font-semibold text-xs uppercase tracking-[1px] transition-colors text-white/70 hover:text-white hover:bg-white/5",
                  location.pathname === link.path && "text-white bg-white/5"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-4 pt-4 pb-2 border-t border-white/10 mt-2">
              <Link
                to="/contact"
                className="flex justify-center border-2 border-white/20 hover:bg-white hover:text-darker text-white px-6 py-3 rounded text-xs font-bold uppercase transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Estimer ma voiture
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
