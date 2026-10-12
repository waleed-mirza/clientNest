import { colorSchemeStorageKey } from "@/lib/theme/presets";

const script = `(function(){
  var key = ${JSON.stringify(colorSchemeStorageKey)};
  function resolved(pref) {
    if (pref === "dark") return "dark";
    if (pref === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncButtons(pref) {
    document.querySelectorAll("[data-set-scheme]").forEach(function (btn) {
      var on = btn.getAttribute("data-set-scheme") === pref;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("bg-accent", on);
      btn.classList.toggle("text-accent-foreground", on);
      btn.classList.toggle("text-muted", !on);
    });
  }
  function apply(pref) {
    if (pref !== "light" && pref !== "dark" && pref !== "system") pref = "light";
    document.documentElement.dataset.schemePref = pref;
    document.documentElement.dataset.colorScheme = resolved(pref);
    try { localStorage.setItem(key, pref); } catch (e) {}
    syncButtons(pref);
    document.dispatchEvent(new CustomEvent("clientnest-scheme", { detail: pref }));
  }
  try {
    apply(localStorage.getItem(key) || "light");
  } catch (e) {
    apply("light");
  }
  document.addEventListener("click", function (event) {
    var node = event.target && event.target.closest && event.target.closest("[data-set-scheme]");
    if (!node) return;
    apply(node.getAttribute("data-set-scheme"));
  });
})();`;

export function ColorSchemeScript() {
  return <script id="clientnest-color-scheme" dangerouslySetInnerHTML={{ __html: script }} />;
}
