// js/clientes.js
const $ = (s) => document.querySelector(s);

// REGEX que parsea cada línea del txt
const REGEX_LINEA =
  /^Nombre:\s*(.*?)\s*\|\s*Email:\s*([^\s|]+)\s*\|\s*Destino:\s*(.*?)\s*\|\s*Personas:\s*(\d+)\s*\|\s*Fecha:\s*(\d{4}-\d{2}-\d{2})\s*$/;

function mostrarAlerta(tipo, mensaje) {
  const cont = $("#alertas");
  cont.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function parsearTxt(contenido) {
  const arr = [];
  const lineas = contenido
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const linea of lineas) {
    const m = linea.match(REGEX_LINEA);
    if (!m) continue;
    const [, nombre, correo, destino, personas, fecha] = m;
    arr.push({ nombre, correo, destino, personas: Number(personas), fecha });
  }
  return arr;
}

async function cargarDesdeTxt() {
  try {
    // Puedes usar '/data/clientes.txt' porque lo servimos estático
    const res = await fetch("/data/clientes.txt");
    if (!res.ok) throw new Error("No se pudo leer el TXT");
    const texto = await res.text();
    return parsearTxt(texto);
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderTabla(datos) {
  const tbody = $("#tablaClientes");
  tbody.innerHTML = "";

  if (!datos.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  datos.forEach((c, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nombre}</td>
      <td>${c.correo}</td>
      <td>${c.destino}</td>
      <td>${c.personas}</td>
      <td>${c.fecha}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" data-action="edit" data-index="${i}">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-action="del" data-index="${i}">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const datos = await cargarDesdeTxt();
  renderTabla(datos);
  mostrarAlerta("info", "Datos cargados desde clientes.txt");

  // Acciones (solo alertas; no escriben en el servidor)
  $("#tablaClientes").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "edit") {
      alert("La opción de editar no está disponible.");
      return;
    }
    if (action === "del") {
      alert("Eliminar no está disponible en esta versión.");
      return;
    }
  });
});
