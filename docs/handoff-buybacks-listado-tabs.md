# Handoff — Listado de BuyBacks (Soga) · Tabs y datos de cada card

> **Para:** Claude Code
> **Objetivo:** construir las tabs faltantes del listado de BuyBacks en Soga con los datos correctos por card.
> **Plataforma:** Soga (light mode · interno). Vive dentro del módulo de **Cotizaciones**, no es un módulo aparte.
> **Fuentes:** Notion *Reglas del sistema BuyBacks – V2.0* (fuente única de verdad, §7 estados) · Notion *PRD Buy backs* · Jira RM-1126 (feature) · BORD-7093 (listado, estado *Por cotizar*, en producción) · BORD-7094/95/96/97 (interna, cotización, SLA, envío).

---

## 0. Lo que ya existe vs. lo que falta (leer primero)

- **Ya en producción:** el listado con la tab **Por cotizar** (BORD-7093). Reutiliza el componente de tabla/cards, buscador y filtros de Quotes.
- **Falta construir (este handoff):** las tabs **Pendiente de aprobación**, **Por facturar**, **Compradas** y **Vencidas**.
- ⚠️ **No existe un ticket en Jira que especifique los datos de card de estas 4 tabs.** Son agrupaciones de estado. Los datos de cada card de este documento están **derivados del modelo de estados documentado** (Notion V2.0 §7.1 + RM-1126 regla 14) y del card ya construido en *Por cotizar*. Todo lo marcado como `PROPUESTA` debe validarse con Camila/Martín antes de cerrar.

---

## 1. Mapeo Tab → Estado de cabecera del BBX

Los estados de cabecera documentados (Notion V2.0 §7.1) son: `Por cotizar`, `Pendiente de aprobación`, `Aprobado`, `Aprobado parcial`, `Rechazado`, `Vencido` (subtipos: sin respuesta / rechazado / no concretado), `Comprado`.

Las tabs de la UI **no son 1:1** con los estados: agrupan varios.

| Tab (UI)                    | Estado(s) de cabecera que agrupa                         | Notas |
|-----------------------------|------------------------------------------------------------|-------|
| **Por cotizar**             | `Por cotizar`                                              | 1:1. Ya en prod. |
| **Pendiente de aprobación** | `Pendiente de aprobación`                                  | 1:1. Oferta enviada, esperando al cliente. |
| **Por facturar**            | `Aprobado` + `Aprobado parcial`                            | `PROPUESTA`. Agrupa BBX aprobados por el cliente que esperan factura → OK de Finanzas → cupón. |
| **Compradas**               | `Comprado`                                                 | 1:1. Al menos 1 equipo con cupón generado. |
| **Vencidas**                | `Vencido` (+ subtipos)                                      | 1:1. |

> 🚩 **Decisiones abiertas a resolver antes de construir:**
> 1. **`Rechazado` (cliente rechazó todo) no tiene tab.** Definir: ¿se oculta?, ¿entra en *Vencidas* (que tiene subtipo "rechazado")?, ¿tab propia? — *sin definición en Jira/Notion.*
> 2. **"Por facturar" mezcla dos sub-pasos que la operación necesita ver separados** (Notion V2.0 §7.1 y §10.2, pendiente explícito): "factura con OK de Finanzas, cupón pendiente" vs. "cupón ya generado". El estado `Comprado` hoy no los distingue. `PROPUESTA`: dentro de *Por facturar*, usar un sub-indicador por card (ver §4).
> 3. El lado de facturación/cupón vive en **RM-1127** (Dash) y **RM-1130** (contable, Etapa 3), fuera del alcance de la gestión en Soga. Los datos de card de *Por facturar* y *Compradas* dependen de campos que aún no están construidos.

---

## 2. Anatomía de la card (campos)

Basado en el card de *Por cotizar* (BORD-7093) + la captura de referencia. Columnas confirmadas en BORD-7093: *cliente (nombre e ID), país(es), estado, SLA, valor/total, responsable(s), fecha*. La captura añade *Solicitado por* y *Herramientas cotizadas* (van un paso adelante del ticket — confirmar en Figma).

