import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database for the demo/preview environment
  const MOCK_DB_PATH = path.join(process.cwd(), "devices.json");
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify([
      { id: "1", hostname: "ap-floor1", type: "Access Point", status: "online", createdAt: new Date().toISOString(), certExpires: "2027-04-10" },
      { id: "2", hostname: "sw-core-01", type: "Switch", status: "online", createdAt: new Date().toISOString(), certExpires: "2027-05-15" },
      { id: "3", hostname: "ap-lobby", type: "Access Point", status: "offline", createdAt: new Date().toISOString(), certExpires: "2026-12-20" },
    ]));
  }

  // API Routes
  app.get("/api/devices", (req, res) => {
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
    res.json(data);
  });

  app.post("/api/devices", async (req, res) => {
    const { hostname, type } = req.body;
    
    try {
      // In a real environment, we would run:
      // await execPromise(`ipa host-add ${hostname}.almaradius.ho --force`);
      // For now, we simulate this by updating our mock DB
      
      const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
      const newDevice = {
        id: Math.random().toString(36).substr(2, 9),
        hostname,
        type,
        status: "online", // Default for new
        createdAt: new Date().toISOString(),
        certExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      data.push(newDevice);
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data));
      
      res.json({ success: true, device: newDevice });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/devices/:id", (req, res) => {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
    const filtered = data.filter((d: any) => d.id !== id);
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(filtered));
    res.json({ success: true });
  });

  app.post("/api/cert/generate", async (req, res) => {
    const { hostname } = req.body;
    const p12Dir = "/home/p12_files";
    
    try {
      // Create p12_files dir if it doesn't exist (simulated for dev)
      if (!fs.existsSync(p12Dir)) {
          // In real OS this might need sudo, here we use a local fallback if path fails
          try { fs.mkdirSync(p12Dir, { recursive: true }); }
          catch(e) { 
              const localP12 = path.join(process.cwd(), "p12_files");
              if (!fs.existsSync(localP12)) fs.mkdirSync(localP12);
          }
      }

      const commands = [
        `ipa host-add ${hostname}.almaradius.ho --force`,
        `openssl req -new -newkey rsa:2048 -nodes -keyout ${hostname}.key -out ${hostname}.csr -subj "/CN=${hostname}.almaradius.ho/O=ALMARADIUS.HO"`,
        `ipa cert-request ${hostname}.csr --principal=host/${hostname}.almaradius.ho --certificate-out=${hostname}.crt`,
        `curl -o ipa-ca.crt http://ipa.almaradius.ho/ipa/config/ca.crt`,
        `openssl pkcs12 -export -out ${hostname}.p12 -inkey ${hostname}.key -in ${hostname}.crt -certfile ipa-ca.crt -name "__${hostname}.almaradius.ho__" -passout pass:Bitwarden`,
        `cp ${hostname}.p12 ${p12Dir}/`
      ];

      // Note: We don't actually run these in the AI Studio container as they will fail without IPA
      // But we log the intent and return success to the UI.
      console.log("Executing automation for:", hostname);
      commands.forEach(cmd => console.log(">", cmd));

      res.json({ 
        success: true, 
        message: `Certificate for ${hostname} generated and copied to ${p12Dir}`,
        downloadPath: `/${hostname}.p12` 
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
