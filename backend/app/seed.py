from datetime import datetime, timezone, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models import Category, Product, Review, Order, OrderItem, User
from app.core.security import hash_password

CATEGORIES = [
    {"id": 1, "name": "Ruang tamu", "slug": "ruang-tamu"},
    {"id": 2, "name": "Pencahayaan", "slug": "pencahayaan"},
    {"id": 3, "name": "Tekstil", "slug": "tekstil"},
    {"id": 4, "name": "Meja makan", "slug": "meja-makan"},
    {"id": 5, "name": "Penyimpanan", "slug": "penyimpanan"},
    {"id": 6, "name": "Dekorasi", "slug": "dekorasi"},
]

PRODUCTS = [
    {"id": 1, "name": "Lampu Meja Linen", "price": 620000, "stock": 14, "category_id": 2, "is_new": True, "description": "Lampu meja dengan kap linen berwarna gading yang menyebarkan cahaya hangat. Cocok untuk sudut baca atau meja samping tempat tidur. Tinggi 42 cm, kabel 1,8 m."},
    {"id": 2, "name": "Kursi Santai Rotan", "price": 3850000, "stock": 5, "category_id": 1, "is_new": False, "description": "Kursi santai berangka kayu jati dengan anyaman rotan alami. Ringan dipindahkan, nyaman untuk duduk lama. Dimensi 70 × 75 × 80 cm."},
    {"id": 3, "name": "Set Mug Keramik", "price": 290000, "stock": 40, "category_id": 4, "is_new": True, "description": "Satu set empat mug keramik glasir matte dengan warna tanah. Aman untuk microwave dan mesin pencuci piring. Kapasitas 320 ml per mug."},
    {"id": 4, "name": "Tanaman Pakis Sintetis", "price": 485000, "stock": 22, "category_id": 6, "is_new": False, "description": "Tanaman pakis tiruan dalam pot semen, tampak segar tanpa perlu disiram. Tinggi total 55 cm."},
    {"id": 5, "name": "Keranjang Anyaman Pasar", "price": 410000, "stock": 18, "category_id": 5, "is_new": False, "description": "Keranjang anyaman dengan dua pegangan kulit. Muat untuk selimut, majalah, atau mainan. Diameter 38 cm."},
    {"id": 6, "name": "Cermin Bingkai Kayu Oak", "price": 1150000, "stock": 7, "category_id": 6, "is_new": True, "description": "Cermin oval berbingkai kayu oak solid dengan finishing minyak alami. Bisa digantung atau disandarkan. 50 × 80 cm."},
    {"id": 7, "name": "Kursi Boucle", "price": 5200000, "stock": 3, "category_id": 1, "is_new": False, "description": "Kursi dengan kain boucle bertekstur lembut dan kaki kayu ramping. Busa padat yang tidak mudah kempis."},
    {"id": 8, "name": "Set Vas Terakota", "price": 540000, "stock": 25, "category_id": 6, "is_new": False, "description": "Dua vas terakota bentuk berbeda, dibuat tangan sehingga setiap pasang sedikit unik. Tinggi 22 cm dan 18 cm."},
    {"id": 9, "name": "Bantal Sofa Linen", "price": 350000, "stock": 31, "category_id": 3, "is_new": False, "description": "Sarung bantal linen cuci-enzim yang makin lembut setiap dicuci, lengkap dengan isian dakron. 45 × 45 cm."},
    {"id": 10, "name": "Peti Rotan Serbaguna", "price": 1980000, "stock": 0, "category_id": 5, "is_new": False, "description": "Peti penyimpanan berpenutup dari rotan, bisa jadi bangku tambahan. Saat ini sedang habis, sedang dalam proses restok."},
    {"id": 11, "name": "Karpet Wol Tenun", "price": 2750000, "stock": 6, "category_id": 3, "is_new": False, "description": "Karpet wol tenun tangan dengan pola geometris halus. Ukuran 160 × 230 cm."},
    {"id": 12, "name": "Selimut Rajut Hangat", "price": 520000, "stock": 16, "category_id": 3, "is_new": False, "description": "Selimut rajut katun tebal dengan rumbai di ujung, nyaman untuk malam yang dingin. 130 × 170 cm."},
    {"id": 13, "name": "Set Piring Stoneware", "price": 780000, "stock": 12, "category_id": 4, "is_new": False, "description": "Enam piring makan stoneware glasir krem dengan tepi sedikit tidak rata yang memberi karakter. Diameter 26 cm."},
    {"id": 14, "name": "Rak Dinding Kayu", "price": 690000, "stock": 9, "category_id": 5, "is_new": False, "description": "Rak dinding dua tingkat dari kayu mahoni, lengkap dengan bracket tersembunyi. Lebar 80 cm."},
]