| Campo (key)          | Contenido                                                        | Formato / regla |
|-----------------------|--------------------------------------------------------------------|-----------------|
| `paises`              | Banderas de los países del lote                                   | Un BBX es **un lote** y puede tener varios países. Mostrar hasta 3 banderas + `+N`. |
| `bbId`                | Consecutivo del BBX                                                | `BB° {consecutivo}` (ej. `BB° 9817`). |
| `cliente`             | Logo + razón/nombre + ID                                          | ej. `Zeplin, Inc.` |
| `solicitadoPor`       | Usuario del cliente que creó el BBX en Dash                       | ej. `Carlos Méndez`. `CONFIRMAR EN FIGMA` |
| `herramientas`        | Contador doble: total (📦) y gestionadas (✅)                     | Semántica cambia por tab — ver §3. |
| `creacion`            | Fecha de creación del BBX                                         | `DD/MM/YYYY`. |
| `tiempoTranscurrido`  | Tiempo corrido contra el SLA                                       | ej. `2 hrs` + punto de semáforo. Relevante en tabs activas. |
| `responsables`        | Stack de avatares                                                  | Martín (auto) + KAM de la organización + agregados manualmente. |
| `estado`              | `status-badge` de cabecera                                        | Mapeo de color en §5. |
| `valorTotal`          | Total del BBX en USD                                               | Aparece **desde** *Pendiente de aprobación* (antes no hay oferta). Incluye IVA, **sin desglosar**, siempre USD. |
| `cta`                 | Botón de acción principal de la fila                                | Label depende del estado — ver §6. `PROPUESTA`. |

---

## 3. Semántica del contador "Herramientas" por tab  `PROPUESTA`

El contador doble (📦 total / ✅ gestionadas) cambia de significado según el estado. Propuesta a validar:

| Tab                        | 📦 (total) | ✅ (segundo número) significa… |
|------------------------------|-----------|---------------------------------|
| Por cotizar                  | Total del lote | Herramientas **cotizadas/gestionadas** por Martín (progreso interno). |
| Pendiente de aprobación      | Total del lote | Herramientas **ofertadas** (excluye "Rechazado por Bord"). |
| Por facturar                 | Total del lote | Herramientas **aprobadas por el cliente**. |
| Compradas                    | Total del lote | Herramientas **vendidas** (con cupón que las cubre). |
| Vencidas                     | Total del lote | Sin progreso relevante (mostrar solo total, u ocultar ✅). |

---

## 4. Sub-indicador dentro de "Por facturar"  `PROPUESTA`

Para no colapsar los dos roles/pasos en un mismo cajón (§1, decisión abierta 2), cada card de *Por facturar* debería exponer en qué punto del sub-flujo está:

- `factura_pendiente` — cliente aún no adjunta factura(s).
- `factura_en_revision` — adjunta, esperando OK de Finanzas.
- `ok_cupon_pendiente` — factura(s) con OK, falta que Comercial/Martín genere cupón.
- `cupon_parcial` — algún cupón generado; queda saldo (aplica a *Aprobado parcial* o lote multi-país).

Nota: la facturación es **por país** dentro del lote (una factura por país con equipos aprobados), así que este sub-indicador puede necesitar granularidad por país.

---

## 5. Mapeo de estado → `status-badge` (DS .bord, light mode)  `PROPUESTA`

El DS define 5 estados de `status-badge` (componente en Figma node `2221:2953`) con estos hex. **No hay mapeo BBX↔badge definido en el DS** — propuesta:

| Estado de cabecera        | Badge DS      | Hex        |
|-----------------------------|---------------|------------|
| Por cotizar                 | pending       | `#626C82`  |
| Pendiente de aprobación      | in-process    | `#23A5FF`  |
| Aprobado / Aprobado parcial (*Por facturar*) | warning | `#DCC410` (señala acción pendiente) |
| Comprado                    | done          | `#09A432`  |
| Vencido / Rechazado          | danger        | `#FC543D`  |

> ⚠️ **Un solo ancla de estado por card** (principio .bord): usar el `status-badge` como único indicador de estado. No agregar barra de color + pill compitiendo.
> El DS **no tiene estado morado**; no inventar colores fuera de estos 5.

---

## 6. CTA por tab  `PROPUESTA`

En la captura el botón es un placeholder (`CTA`). Label real por definir. Propuesta:

| Tab                        | CTA sugerido            | Acción |
|-------------------------------|--------------------------|--------|
| Por cotizar                   | `Gestionar`              | Abre la interna para cotizar/rechazar herramientas. |
| Pendiente de aprobación       | `Ver oferta`             | Interna en modo lectura (esperando al cliente). |
| Por facturar                  | `Revisar factura` / `Generar cupón` | Depende del sub-indicador (§4) y del rol (Finanzas vs Comercial/Martín). |
| Compradas                     | `Ver detalle`            | Interna con cupón(es) y seriales vendidos. |
| Vencidas                      | `Ver detalle`            | Interna en solo lectura. |

---

## 7. Toolbar del listado (reutilizado de Quotes)

- **Toggle superior derecho:** `Cotizaciones` / `Buybacks` (segmentación por tipo).
- **Buscador:** placeholder `Busca por ID, cliente, modelo, serial…`.
- **Filtros:** `Empresa`, `País`, `Responsable`, `SLA y ETA`, `Marca`, `Tipo`, + `Ordenar`.
- **Línea de contexto:** `SLA de la cotización 24hrs` (todos los BBX nacen con SLA 24h; sube a 72h solo si Martín activa "Necesito más tiempo").
- **Tabs con contador:** cada tab muestra el conteo de BBX en ese estado (ej. `Por cotizar 15`).

