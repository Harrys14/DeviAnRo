import "../styles/cuenta.css";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { getMisPedidos } from "../services/strapi";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

/* =========================================================
   NAVEGACIÓN PRINCIPAL DE LA CUENTA
========================================================= */
const MENU_NAV = [
  {
    id: "perfil",
    icon: "👤",
    title: "Mi perfil",
    desc: "Foto, nombres, contacto",
    group: "Cuenta",
  },
  {
    id: "pedidos",
    icon: "📜",
    title: "Mis pedidos",
    desc: "Historial y seguimiento",
    group: "Cuenta",
  },
  {
    id: "favoritos",
    icon: "❤️",
    title: "Favoritos",
    desc: "Productos guardados",
    group: "Cuenta",
  },
  {
    id: "direcciones",
    icon: "📍",
    title: "Direcciones",
    desc: "Entrega y facturación",
    group: "Compras",
  },
  {
    id: "pagos",
    icon: "💳",
    title: "Métodos de pago",
    desc: "Tarjetas guardadas",
    group: "Compras",
  },
  {
    id: "seguridad",
    icon: "🔒",
    title: "Seguridad",
    desc: "Contraseña y 2FA",
    group: "Privacidad",
  },
  {
    id: "preferencias",
    icon: "⚙️",
    title: "Preferencias",
    desc: "Tema, notificaciones",
    group: "Privacidad",
  },
  {
    id: "ayuda",
    icon: "💬",
    title: "Ayuda y soporte",
    desc: "FAQ, contacto",
    group: "Privacidad",
  },
];

/* =========================================================
   FAVORITOS — localStorage
========================================================= */
const FAV_KEY = "devianro_favoritos";
const leerFavoritos = () => {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const guardarFavoritos = (arr) => {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  } catch {}
};

