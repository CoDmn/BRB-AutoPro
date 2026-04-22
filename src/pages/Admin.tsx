import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Star, Trash2, Pencil, ArrowLeft, Globe, X, Calendar, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  addInventoryItem, 
  deleteInventoryItem, 
  updateInventoryItem, 
  toggleInventoryFavorite, 
  addDetailingGallery, 
  updateDetailingGallery, 
  toggleDetailingFavorite,
  deleteDetailingGallery,
  updateBookingStatus
} from '../lib/firebaseUtils';
import { compressImage } from '../lib/imageUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'gallery' | 'appointments' | 'settings'>('requests');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(!!localStorage.getItem('google_access_token'));
  
  // Data states
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [importRequests, setImportRequests] = useState<any[]>([]);
  const [estimationRequests, setEstimationRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Form states
  const [newCar, setNewCar] = useState({ 
    brand: '', model: '', price: '', year: '', km: '', fuel: '', 
    gearbox: 'Auto', doors: '', seats: '', type: '', color: '', 
    critair: '', cv: '', ch: '', specificities: '', details: '', images: [] as string[]
  });
  const [newGallery, setNewGallery] = useState({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);

  const isAdminEmail = (email: string | null) => {
    return email === 'corentindamian@gmail.com' || email === 'brbautopro@gmail.com';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) return;

    const unsubs = [
      onSnapshot(query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc')), (snap) => setContactRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'importRequests'), orderBy('createdAt', 'desc')), (snap) => setImportRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'estimationRequests'), orderBy('createdAt', 'desc')), (snap) => setEstimationRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'inventory'), orderBy('createdAt', 'desc')), (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'detailingGalleries'), orderBy('createdAt', 'desc')), (snap) => setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), (snap) => setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    try {
      console.log("Admin: Requesting Google login...");
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('google_access_token', credential.accessToken);
        setGoogleConnected(true);
        alert("✅ Connexion Google réussie ! Les automatisations (Agenda et Emails) sont actives.");
      } else {
        alert("⚠️ Vous êtes connecté à Firebase, mais aucun jeton d'accès Google n'a été récupéré. Vérifiez que vous avez bien accepté les autorisations.");
      }
    } catch (error: any) {
      console.error(error);
      alert("❌ Erreur lors de la connexion : " + error.message + "\n\nOuvrez IMPÉRATIVEMENT le site dans un nouvel onglet.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('google_access_token');
    setGoogleConnected(false);
  };

  const sendEmailViaGmail = async (to: string, subject: string, body: string) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) return false;

    const emailContent = [
      'To: ' + to,
      'Subject: ' + subject,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const base64Content = btoa(unescape(encodeURIComponent(emailContent)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64Content }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gmail API Error:", errorData);
        if (response.status === 401) {
          localStorage.removeItem('google_access_token');
          setGoogleConnected(false);
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

  const createGoogleCalendarEvent = async (appointment: any) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) return null;

    const startTime = new Date(appointment.date);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    const event = {
      summary: `🚗 RDV Detailing: ${appointment.firstName} ${appointment.lastName}`,
      description: `Prestation: ${appointment.service}\nVéhicule: ${appointment.carModel}\nClient: ${appointment.firstName} ${appointment.lastName}\nEmail: ${appointment.email}\nTél: ${appointment.phone}\n\n--- Contact: 07 81 78 73 60`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          id: data.id, 
          hangoutLink: data.hangoutLink 
        };
      } else {
        const errorData = await response.json();
        console.error("Calendar API Error:", errorData);
        if (response.status === 401) {
          localStorage.removeItem('google_access_token');
          setGoogleConnected(false);
        }
        return null;
      }
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      return null;
    }
  };

  const deleteGoogleCalendarEvent = async (eventId: string) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) return false;

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      return false;
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: 'accepted' | 'refused' | 'cancelled') => {
    setProcessingId(id);
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) throw new Error("Rendez-vous non trouvé.");

      const dateStr = format(new Date(appointment.date), "dd/MM/yyyy", { locale: fr });
      const timeStr = format(new Date(appointment.date), "HH'h'mm", { locale: fr });
      const logoHtml = '<img src="https://brbautopro.fr/logo.jpg" alt="BRB Auto Pro" style="width: 150px; height: auto; display: block; margin-top: 20px;" />';

      if (status === 'accepted') {
        const eventData = await createGoogleCalendarEvent(appointment);
        if (!eventData) throw new Error("Impossible de créer l'événement Google Calendar. Vérifiez votre connexion.");

        await updateBookingStatus(id, 'accepted', eventData.id);

        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : Confirmation de votre séance de Detailing - ${dateStr} 🏁</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>C'est confirmé ! Nous avons bien validé votre rendez-vous pour votre <strong>${appointment.carModel}</strong>.</p>
            <p><strong>Détails :</strong> ${appointment.service} à ${timeStr} le ${dateStr}.</p>
            ${eventData.hangoutLink ? `<p>Lien de rendez-vous : <a href="${eventData.hangoutLink}">${eventData.hangoutLink}</a></p>` : ''}
            <p>Lieu: 6 Chemin des Moulins, 30300 Beaucaire.</p>
            <p>Merci de nous prévenir 24h à l'avance en cas d'empêchement.</p>
            <p>Cordialement,<br>Mathis - BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();

        const mailOk = await sendEmailViaGmail(appointment.email, `Confirmation de votre séance de Detailing - ${dateStr} 🏁`, emailBody);
        alert(mailOk ? "✅ RDV Accepté, Agenda mis à jour et Email envoyé !" : "⚠️ RDV Accepté et Agenda OK, mais l'envoi de l'Email a échoué.");
      } else if (status === 'refused') {
        await updateBookingStatus(id, 'refused');
        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : Votre demande de rendez-vous - BRB Auto Pro</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>Nous ne pouvons malheureusement pas valider votre rendez-vous pour le ${dateStr} à ${timeStr}.</p>
            <p>N'hésitez pas à choisir un autre créneau sur notre site.</p>
            <p>Cordialement,<br>Mathis - BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();
        await sendEmailViaGmail(appointment.email, "À propos de votre demande de rendez-vous - BRB Auto Pro", emailBody);
        alert("Rendez-vous refusé et client notifié.");
      } else if (status === 'cancelled') {
        if (appointment.googleEventId) {
          await deleteGoogleCalendarEvent(appointment.googleEventId);
        }
        await updateBookingStatus(id, 'cancelled');
        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : ANNULATION de votre rendez-vous - ${dateStr}</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>Nous sommes contraints d'annuler votre séance du ${dateStr} pour votre <strong>${appointment.carModel}</strong>.</p>
            <p>Nous vous invitons à replanifier sur notre site.</p>
            <p>Merci de votre compréhension.<br>Mathis - BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();
        await sendEmailViaGmail(appointment.email, `ANNULATION de votre rendez-vous - ${dateStr}`, emailBody);
        alert("✅ Rendez-vous annulé, supprimé de l'agenda et email envoyé.");
      }
    } catch (err: any) {
      console.error(err);
      alert("❌ Erreur : " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCar.images.length === 0) {
      alert("Veuillez ajouter au moins une photo.");
      return;
    }
    try {
      const carData = { ...newCar, name: `${newCar.brand} ${newCar.model}`, img: newCar.images[0] };
      if (editingCarId) {
        await updateInventoryItem(editingCarId, carData);
        setEditingCarId(null);
        alert("Véhicule mis à jour !");
      } else {
        await addInventoryItem(carData);
        alert("Véhicule ajouté !");
      }
      setNewCar({ brand: '', model: '', price: '', year: '', km: '', fuel: '', gearbox: 'Auto', doors: '', seats: '', type: '', color: '', critair: '', cv: '', ch: '', specificities: '', details: '', images: [] });
    } catch (err) { alert("Erreur lors de l'enregistrement."); }
  };

  const handleEditCar = (car: any) => {
    setActiveTab('inventory');
    setEditingCarId(car.id);
    setNewCar({ brand: car.brand || '', model: car.model || '', price: car.price || '', year: car.year || '', km: car.km || '', fuel: car.fuel || '', gearbox: car.gearbox || 'Auto', doors: car.doors || '', seats: car.seats || '', type: car.type || '', color: car.color || '', critair: car.critair || '', cv: car.cv || '', ch: car.ch || '', specificities: car.specificities || '', details: car.details || '', images: car.images || [car.img].filter(Boolean) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (car: any) => {
    const favoritesCount = inventory.filter(c => c.isFavorite).length;
    if (!car.isFavorite && favoritesCount >= 3) return alert("Max 3 favoris.");
    try { await toggleInventoryFavorite(car.id, !car.isFavorite); } catch (err) { alert("Erreur favoris."); }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.beforeImg || !newGallery.afterImg) return alert("Photos manquantes.");
    try {
      if (editingGalleryId) { await updateDetailingGallery(editingGalleryId, newGallery); setEditingGalleryId(null); } else await addDetailingGallery(newGallery);
      setNewGallery({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });
      alert("Galerie ok !");
    } catch (err) { alert("Erreur galerie."); }
  };

  const handleEditGallery = (gal: any) => {
    setActiveTab('gallery');
    setEditingGalleryId(gal.id);
    setNewGallery({ beforeImg: gal.beforeImg || '', afterImg: gal.afterImg || '', beforeDesc: gal.beforeDesc || '', afterDesc: gal.afterDesc || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    if (newCar.images.length + files.length > 4) return alert("Max 4 photos.");
    try {
      const compressed = await Promise.all(files.map(file => compressImage(file, 1200)));
      setNewCar(prev => ({ ...prev, images: [...prev.images, ...compressed].slice(0, 4) }));
    } catch (error) { alert("Erreur compression."); }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const compressed = await compressImage(e.target.files[0], 1200);
      setNewGallery(prev => ({ ...prev, [type === 'before' ? 'beforeImg' : 'afterImg']: compressed }));
    } catch (error) { alert("Erreur compression."); }
  };

  if (loading) return <div className="min-h-screen bg-anthracite flex items-center justify-center text-white font-mono uppercase tracking-widest animate-pulse">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Retour au site
        </Link>
        <div className="bg-darker p-8 rounded border border-white/10 text-center max-w-sm w-full shadow-2xl">
          <h1 className="text-2xl font-sans font-black uppercase text-white mb-6 tracking-wider">Accès Admin</h1>
          <button onClick={handleLogin} className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded font-bold uppercase tracking-wider text-xs w-full transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4" /> Connexion Google
          </button>
          <p className="mt-6 text-[10px] text-white/40 uppercase tracking-widest leading-relaxed font-bold">
            Note : Si rien ne se passe, ouvrez le site dans un <span className="text-primary italic">nouvel onglet</span> (bouton en haut à droite).
          </p>
        </div>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-sans font-black uppercase text-white mb-4">Accès Refusé</h1>
        <p className="text-white/50 mb-6 font-mono text-sm">{user.email}</p>
        <button onClick={handleLogout} className="bg-primary text-white py-2 px-8 rounded uppercase font-bold text-xs hover:bg-primary-hover transition-colors">Déconnexion</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite text-white p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-sans font-black uppercase tracking-wider">Dashboard Admin</h1>
              <Link to="/" className="text-white/30 hover:text-white transition-colors"><Globe className="w-4 h-4" /></Link>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${googleConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${googleConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              Google {googleConnected ? 'Activé' : 'Désactivé'}
            </div>
          </div>
          <div className="flex items-center gap-4 bg-darker p-3 rounded border border-white/5">
            <div className="text-right">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-tighter">Administrateur</p>
              <p className="text-xs font-mono text-white/70">{user.email}</p>
            </div>
            {!googleConnected ? (
              <button onClick={handleLogin} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded text-[10px] font-black uppercase transition-all flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Connecter Google
              </button>
            ) : (
              <button onClick={handleLogout} className="bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-500 px-4 py-2 rounded text-[10px] font-black uppercase transition-all">
                Déconnexion
              </button>
            )}
          </div>
        </div>

        {!googleConnected && activeTab === 'appointments' && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded mb-8 flex items-start gap-3 animate-bounce">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-500 uppercase">Attention : Intégration Google désactivée</p>
              <p className="text-xs text-white/70">Les emails et l'agenda ne fonctionneront pas. Cliquez sur "Connecter Google" ci-dessus pour les activer.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
          {[
            { id: 'requests', label: 'Demandes Client' },
            { id: 'appointments', label: 'Rendez-vous' },
            { id: 'inventory', label: 'Inventaire' },
            { id: 'gallery', label: 'Galerie' },
            { id: 'settings', label: 'Paramètres' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 uppercase font-black text-[10px] tracking-widest transition-all rounded ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6 flex flex-col h-full">
              <h2 className="text-xl font-sans font-black uppercase mb-6 flex items-center gap-2 text-yellow-500">
                <Calendar className="w-5 h-5" /> Attente ({appointments.filter(b => b.status === 'pending').length})
              </h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {appointments.filter(b => b.status === 'pending').map(appointment => (
                  <div key={appointment.id} className="bg-anthracite p-5 rounded border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-tight">{appointment.firstName} {appointment.lastName}</h3>
                        <p className="text-[10px] text-white/40 font-mono italic">{appointment.email}</p>
                      </div>
                      <span className="text-[9px] uppercase font-black px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Nouveau</span>
                    </div>
                    <div className="space-y-2 mb-5">
                      <p className="text-xs text-primary font-black uppercase tracking-widest">{appointment.service} • {appointment.carModel}</p>
                      <p className="text-sm font-bold text-white/90 bg-darker p-3 rounded border border-white/5">
                        {format(new Date(appointment.date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         disabled={processingId === appointment.id}
                         onClick={() => handleUpdateBookingStatus(appointment.id, 'accepted')} 
                         className={`flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                      >
                         {processingId === appointment.id ? 'Traitement...' : <><CheckCircle2 className="w-3 h-3" /> Accepter</>}
                      </button>
                      <button 
                         disabled={processingId === appointment.id}
                         onClick={() => handleUpdateBookingStatus(appointment.id, 'refused')} 
                         className="flex-1 bg-white/5 hover:bg-red-600/20 text-white/40 hover:text-red-500 py-3 rounded text-[10px] font-black uppercase tracking-wider transition-all border border-white/5"
                      >
                         Refuser
                      </button>
                    </div>
                  </div>
                ))}
                {appointments.filter(b => b.status === 'pending').length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center text-white/20">
                    <Calendar className="w-8 h-8 mb-2 opacity-10" />
                    <p className="text-xs uppercase font-bold tracking-widest italic">Aucun RDV en attente</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-darker rounded border border-white/10 p-6 flex flex-col h-full">
              <h2 className="text-xl font-sans font-black uppercase mb-6 flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-5 h-5" /> Confirmés ({appointments.filter(b => b.status === 'accepted').length})
              </h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {appointments.filter(b => b.status === 'accepted' || b.status === 'cancelled').map(appointment => (
                  <div key={appointment.id} className={`bg-anthracite p-4 rounded border ${appointment.status === 'accepted' ? 'border-green-500/20 border-l-4 border-l-green-500' : 'border-red-500/10 border-l-4 border-l-red-500 opacity-40'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <h3 className="font-bold text-sm uppercase">{appointment.firstName} {appointment.lastName}</h3>
                         <p className="text-[10px] text-white/40">{appointment.carModel}</p>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${appointment.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                           {appointment.status === 'accepted' ? 'Validé' : 'Annulé'}
                         </span>
                         {appointment.status === 'accepted' && (
                           <button 
                             disabled={processingId === appointment.id}
                             className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors underline decoration-red-500/20"
                             onClick={() => {
                               if (window.confirm("Annuler le RDV et avertir le client par email ?")) {
                                 handleUpdateBookingStatus(appointment.id, 'cancelled');
                               }
                             }}
                           >
                             {processingId === appointment.id ? 'Annulation...' : 'Annuler'}
                           </button>
                         )}
                       </div>
                    </div>
                    <p className="text-xs font-mono text-white/50">{format(new Date(appointment.date), "d MMM yyyy HH'h'mm", { locale: fr })}</p>
                  </div>
                ))}
              </div>
            </div>

            {localStorage.getItem('brb_google_calendar_url') && (
              <div className="lg:col-span-2 mt-8">
                 <div className="bg-darker rounded border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                       <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Planning Temps Réel</h3>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-[9px] font-black uppercase text-white/30">Google Live</span>
                       </div>
                    </div>
                    <div className="aspect-[16/10] sm:aspect-video w-full bg-anthracite">
                      <iframe 
                        src={localStorage.getItem('brb_google_calendar_url') || ''} 
                        style={{ border: 0 }} 
                        width="100%" 
                        height="100%" 
                        title="Google Calendar"
                      />
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Estimations ({estimationRequests.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {estimationRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-sm uppercase">{req.brand} {req.model}</h3><span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded">{req.status}</span></div>
                    <p className="text-xs text-white/50">{req.email} • {req.year} • {req.km}km</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Imports ({importRequests.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {importRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-sm uppercase">{req.brand} {req.model}</h3><span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded">{req.status}</span></div>
                    <p className="text-xs text-white/70 mb-2">{req.email} • {req.budget}€</p>
                    <p className="text-[10px] text-white/40 mt-1 italic line-clamp-2">Options: {req.options}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2 bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Contact Messages ({contactRequests.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5 h-fit">
                    <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-sm uppercase">{req.subject}</h3><span className="text-[9px] uppercase font-black bg-white/5 text-white/40 px-2 py-1 rounded">{format(req.createdAt?.toDate ? req.createdAt.toDate() : new Date(), "d MMM", { locale: fr })}</span></div>
                    <p className="text-xs text-white/50 mb-3">{req.name} • {req.email}</p>
                    <div className="p-3 bg-darker rounded text-sm text-white/80 leading-relaxed border border-white/5">{req.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6 h-fit shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-sans font-black uppercase text-white">{editingCarId ? 'Modifier' : 'Ajouter'} Véhicule</h2>
                {editingCarId && <button onClick={() => { setEditingCarId(null); setNewCar({ brand: '', model: '', price: '', year: '', km: '', fuel: '', gearbox: 'Auto', doors: '', seats: '', type: '', color: '', critair: '', cv: '', ch: '', specificities: '', details: '', images: [] }); }} className="text-[10px] uppercase font-bold text-red-500 hover:underline">Annuler</button>}
              </div>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4"><input required placeholder="Marque" value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" /><input required placeholder="Modèle" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" /></div>
                <div className="grid grid-cols-2 gap-4"><input required placeholder="Prix" value={newCar.price} onChange={e => setNewCar({...newCar, price: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" /><input required placeholder="Kilométrage" value={newCar.km} onChange={e => setNewCar({...newCar, km: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" /></div>
                <textarea placeholder="Détails..." value={newCar.details} onChange={e => setNewCar({...newCar, details: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm h-32" />
                <div className="border border-white/10 p-4 rounded bg-anthracite">
                  <div className="flex justify-between items-center mb-3"><label className="text-xs font-black uppercase text-white/40">Photos ({newCar.images.length}/4)</label><label className="bg-white/5 hover:bg-white/10 border border-white/5 px-2 py-1 text-[10px] cursor-pointer rounded transition-all uppercase font-black">Upload<input type="file" multiple accept="image/*" className="hidden" onChange={handleCarImageUpload} /></label></div>
                  <div className="flex gap-2 overflow-x-auto pb-2">{newCar.images.map((img, idx) => ( <div key={idx} className="relative w-20 h-20 border border-white/10 rounded overflow-hidden flex-none"><img src={img} className="w-full h-full object-cover" /><button type="button" onClick={() => setNewCar(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 text-[10px] font-black text-red-500 uppercase">X</button></div> ))}</div>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 uppercase font-black text-xs tracking-widest">{editingCarId ? 'Mettre à jour' : 'Ajouter'}</button>
              </form>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6 flex flex-col h-full">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Véhicules ({inventory.length})</h2>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {inventory.map(car => (
                  <div key={car.id} className="flex gap-4 bg-anthracite p-3 rounded border border-white/5 items-center">
                    <img src={car.images?.[0] || car.img} className="w-20 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0"><h3 className="font-bold text-xs uppercase truncate">{car.brand} {car.model}</h3><p className="text-[10px] text-white/40">{car.price}€ • {car.km}km</p></div>
                    <div className="flex gap-2">
                       <button onClick={() => handleToggleFavorite(car)} className={`p-1.5 rounded ${car.isFavorite ? 'text-primary' : 'text-white/20'}`}><Star className={`w-4 h-4 ${car.isFavorite ? 'fill-current' : ''}`} /></button>
                       <button onClick={() => handleEditCar(car)} className="p-1.5 text-white/20 hover:text-white"><Pencil className="w-4 h-4" /></button>
                       <button onClick={() => deleteInventoryItem(car.id)} className="p-1.5 text-white/20 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6 shadow-xl">
               <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">{editingGalleryId ? 'Modifier' : 'Ajouter'} Galerie</h2>
               <form onSubmit={handleAddGallery} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 p-4 rounded bg-anthracite text-center h-40 flex flex-col justify-center items-center">
                      {newGallery.beforeImg ? <img src={newGallery.beforeImg} className="h-full object-contain" /> : <label className="cursor-pointer uppercase font-black text-[9px] text-white/30 border border-white/10 p-3 hover:text-white">Avant<input type="file" className="hidden" onChange={e => handleGalleryUpload(e, 'before')} /></label>}
                    </div>
                    <div className="border border-white/10 p-4 rounded bg-anthracite text-center h-40 flex flex-col justify-center items-center">
                      {newGallery.afterImg ? <img src={newGallery.afterImg} className="h-full object-contain" /> : <label className="cursor-pointer uppercase font-black text-[9px] text-white/30 border border-white/10 p-3 hover:text-white">Après<input type="file" className="hidden" onChange={e => handleGalleryUpload(e, 'after')} /></label>}
                    </div>
                  </div>
                  <input placeholder="Desc Avant" value={newGallery.beforeDesc} onChange={e => setNewGallery({...newGallery, beforeDesc: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-xs" />
                  <input placeholder="Desc Après" value={newGallery.afterDesc} onChange={e => setNewGallery({...newGallery, afterDesc: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-xs" />
                  <button type="submit" className="w-full bg-primary py-3 uppercase font-black text-xs tracking-widest">Enregistrer</button>
               </form>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6 flex flex-col h-full">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Réalisations ({gallery.length})</h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {gallery.map(gal => (
                  <div key={gal.id} className="bg-anthracite p-3 rounded border border-white/5 flex gap-4">
                    <div className="flex gap-1 h-16 w-32 shrink-0">
                      <img src={gal.beforeImg} className="w-1/2 h-full object-cover rounded-l" />
                      <img src={gal.afterImg} className="w-1/2 h-full object-cover rounded-r" />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                       <p className="text-[10px] text-white/40 font-mono italic truncate">{gal.afterDesc}</p>
                       <div className="flex gap-2">
                          <button onClick={() => deleteDetailingGallery(gal.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-darker border border-white/10 p-8 rounded shadow-2xl">
              <h2 className="text-2xl font-sans font-black uppercase mb-8 text-white tracking-wider">Configuration Système</h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 pl-1">Agenda Google (Embed URL)</label>
                  <div className="flex gap-2">
                    <input 
                      placeholder="https://calendar.google.com/calendar/embed?src=..." 
                      className="flex-1 bg-anthracite border border-white/10 rounded px-4 py-3 text-white text-sm focus:border-primary transition-all font-mono"
                      onBlur={(e) => { 
                        localStorage.setItem('brb_google_calendar_url', e.target.value); 
                        alert("Lien de l'agenda mis à jour."); 
                      }}
                      defaultValue={localStorage.getItem('brb_google_calendar_url') || ''}
                    />
                  </div>
                  <p className="text-[10px] text-white/20 italic leading-relaxed">
                    Copiez l'URL d'intégration depuis les paramètres de votre agenda Google. Assurez-vous qu'il soit configuré comme "Public" pour l'affichage.
                  </p>
                </div>

                <div className="p-6 bg-white/5 rounded border border-white/5">
                   <h3 className="text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
                     <AlertTriangle className="w-4 h-4 text-primary" /> Guide des automatisations
                   </h3>
                   <ul className="text-[11px] text-white/50 space-y-3 leading-relaxed">
                     <li className="flex gap-2"><span>1.</span><span>Connectez-vous via Google avec le bouton en haut à droite.</span></li>
                     <li className="flex gap-2"><span>2.</span><span>Acceptez les autorisations "Calendar" et "Gmail" dans la popup.</span></li>
                     <li className="flex gap-2"><span>3.</span><span>Le Dashboard affichera <span className="text-green-500 font-bold">Google Activé</span>.</span></li>
                     <li className="flex gap-2"><span>4.</span><span>Chaque RDV accepté créera un événement Google Calendar avec lien Meet et enverra un mail de confirmation automatique.</span></li>
                   </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
