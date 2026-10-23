// Data contoh. Bentuknya SAMA dengan kontrak API di docs/api-contract-frontend.md,
// jadi saat backend siap cukup set VITE_USE_MOCK=false.

export const categories = [
  { id: 1, name: 'Ruang tamu', slug: 'ruang-tamu' },
  { id: 2, name: 'Pencahayaan', slug: 'pencahayaan' },
  { id: 3, name: 'Tekstil', slug: 'tekstil' },
  { id: 4, name: 'Meja makan', slug: 'meja-makan' },
  { id: 5, name: 'Penyimpanan', slug: 'penyimpanan' },
  { id: 6, name: 'Dekorasi', slug: 'dekorasi' },
]

const cat = (slug) => categories.find((c) => c.slug === slug)

// icon = kunci placeholder gambar (lihat components/ui/icons.js)
export const products = [
  { id: 1, name: 'Lampu Meja Linen', price: 620000, stock: 14, icon: 'lamp', category: cat('pencahayaan'), is_new: true, created_at: '2026-10-08T08:00:00Z', description: 'Lampu meja dengan kap linen berwarna gading yang menyebarkan cahaya hangat. Cocok untuk sudut baca atau meja samping tempat tidur. Tinggi 42 cm, kabel 1,8 m.' },
  { id: 2, name: 'Kursi Santai Rotan', price: 3850000, stock: 5, icon: 'rattan-chair', category: cat('ruang-tamu'), is_new: false, created_at: '2026-09-20T08:00:00Z', description: 'Kursi santai berangka kayu jati dengan anyaman rotan alami. Ringan dipindahkan, nyaman untuk duduk lama. Dimensi 70 × 75 × 80 cm.' },
  { id: 3, name: 'Set Mug Keramik', price: 290000, stock: 40, icon: 'mug', category: cat('meja-makan'), is_new: true, created_at: '2026-10-09T08:00:00Z', description: 'Satu set empat mug keramik glasir matte dengan warna tanah. Aman untuk microwave dan mesin pencuci piring. Kapasitas 320 ml per mug.' },
  { id: 4, name: 'Tanaman Pakis Sintetis', price: 485000, stock: 22, icon: 'plant', category: cat('dekorasi'), is_new: false, created_at: '2026-09-12T08:00:00Z', description: 'Tanaman pakis tiruan dalam pot semen, tampak segar tanpa perlu disiram. Tinggi total 55 cm.' },
  { id: 5, name: 'Keranjang Anyaman Pasar', price: 410000, stock: 18, icon: 'basket', category: cat('penyimpanan'), is_new: false, created_at: '2026-09-02T08:00:00Z', description: 'Keranjang anyaman dengan dua pegangan kulit. Muat untuk selimut, majalah, atau mainan. Diameter 38 cm.' },
  { id: 6, name: 'Cermin Bingkai Kayu Oak', price: 1150000, stock: 7, icon: 'mirror', category: cat('dekorasi'), is_new: true, created_at: '2026-10-07T08:00:00Z', description: 'Cermin oval berbingkai kayu oak solid dengan finishing minyak alami. Bisa digantung atau disandarkan. 50 × 80 cm.' },
  { id: 7, name: 'Kursi Boucle', price: 5200000, stock: 3, icon: 'boucle-chair', category: cat('ruang-tamu'), is_new: false, created_at: '2026-08-21T08:00:00Z', description: 'Kursi dengan kain boucle bertekstur lembut dan kaki kayu ramping. Busa padat yang tidak mudah kempis.' },
  { id: 8, name: 'Set Vas Terakota', price: 540000, stock: 25, icon: 'vases', category: cat('dekorasi'), is_new: false, created_at: '2026-08-30T08:00:00Z', description: 'Dua vas terakota bentuk berbeda, dibuat tangan sehingga setiap pasang sedikit unik. Tinggi 22 cm dan 18 cm.' },
  { id: 9, name: 'Bantal Sofa Linen', price: 350000, stock: 31, icon: 'pillow', category: cat('tekstil'), is_new: false, created_at: '2026-08-15T08:00:00Z', description: 'Sarung bantal linen cuci-enzim yang makin lembut setiap dicuci, lengkap dengan isian dakron. 45 × 45 cm.' },
  { id: 10, name: 'Peti Rotan Serbaguna', price: 1980000, stock: 0, icon: 'chest', category: cat('penyimpanan'), is_new: false, created_at: '2026-07-28T08:00:00Z', description: 'Peti penyimpanan berpenutup dari rotan, bisa jadi bangku tambahan. Saat ini sedang habis, sedang dalam proses restok.' },
  { id: 11, name: 'Karpet Wol Tenun', price: 2750000, stock: 6, icon: 'rug', category: cat('tekstil'), is_new: false, created_at: '2026-07-10T08:00:00Z', description: 'Karpet wol tenun tangan dengan pola geometris halus. Ukuran 160 × 230 cm.' },
  { id: 12, name: 'Selimut Rajut Hangat', price: 520000, stock: 16, icon: 'blanket', category: cat('tekstil'), is_new: false, created_at: '2026-07-02T08:00:00Z', description: 'Selimut rajut katun tebal dengan rumbai di ujung, nyaman untuk malam yang dingin. 130 × 170 cm.' },
  { id: 13, name: 'Set Piring Stoneware', price: 780000, stock: 12, icon: 'plates', category: cat('meja-makan'), is_new: false, created_at: '2026-06-18T08:00:00Z', description: 'Enam piring makan stoneware glasir krem dengan tepi sedikit tidak rata yang memberi karakter. Diameter 26 cm.' },
  { id: 14, name: 'Rak Dinding Kayu', price: 690000, stock: 9, icon: 'shelf', category: cat('penyimpanan'), is_new: false, created_at: '2026-06-05T08:00:00Z', description: 'Rak dinding dua tingkat dari kayu mahoni, lengkap dengan bracket tersembunyi. Lebar 80 cm.' },
]