/* =========================================================
   DIRECCIONES — localStorage
========================================================= */
const DIR_KEY = "devianro_direcciones";
const leerDirecciones = () => {
  try {
    const raw = localStorage.getItem(DIR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const guardarDirecciones = (arr) => {
  try {
    localStorage.setItem(DIR_KEY, JSON.stringify(arr));
  } catch {}
};

/* =========================================================
   TARJETAS — localStorage
========================================================= */
const PAY_KEY = "devianro_pagos";
const leerPagos = () => {
  try {
    const raw = localStorage.getItem(PAY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const guardarPagos = (arr) => {
  try {
    localStorage.setItem(PAY_KEY, JSON.stringify(arr));
  } catch {}
};

/* =========================================================
   PREFERENCIAS — localStorage
========================================================= */
const PREF_KEY = "devianro_preferencias";
const leerPreferencias = () => {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    return Object.assign(
      {
        notifPromos: true,
        notifPedidos: true,
        notifNovedades: false,
        emailMarketing: true,
        moneda: "COP",
        idioma: "es",
        ordenRecomendados: "populares",
      },
      raw ? JSON.parse(raw) : {}
    );
  } catch {
    return {
      notifPromos: true,
      notifPedidos: true,
      notifNovedades: false,
      emailMarketing: true,
      moneda: "COP",
      idioma: "es",
      ordenRecomendados: "populares",
    };
  }
};
const guardarPreferencias = (obj) => {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(obj));
  } catch {}
};

/* =========================================================
   HELPERS
========================================================= */
const uid = () => Math.random().toString(36).slice(2, 10);
const enmascararTarjeta = (n) => {
  const clean = String(n || "").replace(/\D/g, "");
  return clean.length >= 4
    ? `•••• •••• •••• ${clean.slice(-4)}`
    : "•••• •••• •••• ••••";
};
const tipoTarjeta = (n) => {
  const clean = String(n || "").replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  return "card";
};
const iconoTarjeta = (t) =>
  ({ visa: "VISA", mastercard: "MC", amex: "AMEX", card: "💳" }[t] || "💳");

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */
function Cuenta() {
  const { user } = useUser();
  const clerk = useClerk();
  const { signOut, openChangePassword, openUserProfile } = clerk;
  const { showToast } = useToast();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [vista, setVista] = useState("perfil");
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  const [favoritos, setFavoritos] = useState(() => leerFavoritos());
  const [direcciones, setDirecciones] = useState(() => leerDirecciones());
  const [pagos, setPagos] = useState(() => leerPagos());
  const [preferencias, setPreferencias] = useState(() => leerPreferencias());

  /* ---------- Pedidos ---------- */
  useEffect(() => {
    if (vista !== "pedidos" || !user?.id) return;
    const cargarMisPedidos = async () => {
      setCargandoPedidos(true);
      try {
        const data = await getMisPedidos(user.id);
        setPedidos(data || []);
      } catch (error) {
        console.error("Error cargando mis pedidos:", error);
        setPedidos([]);
        showToast("No se pudieron cargar tus pedidos", "error");
      } finally {
        setCargandoPedidos(false);
      }
    };
    cargarMisPedidos();
  }, [vista, user?.id, showToast]);

  const atributosPedido = (p) => p.attributes || p;

  /* ---------- Persistir cuando cambien ---------- */
  useEffect(() => guardarFavoritos(favoritos), [favoritos]);
  useEffect(() => guardarDirecciones(direcciones), [direcciones]);
  useEffect(() => guardarPagos(pagos), [pagos]);
  useEffect(() => guardarPreferencias(preferencias), [preferencias]);

  /* ---------- Sync preferencias.theme con ThemeContext ---------- */
  useEffect(() => {
    if (preferencias.tema && preferencias.tema !== theme) {
      setTheme(preferencias.tema);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grupos = useMemo(() => {
    const g = {};
    MENU_NAV.forEach((m) => {
      if (!g[m.group]) g[m.group] = [];
      g[m.group].push(m);
    });
    return g;
  }, []);

  return (
    <Layout headerProps={{ showBack: false }}>
      <div className="cuenta-page">
        {/* ============ HEADER DE PERFIL ============ */}
        <div className="cuenta-hero">
          <div className="cuenta-hero-bg" />
          <div className="cuenta-hero-content">
            <div className="cuenta-hero-left">
              <div className="cuenta-hero-avatar">
                <img
                  src={user?.imageUrl || "https://via.placeholder.com/150"}
                  alt={user?.fullName || "Usuario"}
                />
                <div className="cuenta-hero-status" title="En línea">
                  ●
                </div>
              </div>
              <div className="cuenta-hero-text">
                <div className="cuenta-hero-chip">
                  <span>✨</span> Cliente Verificado
                </div>
                <h1>
                  ¡Hola, {user?.firstName || user?.fullName || "amigo"}! 👋
                </h1>
                <p>
                  {user?.primaryEmailAddress?.emailAddress || "inicia sesión para ver tu cuenta"}
                </p>
              </div>
            </div>
            <div className="cuenta-hero-stats">
              <div className="stat">
                <div className="stat-num">{pedidos.length}</div>
                <div className="stat-label">Pedidos</div>
              </div>
              <div className="stat">
                <div className="stat-num">{favoritos.length}</div>
                <div className="stat-label">Favoritos</div>
              </div>
              <div className="stat">
                <div className="stat-num">{direcciones.length}</div>
                <div className="stat-label">Direcciones</div>
              </div>
              <div className="stat">
                <div className="stat-num">{pagos.length}</div>
                <div className="stat-label">Tarjetas</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ LAYOUT: SIDEBAR + CONTENT ============ */}
        <div className="cuenta-shell">
          {/* SIDEBAR */}
          <aside className="cuenta-sidebar g-card is-elevated">
            {Object.entries(grupos).map(([grupo, items]) => (
              <div className="cuenta-nav-group" key={grupo}>
                <div className="cuenta-nav-group-title">{grupo}</div>
                <div className="cuenta-nav-list">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setVista(it.id)}
                      className={`cuenta-nav-item ${
                        vista === it.id ? "is-active" : ""
                      }`}
                    >
                      <span className="cuenta-nav-icon">{it.icon}</span>
                      <span className="cuenta-nav-text">
                        <span className="cuenta-nav-title">{it.title}</span>
                        <span className="cuenta-nav-desc">{it.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="cuenta-sidebar-footer">
              <button
                type="button"
                className="cuenta-logout-btn"
                onClick={() => signOut({ redirectUrl: "/home" })}
              >
                <span>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="cuenta-content">
            {vista === "perfil" && (
              <SeccionPerfil
                user={user}
                showToast={showToast}
              />
            )}

            {vista === "pedidos" && (
              <SeccionPedidos
                pedidos={pedidos}
                cargando={cargandoPedidos}
                atributosPedido={atributosPedido}
                setVista={setVista}
              />
            )}

            {vista === "favoritos" && (
              <SeccionFavoritos
                items={favoritos}
                setItems={setFavoritos}
                showToast={showToast}
              />
            )}

            {vista === "direcciones" && (
              <SeccionDirecciones
                items={direcciones}
                setItems={setDirecciones}
                showToast={showToast}
              />
            )}

            {vista === "pagos" && (
              <SeccionPagos
                items={pagos}
                setItems={setPagos}
                showToast={showToast}
              />
            )}

            {vista === "seguridad" && (
              <SeccionSeguridad
                user={user}
                openChangePassword={openChangePassword}
                openUserProfile={openUserProfile}
                showToast={showToast}
              />
            )}

            {vista === "preferencias" && (
              <SeccionPreferencias
                preferencias={preferencias}
                setPreferencias={setPreferencias}
                theme={theme}
                toggleTheme={toggleTheme}
                showToast={showToast}
              />
            )}

            {vista === "ayuda" && <SeccionAyuda showToast={showToast} />}
          </main>
        </div>
      </div>
    </Layout>
  );
}

/* =========================================================
   SECCIÓN 1 — PERFIL EDITABLE (Clerk)
========================================================= */
function SeccionPerfil({ user, showToast }) {
  const fileRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.primaryPhoneNumber?.phoneNumber || "",
    documento: user?.unsafeMetadata?.documento || "",
    genero: user?.unsafeMetadata?.genero || "otro",
    cumpleanos: user?.unsafeMetadata?.cumpleanos || "",
    bio: user?.unsafeMetadata?.bio || "",
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.primaryPhoneNumber?.phoneNumber || "",
      documento: user?.unsafeMetadata?.documento || "",
      genero: user?.unsafeMetadata?.genero || "otro",
      cumpleanos: user?.unsafeMetadata?.cumpleanos || "",
      bio: user?.unsafeMetadata?.bio || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        unsafeMetadata: {
          documento: form.documento,
          genero: form.genero,
          cumpleanos: form.cumpleanos,
          bio: form.bio,
        },
      });
      if (form.phoneNumber) {
        try {
          const exists = user.phoneNumbers.find(
            (p) => p.phoneNumber === form.phoneNumber
          );
          if (!exists) {
            await user.createPhoneNumber({
              phoneNumber: form.phoneNumber,
            });
          }
        } catch (err) {
          console.warn("No se pudo actualizar teléfono:", err);
        }
      }
      showToast("Perfil actualizado correctamente", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al guardar tu perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  const subirFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("La imagen debe ser menor a 5 MB", "error");
      return;
    }
    try {
      await user.setProfileImage({ file });
      showToast("Foto actualizada", "success");
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar la foto", "error");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">👤 Mi perfil</h2>
      <p className="g-section-sub">
        Actualiza tu información personal, foto y datos de contacto. Los cambios
        se guardan directamente en tu cuenta.
      </p>

      <div className="g-card perfil-avatar-card">
        <div className="g-avatar-wrap">
          <img
            src={user?.imageUrl || "https://via.placeholder.com/150"}
            alt={user?.fullName || "Usuario"}
          />
          <label className="g-avatar-edit" title="Cambiar foto">
            📷
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={subirFoto}
            />
          </label>
        </div>
        <div className="perfil-avatar-info">
          <h3>{user?.fullName || "Usuario"}</h3>
          <p>{user?.primaryEmailAddress?.emailAddress || ""}</p>
          <div className="perfil-avatar-chips">
            <span className="g-chip is-success">✓ Verificado</span>
            <span className="g-chip">
              ID: {user?.id ? user.id.slice(0, 8) + "…" : "—"}
            </span>
            <span className="g-chip is-muted">
              Miembro desde{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("es-CO")
                : "hoy"}
            </span>
          </div>
        </div>
      </div>

      <form className="g-card" onSubmit={guardar}>
        <h3 style={{ marginBottom: 18, fontSize: 17 }}>
          📋 Datos personales
        </h3>
        <div className="g-form-grid">
          <div className="g-field">
            <label className="g-label">
              Nombre<span className="req">*</span>
            </label>
            <input
              className="g-input"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ej: Camilo"
              required
            />
          </div>
          <div className="g-field">
            <label className="g-label">
              Apellido<span className="req">*</span>
            </label>
            <input
              className="g-input"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Ej: Pérez"
              required
            />
          </div>
          <div className="g-field">
            <label className="g-label">Correo electrónico</label>
            <input
              className="g-input"
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ""}
              disabled
              placeholder="El correo se gestiona desde la seguridad de tu cuenta"
            />
            <small style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
              Para cambiar tu correo usa el panel de{" "}
              <a
                className="link-primary"
                onClick={() => user && clerkOpenUser(user)}
                style={{ cursor: "pointer", color: "var(--color-primary)", fontWeight: 700 }}
              >
                seguridad
              </a>
            </small>
          </div>
          <div className="g-field">
            <label className="g-label">Teléfono / Celular</label>
            <input
              className="g-input"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              type="tel"
            />
          </div>
          <div className="g-field">
            <label className="g-label">Documento (CC / NIT)</label>
            <input
              className="g-input"
              name="documento"
              value={form.documento}
              onChange={handleChange}
              placeholder="Ej: 1023456789"
            />
          </div>
          <div className="g-field">
            <label className="g-label">Género</label>
            <select
              className="g-select"
              name="genero"
              value={form.genero}
              onChange={handleChange}
            >
              <option value="mujer">Mujer</option>
              <option value="hombre">Hombre</option>
              <option value="otro">Otro / Prefiero no decir</option>
            </select>
          </div>
          <div className="g-field">
            <label className="g-label">Fecha de nacimiento</label>
            <input
              className="g-input"
              type="date"
              name="cumpleanos"
              value={form.cumpleanos}
              onChange={handleChange}
            />
          </div>
          <div className="g-field is-full">
            <label className="g-label">Sobre ti</label>
            <textarea
              className="g-textarea"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Cuéntanos algo sobre ti, alergias, preferencias alimentarias... (opcional)"
              maxLength={300}
            />
            <small style={{ color: "var(--color-text-muted)", textAlign: "right", marginTop: 4 }}>
              {form.bio.length}/300
            </small>
          </div>
        </div>
        <div className="g-form-actions">
          <button
            type="button"
            className="g-btn-ghost"
            onClick={() =>
              setForm({
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                phoneNumber: user?.primaryPhoneNumber?.phoneNumber || "",
                documento: user?.unsafeMetadata?.documento || "",
                genero: user?.unsafeMetadata?.genero || "otro",
                cumpleanos: user?.unsafeMetadata?.cumpleanos || "",
                bio: user?.unsafeMetadata?.bio || "",
              })
            }
          >
            Deshacer cambios
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ minWidth: 180 }}
          >
            {saving ? "⏳ Guardando…" : "💾 Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

function clerkOpenUser() {
  try {
    const w = window;
    if (w.Clerk) w.Clerk.openUserProfile();
  } catch {}
}

/* =========================================================
   SECCIÓN 2 — PEDIDOS
========================================================= */
function SeccionPedidos({ pedidos, cargando, atributosPedido, setVista }) {
  const estadoColor = (st) => {
    const s = String(st || "").toLowerCase();
    if (["entregado", "completado", "listo"].includes(s)) return "success";
    if (["en camino", "enviado", "preparando"].includes(s)) return "warning";
    if (["cancelado", "rechazado"].includes(s)) return "danger";
    return "";
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">📜 Mis pedidos</h2>
      <p className="g-section-sub">
        Consulta el historial, seguimiento y detalle de todos tus pedidos.
      </p>

      {cargando ? (
        <div className="pedidos-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="g-card" key={i}>
              <div className="skeleton" style={{ height: 22, width: "30%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 20, width: "25%", marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="g-card">
          <div className="g-empty">
            <div className="g-empty-emoji">📦</div>
            <div className="g-empty-title">Aún no tienes pedidos</div>
            <div className="g-empty-msg">
              Explora nuestro delicioso catálogo y haz tu primer pedido.
            </div>
            <Link to="/home" className="btn-primary" style={{ textDecoration: "none" }}>
              🛒 Explorar productos
            </Link>
          </div>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map((pedido) => {
            const p = atributosPedido(pedido);
            const items = Array.isArray(p.items) ? p.items : [];
            const total = Number(p.total || 0).toLocaleString("es-CO");
            const fecha = p.fecha
              ? new Date(p.fecha).toLocaleString("es-CO")
              : "Sin fecha";
            return (
              <div className="g-card pedido-card" key={pedido.id}>
                <div className="pedido-head">
                  <div>
                    <div className="pedido-num">
                      Pedido <strong>#{pedido.id}</strong>
                    </div>
                    <div className="pedido-fecha">{fecha}</div>
                  </div>
                  <span className={`g-chip is-${estadoColor(p.estado)}`}>
                    {p.estado || "Pendiente"}
                  </span>
                </div>

                {items.length > 0 && (
                  <div className="pedido-items">
                    {items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="pedido-item">
                        <div className="pedido-item-nombre">
                          <strong>{it.cantidad || 1}x</strong> {it.nombre}
                        </div>
                        <div className="pedido-item-precio">
                          $
                          {Number(it.precio || 0).toLocaleString("es-CO")}
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="pedido-item-more">
                        +{items.length - 3} productos más
                      </div>
                    )}
                  </div>
                )}

                <div className="pedido-foot">
                  <button
                    type="button"
                    className="g-btn-ghost"
                    onClick={() => showToast && console.log("Detalles del pedido")}
                  >
                    🔍 Ver detalle
                  </button>
                  <div className="pedido-total">
                    <span>Total</span>
                    <strong>${total}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SECCIÓN 3 — FAVORITOS
========================================================= */
function SeccionFavoritos({ items, setItems, showToast }) {
  const quitar = (id) => {
    setItems((arr) => arr.filter((f) => f.id !== id));
    showToast("Quitado de favoritos", "warning");
  };
  const limpiar = () => {
    if (!confirm("¿Quitar todos los favoritos?")) return;
    setItems([]);
    showToast("Favoritos limpiados", "success");
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">❤️ Mis favoritos</h2>
      <p className="g-section-sub">
        Todos tus productos guardados. Puedes añadirlos directamente al carrito
        cuando quieras.
      </p>

      {items.length === 0 ? (
        <div className="g-card">
          <div className="g-empty">
            <div className="g-empty-emoji">💔</div>
            <div className="g-empty-title">No tienes favoritos</div>
            <div className="g-empty-msg">
              Toca el ❤️ en cualquier producto para guardarlo aquí.
            </div>
            <Link to="/home" className="btn-primary" style={{ textDecoration: "none" }}>
              Explorar productos
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button type="button" className="g-btn-ghost" onClick={limpiar}>
              🧹 Limpiar todo
            </button>
          </div>
          <div className="fav-grid">
            {items.map((f) => (
              <div className="g-card fav-card" key={f.id}>
                <div
                  className="fav-img"
                  style={{ backgroundImage: `url(${f.imagen || "https://via.placeholder.com/300"})` }}
                />
                <div className="fav-body">
                  <div className="fav-nombre">{f.nombre || "Producto"}</div>
                  <div className="fav-rest">
                    🏪 {f.restaurante || "DevianRo"}
                  </div>
                  <div className="fav-precio">
                    ${Number(f.precio || 0).toLocaleString("es-CO")}
                  </div>
                  <div className="fav-actions">
                    <Link
                      to={`/detalle/${f.id}`}
                      className="g-btn-ghost"
                      style={{ textDecoration: "none", padding: "10px 14px", fontSize: 13 }}
                    >
                      🔍 Ver
                    </Link>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: "10px 14px", fontSize: 13 }}
                      onClick={() => showToast("Producto añadido al carrito", "success")}
                    >
                      🛒 Añadir
                    </button>
                    <button
                      type="button"
                      className="fav-del"
                      onClick={() => quitar(f.id)}
                      title="Quitar de favoritos"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   SECCIÓN 4 — DIRECCIONES
========================================================= */
const EMPTY_DIR = {
  label: "",
  nombreRecibe: "",
  telefono: "",
  ciudad: "Bogotá",
  barrio: "",
  direccion: "",
  detalles: "",
  tipo: "casa",
  favorita: false,
};
const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Otra"];

function SeccionDirecciones({ items, setItems, showToast }) {
  const [editing, setEditing] = useState(null); // id | 'new' | null
  const [form, setForm] = useState(EMPTY_DIR);

  const abrirNuevo = () => {
    setForm(EMPTY_DIR);
    setEditing("new");
  };
  const abrirEditar = (d) => {
    setForm({ ...d });
    setEditing(d.id);
  };
  const cancelar = () => setEditing(null);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const guardar = (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.direccion.trim() || !form.barrio.trim()) {
      showToast("Completa los campos obligatorios", "error");
      return;
    }
    if (editing === "new") {
      const nueva = { ...form, id: uid() };
      if (nueva.favorita) {
        setItems((arr) =>
          [{ ...nueva }, ...arr.map((x) => ({ ...x, favorita: false }))]
        );
      } else {
        setItems((arr) => [nueva, ...arr]);
      }
      showToast("Dirección añadida", "success");
    } else {
      if (form.favorita) {
        setItems((arr) =>
          arr.map((x) =>
            x.id === editing
              ? { ...form, id: editing }
              : { ...x, favorita: false }
          )
        );
      } else {
        setItems((arr) =>
          arr.map((x) => (x.id === editing ? { ...form, id: editing } : x))
        );
      }
      showToast("Dirección actualizada", "success");
    }
    setEditing(null);
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setItems((arr) => arr.filter((d) => d.id !== id));
    showToast("Dirección eliminada", "warning");
  };

  const hacerFavorita = (id) => {
    setItems((arr) =>
      arr.map((x) => ({ ...x, favorita: x.id === id ? !x.favorita : false }))
    );
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">📍 Mis direcciones</h2>
      <p className="g-section-sub">
        Gestiona tus direcciones de entrega y facturación. Marca una como
        favorita para usarla por defecto.
      </p>

      <div style={{ marginBottom: 20 }}>
        <button
          type="button"
          className="btn-primary"
          onClick={abrirNuevo}
          disabled={editing !== null}
        >
          ➕ Añadir dirección
        </button>
      </div>

      {(editing === "new" || editing !== null) && (
        <form className="g-card" style={{ marginBottom: 20 }} onSubmit={guardar}>
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>
            {editing === "new" ? "🏠 Nueva dirección" : "✏️ Editar dirección"}
          </h3>
          <div className="g-form-grid">
            <div className="g-field">
              <label className="g-label">
                Etiqueta<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Ej: Casa, Oficina, Mamá"
                name="label"
                value={form.label}
                onChange={cambiar}
                maxLength={20}
                required
              />
            </div>
            <div className="g-field">
              <label className="g-label">Tipo</label>
              <select
                className="g-select"
                name="tipo"
                value={form.tipo}
                onChange={cambiar}
              >
                <option value="casa">🏠 Casa</option>
                <option value="apartamento">🏢 Apartamento</option>
                <option value="oficina">💼 Oficina</option>
                <option value="otro">📦 Otro</option>
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">
                Quien recibe<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Nombre y apellido"
                name="nombreRecibe"
                value={form.nombreRecibe}
                onChange={cambiar}
              />
            </div>
            <div className="g-field">
              <label className="g-label">Teléfono</label>
              <input
                className="g-input"
                type="tel"
                placeholder="+57 300 123 4567"
                name="telefono"
                value={form.telefono}
                onChange={cambiar}
              />
            </div>
            <div className="g-field">
              <label className="g-label">
                Ciudad<span className="req">*</span>
              </label>
              <select
                className="g-select"
                name="ciudad"
                value={form.ciudad}
                onChange={cambiar}
              >
                {CIUDADES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">
                Barrio / Sector<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Ej: Chapinero"
                name="barrio"
                value={form.barrio}
                onChange={cambiar}
                required
              />
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Dirección completa<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Calle 72 # 10 - 23, Apto 402"
                name="direccion"
                value={form.direccion}
                onChange={cambiar}
                required
              />
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Referencias / Instrucciones
              </label>
              <textarea
                className="g-textarea"
                placeholder="Edificio, portería, timbre, punto de referencia, parqueadero, código…"
                name="detalles"
                value={form.detalles}
                onChange={cambiar}
                maxLength={250}
              />
            </div>
            <div className="g-field is-full" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="g-toggle">
                <input
                  type="checkbox"
                  name="favorita"
                  checked={!!form.favorita}
                  onChange={cambiar}
                />
                <span className="g-toggle-track" />
                <span className="g-toggle-label">
                  Marcar como dirección favorita
                  <small>Se usará automáticamente en tus próximos pedidos</small>
                </span>
              </label>
            </div>
          </div>
          <div className="g-form-actions">
            <button type="button" className="g-btn-ghost" onClick={cancelar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              💾 Guardar dirección
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && editing === null ? (
        <div className="g-card">
          <div className="g-empty">
            <div className="g-empty-emoji">🗺️</div>
            <div className="g-empty-title">No tienes direcciones guardadas</div>
            <div className="g-empty-msg">
              Añade tu primera dirección para agilizar tus compras.
            </div>
            <button type="button" className="btn-primary" onClick={abrirNuevo}>
              ➕ Añadir primera dirección
            </button>
          </div>
        </div>
      ) : (
        <div className="direcciones-grid">
          {items.map((d) => (
            <div className="g-card dir-card" key={d.id}>
              {d.favorita && <span className="dir-star">⭐ Predeterminada</span>}
              <div className="dir-head">
                <span className={`dir-tag tipo-${d.tipo}`}>
                  {d.tipo === "casa" && "🏠"}
                  {d.tipo === "apartamento" && "🏢"}
                  {d.tipo === "oficina" && "💼"}
                  {d.tipo === "otro" && "📦"} {d.label}
                </span>
                <div className="dir-actions">
                  <button
                    type="button"
                    className="dir-act"
                    onClick={() => abrirEditar(d)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="dir-act danger"
                    onClick={() => eliminar(d.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="dir-text">
                <strong>{d.nombreRecibe || "Sin nombre"}</strong>
                <p>
                  📍 {d.direccion}, {d.barrio} — {d.ciudad}
                </p>
                {d.telefono && <p>📞 {d.telefono}</p>}
                {d.detalles && <p className="dir-det">ℹ️ {d.detalles}</p>}
              </div>
              <div className="dir-foot">
                <button
                  type="button"
                  className="g-btn-ghost"
                  onClick={() => hacerFavorita(d.id)}
                >
                  {d.favorita ? "⭐ Favorita" : "Marcar favorita"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SECCIÓN 5 — MÉTODOS DE PAGO
========================================================= */
const BANCOS = [
  "Nequi", "DaviPlata", "Bancolombia", "Bogotá", "Davivienda",
  "BBVA", "Itaú", "Falabella", "AV Villas", "Otro",
];

function SeccionPagos({ items, setItems, showToast }) {
  const [editing, setEditing] = useState(null); // 'tarjeta' | 'banco' | null
  const [tipo, setTipo] = useState("tarjeta");

  const [tarjeta, setTarjeta] = useState({
    numero: "", nombre: "", expira: "", cvv: "", titular: "", favorita: false,
  });
  const [banco, setBanco] = useState({
    banco: BANCOS[0], titular: "", numero: "", tipoCuenta: "ahorros", favorita: false,
  });

  const limpiar = () => {
    setTarjeta({
      numero: "", nombre: "", expira: "", cvv: "", titular: "", favorita: false,
    });
    setBanco({
      banco: BANCOS[0], titular: "", numero: "", tipoCuenta: "ahorros", favorita: false,
    });
    setEditing(null);
  };

  const guardarTarjeta = (e) => {
    e.preventDefault();
    if (
      !tarjeta.numero.replace(/\D/g, "").length ||
      !tarjeta.titular.trim() ||
      !tarjeta.expira.trim() ||
      !tarjeta.cvv.trim()
    ) {
      showToast("Completa los datos de la tarjeta", "error");
      return;
    }
    const nueva = {
      id: uid(),
      tipo: "tarjeta",
      marca: tipoTarjeta(tarjeta.numero),
      ultimos4: tarjeta.numero.replace(/\D/g, "").slice(-4),
      expira: tarjeta.expira,
      titular: tarjeta.titular,
      favorita: tarjeta.favorita,
    };
    if (nueva.favorita) {
      setItems((arr) =>
        [{ ...nueva }, ...arr.map((x) => ({ ...x, favorita: false }))]
      );
    } else {
      setItems((arr) => [nueva, ...arr]);
    }
    showToast("Tarjeta guardada (los datos sensibles NO se almacenan)", "success");
    limpiar();
  };

  const guardarBanco = (e) => {
    e.preventDefault();
    if (!banco.numero.trim() || !banco.titular.trim()) {
      showToast("Completa los datos de la cuenta", "error");
      return;
    }
    const nueva = {
      id: uid(),
      tipo: "banco",
      banco: banco.banco,
      tipoCuenta: banco.tipoCuenta,
      ultimos4: banco.numero.slice(-4),
      titular: banco.titular,
      favorita: banco.favorita,
    };
    if (nueva.favorita) {
      setItems((arr) =>
        [{ ...nueva }, ...arr.map((x) => ({ ...x, favorita: false }))]
      );
    } else {
      setItems((arr) => [nueva, ...arr]);
    }
    showToast("Cuenta bancaria añadida", "success");
    limpiar();
  };

  const eliminar = (id) => {
    if (!confirm("¿Eliminar este método de pago?")) return;
    setItems((arr) => arr.filter((p) => p.id !== id));
    showToast("Método eliminado", "warning");
  };
  const favorita = (id) =>
    setItems((arr) =>
      arr.map((x) => ({ ...x, favorita: x.id === id ? !x.favorita : false }))
    );

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">💳 Métodos de pago</h2>
      <p className="g-section-sub">
        Guarda tus tarjetas y cuentas bancarias para pagar con un clic. Ningún
        CVV ni dato sensible se guarda localmente.
      </p>

      {editing === null && (
        <div className="pagos-toggles">
          <button
            className={`pagos-toggle ${tipo === "tarjeta" ? "is-active" : ""}`}
            onClick={() => setTipo("tarjeta")}
          >
            💳 Tarjeta
          </button>
          <button
            className={`pagos-toggle ${tipo === "banco" ? "is-active" : ""}`}
            onClick={() => setTipo("banco")}
          >
            🏦 Cuenta bancaria / PSE
          </button>
          <button
            className="btn-primary"
            onClick={() => setEditing(tipo)}
            style={{ marginLeft: "auto" }}
          >
            ➕ Añadir
          </button>
        </div>
      )}

      {editing === "tarjeta" && (
        <form className="g-card pago-form" onSubmit={guardarTarjeta}>
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>💳 Añadir tarjeta</h3>
          <div className="tarjeta-preview">
            <div className="tarjeta-preview-chip">💳</div>
            <div className="tarjeta-preview-num">
              {enmascararTarjeta(tarjeta.numero) || "•••• •••• •••• ••••"}
            </div>
            <div className="tarjeta-preview-foot">
              <div>
                <small>TITULAR</small>
                <div>{tarjeta.titular || "NOMBRE COMPLETO"}</div>
              </div>
              <div>
                <small>EXPIRA</small>
                <div>{tarjeta.expira || "MM/AA"}</div>
              </div>
              <div className="tarjeta-preview-brand">
                {iconoTarjeta(tipoTarjeta(tarjeta.numero))}
              </div>
            </div>
          </div>

          <div className="g-form-grid">
            <div className="g-field is-full">
              <label className="g-label">
                Número de tarjeta<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                maxLength={19}
                value={tarjeta.numero}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  v = v.replace(/(.{4})/g, "$1 ").trim();
                  setTarjeta((t) => ({ ...t, numero: v }));
                }}
                required
              />
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Nombre del titular<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Como aparece en la tarjeta"
                value={tarjeta.titular}
                onChange={(e) =>
                  setTarjeta((t) => ({ ...t, titular: e.target.value.toUpperCase() }))
                }
                required
              />
            </div>
            <div className="g-field">
              <label className="g-label">
                Expira<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="MM/AA"
                value={tarjeta.expira}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                  setTarjeta((t) => ({ ...t, expira: v }));
                }}
                required
              />
            </div>
            <div className="g-field">
              <label className="g-label">
                CVV<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="123"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={tarjeta.cvv}
                onChange={(e) =>
                  setTarjeta((t) => ({
                    ...t,
                    cvv: e.target.value.replace(/\D/g, ""),
                  }))
                }
                required
              />
            </div>
            <div className="g-field is-full" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="g-toggle">
                <input
                  type="checkbox"
                  checked={tarjeta.favorita}
                  onChange={(e) =>
                    setTarjeta((t) => ({ ...t, favorita: e.target.checked }))
                  }
                />
                <span className="g-toggle-track" />
                <span className="g-toggle-label">
                  Marcar como método favorito
                  <small>La usaremos por defecto en el checkout</small>
                </span>
              </label>
            </div>
          </div>
          <div className="g-form-actions">
            <button type="button" className="g-btn-ghost" onClick={limpiar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              🔒 Guardar tarjeta
            </button>
          </div>
        </form>
      )}

      {editing === "banco" && (
        <form className="g-card pago-form" onSubmit={guardarBanco}>
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>🏦 Añadir cuenta / PSE</h3>
          <div className="g-form-grid">
            <div className="g-field">
              <label className="g-label">
                Entidad<span className="req">*</span>
              </label>
              <select
                className="g-select"
                value={banco.banco}
                onChange={(e) => setBanco((b) => ({ ...b, banco: e.target.value }))}
              >
                {BANCOS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">Tipo de cuenta</label>
              <select
                className="g-select"
                value={banco.tipoCuenta}
                onChange={(e) => setBanco((b) => ({ ...b, tipoCuenta: e.target.value }))}
              >
                <option value="ahorros">Ahorros</option>
                <option value="corriente">Corriente</option>
                <option value="nequi">Nequi / DaviPlata</option>
              </select>
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Nombre del titular<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Nombre completo"
                value={banco.titular}
                onChange={(e) => setBanco((b) => ({ ...b, titular: e.target.value }))}
                required
              />
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Número de cuenta<span className="req">*</span>
              </label>
              <input
                className="g-input"
                placeholder="Ej: 41234567890"
                inputMode="numeric"
                value={banco.numero}
                onChange={(e) =>
                  setBanco((b) => ({
                    ...b,
                    numero: e.target.value.replace(/\D/g, ""),
                  }))
                }
                required
              />
            </div>
            <div className="g-field is-full" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <label className="g-toggle">
                <input
                  type="checkbox"
                  checked={banco.favorita}
                  onChange={(e) => setBanco((b) => ({ ...b, favorita: e.target.checked }))}
                />
                <span className="g-toggle-track" />
                <span className="g-toggle-label">
                  Marcar como método favorito
                </span>
              </label>
            </div>
          </div>
          <div className="g-form-actions">
            <button type="button" className="g-btn-ghost" onClick={limpiar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              💾 Guardar cuenta
            </button>
          </div>
        </form>
      )}

      {items.length === 0 && editing === null ? (
        <div className="g-card">
          <div className="g-empty">
            <div className="g-empty-emoji">💳</div>
            <div className="g-empty-title">No tienes métodos de pago</div>
            <div className="g-empty-msg">
              Agrega una tarjeta o cuenta para agilizar el checkout.
            </div>
          </div>
        </div>
      ) : (
        <div className="pagos-grid">
          {items.map((p) => (
            <div
              className={`g-card pago-card ${
                p.tipo === "tarjeta" ? "pago-card-tarjeta" : "pago-card-banco"
              }`}
              key={p.id}
            >
              {p.favorita && <span className="pago-fav">⭐ Predeterminado</span>}
              {p.tipo === "tarjeta" ? (
                <>
                  <div className="pago-brand">{iconoTarjeta(p.marca)}</div>
                  <div className="pago-num">•••• •••• •••• {p.ultimos4}</div>
                  <div className="pago-foot">
                    <div>
                      <small>TITULAR</small>
                      <div>{p.titular}</div>
                    </div>
                    <div>
                      <small>EXPIRA</small>
                      <div>{p.expira}</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pago-brand">🏦</div>
                  <div className="pago-banco-name">{p.banco}</div>
                  <div className="pago-num">Cuenta •••• {p.ultimos4}</div>
                  <div className="pago-foot">
                    <div>
                      <small>TITULAR</small>
                      <div>{p.titular}</div>
                    </div>
                    <div>
                      <small>TIPO</small>
                      <div className="capitalize">{p.tipoCuenta}</div>
                    </div>
                  </div>
                </>
              )}
              <div className="pago-actions">
                <button
                  type="button"
                  className="g-btn-ghost"
                  onClick={() => favorita(p.id)}
                >
                  {p.favorita ? "⭐ Favorita" : "Favorita"}
                </button>
                <button
                  type="button"
                  className="pago-del"
                  onClick={() => eliminar(p.id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SECCIÓN 6 — SEGURIDAD
========================================================= */
function SeccionSeguridad({ user, openChangePassword, openUserProfile, showToast }) {
  const [sesiones] = useState([
    {
      id: 1,
      nombre: "Windows · Chrome",
      ubicacion: "Bogotá, Colombia",
      fecha: "Actual",
      actual: true,
    },
    {
      id: 2,
      nombre: "Android · App",
      ubicacion: "Bogotá, Colombia",
      fecha: "Hace 2 días",
    },
  ]);

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">🔒 Seguridad de tu cuenta</h2>
      <p className="g-section-sub">
        Mantén tu cuenta protegida: actualiza tu contraseña, revisa los inicios
        de sesión y activa la verificación en dos pasos.
      </p>

      <div className="seg-grid">
        <div className="g-card seg-card">
          <h3 className="seg-title">🔑 Contraseña</h3>
          <p className="seg-sub">
            Cambia tu contraseña periódicamente para proteger tu cuenta.
          </p>
          <div className="seg-meta">
            <span className="g-chip is-success">
              Último cambio:{" "}
              {user?.passwordEnabled
                ? new Date(
                    user.lastSignInAt || Date.now()
                  ).toLocaleDateString("es-CO")
                : "—"}
            </span>
          </div>
          <button
            type="button"
            className="btn-primary seg-btn"
            onClick={() => {
              try {
                openChangePassword();
              } catch {
                showToast("Abre la ventana de seguridad de Clerk", "warning");
              }
            }}
          >
            Cambiar contraseña
          </button>
        </div>

        <div className="g-card seg-card">
          <h3 className="seg-title">🛡️ Verificación en 2 pasos (2FA)</h3>
          <p className="seg-sub">
            Añade una capa extra de seguridad a tu cuenta.
          </p>
          <div className="seg-meta">
            {user?.twoFactorEnabled ? (
              <span className="g-chip is-success">✅ 2FA activado</span>
            ) : (
              <span className="g-chip is-warning">⚠️ Sin activar</span>
            )}
          </div>
          <button
            type="button"
            className="g-btn-ghost seg-btn"
            onClick={() => {
              try { openUserProfile(); }
              catch { showToast("Abre gestión de seguridad de Clerk", "warning"); }
            }}
          >
            Gestionar 2FA
          </button>
        </div>

        <div className="g-card seg-card is-full">
          <h3 className="seg-title">📱 Sesiones activas</h3>
          <p className="seg-sub">
            Revisa los dispositivos que tienen acceso a tu cuenta.
          </p>
          <div className="seg-sesiones">
            {sesiones.map((s) => (
              <div className="seg-sesion g-row" key={s.id}>
                <div className="g-row-icon">
                  {s.nombre.toLowerCase().includes("android") || s.nombre.toLowerCase().includes("iphone")
                    ? "📱"
                    : "💻"}
                </div>
                <div className="g-row-body">
                  <div className="g-row-title">
                    {s.nombre} {s.actual && <span className="g-chip is-success" style={{ marginLeft: 8 }}>Actual</span>}
                  </div>
                  <div className="g-row-sub">
                    📍 {s.ubicacion} · ⏱️ {s.fecha}
                  </div>
                </div>
                {!s.actual && (
                  <button
                    type="button"
                    className="g-btn-ghost"
                    onClick={() => showToast("Sesión cerrada", "success")}
                  >
                    Cerrar sesión
                  </button>
                )}
                {s.actual && <div className="g-row-arrow">●</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="g-card seg-card is-full">
          <h3 className="seg-title">🔐 Panel oficial de seguridad (Clerk)</h3>
          <p className="seg-sub">
            Gestiona correos, teléfonos, sesiones y 2FA desde el panel oficial.
          </p>
          <button
            type="button"
            className="btn-primary seg-btn"
            onClick={() => {
              try { openUserProfile(); }
              catch { showToast("Función de Clerk no disponible", "error"); }
            }}
          >
            Abrir panel de cuenta oficial
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECCIÓN 7 — PREFERENCIAS
========================================================= */
function SeccionPreferencias({ preferencias, setPreferencias, theme, toggleTheme, showToast }) {
  const set = (k, v) => setPreferencias((p) => ({ ...p, [k]: v }));

  const guardar = () => {
    showToast("Preferencias guardadas", "success");
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">⚙️ Preferencias</h2>
      <p className="g-section-sub">
        Personaliza tu experiencia: apariencia, notificaciones, idioma y cómo
        ordenamos tus recomendaciones.
      </p>

      <div className="pref-grid">
        <div className="g-card">
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>🎨 Apariencia</h3>
          <div className="pref-row">
            <div className="pref-row-text">
              <div className="pref-row-title">Modo oscuro</div>
              <div className="pref-row-sub">
                El tema actual: <strong>{theme === "dark" ? "Oscuro 🌙" : "Claro ☀️"}</strong>
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={toggleTheme}>
              {theme === "dark" ? "☀️ Cambiar a claro" : "🌙 Cambiar a oscuro"}
            </button>
          </div>
        </div>

        <div className="g-card">
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>🔔 Notificaciones push</h3>
          <div className="pref-toggles">
            <label className="g-toggle pref-toggle">
              <input
                type="checkbox"
                checked={preferencias.notifPedidos}
                onChange={(e) => set("notifPedidos", e.target.checked)}
              />
              <span className="g-toggle-track" />
              <span className="g-toggle-label">
                Estados de mis pedidos
                <small>Recibe notificaciones cuando cambie el estado</small>
              </span>
            </label>
            <label className="g-toggle pref-toggle">
              <input
                type="checkbox"
                checked={preferencias.notifPromos}
                onChange={(e) => set("notifPromos", e.target.checked)}
              />
              <span className="g-toggle-track" />
              <span className="g-toggle-label">
                Promociones y descuentos 🔥
                <small>Ofertas exclusivas, cupones y lanzamientos</small>
              </span>
            </label>
            <label className="g-toggle pref-toggle">
              <input
                type="checkbox"
                checked={preferencias.notifNovedades}
                onChange={(e) => set("notifNovedades", e.target.checked)}
              />
              <span className="g-toggle-track" />
              <span className="g-toggle-label">
                Novedades y nuevos restaurantes
                <small>Avisos cuando se unen restaurantes nuevos</small>
              </span>
            </label>
          </div>
        </div>

        <div className="g-card">
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>📧 Comunicaciones por email</h3>
          <div className="pref-toggles">
            <label className="g-toggle pref-toggle">
              <input
                type="checkbox"
                checked={preferencias.emailMarketing}
                onChange={(e) => set("emailMarketing", e.target.checked)}
              />
              <span className="g-toggle-track" />
              <span className="g-toggle-label">
                Boletín de marketing
                <small>Recomendaciones semanales según tus gustos</small>
              </span>
            </label>
          </div>
        </div>

        <div className="g-card">
          <h3 style={{ marginBottom: 18, fontSize: 17 }}>🌐 General</h3>
          <div className="g-form-grid">
            <div className="g-field">
              <label className="g-label">Idioma</label>
              <select
                className="g-select"
                value={preferencias.idioma}
                onChange={(e) => set("idioma", e.target.value)}
              >
                <option value="es">🇨🇴 Español</option>
                <option value="en">🇺🇸 English</option>
                <option value="pt">🇧🇷 Português</option>
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">Moneda</label>
              <select
                className="g-select"
                value={preferencias.moneda}
                onChange={(e) => set("moneda", e.target.value)}
              >
                <option value="COP">🇨🇴 Peso colombiano (COP)</option>
                <option value="USD">🇺🇸 Dólar (USD)</option>
                <option value="EUR">🇪🇺 Euro (EUR)</option>
              </select>
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Orden por defecto para productos recomendados
              </label>
              <select
                className="g-select"
                value={preferencias.ordenRecomendados}
                onChange={(e) => set("ordenRecomendados", e.target.value)}
              >
                <option value="populares">🔥 Más populares</option>
                <option value="reciente">🕒 Más recientes</option>
                <option value="precio-asc">💸 Precio: menor a mayor</option>
                <option value="precio-desc">💸 Precio: mayor a menor</option>
                <option value="rating">⭐ Mejor calificados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={guardar}
        >
          💾 Guardar preferencias
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   SECCIÓN 8 — AYUDA
========================================================= */
const FAQS = [
  {
    q: "¿Cómo realizo un pedido?",
    a: "Selecciona el producto que desees, añádelo al carrito, elige la dirección y método de pago, y confirma. Recibirás confirmación por email.",
  },
  {
    q: "¿Puedo cancelar un pedido?",
    a: "Sí, mientras no haya sido enviado puedes cancelarlo desde 'Mis pedidos'. También puedes llamar al restaurante directamente.",
  },
  {
    q: "¿Qué hago si mi pedido llega incorrecto?",
    a: "Contáctanos dentro de los primeros 30 minutos después de la entrega con una foto y te reenvíamos el pedido o te reembolsamos.",
  },
  {
    q: "¿Cómo funciona la cobertura de entrega?",
    a: "Mostramos automáticamente restaurantes dentro de tu zona. Puedes cambiar la ciudad desde el encabezado de la página.",
  },
  {
    q: "¿Es seguro guardar mi tarjeta?",
    a: "No almacenamos CVV ni datos sensibles. Usamos pasarelas de pago PCI-DSS certificadas.",
  },
];

function SeccionAyuda({ showToast }) {
  const [abierta, setAbierta] = useState(0);
  const [mensaje, setMensaje] = useState({ asunto: "", nombre: "", email: "", texto: "" });

  const enviar = (e) => {
    e.preventDefault();
    if (!mensaje.asunto || !mensaje.texto) {
      showToast("Completa asunto y mensaje", "error");
      return;
    }
    showToast("Mensaje enviado, te responderemos pronto", "success");
    setMensaje({ asunto: "", nombre: "", email: "", texto: "" });
  };

  const cambiar = (e) => {
    const { name, value } = e.target;
    setMensaje((m) => ({ ...m, [name]: value }));
  };

  return (
    <div className="cuenta-section">
      <h2 className="g-section-title">💬 Ayuda y soporte</h2>
      <p className="g-section-sub">
        Respuestas a las dudas más frecuentes. Si no encuentras lo que buscas,
        envíanos un mensaje.
      </p>

      <div className="ayuda-wrap">
        <div>
          <h3 style={{ margin: "4px 0 18px", fontSize: 17 }}>📚 Preguntas frecuentes</h3>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className="g-card faq-item" key={i}>
                <button
                  type="button"
                  className="faq-q"
                  onClick={() => setAbierta(abierta === i ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <span className={`faq-arrow ${abierta === i ? "is-open" : ""}`}>
                    ▾
                  </span>
                </button>
                {abierta === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <form className="g-card ayuda-contacto" onSubmit={enviar}>
          <h3 style={{ marginBottom: 6, fontSize: 17 }}>✉️ Contáctanos</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 18, fontSize: 13.5 }}>
            Nuestro equipo responde en menos de 24h hábiles.
          </p>
          <div className="ayuda-contactos">
            <div className="g-row" style={{ cursor: "default" }}>
              <div className="g-row-icon">📞</div>
              <div className="g-row-body">
                <div className="g-row-title">Teléfono</div>
                <div className="g-row-sub">+57 (601) 123 - 4567</div>
              </div>
            </div>
            <div className="g-row" style={{ cursor: "default" }}>
              <div className="g-row-icon">✉️</div>
              <div className="g-row-body">
                <div className="g-row-title">Email</div>
                <div className="g-row-sub">soporte@devianro.com</div>
              </div>
            </div>
            <div className="g-row" style={{ cursor: "default" }}>
              <div className="g-row-icon">🕐</div>
              <div className="g-row-body">
                <div className="g-row-title">Horarios</div>
                <div className="g-row-sub">Lun–Dom  8:00 AM – 10:00 PM</div>
              </div>
            </div>
          </div>

          <div className="g-form-grid" style={{ marginTop: 18 }}>
            <div className="g-field is-full">
              <label className="g-label">
                Asunto<span className="req">*</span>
              </label>
              <select
                className="g-select"
                name="asunto"
                value={mensaje.asunto}
                onChange={cambiar}
                required
              >
                <option value="">Selecciona un tema</option>
                <option>Pedido / Entrega</option>
                <option>Pago o facturación</option>
                <option>Reembolso</option>
                <option>Producto o restaurante</option>
                <option>Cuenta o login</option>
                <option>Sugerencia / Otro</option>
              </select>
            </div>
            <div className="g-field">
              <label className="g-label">Tu nombre</label>
              <input
                className="g-input"
                name="nombre"
                value={mensaje.nombre}
                onChange={cambiar}
                placeholder="Opcional"
              />
            </div>
            <div className="g-field">
              <label className="g-label">Email de respuesta</label>
              <input
                className="g-input"
                type="email"
                name="email"
                value={mensaje.email}
                onChange={cambiar}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div className="g-field is-full">
              <label className="g-label">
                Tu mensaje<span className="req">*</span>
              </label>
              <textarea
                className="g-textarea"
                name="texto"
                value={mensaje.texto}
                onChange={cambiar}
                placeholder="Cuéntanos cómo podemos ayudarte…"
                required
                maxLength={1000}
              />
              <small style={{ color: "var(--color-text-muted)", textAlign: "right", marginTop: 4 }}>
                {mensaje.texto.length}/1000
              </small>
            </div>
          </div>
          <div className="g-form-actions">
            <button type="submit" className="btn-primary">
              📤 Enviar mensaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Cuenta;
