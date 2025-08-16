// --- Config y utilidades ---
const LS_KEY = "clientes";
const $ = (s) => document.querySelector(s);

function leerLS() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}
function guardarLS(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function mostrarAlerta(tipo, mensaje) {
  const cont = $("#alertas");
  cont.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function formatearLinea(c) {
  return `Nombre: ${c.nombre} | Email: ${c.correo} | Destino: ${c.destino} | Personas: ${c.personas} | Fecha: ${c.fecha}`;
}

// --- Render de tabla ---
let datos = []; // fuente actual (LS o importación)

function renderTabla() {
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

// --- Carga desde LocalStorage ---
function cargarDesdeLS() {
  datos = leerLS();
  renderTabla();
  mostrarAlerta("info", "Datos cargados desde LocalStorage.");
}

// --- Exportar a .txt lo que se ve en la tabla ---
function exportarTXT() {
  if (!datos.length) {
    mostrarAlerta("warning", "No hay registros para exportar.");
    return;
  }
  const texto = datos.map(formatearLinea).join("\n");
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clientes.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  mostrarAlerta("success", "Archivo clientes.txt exportado.");
}

// --- Importar desde un archivo .txt ---
// Formato esperado por línea:
// Nombre: X | Email: Y | Destino: Z | Personas: N | Fecha: YYYY-MM-DD
const REGEX_LINEA =
  /^Nombre:\s*(.*?)\s*\|\s*Email:\s*([^\s|]+)\s*\|\s*Destino:\s*(.*?)\s*\|\s*Personas:\s*(\d+)\s*\|\s*Fecha:\s*(\d{4}-\d{2}-\d{2})\s*$/;

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
    arr.push({
      nombre,
      correo,
      destino,
      personas: Number(personas),
      fecha,
    });
  }
  return arr;
}

function importarDesdeArchivo(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const texto = ev.target.result;
    const arr = parsearTxt(texto);
    if (!arr.length) {
      mostrarAlerta("danger", "El archivo no tiene el formato esperado.");
      return;
    }
    datos = arr;
    renderTabla();
    // Opcional: también guardamos en LS para persistir
    guardarLS(datos);
    mostrarAlerta(
      "success",
      "Clientes importados desde .txt y guardados en LocalStorage."
    );
  };
  reader.readAsText(file, "utf-8");
}

// --- Acciones: editar / eliminar ---
function abrirModalEditar(idx) {
  const c = datos[idx];
  $("#editIndex").value = idx;
  $("#editNombre").value = c.nombre;
  $("#editCorreo").value = c.correo;
  $("#editDestino").value = c.destino;
  $("#editPersonas").value = c.personas;
  $("#editFecha").value = c.fecha;

  const modal = new bootstrap.Modal($("#modalEditar"));
  modal.show();
}

function eliminarRegistro(idx) {
  datos.splice(idx, 1);
  renderTabla();
  guardarLS(datos);
  mostrarAlerta("success", "Registro eliminado.");
}

// --- Validaciones básicas para edición ---
function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}
function fechaFuturaOIgual(fechaStr) {
  // para edición puedes permitir igual o futura; si quieres estrictamente futura, cambia >
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fechaStr);
  return f.getTime() >= hoy.getTime();
}

// --- Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  // Cargar de LS inicialmente
  cargarDesdeLS();

  // Clicks en acciones de la tabla (delegación)
  $("#tablaClientes").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    const action = btn.dataset.action;
    if (action === "edit") {
      alert("La opción de editar no está disponible.");
      return;
    }
    if (action === "del") eliminarRegistro(idx);
  });

  // Guardar edición
  $("#formEditar").addEventListener("submit", (e) => {
    e.preventDefault();
    const idx = Number($("#editIndex").value);
    const nombre = $("#editNombre").value.trim();
    const correo = $("#editCorreo").value.trim();
    const destino = $("#editDestino").value.trim();
    const personas = Number($("#editPersonas").value);
    const fecha = $("#editFecha").value;

    if (!nombre || !correo || !destino || !personas || !fecha) {
      mostrarAlerta("warning", "Completa todos los campos.");
      return;
    }
    if (!emailValido(correo)) {
      mostrarAlerta("danger", "Email inválido.");
      return;
    }
    if (!(Number.isInteger(personas) && personas >= 1)) {
      mostrarAlerta("danger", "Personas debe ser entero ≥ 1.");
      return;
    }
    if (!fechaFuturaOIgual(fecha)) {
      mostrarAlerta("danger", "La fecha debe ser hoy o futura.");
      return;
    }

    datos[idx] = { nombre, correo, destino, personas, fecha };
    guardarLS(datos);
    renderTabla();
    bootstrap.Modal.getInstance($("#modalEditar")).hide();
    mostrarAlerta("success", "Cambios guardados.");
  });

  // Importar .txt
  $("#fileTxt").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importarDesdeArchivo(file);
    e.target.value = ""; // reset
  });

  // Exportar .txt
  $("#btnExportar").addEventListener("click", exportarTXT);

  // Recargar desde LocalStorage
  $("#btnRecargarLS").addEventListener("click", cargarDesdeLS);
});
