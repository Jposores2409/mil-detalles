import { useState, useEffect } from "react";
import { supabase, getProducts, createProduct, updateProduct, deleteProduct as dbDeleteProduct, uploadImage } from "./supabase.js";
 
// ── DATOS ────────────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1,  name: "Agenda 2025 Premium",      category: "Librería",   price: 4200,  stock: 15, description: "Tapa dura con cierre magnético, papel marfil 90g, 400 páginas.", emoji: "📒", tag: "Nuevo" },
  { id: 2,  name: "Set Marcadores Brush",      category: "Librería",   price: 2800,  stock: 30, description: "24 colores base acuosa, doble punta fina y brush, secado rápido.", emoji: "🖌️", tag: "Popular" },
  { id: 3,  name: "Perfume Noir Elixir",       category: "Perfumería", price: 18500, stock: 8,  description: "Fragancia oriental amaderada, 100ml EDP, duración 12hs.", emoji: "🌸", tag: "Exclusivo" },
  { id: 4,  name: "Perfume Citrus Fresh",      category: "Perfumería", price: 12400, stock: 12, description: "Notas cítricas y verdes, 80ml EDT, ideal para el día.", emoji: "🍋", tag: "" },
  { id: 5,  name: "Caja Regalo Deluxe",        category: "Regalería",  price: 6900,  stock: 20, description: "Incluye vela aromática, jabones artesanales y tarjeta personalizada.", emoji: "🎁", tag: "Popular" },
  { id: 6,  name: "Marco Portarretrato Gold",  category: "Regalería",  price: 3500,  stock: 25, description: "Marco metálico dorado 13x18cm, estilo art deco con relieve.", emoji: "🖼️", tag: "" },
  { id: 7,  name: "Cuaderno Bullet Journal",   category: "Librería",   price: 3100,  stock: 40, description: "Dotted A5, 200 hojas, tapa de cuero vegano, incluye stickers.", emoji: "📓", tag: "Nuevo" },
  { id: 8,  name: "Difusor Aromaterapia",      category: "Regalería",  price: 8200,  stock: 10, description: "Difusor ultrasónico LED multicolor 500ml, 7 colores, silencioso.", emoji: "🕊️", tag: "Exclusivo" },
  { id: 9,  name: "Perfume Rose Oud",          category: "Perfumería", price: 21000, stock: 5,  description: "Fusión de rosa búlgara y oud árabe, 90ml EDP, edición limitada.", emoji: "🌹", tag: "Exclusivo" },
  { id: 10, name: "Set Plumas Caligrafía",     category: "Librería",   price: 4800,  stock: 18, description: "6 plumas + 12 tintas de colores + guía de caligrafía incluida.", emoji: "✒️", tag: "" },
  { id: 11, name: "Vela Perfumada Luxury",     category: "Regalería",  price: 5400,  stock: 22, description: "Cera de soja natural, mecha de algodón, aroma vainilla & ámbar, 250g.", emoji: "🕯️", tag: "Popular" },
  { id: 12, name: "Perfume Aqua Marine",       category: "Perfumería", price: 9800,  stock: 15, description: "Fragancia fresca acuática, 60ml EDT, perfecto para verano.", emoji: "🌊", tag: "Nuevo" },
];
 
const ADMIN      = { email: "mildetalles.24", password: "mildetalles.24", name: "Administrador" };
const DEFAULT_CATEGORIES = ["Librería", "Regalería", "Perfumería"];
const fmt        = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
 
