// Kumpulan ikon sebagai data (bukan string HTML) supaya aman dirender tanpa v-html.
// Format: [tag, atribut]. Dirender oleh AppIcon.vue.

const UI = '0 0 24 24'
const PRODUCT = '0 0 100 100'

export const iconSets = {
  ui: {
    viewBox: UI,
    icons: {
      search: [['circle', { cx: 11, cy: 11, r: 7 }], ['line', { x1: 21, y1: 21, x2: 16.5, y2: 16.5 }]],
      user: [['circle', { cx: 12, cy: 8, r: 3.5 }], ['path', { d: 'M5 20c1.3-3.6 4-5.5 7-5.5s5.7 1.9 7 5.5' }]],
      bag: [['path', { d: 'M6 8h12l-1 12H7L6 8z' }], ['path', { d: 'M9 8V6a3 3 0 0 1 6 0v2' }]],
      close: [['line', { x1: 4, y1: 4, x2: 20, y2: 20 }], ['line', { x1: 20, y1: 4, x2: 4, y2: 20 }]],
      menu: [['line', { x1: 4, y1: 7, x2: 20, y2: 7 }], ['line', { x1: 4, y1: 12, x2: 20, y2: 12 }], ['line', { x1: 4, y1: 17, x2: 20, y2: 17 }]],
      arrowRight: [['line', { x1: 5, y1: 12, x2: 19, y2: 12 }], ['path', { d: 'M13 6l6 6-6 6' }]],
      chevronLeft: [['path', { d: 'M15 5l-7 7 7 7' }]],
      chevronRight: [['path', { d: 'M9 5l7 7-7 7' }]],
      plus: [['line', { x1: 12, y1: 5, x2: 12, y2: 19 }], ['line', { x1: 5, y1: 12, x2: 19, y2: 12 }]],
      minus: [['line', { x1: 5, y1: 12, x2: 19, y2: 12 }]],
      check: [['path', { d: 'M5 12.5l4.5 4.5L19 7.5' }]],
      alert: [['circle', { cx: 12, cy: 12, r: 9 }], ['line', { x1: 12, y1: 7.5, x2: 12, y2: 13 }], ['line', { x1: 12, y1: 16.5, x2: 12, y2: 16.6 }]],
      star: [['path', { d: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z' }]],
      box: [['path', { d: 'M4 8l8-4 8 4v8l-8 4-8-4V8z' }], ['path', { d: 'M4 8l8 4 8-4M12 12v8' }]],
      logout: [['path', { d: 'M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4' }], ['path', { d: 'M10 8l-4 4 4 4' }], ['line', { x1: 6, y1: 12, x2: 15, y2: 12 }]],
    },
  },
  // Ikon kategori, kunci = slug kategori
  category: {
    viewBox: UI,
    icons: {
      'ruang-tamu': [['path', { d: 'M4 18V10a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8' }], ['path', { d: 'M2 18h20' }], ['path', { d: 'M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2' }]],
      pencahayaan: [['line', { x1: 12, y1: 2, x2: 12, y2: 9 }], ['path', { d: 'M6 9h12l3 11H3L6 9z' }]],
      tekstil: [['rect', { x: 4, y: 5, width: 16, height: 12, rx: 2 }], ['path', { d: 'M4 17c1-3 15-3 16 0' }]],
      'meja-makan': [['path', { d: 'M6 3h12l-1 9a5 5 0 0 1-10 0L6 3z' }], ['path', { d: 'M9 3v3M15 3v3' }]],
      penyimpanan: [['rect', { x: 4, y: 7, width: 16, height: 13, rx: 2 }], ['path', { d: 'M9 7V5a3 3 0 0 1 6 0v2' }]],
      dekorasi: [['circle', { cx: 12, cy: 12, r: 8 }], ['path', { d: 'M12 8v4l3 2' }]],
    },
  },
  // Placeholder gambar produk (dipakai bila backend belum punya image_url)
  product: {
    viewBox: PRODUCT,
    icons: {
      lamp: [['ellipse', { cx: 50, cy: 30, rx: 18, ry: 14 }], ['line', { x1: 50, y1: 44, x2: 50, y2: 78 }], ['ellipse', { cx: 50, cy: 82, rx: 16, ry: 4 }]],
      'rattan-chair': [['path', { d: 'M25 80V52a10 10 0 0 1 10-10h30a10 10 0 0 1 10 10v28' }], ['path', { d: 'M25 62h50' }], ['line', { x1: 20, y1: 80, x2: 20, y2: 68 }], ['line', { x1: 80, y1: 80, x2: 80, y2: 68 }]],
      mug: [['path', { d: 'M35 45c0-8 6-14 15-14s15 6 15 14v28a4 4 0 0 1-4 4H39a4 4 0 0 1-4-4V45z' }], ['path', { d: 'M62 50c8 0 12 5 12 10s-6 8-12 6' }]],
      plant: [['path', { d: 'M40 80V55c0-10 4-18 10-24 6 6 10 14 10 24v25' }], ['path', { d: 'M30 80h40' }], ['path', { d: 'M50 55c-10-2-16-12-14-22 10 0 18 8 18 18' }], ['path', { d: 'M50 55c10-2 16-12 14-22-10 0-18 8-18 18' }]],
      basket: [['path', { d: 'M28 40h44l-6 40H34l-6-40z' }], ['path', { d: 'M28 40l6-4h32l6 4' }], ['line', { x1: 36, y1: 46, x2: 40, y2: 76 }], ['line', { x1: 50, y1: 46, x2: 50, y2: 76 }], ['line', { x1: 64, y1: 46, x2: 60, y2: 76 }]],
      mirror: [['ellipse', { cx: 50, cy: 42, rx: 22, ry: 28 }], ['ellipse', { cx: 50, cy: 42, rx: 16, ry: 22 }], ['line', { x1: 50, y1: 70, x2: 50, y2: 82 }], ['line', { x1: 38, y1: 82, x2: 62, y2: 82 }]],
      'boucle-chair': [['path', { d: 'M25 80V50a12 12 0 0 1 12-12h26a12 12 0 0 1 12 12v30' }], ['path', { d: 'M25 64h50' }], ['path', { d: 'M25 64c-6 0-8 10-2 12h4' }], ['path', { d: 'M75 64c6 0 8 10 2 12h-4' }]],
      vases: [['path', { d: 'M38 78V45c0-8 5-13 12-13s12 5 12 13v33' }], ['path', { d: 'M65 78V55c0-6 4-10 9-10s9 4 9 10v23' }], ['path', { d: 'M30 78h48' }]],
      pillow: [['rect', { x: 28, y: 30, width: 44, height: 44, rx: 8 }], ['path', { d: 'M28 52h44' }]],
      chest: [['rect', { x: 24, y: 38, width: 52, height: 34, rx: 4 }], ['path', { d: 'M24 50h52' }], ['line', { x1: 35, y1: 38, x2: 35, y2: 72 }], ['line', { x1: 65, y1: 38, x2: 65, y2: 72 }]],
      rug: [['rect', { x: 16, y: 38, width: 68, height: 34, rx: 4 }], ['rect', { x: 24, y: 46, width: 52, height: 18, rx: 2 }]],
      blanket: [['path', { d: 'M22 40h56v34H22z' }], ['path', { d: 'M22 52h56M22 62h56' }], ['path', { d: 'M30 74v6M42 74v6M54 74v6M66 74v6' }]],
      plates: [['ellipse', { cx: 50, cy: 64, rx: 28, ry: 8 }], ['ellipse', { cx: 50, cy: 56, rx: 28, ry: 8 }], ['ellipse', { cx: 50, cy: 48, rx: 28, ry: 8 }]],
      shelf: [['line', { x1: 20, y1: 36, x2: 80, y2: 36 }], ['line', { x1: 20, y1: 58, x2: 80, y2: 58 }], ['line', { x1: 26, y1: 36, x2: 26, y2: 78 }], ['line', { x1: 74, y1: 36, x2: 74, y2: 78 }], ['rect', { x: 36, y: 44, width: 10, height: 14 }], ['rect', { x: 54, y: 48, width: 12, height: 10 }]],
      box: [['path', { d: 'M26 38l24-12 24 12v28L50 78 26 66V38z' }], ['path', { d: 'M26 38l24 12 24-12M50 50v28' }]],
    },
  },
}

/** Cari ikon berdasarkan nama di salah satu set. Mengembalikan { viewBox, shapes } atau null. */
export function resolveIcon(name, set) {
  const sets = set ? [iconSets[set]] : Object.values(iconSets)
  for (const s of sets) {
    if (s && s.icons[name]) return { viewBox: s.viewBox, shapes: s.icons[name] }
  }
  return null
}
