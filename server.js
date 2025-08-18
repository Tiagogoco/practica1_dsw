const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const TXT_PATH = path.join(DATA_DIR, "clientes.txt");

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(TXT_PATH)) fs.writeFileSync(TXT_PATH, "", "utf-8");
}

// middlewares
app.use(express.json());
app.use(express.static(ROOT));

// Endpoint para agregar un registro
app.post("/api/registro", (req, res) => {
  const {
    nombre,
    correo,
    destino,
    personas,
    fecha,
    comentarios = "",
  } = req.body || {};

  // Validaciones básicas en el server
  if (!nombre || !correo || !destino || !personas || !fecha) {
    return res.status(400).json({ ok: false, msg: "Faltan campos" });
  }

  // línea en el formato pedido (una por cliente)
  const linea = `Nombre: ${nombre} | Email: ${correo} | Destino: ${destino} | Personas: ${Number(
    personas
  )} | Fecha: ${fecha}`;

  try {
    ensureData();
    fs.appendFileSync(TXT_PATH, linea + "\n", "utf-8");
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error al guardar" });
  }
});

app.get("/api/clientes.txt", (req, res) => {
  ensureData();
  res.type("text/plain");
  res.send(fs.readFileSync(TXT_PATH, "utf-8"));
});

app.listen(PORT, () => {
  ensureData();
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});
