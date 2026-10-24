// Verificación de contraste (WCAG 2.2) de los pares de colores usados por la UI.
// Los alfas se componen en espacio sRGB (como hace CSS), no en lineal.
// Uso: node scripts/contrast-check.mjs → código 1 si algo falla.

const oklchToSrgbLinear = (L, C, hDeg) => {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const encode = (v) => {
  const c = clamp01(v)
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}
const decode = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)

// Color en sRGB "gamma" (0-1), que es como lo compone CSS.
const srgb = (L, C, h) => oklchToSrgbLinear(L, C, h).map(encode)

const luminance = (rgb) => {
  const [r, g, b] = rgb.map(decode)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Compone `fg` con alfa `alpha` sobre `bg`, como lo haría la caja del navegador.
const over = (fg, alpha, bg) =>
  fg.map((c, i) => alpha * c + (1 - alpha) * bg[i])

// Paleta — debe reflejar src/index.css
const forest = {
  950: srgb(0.196, 0.042, 158),
  900: srgb(0.245, 0.05, 158),
  800: srgb(0.305, 0.058, 158),
  700: srgb(0.372, 0.066, 158),
  600: srgb(0.445, 0.075, 158),
  500: srgb(0.52, 0.082, 158),
  400: srgb(0.605, 0.084, 158),
  300: srgb(0.69, 0.075, 158),
}
const sun = { 400: srgb(0.795, 0.148, 82), 500: srgb(0.735, 0.165, 78) }
const white = [1, 1, 1]

const light = {
  background: srgb(0.984, 0.006, 95),
  card: white,
  popover: white,
  primary: forest[800],
  primaryFg: srgb(0.985, 0.005, 120),
  mutedFg: srgb(0.48, 0.02, 158),
  destructive: srgb(0.545, 0.205, 25),
}

const dark = {
  background: srgb(0.16, 0.012, 158),
  card: srgb(0.21, 0.014, 158),
  popover: srgb(0.21, 0.014, 158),
  secondary: srgb(0.28, 0.016, 158),
  primary: forest[400],
  primaryFg: forest[950],
  mutedFg: srgb(0.72, 0.02, 140),
  destructive: srgb(0.7, 0.19, 25),
  fg: srgb(0.96, 0.006, 120),
}

let failures = 0
const check = (label, a, b, min = 4.5) => {
  const ratio = contrast(a, b)
  const pass = ratio >= min
  if (!pass) failures += 1
  console.log(
    `${pass ? "OK  " : "FAIL"} ${ratio.toFixed(2)} (min ${min}) — ${label}`
  )
}
const section = (title) => console.log(`\n== ${title} ==`)

section("Claro")
check("texto primario sobre fondo", forest[950], light.background)
check("muted-foreground sobre fondo", light.mutedFg, light.background)
check("botón: primary / primary-foreground", light.primary, light.primaryFg)
check("chip bg-primary/10 text-primary (card)", light.primary, over(light.primary, 0.1, light.card))
check("chip bg-forest-600/15 text-forest-700 (card)", forest[700], over(forest[600], 0.15, light.card))
check("chip bg-sun-400/25 text-forest-900 (card)", forest[900], over(sun[400], 0.25, light.card))
check("alerta bg-destructive/10 text-destructive (card)", light.destructive, over(light.destructive, 0.1, light.card))
check("error de formulario text-destructive sobre fondo", light.destructive, light.background)
check("404 text-forest-800 sobre fondo", forest[800], light.background)

section("Oscuro")
check("texto sobre fondo", dark.fg, dark.background)
check("muted-foreground sobre fondo", dark.mutedFg, dark.background)
check("muted-foreground sobre card", dark.mutedFg, dark.card)
check("botón: primary / primary-foreground", dark.primary, dark.primaryFg)
check("text-primary sobre card", dark.primary, dark.card)
check("text-primary sobre fondo", dark.primary, dark.background)
check("chip bg-primary/10 text-forest-300 (card)", forest[300], over(dark.primary, 0.1, dark.card))
check("chip bg-forest-600/15 text-forest-300 (card)", forest[300], over(forest[600], 0.15, dark.card))
check("chip bg-forest-600/15 text-forest-300 (fondo)", forest[300], over(forest[600], 0.15, dark.background))
check("feedback bg-forest-500/10 text-forest-300 (card)", forest[300], over(forest[500], 0.1, dark.card))
check("chip bg-sun-400/10 text-sun-400 (card)", sun[400], over(sun[400], 0.1, dark.card))
check("alerta bg-destructive/10 text-destructive (card)", dark.destructive, over(dark.destructive, 0.1, dark.card))
check("botón destructivo bg-destructive/20 (fondo)", dark.destructive, over(dark.destructive, 0.2, dark.background))
check("botón destructivo hover bg-destructive/25 (fondo)", dark.destructive, over(dark.destructive, 0.25, dark.background))
check("menú destructivo focus bg-destructive/20 (popover)", dark.destructive, over(dark.destructive, 0.2, dark.popover))
check("404 text-forest-300 sobre fondo", forest[300], dark.background)
check("secondary-foreground sobre secondary", dark.fg, dark.secondary)
check("sidebar-foreground sobre sidebar", srgb(0.93, 0.02, 120), forest[950])

section("Gráficos (mínimo 3:1)")
check("focus ring forest-600 sobre fondo (claro)", forest[600], light.background, 3)
check("focus ring forest-500 sobre fondo (oscuro)", forest[500], dark.background, 3)
check("avatar/ícono forest-300 sobre card oscuro", forest[300], dark.card, 3)
check("icono de aviso sun-500 sobre bg-sun-400/15 (oscuro)", sun[500], over(sun[400], 0.15, dark.background), 3)

console.log(`\n${failures === 0 ? "Todo OK" : `${failures} fallo(s)`}`)
process.exit(failures === 0 ? 0 : 1)
