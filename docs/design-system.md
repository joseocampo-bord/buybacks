# .bord Design System

Sistema de diseño para dos productos que comparten los mismos tokens semánticos con valores distintos según el modo:

- **SOGA** — herramienta interna de operaciones · **light mode** · `background = #FAFAF9`
- **DASH** — plataforma cliente · **dark mode** · `background = #070F21`

Regla base: nunca uses colores primitivos directamente. Aplica siempre el token semántico; el mismo token resuelve a un hex distinto en dark (Dash) y light (Soga).

---

## 1. Color — tokens semánticos

Todos los valores están resueltos a hex. Donde el DS aún no define un valor para un modo, se marca como **propuesto** (sin token formal — decisión abierta para alineación de equipo).

### Layout

| Token | Dark (Dash) | Light (Soga) |
|---|---|---|
| `layout/background` | `#070F21` | `#FAFAF9` |
| `layout/level-1` | `#1B202F` | `#FFFFFF` |
| `layout/level-2` | `#262B39` | `#FAFAF9` |
| `layout/level-3` | `#1B202F` | — |
| `layout/opacity` | `#FFFFFF` @ 5% | `#000000` @ 5% |

### Content & Stroke

| Token | Dark (Dash) | Light (Soga) |
|---|---|---|
| `content/default` | `#FFFFFF` | `#070F21` |
| `content/secondary` | `#C6C7CB` | `#626C82` *(propuesto)* |
| `stroke/default` | `#262B39` | `#EBEBEB` *(propuesto)* |

### Primary

| Token | Dark (Dash) | Light (Soga) |
|---|---|---|
| `primary/bg/default` | `#22CFAB` | `#22CFAB` *(propuesto)* |
| `primary/bg/hover-pressed` | `#00B188` | `#00B188` *(propuesto)* |
| `primary/fg/default` | `#070F21` | `#FFFFFF` |
| `secondary/bg/default` | `#1B202F` | — |

### Estados semánticos (`boolean`)

Usar siempre este vocabulario: `success` · `danger` · `warning` · `informative`. No usar sinónimos (`positive`, `critical`, `info`).

| Estado | fg | bg-opacity (dark + light) | bg sólido (light) |
|---|---|---|---|
| `success` | `#09A432` | `#09A432` @ 10% | `#EAF9F4` |
| `danger` | `#FC543D` | `#FC543D` @ 10% | — |
| `warning` | `#DCC410` | `#DCC410` @ 10% | — |
| `informative` | `#23A5FF` | `#23A5FF` @ 10% | — |

### Complementary

| Token | Valor (ambos modos) |
|---|---|
| `complementary/blue/default` | `#23A5FF` |
| `complementary/red/default` | `#FC543D` |
| `complementary/yellow/default` | `#DCC410` |
| `complementary/default` | dark `#FFFFFF` · light `#070F21` |

### Tags

Fondo sólido de la tag; el fg de texto usa el mismo hue a baja opacidad.

| Tag | Fondo (dark) | Fondo (light) |
|---|---|---|
| `blue` | `#23A5FF` | `#DFF2FF` |
| `pink` | `#E897FF` | `#E897FF` |
| `purple` | `#885EF7` | `#885EF7` |
| `brown` | `#A95C14` | `#A95C14` |

### Status-badge (5 estados)

Pill con borde + dot de color. **No existe estado purple.**

| Estado | Color dot |
|---|---|
| `pending` | `#626C82` |
| `in-process` | `#23A5FF` |
| `done` | `#09A432` |
| `warning` | `#DCC410` |
| `danger` | `#FC543D` |

---

## 2. Tipografía

- **Fuente única:** DM Sans
- **Letter-spacing:** 0% en todos los estilos
- **Line-height:** auto en todos los estilos
- **Escala:** 10 / 12 / 14 / 16 / 20 / 32
- **Pesos:** Regular · Medium · Bold (Link = variante semántica de Regular)