REVIEWS = [
    {"product_id": 1, "user_name": "Dewi A.", "rating": 5, "comment": "Cahayanya hangat banget, pas buat baca sebelum tidur. Kapnya rapi."},
    {"product_id": 1, "user_name": "Raka P.", "rating": 4, "comment": "Bagus dan sesuai foto. Kabelnya agak pendek untuk meja yang jauh dari stopkontak."},
    {"product_id": 2, "user_name": "Sinta M.", "rating": 5, "comment": "Nyaman dan anyamannya halus, tidak menusuk. Sangat puas."},
    {"product_id": 3, "user_name": "Budi S.", "rating": 4, "comment": "Warnanya cantik, ukurannya pas di tangan."},
    {"product_id": 7, "user_name": "Laras K.", "rating": 5, "comment": "Teksturnya mewah dan duduknya empuk tapi tetap padat."},
    {"product_id": 7, "user_name": "Hendra W.", "rating": 3, "comment": "Kualitas bagus tapi harganya cukup tinggi, pengiriman agak lama."},
]

SEED_USERS = [
    {"full_name": "Admin Toko", "email": "admin@example.com", "password": "admin12345", "role": "admin"},
    {"full_name": "Customer Demo", "email": "customer@example.com", "password": "customer12345", "role": "customer"},
]

def seed_users(db: Session):
    for u in SEED_USERS:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            db.add(User(
                full_name=u["full_name"],
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            ))
    db.commit()

def seed_data(db: Session):
    seed_users(db)
    for c in CATEGORIES:
        existing = db.query(Category).filter(Category.id == c["id"]).first()
        if not existing:
            db.add(Category(**c))
    db.commit()

    for p in PRODUCTS:
        existing = db.query(Product).filter(Product.id == p["id"]).first()
        if not existing:
            db.add(Product(**p))
    db.commit()

    if db.query(Review).count() == 0:
        for r in REVIEWS:
            db.add(Review(**r))
        db.commit()

    if db.query(Order).count() == 0:
        customer = db.query(User).filter(User.email == "customer@example.com").first()
        cid = customer.id if customer else None
        now = datetime.now(timezone.utc)
        o1 = Order(user_id=cid, total_amount=620000, status="paid", payment_status="paid", created_at=now - timedelta(days=2))
        o2 = Order(user_id=cid, total_amount=4140000, status="paid", payment_status="paid", created_at=now - timedelta(days=1))
        o3 = Order(user_id=cid, total_amount=290000, status="completed", payment_status="paid", created_at=now)
        db.add_all([o1, o2, o3])
        db.commit()

        db.add_all([
            OrderItem(order_id=o1.id, product_id=1, quantity=1, price=620000),
            OrderItem(order_id=o2.id, product_id=2, quantity=1, price=3850000),
            OrderItem(order_id=o2.id, product_id=3, quantity=1, price=290000),
            OrderItem(order_id=o3.id, product_id=3, quantity=1, price=290000),
        ])
        db.commit()

    _sync_pg_sequences(db)

def _sync_pg_sequences(db: Session):
    # Seed memakai id eksplisit, jadi sequence PostgreSQL harus dimajukan
    # supaya INSERT berikutnya (mis. admin tambah produk) tidak bentrok di id=1.
    if db.bind.dialect.name != "postgresql":
        return
    for table in ("categories", "products", "reviews", "orders", "order_items"):
        db.execute(text(
            f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
            f"COALESCE((SELECT MAX(id) FROM {table}), 0) + 1, false)"
        ))
    db.commit()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_data(db)
    db.close()
    print("Database seeded successfully!")
