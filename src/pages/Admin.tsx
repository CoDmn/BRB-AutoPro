import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Star, Trash2, Pencil, ArrowLeft, Globe, X } from 'lucide-react';
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
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        localStorage.setItem('google_access_token', credential.accessToken);
      }
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la connexion : " + error.message + "\n\nSi vous êtes dans l'aperçu, essayez d'ouvrir l'application dans un nouvel onglet.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCar.images.length === 0) {
      alert("Veuillez ajouter au moins une photo.");
      return;
    }
    
    try {
      const carData = {
        ...newCar,
        name: `${newCar.brand} ${newCar.model}`, // Auto-generate name based on brand+model
        img: newCar.images[0] // Set the first image as cover `img` for backward compatibility
      };

      if (editingCarId) {
        await updateInventoryItem(editingCarId, carData);
        setEditingCarId(null);
        alert("Véhicule mis à jour !");
      } else {
        await addInventoryItem(carData);
        alert("Véhicule ajouté !");
      }

      setNewCar({ 
        brand: '', model: '', price: '', year: '', km: '', fuel: '', 
        gearbox: 'Auto', doors: '', seats: '', type: '', color: '', 
        critair: '', cv: '', ch: '', specificities: '', details: '', images: [] 
      });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleEditCar = (car: any) => {
    setActiveTab('inventory');
    setEditingCarId(car.id);
    setNewCar({
      brand: car.brand || '',
      model: car.model || '',
      price: car.price || '',
      year: car.year || '',
      km: car.km || '',
      fuel: car.fuel || '',
      gearbox: car.gearbox || 'Auto',
      doors: car.doors || '',
      seats: car.seats || '',
      type: car.type || '',
      color: car.color || '',
      critair: car.critair || '',
      cv: car.cv || '',
      ch: car.ch || '',
      specificities: car.specificities || '',
      details: car.details || '',
      images: car.images || [car.img].filter(Boolean)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (car: any) => {
    const favoritesCount = inventory.filter(c => c.isFavorite).length;
    
    if (!car.isFavorite && favoritesCount >= 3) {
      alert("Vous ne pouvez avoir que 3 véhicules en favoris (Derniers Arrivages) au maximum.");
      return;
    }

    try {
      await toggleInventoryFavorite(car.id, !car.isFavorite);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour des favoris.");
    }
  };

  const handleToggleGalleryFavorite = async (gal: any) => {
    const favoritesCount = gallery.filter(g => g.isFavorite).length;
    
    if (!gal.isFavorite && favoritesCount >= 2) {
      alert("Vous ne pouvez avoir que 2 réalisations en favoris (Nos Transformations) au maximum.");
      return;
    }

    try {
      await toggleDetailingFavorite(gal.id, !gal.isFavorite);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour des favoris.");
    }
  };

  const sendEmailViaGmail = async (to: string, subject: string, body: string) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) return;

    const emailContent = [
      'To: ' + to,
      'Subject: ' + subject,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const base64Content = btoa(unescape(encodeURIComponent(emailContent))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
      await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64Content }),
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const createGoogleCalendarEvent = async (appointment: any) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) {
      console.warn("No Google Access Token found. Calendar event not created.");
      return null;
    }

    const startTime = new Date(appointment.date);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

    const event = {
      summary: `🚗 RDV Detailing: ${appointment.firstName} ${appointment.lastName}`,
      description: `
Prestation: ${appointment.service}
Véhicule: ${appointment.carModel}
Client: ${appointment.firstName} ${appointment.lastName}
Téléphone: ${appointment.phone}
Email: ${appointment.email}

---
Contact BRB Auto Pro:
Téléphone: 07 81 78 73 60
Adresse: 6 Chemin des Moulins, 30300 Beaucaire, France
Email: brbautopro@gmail.com
      `.trim(),
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      reminders: {
        useDefault: true
      },
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
        console.log("Calendar event created successfully");
        return { 
          id: data.id, 
          hangoutLink: data.hangoutLink 
        };
      } else {
        const errorData = await response.json();
        console.error("Failed to create calendar event:", errorData);
        return null;
      }
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      return null;
    }
  };

  const deleteGoogleCalendarEvent = async (eventId: string) => {
    const token = localStorage.getItem('google_access_token');
    if (!token) {
      alert("Erreur: Jeton d'accès Google manquant. Veuillez vous déconnecter et vous reconnecter.");
      return;
    }

    try {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const err = await response.json();
        console.error("Failed to delete event:", err);
      }
    } catch (error) {
      console.error("Error deleting calendar event:", error);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: 'accepted' | 'refused' | 'cancelled') => {
    console.log(`Updating booking ${id} to ${status}`);
    setProcessingId(id);
    try {
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) {
        console.error("Appointment not found in state:", id);
        setProcessingId(null);
        return;
      }

      const dateStr = format(new Date(appointment.date), "dd/MM/yyyy", { locale: fr });
      const timeStr = format(new Date(appointment.date), "HH'h'mm", { locale: fr });
      const logoHtml = '<img src="https://brbautopro.fr/logo.jpg" alt="BRB Auto Pro" style="width: 150px; height: auto; display: block; margin-top: 20px;" />';

      if (status === 'accepted') {
        const eventData = await createGoogleCalendarEvent(appointment);
        const googleEventId = eventData?.id || '';
        const hangoutLink = eventData?.hangoutLink || '';

        await updateBookingStatus(id, 'accepted', googleEventId);

        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : Confirmation de votre séance de Detailing - ${dateStr} 🏁</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>C'est confirmé ! Nous avons bien validé votre rendez-vous pour prendre soin de votre <strong>${appointment.carModel}</strong>.</p>
            <p>Voici le récapitulatif de votre séance :</p>
            <ul>
              <li><strong>Prestation :</strong> ${appointment.service}</li>
              <li><strong>Date :</strong> ${dateStr}</li>
              <li><strong>Heure de dépôt :</strong> ${timeStr}</li>
              <li><strong>Lieu :</strong> 6 Chemin des Moulins, 30300 Beaucaire, France</li>
            </ul>
            ${hangoutLink ? `<p><strong>Lien de rendez-vous (Google Meet) :</strong> <a href="${hangoutLink}">${hangoutLink}</a></p>` : ''}
            <p><strong>Quelques précisions pour le bon déroulement de la prestation :</strong></p>
            <p>Durée : Prévoyez environ 2h d'immobilisation pour un résultat optimal.</p>
            <p>Préparation : Nous vous remercions de bien vouloir retirer vos objets personnels de l'habitacle avant notre intervention.</p>
            <p>Si vous avez la moindre question ou un empêchement, merci de nous prévenir au moins 24h à l'avance au 07 81 78 73 60.</p>
            <p>Nous avons hâte de redonner tout son éclat à votre véhicule !</p>
            <p>À très vite,</p>
            <p>Mathis BORDES BUENO<br>BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();
        await sendEmailViaGmail(appointment.email, `Confirmation de votre séance de Detailing - ${dateStr} 🏁`, emailBody);
        alert("Rendez-vous validé, ajouté à l'agenda et email envoyé !");
      } else if (status === 'refused') {
        await updateBookingStatus(id, 'refused');
        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : À propos de votre demande de rendez-vous - BRB Auto Pro</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>Je vous remercie de l'intérêt que vous portez à nos services de detailing pour votre <strong>${appointment.carModel}</strong>.</p>
            <p>Après étude de votre demande, je ne suis malheureusement pas en mesure de valider votre rendez-vous pour la date du ${dateStr} à ${timeStr}.</p>
            <p>Nous serions ravis de prendre soin de votre véhicule à une autre date. Je vous invite à consulter nos prochaines disponibilités directement sur notre site ou à me recontacter par téléphone au 07 81 78 73 60.</p>
            <p>Merci de votre compréhension.</p>
            <p>Cordialement,</p>
            <p>Mathis BORDES BUENO<br>BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();
        await sendEmailViaGmail(appointment.email, "À propos de votre demande de rendez-vous - BRB Auto Pro", emailBody);
        alert("Rendez-vous refusé et email envoyé.");
      } else if (status === 'cancelled') {
        if (appointment.googleEventId) {
          await deleteGoogleCalendarEvent(appointment.googleEventId);
        }
        await updateBookingStatus(id, 'cancelled');
        const emailBody = `
          <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
            <p>Objet : ANNULATION / REPORT de votre rendez-vous - ${dateStr}</p>
            <p>Bonjour ${appointment.firstName},</p>
            <p>Nous vous contactons pour vous informer que nous sommes contraints d'annuler votre séance de detailing prévue le ${dateStr} à ${timeStr} pour votre <strong>${appointment.carModel}</strong>.</p>
            <p>En raison d'un imprévu, nous ne pourrons pas vous recevoir dans les conditions de qualité optimales que nous exigeons.</p>
            <p>Nous sommes sincèrement désolés pour ce contretemps. Votre satisfaction et le soin apporté à votre véhicule restent notre priorité.</p>
            <p>Je vous propose de replanifier votre séance sur notre site web.</p>
            <p>Je reste également votre entière disposition pour en discuter de vive voix au 07 81 78 73 60.</p>
            <p>Bien cordialement,</p>
            <p>Mathis BORDES BUENO<br>BRB Auto Pro</p>
            ${logoHtml}
          </div>
        `.trim();
        await sendEmailViaGmail(appointment.email, `ANNULATION / REPORT de votre rendez-vous - ${dateStr}`, emailBody);
        alert("Rendez-vous annulé, supprimé de l'agenda et email envoyé.");
      }
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      alert("Erreur lors de la mise à jour du statut : " + (err.message || "Erreur inconnue"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.beforeImg || !newGallery.afterImg) {
      alert("Veuillez sélectionner les photos Avant et Après.");
      return;
    }
    try {
      if (editingGalleryId) {
        await updateDetailingGallery(editingGalleryId, newGallery);
        setEditingGalleryId(null);
        alert("Galerie mise à jour !");
      } else {
        await addDetailingGallery(newGallery);
        alert("Galerie ajoutée !");
      }
      setNewGallery({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleEditGallery = (gal: any) => {
    setActiveTab('gallery');
    setEditingGalleryId(gal.id);
    setNewGallery({
      beforeImg: gal.beforeImg || '',
      afterImg: gal.afterImg || '',
      beforeDesc: gal.beforeDesc || '',
      afterDesc: gal.afterDesc || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCarImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    if (newCar.images.length + files.length > 4) {
      alert("Vous ne pouvez télécharger que 4 photos maximum.");
      return;
    }

    try {
      const compressedImages = await Promise.all(
        files.map(file => compressImage(file, 1200)) // Max width 1200px
      );
      setNewCar(prev => ({
        ...prev,
        images: [...prev.images, ...compressedImages].slice(0, 4)
      }));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la compression de l'image.");
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const compressed = await compressImage(e.target.files[0], 1200);
      setNewGallery(prev => ({
        ...prev,
        [type === 'before' ? 'beforeImg' : 'afterImg']: compressed
      }));
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la compression de l'image.");
    }
  };

  if (loading) return <div className="min-h-screen bg-anthracite flex items-center justify-center text-white">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Retour au site
        </Link>
        <div className="bg-darker p-8 rounded border border-white/10 text-center max-w-sm w-full shadow-2xl">
          <h1 className="text-2xl font-sans font-black uppercase text-white mb-6 tracking-wider">Accès Admin</h1>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">Veuillez vous connecter avec un compte administrateur autorisé.</p>
          <button onClick={handleLogin} className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded font-bold uppercase tracking-wider text-xs w-full transition-colors mb-4 shadow-lg shadow-primary/20">
            Connexion Google
          </button>
          <p className="text-[10px] text-white/40 uppercase tracking-wider leading-relaxed">Note : Si la connexion échoue, veuillez ouvrir le site dans un <strong>nouvel onglet</strong>.</p>
        </div>
      </div>
    );
  }

  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-sans font-black uppercase text-white mb-4">Accès Refusé</h1>
        <p className="text-white/50 mb-6">L'adresse <strong>{user.email}</strong> n'est pas autorisée.</p>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="bg-darker border border-white/10 text-white py-2 px-6 rounded uppercase font-bold text-xs hover:bg-white/5 transition-colors">Déconnexion</button>
          <Link to="/" className="bg-primary text-white py-2 px-6 rounded uppercase font-bold text-xs hover:bg-primary-hover transition-colors">Quitter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-sans font-black uppercase tracking-wider">Dashboard Admin</h1>
            <Link to="/" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-3 py-1 rounded text-[10px] uppercase font-bold transition-all border border-white/5">
              <Globe className="w-3 h-3" /> Voir le site
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/50">{user.email}</p>
            <button onClick={handleLogout} className="text-xs bg-darker hover:bg-white/5 border border-white/10 px-4 py-2 rounded transition-colors uppercase font-bold tracking-wider">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Demandes Client</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Rendez-vous</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Inventaire</button>
          <button onClick={() => setActiveTab('gallery')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Galerie Detailing</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Paramètres</button>
        </div>

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-yellow-500">Demandes en attente ({appointments.filter(b => b.status === 'pending').length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {appointments.filter(b => b.status === 'pending').map(appointment => (
                  <div key={appointment.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm uppercase">{appointment.firstName} {appointment.lastName}</h3>
                      <span className="text-[10px] uppercase font-bold bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">En attente</span>
                    </div>
                    <p className="text-xs text-white/70 mb-2">{appointment.email} • {appointment.phone}</p>
                    <p className="text-xs text-primary mb-2 font-bold uppercase">{appointment.service} - {appointment.carModel}</p>
                    <p className="text-sm font-bold mb-4">{format(new Date(appointment.date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateBookingStatus(appointment.id, 'accepted')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">Accepter</button>
                      <button onClick={() => handleUpdateBookingStatus(appointment.id, 'refused')} className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-colors">Refuser</button>
                    </div>
                  </div>
                ))}
                {appointments.filter(b => b.status === 'pending').length === 0 && <p className="text-white/30 italic text-sm">Aucune demande en attente.</p>}
              </div>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-green-500">Rendez-vous validés ({appointments.filter(b => b.status === 'accepted').length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {appointments.filter(b => b.status === 'accepted' || b.status === 'cancelled').map(appointment => (
                  <div key={appointment.id} className={`bg-anthracite p-4 rounded border border-white/5 ${appointment.status === 'accepted' ? 'border-l-4 border-l-green-500' : 'opacity-50 border-l-4 border-l-red-500'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-sm uppercase">{appointment.firstName} {appointment.lastName}</h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${appointment.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {appointment.status === 'accepted' ? 'Validé' : 'Annulé'}
                        </span>
                        {appointment.status === 'accepted' && (
                          <button 
                            disabled={processingId === appointment.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ? Un email d'annulation sera envoyé au client.")) {
                                handleUpdateBookingStatus(appointment.id, 'cancelled');
                              }
                            }}
                            className={`text-[10px] uppercase font-bold transition-all ${processingId === appointment.id ? 'text-white/20' : 'text-red-500 hover:underline'}`}
                          >
                            {processingId === appointment.id ? 'Annulation...' : 'Annuler le rendez-vous'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/50">{appointment.carModel} • {format(new Date(appointment.date), "d MMM yyyy HH'h'mm", { locale: fr })}</p>
                  </div>
                ))}
              </div>
            </div>

            {localStorage.getItem('brb_google_calendar_url') && (
              <div className="lg:col-span-2 bg-darker rounded border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-sans font-black uppercase text-white">Mon Agenda Google</h2>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Synchronisation active</span>
                </div>
                <div className="aspect-video w-full bg-anthracite rounded overflow-hidden">
                  <iframe 
                    src={localStorage.getItem('brb_google_calendar_url') || ''} 
                    style={{ border: 0 }} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no"
                    title="Google Calendar"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Demandes d'Estimation ({estimationRequests.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {estimationRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm uppercase">{req.brand} {req.model}</h3>
                      <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded">{req.status}</span>
                    </div>
                    <p className="text-xs text-white/70 mb-2">{req.email}</p>
                    <div className="text-xs text-white/50 grid grid-cols-2 gap-1 mb-2">
                      <p>Année: <strong className="text-white">{req.year}</strong></p>
                      <p>KM: <strong className="text-white">{req.km}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Demandes d'Import ({importRequests.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {importRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm uppercase">{req.brand} {req.model}</h3>
                      <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded">{req.status}</span>
                    </div>
                    <p className="text-xs text-white/70 mb-2">{req.email} • {req.phone}</p>
                    <div className="text-xs text-white/50 grid grid-cols-2 gap-1 mb-2">
                      <p>Budget: <strong className="text-white">{req.budget}</strong></p>
                      <p>Année: <strong className="text-white">{req.year}</strong></p>
                    </div>
                    <p className="text-xs text-white/70 mt-2 bg-darker p-3 rounded">Options: {req.options}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-primary">Messages Contact ({contactRequests.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {contactRequests.map(req => (
                  <div key={req.id} className="bg-anthracite p-4 rounded border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm uppercase">{req.subject}</h3>
                      <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-1 rounded">{req.status}</span>
                    </div>
                    <p className="text-xs text-white/70 mb-2">{req.name} • {req.email} • {req.phone}</p>
                    <p className="text-sm text-white/90 mt-2 bg-darker p-3 rounded leading-relaxed">{req.message}</p>
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
                <h2 className="text-xl font-sans font-black uppercase text-white">{editingCarId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h2>
                {editingCarId && (
                  <button 
                    onClick={() => {
                      setEditingCarId(null);
                      setNewCar({ 
                        brand: '', model: '', price: '', year: '', km: '', fuel: '', 
                        gearbox: 'Auto', doors: '', seats: '', type: '', color: '', 
                        critair: '', cv: '', ch: '', specificities: '', details: '', images: [] 
                      });
                    }}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" /> Annuler
                  </button>
                )}
              </div>
              <form onSubmit={handleAddCar} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Marque (ex: Porsche)" value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input required placeholder="Modèle (ex: 911)" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Prix" value={newCar.price} onChange={e => setNewCar({...newCar, price: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input required placeholder="Année" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input required placeholder="Kilométrage" value={newCar.km} onChange={e => setNewCar({...newCar, km: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input required placeholder="Énergie" value={newCar.fuel} onChange={e => setNewCar({...newCar, fuel: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select required value={newCar.gearbox} onChange={e => setNewCar({...newCar, gearbox: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm">
                    <option value="Auto">Automatique</option>
                    <option value="Manuelle">Manuelle</option>
                    <option value="Électrique">Électrique</option>
                  </select>
                  <input required placeholder="Type (ex: SUV, Coupé)" value={newCar.type} onChange={e => setNewCar({...newCar, type: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Nombre de portes" value={newCar.doors} onChange={e => setNewCar({...newCar, doors: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Nombre de places" value={newCar.seats} onChange={e => setNewCar({...newCar, seats: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Couleur" value={newCar.color} onChange={e => setNewCar({...newCar, color: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Crit'air" value={newCar.critair} onChange={e => setNewCar({...newCar, critair: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Puissance fiscale (CV)" value={newCar.cv} onChange={e => setNewCar({...newCar, cv: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                  <input placeholder="Puissance DIN (ch)" value={newCar.ch} onChange={e => setNewCar({...newCar, ch: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                </div>

                <textarea placeholder="Spécificités / Finitions..." value={newCar.specificities} onChange={e => setNewCar({...newCar, specificities: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm h-20" />
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-white/40 tracking-widest pl-1">Description détaillée (longue)</label>
                  <textarea placeholder="Détails complets sur le véhicule, équipements, entretien..." value={newCar.details} onChange={e => setNewCar({...newCar, details: e.target.value})} className="w-full px-4 py-3 bg-anthracite border border-white/10 text-white text-sm h-40 focus:border-primary focus:outline-none transition-colors" />
                </div>

                <div className="border border-white/10 p-4 rounded bg-anthracite">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold uppercase text-white/70">Photos ({newCar.images.length}/4)</label>
                    <label className="bg-darker hover:bg-white/5 border border-white/10 px-3 py-1 text-xs cursor-pointer rounded transition-colors uppercase font-bold">
                      Parcourir...
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleCarImageUpload} />
                    </label>
                  </div>
                  <div className="flex gap-2 overflow-x-auto">
                    {newCar.images.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 shrink-0 flex-none border border-white/10 rounded overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setNewCar(p => ({...p, images: p.images.filter((_, i) => i !== idx)}))} className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-xs uppercase font-bold text-red-500">Retirer</button>
                        {idx === 0 && <span className="absolute bottom-0 left-0 bg-primary px-1 text-[9px] uppercase font-bold w-full text-center">Couverture</span>}
                      </div>
                    ))}
                    {newCar.images.length === 0 && <p className="text-xs text-white/30 italic">Aucune photo sélectionnée.</p>}
                  </div>
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 uppercase font-bold text-xs tracking-wider">Ajouter à l'inventaire</button>
              </form>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Véhicules en ligne ({inventory.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {inventory.map(car => (
                  <div key={car.id} className="flex gap-4 bg-anthracite p-3 rounded border border-white/5 items-center">
                    <div className="w-20 h-16 shrink-0 relative bg-darker rounded overflow-hidden">
                      {car.images && car.images[0] ? (
                        <img src={car.images[0]} alt={car.name} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <img src={car.img} alt={car.name} className="w-full h-full object-cover opacity-80" />
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-black/80 px-2 py-1 text-[8px] rounded-tl">{car.images?.length || 1}/4</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-sm uppercase truncate">{car.brand} {car.model}</h3>
                      <p className="text-xs text-white/50">{car.price}€ • {car.km} • {car.year}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleFavorite(car)} 
                        className={`p-2 rounded transition-colors ${car.isFavorite ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                        title={car.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris (Derniers Arrivages)"}
                      >
                        <Star className={`w-5 h-5 ${car.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => handleEditCar(car)} className="p-2 text-white/20 hover:text-blue-400 transition-colors" title="Modifier">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteInventoryItem(car.id)} className="p-2 text-white/20 hover:text-red-500 transition-colors" title="Supprimer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-darker rounded border border-white/10 p-6 h-fit shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-sans font-black uppercase text-white">{editingGalleryId ? 'Modifier la réalisation' : 'Ajouter un Avant/Après'}</h2>
                {editingGalleryId && (
                  <button 
                    onClick={() => {
                      setEditingGalleryId(null);
                      setNewGallery({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });
                    }}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" /> Annuler
                  </button>
                )}
              </div>
              <form onSubmit={handleAddGallery} className="space-y-4">
                <div className="border border-white/10 p-4 rounded bg-anthracite text-center">
                   {newGallery.beforeImg ? (
                     <div className="relative inline-block">
                        <img src={newGallery.beforeImg} className="h-32 object-contain mx-auto rounded" />
                        <button type="button" onClick={() => setNewGallery(p => ({...p, beforeImg: ''}))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 text-xs font-bold text-red-500 uppercase transition-opacity">Retirer</button>
                     </div>
                   ) : (
                     <label className="cursor-pointer block py-6">
                       <span className="text-xs font-bold uppercase text-white/50 underline">Sélectionner photo Avant</span>
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleGalleryUpload(e, 'before')} />
                     </label>
                   )}
                </div>
                <input required placeholder="Description (ex: Peinture terne)" value={newGallery.beforeDesc} onChange={e => setNewGallery({...newGallery, beforeDesc: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                
                <div className="my-4 border-t border-white/10"></div>
                
                <div className="border border-white/10 p-4 rounded bg-anthracite text-center">
                   {newGallery.afterImg ? (
                     <div className="relative inline-block">
                        <img src={newGallery.afterImg} className="h-32 object-contain mx-auto rounded" />
                        <button type="button" onClick={() => setNewGallery(p => ({...p, afterImg: ''}))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 text-xs font-bold text-red-500 uppercase transition-opacity">Retirer</button>
                     </div>
                   ) : (
                     <label className="cursor-pointer block py-6">
                       <span className="text-xs font-bold uppercase text-white/50 underline">Sélectionner photo Après</span>
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleGalleryUpload(e, 'after')} />
                     </label>
                   )}
                </div>
                <input required placeholder="Description (ex: Lustrage Cire Céramique)" value={newGallery.afterDesc} onChange={e => setNewGallery({...newGallery, afterDesc: e.target.value})} className="w-full px-4 py-2 bg-anthracite border border-white/10 text-white text-sm" />
                
                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 uppercase font-bold text-xs tracking-wider mt-4">Ajouter la galerie</button>
              </form>
            </div>
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Galeries en ligne ({gallery.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {gallery.map(gal => (
                  <div key={gal.id} className="bg-anthracite p-4 rounded border border-white/5 space-y-3">
                    <div className="flex gap-2 h-20">
                      <div className="flex-1 relative"><img src={gal.beforeImg} className="w-full h-full object-cover" referrerPolicy="no-referrer"/><span className="absolute bottom-0 left-0 bg-black/80 px-1 text-[10px]">Avant</span></div>
                      <div className="flex-1 relative"><img src={gal.afterImg} className="w-full h-full object-cover" referrerPolicy="no-referrer"/><span className="absolute bottom-0 left-0 bg-black/80 px-1 text-[10px]">Après</span></div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-white/60">
                        <p>- {gal.beforeDesc}</p>
                        <p>- {gal.afterDesc}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleToggleGalleryFavorite(gal)} 
                          className={`p-1 rounded transition-colors ${gal.isFavorite ? 'text-primary' : 'text-white/20 hover:text-white'}`}
                          title={gal.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris (Nos Transformations)"}
                        >
                          <Star className={`w-4 h-4 ${gal.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={() => handleEditGallery(gal)} className="text-blue-400 hover:text-blue-300 font-bold text-xs uppercase" title="Modifier">Modifier</button>
                        <button onClick={() => deleteDetailingGallery(gal.id)} className="text-red-500 hover:text-red-400 font-bold text-xs uppercase" title="Supprimer">Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="bg-darker border border-white/10 p-8 rounded">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Paramètres Intégrations</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lien iFrame Google Calendar (Public)</label>
                  <input 
                    placeholder="https://calendar.google.com/calendar/embed?src=..." 
                    className="w-full bg-anthracite border border-white/10 rounded px-4 py-2 text-white text-sm"
                    onBlur={(e) => localStorage.setItem('brb_google_calendar_url', e.target.value)}
                    defaultValue={localStorage.getItem('brb_google_calendar_url') || ''}
                  />
                  <p className="text-[10px] text-white/30 italic">Pensez à rendre votre agenda public dans les paramètres Google Calendar pour qu'il s'affiche ici.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