---

## 8. Tokens .bord a usar (Soga · light mode)

| Uso | Token / valor |
|-----|---------------|
| Fondo de página | `layout/background` = `#FAFAF9` |
| Fondo de card | `layout/level-1` = `#FFFFFF` |
| Texto principal | `content/default` = `#070F21` |
| Texto secundario | `#626C82` (navy-blue/600) `PROPUESTA` — `content/secondary` no está definido en light |
| Bordes | 0.5px; radius 8px en cards. `stroke` light sin token — `PROPUESTA` `#EBEBEB` (white/300) |
| Tipografía | **DM Sans** única. Escala `10/12/14/16/20/32`. Título de página `title-20-bold`, dato clave `body-12-bold`, cuerpo `body-14-regular`, metadata `caption-10-regular`. |
| Badges de estado | ver §5 |

> **Motion:** el DS **no define tokens de animación**. Si agregas transiciones (tabs, hover), proponlas y márcalas como decisión abierta.

---

## 9. Forma de datos por card (para mock / contrato de API)

```json
{
  "bbId": "BB° 9817",
  "estado": "por_cotizar",            // por_cotizar | pendiente_aprobacion | aprobado | aprobado_parcial | rechazado | vencido | comprado
  "vencidoSubtipo": null,             // sin_respuesta | rechazado | no_concretado (solo si estado=vencido)
  "paises": ["MX", "CO", "AR"],       // ISO-3166 alpha-2; render banderas + "+N" si > 3
  "cliente": { "id": "org_123", "nombre": "Zeplin, Inc.", "logoUrl": "…" },
  "solicitadoPor": "Carlos Méndez",
  "herramientas": { "total": 46, "gestionadas": 12 },   // ver §3 para semántica de "gestionadas" por estado
  "valorTotalUsd": 12450.00,          // null hasta que se envía la oferta
  "ivaIncluido": true,                // siempre true; total no se desglosa
  "creacion": "2026-03-12",
  "sla": { "tipoHoras": 24, "necesitoMasTiempo": false },
  "tiempoTranscurrido": { "valor": 2, "unidad": "hrs", "semaforo": "ok" },  // ok | warning | vencido
  "responsables": [
    { "nombre": "Martín Ríos", "rol": "buyer", "avatarUrl": "…" },
    { "nombre": "…", "rol": "kam", "avatarUrl": "…" }
  ],
  "cta": { "label": "Gestionar", "action": "abrir_interna" },   // ver §6
  "facturacion": {                    // solo relevante en por_facturar / compradas — PROPUESTA
    "subIndicador": "factura_pendiente", // factura_pendiente | factura_en_revision | ok_cupon_pendiente | cupon_parcial
    "porPais": [
      { "pais": "MX", "factura": "pendiente", "cupon": null },
      { "pais": "CO", "factura": "ok", "cupon": "BBC-…" }
    ]
  }
}
```

---

## 10. Reglas de negocio que el listado debe respetar

1. **Un BBX = un lote**, puede tener varios países. Nunca hay un BBX por país; la separación por país es solo a nivel de facturación.
2. **Sin reapertura:** un BBX no vuelve a *Por cotizar* una vez enviado.
3. **SLA:** 24h por defecto; 72h solo con toggle "Necesito más tiempo". Horas hábiles, sin fines de semana (UTC).
4. **Valor/total:** siempre USD, incluye IVA, **no se desglosa**.
5. **Al vencer**, los equipos vuelven al estado que tenían en inventario antes del BBX.
6. **Diferenciación visual BBX vs quote** en el listado sigue como pendiente de diseño abierto (D3, Gabriela) — coordinar antes de cerrar el estilo.

---

## 11. Checklist para el prompt a Claude Code

- [ ] Construir las 4 tabs faltantes reutilizando el card de *Por cotizar*.
- [ ] Aplicar el mapeo Tab→Estado de §1 (y decidir dónde cae `Rechazado`).
- [ ] Ajustar la semántica del contador de herramientas por tab (§3).
- [ ] Añadir `valorTotal` desde *Pendiente de aprobación* en adelante.
- [ ] Sub-indicador de facturación en *Por facturar* (§4).
- [ ] `status-badge` con el mapeo de §5 (un solo ancla de estado).
- [ ] CTA por estado (§6).
- [ ] Tokens light mode + DM Sans (§8).
- [ ] Marcar como `PROPUESTA` en el código/PR todo lo señalado, para revisión con Camila/Martín.
