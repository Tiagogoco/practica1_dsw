// js/registro.js
const $ = (s) => document.querySelector(s);

function mostrarAlerta(tipo, mensaje) {
  let cont = $("#alertas");
  if (!cont) {
    cont = document.createElement("div");
    cont.id = "alertas";
    $("#formRegistro").prepend(cont);
  }
  cont.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
}
function fechaFutura(fechaStr) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fechaStr);
  return f.getTime() > hoy.getTime();
}

document.addEventListener("DOMContentLoaded", () => {
  $("#formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = $("#nombre").value.trim();
    const correo = $("#correo").value.trim();
    const destino = $("#destino").value;
    const personas = Number($("#personas").value);
    const fecha = $("#fecha").value;
    const comentarios = $("#comentarios").value.trim();

    // Validaciones
    if (!nombre || !correo || !destino || !personas || !fecha) {
      mostrarAlerta("warning", "Completa todos los campos obligatorios.");
      return;
    }
    if (!emailValido(correo)) {
      mostrarAlerta("danger", "El correo no es válido.");
      return;
    }
    if (!(Number.isInteger(personas) && personas >= 1)) {
      mostrarAlerta("danger", "Personas debe ser un entero ≥ 1.");
      return;
    }
    if (!fechaFutura(fecha)) {
      mostrarAlerta("danger", "La fecha debe ser futura.");
      return;
    }

    // Enviar al backend
    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          destino,
          personas,
          fecha,
          comentarios,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.msg || "Error al guardar");

      mostrarAlerta("success", "Registro guardado correctamente ✅");
      e.target.reset();
      if ($("#destino")) $("#destino").selectedIndex = 0;
    } catch (err) {
      console.error(err);
      mostrarAlerta("danger", "Ocurrió un error al guardar. Intenta de nuevo.");
    }
  });
});
