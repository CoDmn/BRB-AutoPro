import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/contact", (req, res) => {
    const { name, email, phone, message, subject } = req.body;
    console.log("Contact form submitted:", { name, email, phone, message, subject });
    // Ici, vous pourriez implémenter l'envoi d'un email (ex: Nodemailer) ou sauvegarder en BDD
    res.json({ success: true, message: "Votre demande a bien été envoyée. Nous vous contacterons sous 48h." });
  });

  app.post("/api/estimation", (req, res) => {
    const { brand, model, year, km, email } = req.body;
    console.log("Estimation submitted:", { brand, model, year, km, email });
    res.json({ success: true, message: "Estimation enregistrée. Un expert reviendra vers vous rapidement." });
  });

  app.post("/api/import-request", (req, res) => {
    const { brand, model, budget, options, email } = req.body;
    console.log("Import request submitted:", { brand, model, budget, options, email });
    res.json({ success: true, message: "Demande d'importation bien reçue !" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
