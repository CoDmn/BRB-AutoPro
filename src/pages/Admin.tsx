import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [importRequests, setImportRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to contact requests
    const qContact = query(collection(db, 'contactRequests'), orderBy('createdAt', 'desc'));
    const unsubContact = onSnapshot(qContact, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContactRequests(data);
    });

    // Listen to import requests
    const qImport = query(collection(db, 'importRequests'), orderBy('createdAt', 'desc'));
    const unsubImport = onSnapshot(qImport, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setImportRequests(data);
    });

    return () => {
      unsubContact();
      unsubImport();
    };
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la connexion");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="min-h-screen bg-anthracite flex items-center justify-center text-white">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-anthracite flex flex-col items-center justify-center p-4">
        <div className="bg-darker p-8 rounded border border-white/10 text-center max-w-sm w-full">
          <h1 className="text-2xl font-sans font-black uppercase text-white mb-6">Accès Admin</h1>
          <p className="text-white/50 text-sm mb-6">Veuillez vous connecter avec votre compte administrateur.</p>
          <button onClick={handleLogin} className="bg-primary hover:bg-primary-hover text-white py-3 px-6 rounded font-bold uppercase tracking-wider text-xs w-full transition-colors">
            Connexion Google
          </button>
        </div>
      </div>
    );
  }

  // Very basic "Admin interface" reading data
  return (
    <div className="min-h-screen bg-anthracite text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-sans font-black uppercase tracking-wider">Dashboard Admin</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-white/50">{user.email}</p>
            <button onClick={handleLogout} className="text-xs bg-darker hover:bg-white/5 border border-white/10 px-4 py-2 rounded transition-colors uppercase font-bold tracking-wider">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demandes Import */}
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
              {importRequests.length === 0 && <p className="text-sm text-white/50">Aucune demande reçue.</p>}
            </div>
          </div>

          {/* Demandes Contact */}
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
              {contactRequests.length === 0 && <p className="text-sm text-white/50">Aucun message reçu.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