// ── PALETA MINIMALISTA ───────────────────────────────────────────────────────
const C = {
  bg:       "#fdf6ee",   // crema cálido del logo
  surface:  "#ffffff",
  border:   "#e8dfd0",
  borderDk: "#c9b99a",
  text:     "#1c2a3a",   // azul oscuro del logo
  muted:    "#7a8fa6",
  accent:   "#2b5f9e",   // azul principal del logo
  accentLt: "#e8f0fa",   // azul muy claro
  gold:     "#b8890b",   // dorado del logo
  goldLt:   "#fdf3dc",
  danger:   "#c0392b",
  success:  "#2d6a4f",
  tag: {
    Nuevo:     { bg: "#e8f0fa", color: "#2b5f9e" },
    Popular:   { bg: "#fdf3dc", color: "#96700a" },
    Exclusivo: { bg: "#f3f0f8", color: "#5a3e8a" },
  },
};
 
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  /* Paper texture on body */
  body {
    color: ${C.text};
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    background-color: #fdf6ee;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeBlend in='SourceGraphic' mode='multiply'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23paper)' opacity='0.45'/%3E%3C/svg%3E");
    background-size: 300px 300px;
  }
 
  /* Splash screen */
  .splash {
    position: fixed; inset: 0; z-index: 9000;
    background: #fdf6ee;
    display: flex; align-items: center; justify-content: center;
    animation: splashFade 0.5s ease-out 1.6s forwards;
    pointer-events: none;
  }
  .splash-logo {
    display: flex; align-items: baseline; gap: 10px;
    animation: splashLogoOut 0.55s cubic-bezier(0.4,0,0.2,1) 1.6s forwards;
  }
  @keyframes splashFade    { to { opacity: 0; visibility: hidden; } }
  @keyframes splashLogoOut { to { transform: translate(-50vw, -50vh) scale(0.55); opacity: 0; } }
 
  /* Nav logo fade-in after splash */
  .nav-logo {
    opacity: 0;
    animation: navLogoIn 0.4s ease-out 2.05s forwards;
  }
  @keyframes navLogoIn { to { opacity: 1; } }
  h1,h2,h3,h4 { font-family: 'Playfair Display', serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.borderDk}; border-radius: 2px; }
 
  /* Full-width wrapper — no max-width cap at mobile */
  .page-wrap { width: 100%; padding: 0 16px; }
  .nav { position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid ${C.border}; width: 100%; box-shadow: 0 1px 12px rgba(0,0,0,0.06); }
  .nav-inner { width: 100%; padding: 0 16px; height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
 
  /* ── BUTTONS ── */
  .btn-primary { background: ${C.accent}; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: opacity .15s, transform .15s; white-space: nowrap; }
  .btn-primary:hover   { opacity: .82; transform: translateY(-1px); }
  .btn-primary:active  { opacity: .7;  transform: translateY(0); }
  .btn-primary:disabled{ opacity: .35; cursor: not-allowed; transform: none; }
  .btn-outline { background: transparent; color: ${C.text}; border: 1px solid ${C.borderDk}; padding: 9px 18px; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 500; font-size: 13px; cursor: pointer; transition: background .15s; white-space: nowrap; }
  .btn-outline:hover { background: ${C.accentLt}; }
  .btn-ghost  { background: transparent; color: ${C.muted}; border: none; padding: 8px 12px; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 500; font-size: 13px; cursor: pointer; transition: background .15s, color .15s; white-space: nowrap; }
  .btn-ghost:hover { background: ${C.accentLt}; color: ${C.text}; }
  .btn-danger { background: ${C.danger}; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 12px; cursor: pointer; transition: opacity .15s; white-space: nowrap; }
  .btn-danger:hover { opacity: .82; }
  .btn-sm { padding: 7px 12px !important; font-size: 12px !important; }
 
  /* ── INPUTS ── */
  .input { background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text}; padding: 10px 14px; border-radius: 6px; font-family: 'Inter',sans-serif; font-size: 14px; width: 100%; outline: none; transition: border-color .15s, box-shadow .15s; }
  .input:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(26,26,24,.08); }
  .input::placeholder { color: ${C.muted}; }
  .input-search { padding-left: 38px !important; }
  .search-wrap { position: relative; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: ${C.muted}; font-size: 14px; pointer-events: none; }
  select.input option { background: #fff; }
  textarea.input { resize: vertical; }
 
  /* ── CARDS ── */
  .card { background: #ffffff; border: 1px solid ${C.border}; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: box-shadow .2s, border-color .2s, transform .2s; }
  .card:hover { border-color: ${C.borderDk}; box-shadow: 0 6px 28px rgba(0,0,0,0.13); transform: translateY(-3px); }
  .card-click { cursor: pointer; }
 
  /* ── TAGS & PILLS ── */
  .tag { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; font-family: 'Inter',sans-serif; }
  .pill { padding: 6px 14px; border-radius: 20px; border: 1px solid ${C.borderDk}; background: #e8e4de;color: ${C.muted}; font-family: 'Inter',sans-serif; font-weight: 500; font-size: 12px; cursor: pointer; transition: all .15s; white-space: nowrap; flex-shrink: 0; }
  .pill:hover  { border-color: ${C.borderDk}; color: ${C.text}; }
  .pill.active { background: ${C.accent}; color: #fff; border-color: ${C.accent}; }
 
  /* ── HERO ── */
  .hero { width: 100%; padding: 40px 16px 36px; text-align: center; border-bottom: 1px solid ${C.border}; }
 
  /* ── FILTERS ── */
  .filters-bar { width: 100%; border-bottom: 1px solid ${C.border}; padding: 12px 0; background: rgba(253,246,238,0.85); }
  .filters-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .pills-scroll { display: flex; gap: 6px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; flex: 1 1 auto; }
  .pills-scroll::-webkit-scrollbar { display: none; }
 
  /* ── MODAL: bottom-sheet on mobile ── */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.42); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn .18s; }
  .modal { background: ${C.surface}; border-radius: 20px 20px 0 0; padding: 20px 16px 32px; width: 100%; box-shadow: 0 -8px 40px rgba(0,0,0,.14); animation: sheetUp .26s ease-out; max-height: 90vh; overflow-y: auto; position: relative; }
  .modal-handle { width: 36px; height: 4px; background: ${C.borderDk}; border-radius: 2px; margin: 0 auto 18px; }
  @keyframes fadeIn  { from{opacity:0}     to{opacity:1} }
  @keyframes sheetUp { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
 
  /* ── PRODUCT GRID: 2 cols mobile-first ── */
  .product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
 
  /* ── ADMIN TABLE ── */
  .admin-table { width: 100%; border-collapse: collapse; }
  .admin-table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; color: ${C.muted}; letter-spacing: .8px; text-transform: uppercase; border-bottom: 1px solid ${C.border}; font-family: 'Inter',sans-serif; }
  .admin-table td { padding: 12px; border-bottom: 1px solid ${C.border}; font-size: 13px; vertical-align: middle; }
  .admin-table tr:last-child td { border-bottom: none; }
  .admin-table tbody tr { transition: background .12s; }
  .admin-table tbody tr:hover td { background: ${C.accentLt}; }
  .col-hide { display: none; }
 
  /* ── MISC ── */
  .divider       { border: none; border-top: 1px solid ${C.border}; }
  .section-label { font-family: 'Inter',sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: ${C.muted}; }
  /* Banner promoción */
  .promo-banner { width:100%; background: linear-gradient(90deg, ${C.accent}, #1a4a8a); color:#fff; padding: 10px 16px; text-align:center; font-family:'Inter',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.3px; position:relative; }
  .promo-banner-close { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.7); font-size:18px; cursor:pointer; line-height:1; padding:0 4px; }
  .promo-banner-close:hover { color:#fff; }
 
  /* Carrusel destacados */
  .carousel-wrap { overflow:hidden; position:relative; }
  .carousel-track { display:flex; gap:14px; transition: transform 0.4s cubic-bezier(0.4,0,0.2,1); will-change:transform; }
  .carousel-track .card { flex-shrink:0; width: 220px; }
  .carousel-btn { position:absolute; top:50%; transform:translateY(-50%); z-index:10; width:36px; height:36px; border-radius:50%; background:${C.surface}; border:1px solid ${C.borderDk}; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 10px rgba(0,0,0,0.12); transition:all 0.15s; font-size:16px; }
  .carousel-btn:hover { background:${C.accent}; color:#fff; border-color:${C.accent}; }
  .carousel-btn-left  { left: 0; }
  .carousel-btn-right { right: 0; }
 
  /* Favoritos */
  .fav-btn { position:absolute; top:10px; right:10px; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; box-shadow:0 1px 6px rgba(0,0,0,0.1); transition:transform 0.15s, background 0.15s; z-index:2; }
  .fav-btn:hover { transform:scale(1.15); }
  .fav-btn.active { background:#fff0f0; }
 
  /* Precio con descuento */
  .price-original { text-decoration:line-through; color:${C.muted}; font-size:12px; font-family:'Inter',sans-serif; }
  .price-discount  { background:#c0392b; color:#fff; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; font-family:'Inter',sans-serif; }
 
  .wa-float { position: fixed; bottom: 24px; right: 24px; z-index: 500; width: 56px; height: 56px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.5); cursor: pointer; border: none; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; animation: waPulse 2.5s ease-in-out infinite; }
  .wa-float:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(37,211,102,0.65); }
  @keyframes waPulse { 0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5)} 50%{box-shadow:0 4px 36px rgba(37,211,102,0.8)} }
 
  .toast { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; background: ${C.accent}; color: #fff; padding: 11px 20px; border-radius: 8px; font-family: 'Inter',sans-serif; font-weight: 600; font-size: 13px; box-shadow: 0 8px 32px rgba(0,0,0,.18); animation: slideUp .25s; white-space: nowrap; }
 
  /* ── TABLET 640px+ ── */
  @media (min-width: 640px) {
    .page-wrap    { max-width: 1160px; margin: 0 auto; padding: 0 28px; }
    .nav-inner    { max-width: 1160px; margin: 0 auto; padding: 0 28px; height: 62px; }
    .hero         { padding: 52px 0 44px; }
    .product-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .overlay      { align-items: center; padding: 24px; }
    .modal        { border-radius: 16px; padding: 36px; max-width: 520px; animation: slideUp .22s; }
    .modal-handle { display: none; }
    .col-hide     { display: table-cell; }
    .toast        { left: auto; right: 24px; transform: none; bottom: 24px; }
    .filters-row  { flex-wrap: nowrap; }
  }
 
  /* ── DESKTOP 1024px+ ── */
  @media (min-width: 1024px) {
    .page-wrap    { padding: 0 24px; }
    .nav-inner    { padding: 0 24px; }
    .hero         { padding: 60px 0 50px; }
    .product-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
  }
`;
 
// ── HELPERS ───────────────────────────────────────────────────────────────────
function Label({ text }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'Inter',sans-serif", marginBottom: 6 }}>{text}</p>;
}
 
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return <div className="toast">{msg}</div>;
}
 
// ── LOGIN MODAL ───────────────────────────────────────────────────────────────
function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const handle = () => {
    if (email === ADMIN.email && pass === ADMIN.password) { onLogin(); onClose(); }
    else setErr("Credenciales incorrectas.");
  };
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-handle" />
        <p className="section-label" style={{ marginBottom: 4 }}>Zona restringida</p>
        <h2 style={{ fontSize: 24, marginBottom: 28 }}>Acceso Administrador</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Label text="Usuario" /><input className="input" type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Usuario" /></div>
          <div><Label text="Contraseña" /><input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} /></div>
          {err && <p style={{ color: C.danger, fontSize: 13 }}>{err}</p>}
          <button className="btn-primary" style={{ width: "100%", padding: 13, marginTop: 4 }} onClick={handle}>Ingresar</button>
          <button className="btn-ghost" style={{ width: "100%", textAlign: "center" }} onClick={onClose}>← Volver a la tienda</button>
        </div>
 
      </div>
    </div>
  );
}
 
// ── PRODUCT DETAIL MODAL ──────────────────────────────────────────────────────
function ProductModal({ product, onClose, onAdd, isFav, onToggleFav }) {
  const tagStyle    = C.tag[product.tag] || {};
  const hasDiscount = product.discount > 0;
  const finalPrice  = hasDiscount ? product.price * (1 - product.discount/100) : product.price;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-handle" />
        <button onClick={onClose} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted, lineHeight: 1, padding: 4 }}>×</button>
 
        {/* Emoji hero */}
        <div style={{ background: C.accentLt, borderRadius: 10, height: 180, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, overflow: "hidden" }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 10 }} />
            : <span style={{ fontSize: 72 }}>{product.emoji || "📦"}</span>
          }
        </div>
 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="section-label">{product.category}</p>
            <h2 style={{ fontSize: 26, marginTop: 4, lineHeight: 1.2 }}>{product.name}</h2>
          </div>
          {product.tag && <span className="tag" style={{ background: tagStyle.bg, color: tagStyle.color, marginTop: 6 }}>{product.tag}</span>}
        </div>
 
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.75, margin: "16px 0" }}>{product.description}</p>
        <hr className="divider" />
 
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <p className="section-label">Precio</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginTop:4 }}>
              <p style={{ fontSize:28, fontFamily:"'Playfair Display',serif", fontWeight:700, color: hasDiscount ? C.danger : C.text }}>{fmt(finalPrice)}</p>
              {hasDiscount && <span className="price-original" style={{ fontSize:16 }}>{fmt(product.price)}</span>}
              {hasDiscount && <span className="price-discount" style={{ fontSize:12, padding:"3px 8px" }}>-{product.discount}%</span>}
            </div>
            <p style={{ fontSize: 12, marginTop: 5, fontWeight: 500, color: product.stock > 5 ? C.success : product.stock > 0 ? "#b8860b" : C.danger }}>
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock"}
            </p>
          </div>
          <button className="btn-primary" disabled={product.stock === 0} onClick={() => { onAdd(product.id); onClose(); }} style={{ padding: "12px 28px", fontSize: 14 }}>
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ── CART MODAL ────────────────────────────────────────────────────────────────
function CartModal({ cart, products, onClose, onUpdate, onCheckout }) {
  const items = Object.entries(cart).map(([id, qty]) => ({ ...products.find(p => p.id === Number(id)), qty })).filter(i => i.name);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22 }}>Tu carrito</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>×</button>
        </div>
 
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🛒</p>
            <p style={{ fontSize: 15 }}>El carrito está vacío</p>
            <button className="btn-outline" style={{ marginTop: 20 }} onClick={onClose}>Ver productos</button>
          </div>
        ) : (
          <>
            {items.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ width: 48, height: 48, background: C.accentLt, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    : <span>{item.emoji || "📦"}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{fmt(item.price)} c/u</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {[["−", item.qty - 1], ["+", item.qty + 1]].map(([label, val], j) => (
                    <button key={j} onClick={() => onUpdate(item.id, val)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {label}
                    </button>
                  ))}
                  <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center", fontSize: 14 }}>{item.qty}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: "right", flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
              </div>
            ))}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p className="section-label">Total</p>
                <p style={{ fontSize: 26, fontFamily: "'Playfair Display',serif", fontWeight: 700, marginTop: 2 }}>{fmt(total)}</p>
              </div>
              <button
                className="btn-primary"
                style={{ padding: "13px 24px", fontSize: 14, background: "#25D366", display: "flex", alignItems: "center", gap: 8 }}
                onClick={() => onCheckout(items, total)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.123 1.526 5.855L.057 23.04a.75.75 0 00.916.899l5.04-1.405A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.697-.504-5.243-1.383l-.374-.22-3.863 1.078 1.032-3.77-.241-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                Pedir por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
// ── PRODUCT FORM (admin) ──────────────────────────────────────────────────────
function ProductFormModal({ product, onSave, onClose, categories }) {
  const empty = { name: "", category: "Librería", price: "", stock: "", description: "", image: null, tag: "", discount: 0 };
  const [form, setForm] = useState(product ? { ...product, price: String(product.price), stock: String(product.stock) } : empty);
  const upd  = (k, v) => setForm(f => ({ ...f, [k]: v }));
 
  const [uploading, setUploading] = useState(false);
 
  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      upd("image", url);
    } catch { alert("Error al subir imagen"); }
    finally { setUploading(false); }
  };
 
  const save = () => {
    if (!form.name.trim() || !form.price || !form.stock) return;
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock), id: product?.id || Date.now() });
    onClose();
  };
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-handle" />
        <h2 style={{ fontSize: 22, marginBottom: 24 }}>{product ? "Editar producto" : "Nuevo producto"}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><Label text="Nombre" /><input className="input" value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Nombre del producto" /></div>
          <div>
            <Label text="Imagen del producto" />
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: "2px dashed " + C.border, borderRadius: 10, padding: "18px 12px", cursor: "pointer", background: C.accentLt, transition: "border-color 0.15s" }}>
              {form.image
                ? <img src={form.image} alt="preview" style={{ width: "100%", maxHeight: 140, objectFit: "contain", borderRadius: 8 }} />
                : <>
                    <span style={{ fontSize: 32 }}>🖼️</span>
                    <span style={{ fontSize: 13, color: C.muted }}>Tocá para subir una imagen</span>
                  </>
              }
              {uploading && <span style={{ fontSize: 12, color: C.muted }}>Subiendo...</span>}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><Label text="Precio ($)" /><input className="input" type="number" value={form.price} onChange={e => upd("price", e.target.value)} placeholder="0" /></div>
            <div><Label text="Stock" /><input className="input" type="number" value={form.stock} onChange={e => upd("stock", e.target.value)} placeholder="0" /></div>
            <div><Label text="Descuento (%)" /><input className="input" type="number" value={form.discount||0} onChange={e => upd("discount", e.target.value)} placeholder="0" min="0" max="99" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label text="Categoría" />
              <select className="input" value={form.category} onChange={e => upd("category", e.target.value)}>
                {(categories || DEFAULT_CATEGORIES).filter(c => c !== "Todos").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label text="Tag" />
              <select className="input" value={form.tag} onChange={e => upd("tag", e.target.value)}>
                {["", "Nuevo", "Popular", "Exclusivo"].map(t => <option key={t} value={t}>{t || "Sin tag"}</option>)}
              </select>
            </div>
          </div>
          <div><Label text="Descripción" /><textarea className="input" rows={3} value={form.description} onChange={e => upd("description", e.target.value)} placeholder="Descripción del producto" /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1, padding: 12 }} onClick={save}>Guardar</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
 
// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, onClick, isFav, onToggleFav }) {
  const tagStyle = C.tag[product.tag] || {};
  const hasDiscount = product.discount > 0;
  const finalPrice  = hasDiscount ? product.price * (1 - product.discount/100) : product.price;
  return (
    <div className="card card-click" onClick={() => onClick(product)} style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: C.accentLt, height: 140, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position:"relative" }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          : <span style={{ fontSize: 52 }}>{product.emoji || "📦"}</span>
        }
        <button className={`fav-btn ${isFav ? "active" : ""}`} onClick={e => { e.stopPropagation(); onToggleFav(product.id); }} title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}>
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>{product.category}</p>
          {product.tag && <span className="tag" style={{ background: tagStyle.bg, color: tagStyle.color }}>{product.tag}</span>}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 6 }}>{product.name}</h3>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:17, color: hasDiscount ? C.danger : C.text }}>{fmt(finalPrice)}</p>
            {hasDiscount && <span className="price-original">{fmt(product.price)}</span>}
            {hasDiscount && <span className="price-discount">-{product.discount}%</span>}
          </div>
          <p style={{ fontSize: 11, fontWeight: 500, color: product.stock > 5 ? C.success : product.stock > 0 ? "#b8860b" : C.danger }}>
            {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
          </p>
        </div>
      </div>
    </div>
  );
}
 
// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ products, onAdd, onEdit, onDelete, categories, onAddCategory, onDeleteCategory }) {
  const [showForm,   setShowForm]   = useState(false);
  const [editProd,   setEditProd]   = useState(null);
  const [search,     setSearch]     = useState("");
  const [cat,        setCat]        = useState("Todos");
  const [adminTab,   setAdminTab]   = useState("productos");
  const [newCatName, setNewCatName] = useState("");
 
  const filtered = products.filter(p =>
    (cat === "Todos" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="page-wrap" style={{ paddingTop: 28, paddingBottom: 60, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>Panel de control</p>
          <h2 style={{ fontSize: 28 }}>Administración</h2>
        </div>
        {adminTab === "productos" && <button className="btn-primary" onClick={() => { setEditProd(null); setShowForm(true); }}>+ Nuevo producto</button>}
      </div>
 
      {/* Pestañas */}
      <div style={{ display:"flex", gap:8, marginBottom:24, borderBottom:`1px solid ${C.border}`, paddingBottom:12 }}>
        {["productos","categorías","banner"].map(tab => (
          <button key={tab} className={`pill ${adminTab===tab?"active":""}`} onClick={() => setAdminTab(tab)} style={{ textTransform:"capitalize" }}>{tab}</button>
        ))}
      </div>
 
      {/* ── PESTAÑA CATEGORÍAS ── */}
      {adminTab === "categorías" && (
        <div className="card" style={{ padding:24, maxWidth:480 }}>
          <h3 style={{ fontSize:18, marginBottom:20 }}>Categorías</h3>
          <div style={{ display:"flex", gap:10, marginBottom:20 }}>
            <input className="input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nueva categoría..." onKeyDown={e => e.key==="Enter" && newCatName.trim() && (onAddCategory(newCatName.trim()), setNewCatName(""))} />
            <button className="btn-primary" style={{ flexShrink:0 }} onClick={() => { if(newCatName.trim()){ onAddCategory(newCatName.trim()); setNewCatName(""); } }}>Agregar</button>
          </div>
          {categories.filter(c => c !== "Todos").map(cat => (
            <div key={cat} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontWeight:500 }}>{cat}</span>
              {!DEFAULT_CATEGORIES.includes(cat) && (
                <button className="btn-danger btn-sm" onClick={() => onDeleteCategory(cat)}>Eliminar</button>
              )}
            </div>
          ))}
        </div>
      )}
 
      {/* ── PESTAÑA BANNER ── */}
      {adminTab === "banner" && (
        <div className="card" style={{ padding:24, maxWidth:480 }}>
          <h3 style={{ fontSize:18, marginBottom:20 }}>Banner de promoción</h3>
          <p style={{ color:C.muted, fontSize:13, marginBottom:12 }}>Este texto aparece en la franja superior de la tienda.</p>
          <textarea className="input" rows={3} defaultValue="🎁 ¡Envío gratis en compras mayores a $10.000!" id="bannerInput" />
          <button className="btn-primary" style={{ marginTop:12, width:"100%" }} onClick={() => {
            const val = document.getElementById("bannerInput").value;
            if(val) { window.__setBannerText && window.__setBannerText(val); }
          }}>Guardar banner</button>
        </div>
      )}
 
      {/* ── PESTAÑA PRODUCTOS ── */}
      {adminTab === "productos" && <>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: 200, maxWidth: 340 }}>
          <span className="search-icon">🔍</span>
          <input className="input input-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." />
        </div>
        <select className="input" value={cat} onChange={e => setCat(e.target.value)} style={{ width: "auto", minWidth: 140 }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
 
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th><th className="col-hide">Categoría</th><th>Precio</th><th>Stock</th><th className="col-hide">Tag</th><th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: C.muted, padding: 40 }}>Sin resultados</td></tr>
            ) : filtered.map(p => {
              const ts = C.tag[p.tag] || {};
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: C.accentLt, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.image
                          ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain"}} />
                          : <span style={{ fontSize: 18 }}>{p.emoji || "📦"}</span>
                        }
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="col-hide" style={{ color: C.muted, fontSize: 13 }}>{p.category}</td>
                  <td style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15 }}>{fmt(p.price)}</td>
                  <td style={{ fontWeight: 600, fontSize: 13, color: p.stock > 5 ? C.success : p.stock > 0 ? "#b8860b" : C.danger }}>{p.stock}</td>
                  <td className="col-hide">{p.tag ? <span className="tag" style={{ background: ts.bg, color: ts.color }}>{p.tag}</span> : <span style={{ color: C.muted }}>—</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn-outline btn-sm" onClick={() => { setEditProd(p); setShowForm(true); }}>Editar</button>
                      <button className="btn-danger btn-sm" onClick={() => onDelete(p.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
 
      {showForm && (
        <ProductFormModal product={editProd} categories={categories} onSave={editProd ? onEdit : onAdd} onClose={() => { setShowForm(false); setEditProd(null); }} />
      )}
      </>}
    </div>
  );
}
 
// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [user,       setUser]       = useState(null);
  const [cart,       setCart]       = useState({});
  const [view,       setView]       = useState("shop");
  const [showLogin,  setShowLogin]  = useState(false);
  const [showCart,   setShowCart]   = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("Todos");
  const [sortBy,     setSortBy]     = useState("default");
  const [toast,      setToast]      = useState(null);
  const [splashDone,  setSplashDone]  = useState(false);
  const [categories,  setCategories]  = useState(["Todos", ...DEFAULT_CATEGORIES]);
  const [favorites,   setFavorites]   = useState([]);
  const [showBanner,  setShowBanner]  = useState(true);
  const [bannerText,  setBannerText]  = useState("🎁 ¡Envío gratis en compras mayores a $10.000!");
 
  // Cargar productos desde Supabase
  useEffect(() => {
    getProducts()
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err  => { console.error(err); setLoading(false); });
  }, []);
 
  useEffect(() => { const t = setTimeout(() => setSplashDone(true), 2200); return () => clearTimeout(t); }, []);
 
  const showToast = (msg) => setToast(msg);
  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);
 
  const filtered = products
    .filter(p => (filterCat === "Todos" || p.category === filterCat) && p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "asc" ? a.price - b.price : sortBy === "desc" ? b.price - a.price : a.id - b.id);
 
  const toggleFav = (id) => setFavorites(fs => fs.includes(id) ? fs.filter(f => f !== id) : [...fs, id]);
 
  const addToCart  = (id) => { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })); showToast("Producto agregado al carrito ✓"); };
  const updateCart = (id, qty) => qty <= 0 ? setCart(c => { const n = { ...c }; delete n[id]; return n; }) : setCart(c => ({ ...c, [id]: qty }));
  const WA_NUMBER = "5493815779570";
 
  const checkout = (items, total) => {
    const lines = items.map(i => `• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`).join("%0A");
    const msg   = `Hola! Me gustaría hacer el siguiente pedido:%0A%0A${lines}%0A%0A*Total: ${fmt(total)}*`;
    window.open(`https://wa.me/5493815779570?text=${msg}`, "_blank");
    setCart({});
    setShowCart(false);
    showToast("Redirigiendo a WhatsApp 🎉");
  };
  const logout        = () => { setUser(null); setView("shop"); showToast("Sesión cerrada"); };
  const addCategory    = (name) => { if(!categories.includes(name)){ setCategories(cs => [...cs, name]); showToast("Categoría creada ✓"); } };
  const deleteCategory = (name) => { setCategories(cs => cs.filter(c => c !== name)); if(filterCat===name) setFilterCat("Todos"); showToast("Categoría eliminada"); };
 
  // Exponer setBannerText al panel admin
  useEffect(() => { window.__setBannerText = setBannerText; }, []);
 
  const addProduct = async (p) => {
    try {
      const saved = await createProduct(p);
      setProducts(ps => [...ps, saved]);
      showToast("Producto creado ✓");
    } catch { showToast("Error al crear producto"); }
  };
 
  const editProduct = async (p) => {
    try {
      const saved = await updateProduct(p.id, p);
      setProducts(ps => ps.map(x => x.id === saved.id ? saved : x));
      showToast("Producto actualizado ✓");
    } catch { showToast("Error al actualizar"); }
  };
 
  const deleteProduct = async (id) => {
    try {
      await dbDeleteProduct(id);
      setProducts(ps => ps.filter(p => p.id !== id));
      showToast("Producto eliminado");
    } catch { showToast("Error al eliminar"); }
  };
 
  return (
    <>
      <style>{css}</style>
 
      {/* SPLASH */}
      {!splashDone && (
        <div className="splash">
          <div className="splash-logo">
            <img src="/logo.jpg" alt="Mil Detalles" style={{ width: 'clamp(180px,45vw,300px)', height: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
      )}
 
      {/* BANNER PROMOCIÓN */}
      {showBanner && (
        <div className="promo-banner">
          <span>{bannerText}</span>
          <button className="promo-banner-close" onClick={() => setShowBanner(false)}>×</button>
        </div>
      )}
 
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo" style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setView("shop")}>
            <img src="/logo.jpg" alt="Mil Detalles" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {user && (
              <>
                <span style={{ fontSize: 12, color: C.muted }}>Admin</span>
                <button className={view === "admin" ? "btn-outline" : "btn-ghost"} style={view === "admin" ? { background: C.accentLt } : {}} onClick={() => setView(view === "admin" ? "shop" : "admin")}>Panel</button>
                <button className="btn-ghost" onClick={logout}>Salir</button>
              </>
            )}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowCart(true)}>
              <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px" }}>
                <span>🛒</span>
                {cartCount > 0 && <span style={{ fontWeight: 700, fontSize: 13 }}>{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </nav>
 
      {/* SHOP */}
      {view === "shop" && (
        <>
          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>⏳</p>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18 }}>Cargando productos...</p>
            </div>
          )}
 
          {/* Título destacado */}
          <div style={{
            background: "#ffffff",
            borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            padding: "clamp(28px,5vw,52px) 16px",
            textAlign: "center",
          }}>
            <h1 style={{
              fontSize: "clamp(36px,8vw,72px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              maxWidth: "90%",
              margin: "0 auto",
              fontWeight: 700,
              color: "#2b5f9e",
            }}>
              Mil Detalles
            </h1>
            <p style={{ color: "#b8890b", fontFamily:"'Inter',sans-serif", fontWeight: 600, fontSize: "clamp(13px,3vw,16px)", letterSpacing: 2, textTransform: "uppercase", marginTop: 12 }}>
              Librería · Regalería · Perfumería
            </p>
          </div>
 
          {/* CARRUSEL DESTACADOS */}
          {(() => {
            const featured = products.filter(p => p.tag === "Exclusivo" || p.tag === "Popular");
            if (featured.length === 0) return null;
            const [idx, setIdx] = useState(0);
            const visible = 1;
            const max = Math.max(0, featured.length - visible);
            return (
              <div style={{ padding: "24px 0 8px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
                <div className="page-wrap">
                  <p className="section-label" style={{ marginBottom: 14 }}>✨ Destacados</p>
                  <div style={{ position: "relative", padding: "0 44px" }}>
                    <button className="carousel-btn carousel-btn-left" onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx===0} style={{ opacity: idx===0 ? 0.3 : 1 }}>‹</button>
                    <div className="carousel-wrap">
                      <div className="carousel-track" style={{ transform: `translateX(-${idx * 234}px)` }}>
                        {featured.map(p => {
                          const tagStyle = C.tag[p.tag] || {};
                          const hasDiscount = p.discount > 0;
                          const finalPrice  = hasDiscount ? p.price * (1 - p.discount/100) : p.price;
                          return (
                            <div key={p.id} className="card card-click carousel-track" style={{ width: 220, padding: 0, overflow:"hidden", flexShrink:0 }} onClick={() => setSelected(p)}>
                              <div style={{ background: C.accentLt, height:120, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
                                {p.image ? <img src={p.image} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : <span style={{ fontSize:44 }}>{p.emoji||"📦"}</span>}
                                {p.tag && <span className="tag" style={{ position:"absolute", top:8, left:8, background:tagStyle.bg, color:tagStyle.color }}>{p.tag}</span>}
                              </div>
                              <div style={{ padding:"12px" }}>
                                <p style={{ fontWeight:600, fontSize:13, marginBottom:6, lineHeight:1.3 }}>{p.name}</p>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16, color: hasDiscount ? C.danger : C.text }}>{fmt(finalPrice)}</p>
                                  {hasDiscount && <span className="price-original">{fmt(p.price)}</span>}
                                  {hasDiscount && <span className="price-discount">-{p.discount}%</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button className="carousel-btn carousel-btn-right" onClick={() => setIdx(i => Math.min(max, i+1))} disabled={idx>=max} style={{ opacity: idx>=max ? 0.3 : 1 }}>›</button>
                  </div>
                </div>
              </div>
            );
          })()}
 
          {/* Filters */}
          <div className="filters-bar">
            <div className="page-wrap">
              <div className="filters-row">
                <div className="search-wrap" style={{ flex: "1 1 160px", maxWidth: 260 }}>
                  <span className="search-icon">🔍</span>
                  <input className="input input-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." />
                </div>
                <div className="pills-scroll" style={{ flex: "1 1 auto" }}>
                  {categories.map(cat => (
                    <button key={cat} className={`pill ${filterCat === cat ? "active" : ""}`} onClick={() => setFilterCat(cat)}>{cat}</button>
                  ))}
                </div>
                <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "auto", minWidth: 130, flexShrink: 0 }}>
                  <option value="default">Ordenar</option>
                  <option value="asc">Menor precio</option>
                  <option value="desc">Mayor precio</option>
                </select>
              </div>
            </div>
          </div>
 
          {/* Products */}
          <div className="page-wrap" style={{ paddingTop: 24, paddingBottom: 60, width: "100%" }}>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>{filtered.length} productos encontrados</p>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.muted }}>
                <p style={{ fontSize: 36, marginBottom: 14 }}>🔍</p>
                <p>Sin resultados para esa búsqueda</p>
              </div>
            ) : (
              <div className="product-grid">
                {filtered.map(p => <ProductCard key={p.id} product={p} onClick={setSelected} isFav={favorites.includes(p.id)} onToggleFav={toggleFav} />)}
              </div>
            )}
          </div>
 
          {/* Footer */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "28px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Lumina Store</p>
            <p style={{ color: C.muted, fontSize: 12 }}>© 2025 · Todos los derechos reservados</p>
            {!user && (
              <button onClick={() => setShowLogin(true)} style={{ marginTop: 14, background: "none", border: "none", color: "#ccc", fontSize: 11, cursor: "pointer", letterSpacing: 0.5 }}>
                Acceso administrativo
              </button>
            )}
          </div>
        </>
      )}
 
      {/* ADMIN */}
      {view === "admin" && user && (
        <AdminPanel products={products} onAdd={addProduct} onEdit={editProduct} onDelete={deleteProduct} categories={categories} onAddCategory={addCategory} onDeleteCategory={deleteCategory} />
      )}
 
      {/* MODALS */}
      {selected   && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} isFav={favorites.includes(selected.id)} onToggleFav={toggleFav} />}
      {showLogin  && <LoginModal onClose={() => setShowLogin(false)} onLogin={() => { setUser(ADMIN); showToast(`Bienvenido, ${ADMIN.name}`); }} />}
      {showCart   && <CartModal cart={cart} products={products} onClose={() => setShowCart(false)} onUpdate={updateCart} onCheckout={checkout} />}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
 
      {/* BOTÓN FLOTANTE WHATSAPP */}
      <a className="wa-float" href="https://wa.me/5493815779570" target="_blank" rel="noopener noreferrer" title="Contactanos por WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.556 4.123 1.526 5.855L.057 23.04a.75.75 0 00.916.899l5.04-1.405A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.697-.504-5.243-1.383l-.374-.22-3.863 1.078 1.032-3.77-.241-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>
    </>
  );
}
 