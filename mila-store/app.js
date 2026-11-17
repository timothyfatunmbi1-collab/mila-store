// EDIT THESE 3 LINES PER STORE. That is the only code you change.
const SHOP = {
  name: "Mila Varieties Store",
  tagline: "Varieties store • Order fast on WhatsApp",
  whatsapp: "2349117073171", // <-- REPLACE with her order number, no + or spaces
  deliveryNote: "Pay on delivery in Lagos. Transfer before waybill outside Lagos."
};

const APP_BASE = (() => { try { const s = document.currentScript && document.currentScript.src; if (s) return s.slice(0, s.lastIndexOf("/") + 1); } catch (e) {} return ""; })();

const grid = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const availOnly = document.getElementById("availOnly");
const countEl = document.getElementById("countEl");
const emptyEl = document.getElementById("emptyEl");
let PRODUCTS = [];

function naira(n) {
  return "₦" + Number(n).toLocaleString("en-NG");
}
function waLink(p, size) {
  const msg = `Hi ${SHOP.name}, I want ${p.id} - ${p.name} (${size}) ${naira(p.price)} (from website)`;
  return "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent(msg);
}
function cardHTML(p) {
  const sizes = (p.sizes && p.sizes.length ? p.sizes : ["One size"]);
  const opts = sizes.map(s => `<option>${s}</option>`).join("");
  const badge = p.available
    ? `<span class="badge ok">Available</span>`
    : `<span class="badge out">Sold out</span>`;
  const btn = p.available
    ? `<a class="order-btn" data-id="${p.id}" target="_blank" rel="noopener" href="#">Order on WhatsApp</a>`
    : `<span class="order-btn disabled">Sold out</span>`;
  return `<article class="card">
    <img loading="lazy" src="${p.img}" alt="${p.name}">
    <div class="card-body">
      <p class="pname">${p.name}</p>
      <div class="price">${naira(p.price)}</div>
      <div>${badge} <span class="sizes">${sizes.join(" / ")}</span></div>
      ${p.available ? `<select class="size-pick" data-id="${p.id}">${opts}</select>` : ""}
      <div class="btn-row">${btn}<button class="share-btn" data-share="${p.id}" title="Copy link">⧉</button></div>
    </div>
  </article>`;
}
function render() {
  const q = searchInput.value.trim().toLowerCase();
  const onlyAvail = availOnly.checked;
  const params = new URLSearchParams(location.search);
  const single = params.get("p");
  let list = PRODUCTS.slice();
  if (single) list = list.filter(p => p.id === single);
  if (q) list = list.filter(p => (p.name + " " + (p.sizes||[]).join(" ") + " " + p.price).toLowerCase().includes(q));
  if (onlyAvail) list = list.filter(p => p.available);
  grid.innerHTML = list.map(cardHTML).join("");
  emptyEl.hidden = list.length > 0;
  document.getElementById("singleWrap").hidden = !single;
  countEl.textContent = single ? "Shared product" : list.length + " items";
  // wire order buttons with picked size
  grid.querySelectorAll(".order-btn[data-id]").forEach(a => {
    const id = a.getAttribute("data-id");
    const p = PRODUCTS.find(x => x.id === id);
    const sel = grid.querySelector(`select[data-id="${id}"]`);
    const update = () => { a.href = waLink(p, sel ? sel.value : "One size"); };
    if (sel) sel.addEventListener("change", update);
    update();
  });
  grid.querySelectorAll("[data-share]").forEach(b => {
    b.onclick = async () => {
      const id = b.getAttribute("data-share");
      const url = location.origin + location.pathname + "?p=" + id;
      try { await navigator.clipboard.writeText(url); b.textContent = "✓"; }
      catch (e) { prompt("Copy this link:", url); }
      setTimeout(() => b.textContent = "⧉", 1200);
    };
  });
}
async function boot() {
  document.getElementById("shopNameEl").textContent = SHOP.name;
  const pt = document.getElementById("pageTitle"); if (pt) pt.textContent = SHOP.name + " - Shop";
  document.getElementById("shopTagEl").textContent = SHOP.tagline;
  document.getElementById("footEl").textContent = SHOP.deliveryNote;
  document.getElementById("chatShopBtn").href = "https://wa.me/" + SHOP.whatsapp + "?text=" + encodeURIComponent("Hi " + SHOP.name + " (from website)");
  let PRODUCTS_TMP = null;
  for (const u of ["src/mila-store/products.json", "./products.json", "./src/mila-store/products.json"]) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const j = await r.json();
      if (Array.isArray(j)) { PRODUCTS_TMP = j; break; }
    } catch (e) {}
  }
  if (!PRODUCTS_TMP) { countEl.textContent = "Could not load products.json"; return; }
  PRODUCTS = PRODUCTS_TMP;
  if (APP_BASE) PRODUCTS.forEach(p => { if (p.img && p.img.startsWith("./")) p.img = APP_BASE + p.img.slice(2); });
  searchInput.addEventListener("input", render);
  availOnly.addEventListener("change", render);
  document.getElementById("backBtn").onclick = () => {
    const u = new URL(location.href); u.searchParams.delete("p"); location.href = u.toString();
  };
  render();
}
boot();
