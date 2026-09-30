import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import userRoutes from './routes/user.routes';
import auditRoutes from './routes/audit.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/documentos', documentRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/auditoria', auditRoutes);

const PORT = process.env.PORT || 4000;
const INSTANCE_COLOR = process.env.INSTANCE_COLOR || '#666666';
const INSTANCE_NAME = process.env.INSTANCE_NAME || `Backend ${PORT}`;

app.get('/api/instance-info', (_req, res) => {
  res.json({ port: PORT, color: INSTANCE_COLOR, name: INSTANCE_NAME });
});

// --- MODO MONOLITO: servir el frontend ya compilado desde este mismo backend ---
const FRONTEND_DIST = path.join(__dirname, '../../frontend/dist');
const INDEX_HTML_PATH = path.join(FRONTEND_DIST, 'index.html');

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST, { index: false }));

  app.get(/^(?!\/api).*/, (_req, res) => {
    let html = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

    const banner = `
      <div id="instance-banner" style="
        position:fixed;top:0;left:0;right:0;z-index:99999;
        background:${INSTANCE_COLOR};color:#fff;
        font-family:Arial,sans-serif;font-size:13px;
        padding:6px 12px;text-align:center;
        box-shadow:0 2px 4px rgba(0,0,0,0.2);
      ">
        🖥️ ${INSTANCE_NAME} — Puerto ${PORT}
      </div>
      <style>body { padding-top: 32px !important; }</style>
    `;

    html = html.replace('</body>', `${banner}</body>`);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  });
}

app.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] Servidor corriendo en el puerto ${PORT} (color: ${INSTANCE_COLOR})`);
});