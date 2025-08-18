// servicios.js: rellena el modal con los data-* del botón que lo abrió
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("modalPaquete");
  if (!modalEl) return;

  modalEl.addEventListener("show.bs.modal", (event) => {
    const btn = event.relatedTarget;
    if (!btn) return;

    const titulo = btn.getAttribute("data-title") || "Paquete";
    const precio = btn.getAttribute("data-price") || "";
    const desc = btn.getAttribute("data-desc") || "";
    const politStr = btn.getAttribute("data-policies") || "";
    const imgs = (btn.getAttribute("data-images") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Título, descripción y precio
    document.getElementById("modalTitulo").textContent = titulo;
    document.getElementById("modalDescripcion").textContent = desc;
    document.getElementById("modalPrecio").textContent = precio
      ? `Desde ${precio}`
      : "";

    // Políticas
    const ul = document.getElementById("modalPoliticas");
    ul.innerHTML = "";
    politStr
      .split("||")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((p) => {
        const li = document.createElement("li");
        li.textContent = p;
        ul.appendChild(li);
      });

    // Carousel
    const carousel = document.getElementById("modalCarousel");
    const inner = document.getElementById("modalCarouselInner");
    inner.innerHTML = "";

    if (imgs.length) {
      imgs.forEach((src, i) => {
        const item = document.createElement("div");
        item.className = `carousel-item ${i === 0 ? "active" : ""}`;
        item.innerHTML = `<img src="${src}" class="d-block w-100" alt="${titulo}" loading="lazy">`;
        inner.appendChild(item);
      });
      carousel.classList.remove("d-none");
    } else {
      carousel.classList.add("d-none");
    }
  });
});
