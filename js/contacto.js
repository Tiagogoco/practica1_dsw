// contacto.js: validación + alerta de éxito
(() => {
  const $ = (s) => document.querySelector(s);

  function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
  }

  function mostrarAlertaSuccess() {
    const cont = $("#alertas");
    cont.innerHTML = `
      <div class="alert alert-success d-flex align-items-center alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>
        <div><strong>¡Mensaje enviado exitosamente!</strong></div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
      </div>`;
    // Desaparece automáticamente después de 4s (opcional)
    setTimeout(() => {
      const alertEl = cont.querySelector(".alert");
      if (alertEl) bootstrap.Alert.getOrCreateInstance(alertEl).close();
    }, 4000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#formContacto");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const nombre = $("#nombre").value.trim();
      const correo = $("#correo").value.trim();
      const mensaje = $("#mensaje").value.trim();

      // Bootstrap validation UI
      if (!nombre || !correo || !mensaje || !emailValido(correo)) {
        if (!emailValido(correo)) {
          $("#correo").setCustomValidity("Correo inválido");
        } else {
          $("#correo").setCustomValidity("");
        }
        form.classList.add("was-validated");
        return;
      }

      // Simulación de envío exitoso
      mostrarAlertaSuccess();

      // Limpiar validaciones y formulario
      form.reset();
      form.classList.remove("was-validated");
      $("#correo").setCustomValidity("");
    });
  });
})();
