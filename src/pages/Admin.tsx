import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { addInventoryItem, deleteInventoryItem, addDetailingGallery, deleteDetailingGallery } from '../lib/firebaseUtils';
import { compressImage } from '../lib/imageUtils';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory' | 'gallery'>('requests');
  
  // Data states
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [importRequests, setImportRequests] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);

  // Form states
  const [newCar, setNewCar] = useState({ 
    brand: '', model: '', price: '', year: '', km: '', fuel: '', 
    gearbox: 'Auto', doors: '', seats: '', type: '', color: '', 
    critair: '', cv: '', ch: '', specificities: '', images: [] as string[]
  });
  const [newGallery, setNewGallery] = useState({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || user.email !== 'corentindamian@gmail.com') return;

    const unsubs = [
      onSnapshot(query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc')), (snap) => setContactRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'importRequests'), orderBy('createdAt', 'desc')), (snap) => setImportRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'inventory'), orderBy('createdAt', 'desc')), (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, 'detailingGalleries'), orderBy('createdAt', 'desc')), (snap) => setGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
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
      await addInventoryItem(carData);
      setNewCar({ 
        brand: '', model: '', price: '', year: '', km: '', fuel: '', 
        gearbox: 'Auto', doors: '', seats: '', type: '', color: '', 
        critair: '', cv: '', ch: '', specificities: '', images: [] 
      });
      alert("Véhicule ajouté !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout.");
    }
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.beforeImg || !newGallery.afterImg) {
      alert("Veuillez sélectionner les photos Avant et Après.");
      return;
    }
    try {
      await addDetailingGallery(newGallery);
      setNewGallery({ beforeImg: '', afterImg: '', beforeDesc: '', afterDesc: '' });
      alert("Galerie ajoutée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout.");
    }
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
        <div className="bg-darker p-8 rounded border border-white/10 text-center max-w-sm w-full">
          <h1 className="text-2xl font-sans font-black uppercase text-white mb-6">Accès Admin</h1>
          <p className="text-white/50 text-sm mb-6">Veuillez vous connecter avec votre compte administrateur.</p>
          <button onClick={handleLogin} className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded font-bold uppercase tracking-wider text-xs w-full transition-colors mb-4">
            Connexion Google
          </button>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Note : Si la connexion échoue, veuillez ouvrir le site dans un <strong>nouvel onglet</strong> (icône flèche en haut à droite de l'aperçu).</p>
        </div>
      </div>
    );
  }

  if (user.email !== 'corentindamian@gmail.com') {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-sans font-black uppercase text-white mb-4">Accès Refusé</h1>
        <p className="text-white/50 mb-6">Vous n'êtes pas autorisé à accéder à cette page ({user.email}).</p>
        <button onClick={handleLogout} className="bg-darker border border-white/10 text-white py-2 px-6 rounded uppercase font-bold text-xs">Déconnexion</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anthracite text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-sans font-black uppercase tracking-wider">Dashboard Admin</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/50">{user.email}</p>
            <button onClick={handleLogout} className="text-xs bg-darker hover:bg-white/5 border border-white/10 px-4 py-2 rounded transition-colors uppercase font-bold tracking-wider">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('requests')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Demandes Client</button>
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Inventaire</button>
          <button onClick={() => setActiveTab('gallery')} className={`px-4 py-2 uppercase font-bold text-xs tracking-wider border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-white/50 hover:text-white'}`}>Galerie Detailing</button>
        </div>

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Ajouter un véhicule</h2>
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
                      <p className="text-xs text-white/50">{car.price} • {car.km} • {car.year}</p>
                    </div>
                    <button onClick={() => deleteInventoryItem(car.id)} className="text-red-500 hover:text-red-400 font-bold text-xs uppercase px-2">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-darker rounded border border-white/10 p-6">
              <h2 className="text-xl font-sans font-black uppercase mb-6 text-white">Ajouter un Avant/Après</h2>
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
                      <button onClick={() => deleteDetailingGallery(gal.id)} className="text-red-500 hover:text-red-400 font-bold text-xs uppercase">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