| Token | Size | Weight | Uso |
|---|---|---|---|
| `title-32-bold` | 32px | Bold | H1 — título de página |
| `title-20-bold` | 20px | Bold | H2 — título de sección |
| `subtitle-16-bold` | 16px | Bold | Subtítulos, labels de sección |
| `subtitle-16-medium` | 16px | Medium | Subtítulos secundarios |
| `subtitle-16-regular` | 16px | Regular | Subtítulos de apoyo |
| `body-14-medium` | 14px | Medium | Cuerpo principal enfatizado |
| `body-14-regular` | 14px | Regular | Cuerpo principal |
| `body-12-bold` | 12px | Bold | Labels, badges, datos clave |
| `body-12-medium` | 12px | Medium | Cuerpo secundario enfatizado |
| `body-12-regular` | 12px | Regular | Cuerpo secundario |
| `body-12-link` | 12px | Regular | Links en cuerpo de texto |
| `caption-10-regular` | 10px | Regular | Captions, metadata, notas |

---

## 3. Spacing

Base mínima **4px**. Escala:

`4 · 8 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 28 · 32 · 36 · 40 · 48 · 56 · 64 · 80 · 120`

Altura de celda para componentes tipo tabla/card:

| Token | Valor |
|---|---|
| `cell/xs` | 104px |
| `cell/s` | 120px |
| `cell/m` | 140px |
| `cell/l` | 180px |

---

## 4. Radius & Bordes

- **8px** — cards, modals
- **6px** — inputs
- **0.5px** — grosor de borde

---

## 5. Grid

### Web estándar — 1440 × 800

| Config | Sidebar abierto | Sidebar cerrado |
|---|---|---|
| Columns | 12 | 12 |
| Column width | 80px | 80px |
| Gutter | 20px | 20px |
| Offset | 40px | — |
| Content area | 1240px | 1440px |

### Web large — 1920 × 1080

12 columns · column width 80px · gutter 40px · content area 1640px · centrado.

---

## 6. Componentes disponibles

- **Buttons:** primary-button, secondary-button, icon-button
- **Toggles:** toggle, checkbox, radio
- **Forms:** input, select, textarea, dropdown, uploader, phone, date
- **Navigation:** header, sidebar, tabs, breadcrumb, pagination, filters
- **Status & Badges:** badge, step, stepper, status-badge
- **Data Display:** table, historial, tooltip
- **Feedback:** toast, feedback-alert, banner
- **Locations & Logistic services:** logistic-status, location-display
- **Modals:** modal sm/md/lg (+ variantes w-inputs, w-select, w-dropdown)
- **Dates:** date-picker, calendar
- **Icons:** feather icons, twotone-list, 3d-special, flags, logos, avatars

---

## 7. Naming (para variantes y props)

- Naming técnico en `lowercase` inglés `kebab-case`, sin acentos ni espacios.
- Modos: `mode=dark` / `mode=light`
- Estados: `default` · `hover` · `hover-pressed` · `disabled` · `loading` · `selected` · `active`
- Tamaños: `xs` · `sm` · `md` · `lg` · `xl`
- Booleanos: `on` / `off` (nunca `true`/`false`)
- Estados semánticos: `success` · `danger` · `warning` · `informative`
- Rutas de componente: `categoria/subcategoria/variante`

---

## 8. Voz y copy UX

- Segunda persona **"tú"**, español neutro latinoamericano (no argentino).
- Tono declarativo, orientado a acción, consciente de consecuencias.
- Evitar "pero" — oraciones declarativas separadas.
- Presente, segunda persona: "vuelves", "conservas".
- Títulos de modal = acción: `"Aprobar diagnóstico"`, no `"Confirmación"`.
- Acciones pareadas se reflejan entre sí: `"Marcar como no disponible"` ↔ `"Marcar como disponible"`.
- El copy visible puede ir en español; el naming técnico siempre en inglés.
