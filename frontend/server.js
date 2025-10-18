import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
