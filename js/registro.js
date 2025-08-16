const LS_KEY = "clientes";

const $ = (sel) => document.querySelector(sel);

function leerClientes() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarClientes(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

function formatearLinea(c) {
  return `Nombre: ${c.nombre} | Email: ${c.correo} | Destino: ${c.destino} | Personas: ${c.personas} | Fecha: ${c.fecha}`;
}

function emailValido(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(String(email).trim());
}

function fechaFutura(fechaStr) {
  if (!fechaStr) return false;
  const hoy = new Date(); // ahora
  hoy.setHours(0, 0, 0, 0); // inicio de hoy
  const f = new Date(fechaStr);
  return f.getTime() > hoy.getTime(); // estrictamente mayor
}

function mostrarAlerta(tipo, mensaje) {
  let cont = $("#alertas");
  if (!cont) {
    // crea un contenedor si no existe
    const form = $("#formRegistro");
    cont = document.createElement("div");
    cont.id = "alertas";
    cont.className = "my-3";
    form?.prepend(cont);
  }
  cont.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// --- Manejo del formulario ---
function manejarSubmit(e) {
  e.preventDefault();

  const nombre = $("#nombre")?.value.trim() || "";
  const correo = $("#correo")?.value.trim() || "";
  const destino = $("#destino")?.value || "";
  const personas = $("#personas")?.value;
  const fecha = $("#fecha")?.value || "";
  const comentarios = $("#comentarios")?.value?.trim() || "";

  // 1) Requeridos
  if (!nombre || !correo || !destino || !personas || !fecha) {
    mostrarAlerta(
      "warning",
      "Por favor, completa todos los campos obligatorios."
    );
    return;
  }

  // 2) Email
  if (!emailValido(correo)) {
    mostrarAlerta(
      "danger",
      "El correo electrónico no tiene un formato válido."
    );
    return;
  }

  // 3) Personas >= 1
  const nPersonas = Number(personas);
  if (!Number.isInteger(nPersonas) || nPersonas < 1) {
    mostrarAlerta(
      "danger",
      "El número de personas debe ser un entero mayor o igual a 1."
    );
    return;
  }

  // 4) Fecha futura
  if (!fechaFutura(fecha)) {
    mostrarAlerta("danger", "La fecha tentativa debe ser futura.");
    return;
  }

  const clientes = leerClientes();
  const nuevo = {
    nombre,
    correo,
    destino,
    personas: nPersonas,
    fecha,
    comentarios,
  };
  clientes.push(nuevo);
  guardarClientes(clientes);

  mostrarAlerta("success", "Registro guardado correctamente ✅");

  $("#formRegistro")?.reset();
  if ($("#destino")) $("#destino").selectedIndex = 0;
}

// --- Exportación a .txt ---
function exportarTXT() {
  const clientes = leerClientes();
  if (!clientes.length) {
    mostrarAlerta("info", "No hay registros para exportar.");
    return;
  }

  const lineas = clientes.map(formatearLinea).join("\n");
  const blob = new Blob([lineas], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clientes.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  mostrarAlerta("success", "Archivo clientes.txt generado ");
}

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  const form = $("#formRegistro");
  form?.addEventListener("submit", manejarSubmit);

  const btnExportar = $("#btnExportar");
  btnExportar?.addEventListener("click", exportarTXT);
});
