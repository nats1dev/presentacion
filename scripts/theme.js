/* Toggle de tema claro/oscuro, persistente. */
(function () {
  var KEY = "tesis-theme";
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "dark" || saved === "light") {
    root.setAttribute("data-theme", saved);
  } else {
    root.setAttribute("data-theme", "light");
  }

  function icon() {
    return root.getAttribute("data-theme") === "dark" ? "☀" : "☾";
  }

  function build() {
    var btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.setAttribute("aria-label", "Cambiar tema claro/oscuro");
    btn.title = "Tema claro / oscuro";
    btn.textContent = icon();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      btn.textContent = icon();
      window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
    });
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