export const seedReviews = [
  { id: 1, product_id: 1, user_name: 'Dewi A.', rating: 5, comment: 'Cahayanya hangat banget, pas buat baca sebelum tidur. Kapnya rapi.', created_at: '2026-10-09T10:20:00Z' },
  { id: 2, product_id: 1, user_name: 'Raka P.', rating: 4, comment: 'Bagus dan sesuai foto. Kabelnya agak pendek untuk meja yang jauh dari stopkontak.', created_at: '2026-10-10T09:00:00Z' },
  { id: 3, product_id: 2, user_name: 'Sinta M.', rating: 5, comment: 'Nyaman dan anyamannya halus, tidak menusuk. Sangat puas.', created_at: '2026-10-01T14:10:00Z' },
  { id: 4, product_id: 3, user_name: 'Budi S.', rating: 4, comment: 'Warnanya cantik, ukurannya pas di tangan.', created_at: '2026-10-10T07:45:00Z' },
  { id: 5, product_id: 7, user_name: 'Laras K.', rating: 5, comment: 'Teksturnya mewah dan duduknya empuk tapi tetap padat.', created_at: '2026-09-12T16:30:00Z' },
  { id: 6, product_id: 7, user_name: 'Hendra W.', rating: 3, comment: 'Kualitas bagus tapi harganya cukup tinggi, pengiriman agak lama.', created_at: '2026-09-28T11:05:00Z' },
]

// Pesanan contoh. Bentuknya = respons GET /admin/orders (GET /orders sama, tanpa customer_*).
// Pelanggan demo (customer@example.com) = akun yang "login" di mode mock.
export const DEMO_CUSTOMER = { name: 'Pelanggan Demo', email: 'customer@example.com' }
const customers = {
  demo: DEMO_CUSTOMER,
  dewi: { name: 'Dewi Anggraini', email: 'dewi@example.com' },
  raka: { name: 'Raka Pratama', email: 'raka@example.com' },
}
const address = {
  demo: { shipping_name: 'Pelanggan Demo', shipping_phone: '081234567890', shipping_address: 'Jl. Mawar No. 1', shipping_city: 'Bogor', shipping_postal_code: '16111' },
  dewi: { shipping_name: 'Dewi Anggraini', shipping_phone: '081298765432', shipping_address: 'Jl. Kenanga No. 8', shipping_city: 'Bandung', shipping_postal_code: '40115' },
  raka: { shipping_name: 'Raka Pratama', shipping_phone: '081377788899', shipping_address: 'Jl. Melati No. 21', shipping_city: 'Depok', shipping_postal_code: '16424' },
}

let nextItemId = 1
function order(id, created_at, status, payment_status, who, lines) {
  const items = lines.map(([productId, quantity]) => {
    const p = products.find((x) => x.id === productId)
    return { id: nextItemId++, product_id: p.id, name: p.name, quantity, price: p.price, line_total: p.price * quantity }
  })
  return {
    id,
    status,
    payment_status,
    total_amount: items.reduce((sum, it) => sum + it.line_total, 0),
    created_at,
    ...address[who],
    items,
    customer_name: customers[who].name,
    customer_email: customers[who].email,
  }
}

export const seedOrders = [
  order(1, '2026-10-03T09:15:00Z', 'completed', 'paid', 'demo', [[1, 1]]),
  order(2, '2026-10-04T13:40:00Z', 'completed', 'paid', 'dewi', [[2, 1], [9, 2]]),
  order(3, '2026-10-06T08:05:00Z', 'completed', 'paid', 'raka', [[3, 2]]),
  order(4, '2026-10-06T19:22:00Z', 'cancelled', 'refunded', 'dewi', [[11, 1]]),
  order(5, '2026-10-08T10:30:00Z', 'shipped', 'paid', 'demo', [[6, 1], [4, 1]]),
  order(6, '2026-10-09T15:12:00Z', 'shipped', 'paid', 'raka', [[13, 1], [12, 1]]),
  order(7, '2026-10-10T11:48:00Z', 'paid', 'paid', 'dewi', [[7, 1]]),
  order(8, '2026-10-11T07:55:00Z', 'paid', 'paid', 'demo', [[5, 2], [8, 1]]),
  order(9, '2026-10-12T16:20:00Z', 'pending', 'unpaid', 'raka', [[14, 1]]),
  order(10, '2026-10-12T18:02:00Z', 'pending', 'failed', 'demo', [[3, 1], [1, 1]]),
]
