# 🏫 Marg'ilon shahri 26-son umumiy o'rta ta'lim maktabi — Rasmiy Axborot Portali

**Farg'ona viloyati Marg'ilon shahri 26-son umumiy o'rta ta'lim maktabi** uchun ishlab chiqilgan zamonaviy, tezkor, ko'p tilli va to'liq boshqariladigan (Admin CMS) veb-portal.

🌐 **Jonli manzil (GitHub Pages):** [https://smamatov637-stack.github.io/26-maktab/](https://smamatov637-stack.github.io/26-maktab/)

---

## ✨ Asosiy imkoniyatlar (v5.0)

### 1. 🌐 Ko'p tilli tizim va Maxsus imkoniyatlar
- **3 ta til rejimi:** O'zbek lotin (`O'Z`), O'zbek kirill (`ЎЗ` — barcha dinamik e'lon va matnlarni ham avtomatik transliteratsiya qiladi!) hamda Rus tili (`РУ`).
- **Maxsus imkoniyatlar (Accessibility):** Shrift o'lchamini boshqarish (`A−`, `A`, `A+`), oq-qora (kontrast) rejim hamda **Kunduzgi / Tungi (Dark Mode)** mavzular.

### 2. 🕒 Jonli Toshkent vaqti va Qo'ng'iroqlar trekeri (`UTC+5`)
- Foydalanuvchi qaysi qurilmadan kirishidan qat'i nazar, **Toshkent / Marg'ilon vaqti** bo'yicha ayni damda nechanchi smena, nechanchi soat dars yoki tanaffus davom etayotganini real vaqtda hisoblaydi va jadvalda yoritib ko'rsatadi.

### 3. 📊 Tahliliy statistika va Maktab pasporti
- O'quvchilar soni, pedagogik jamoa, o'quv xonalari va loyihaviy sig'im bo'yicha jonli animatsion ko'rsatkichlar.
- **Pedagogik salohiyat diagrammasi** (Oliy, I, II toifali va mutaxassis o'qituvchilar ulushi).
- **Maktab pasportini chop etish (`🖨️`)**: Bir tugma orqali maktab ma'lumotnomasini qog'ozga yoki PDF formatga tayyorlash.

### 4. 🎯 To'garaklar katalogi va 📰 Yangiliklar markazi
- Yo'nalishlar bo'yicha saralash (`Aniq fanlar`, `Tillar`, `IT`, `Sport va san'at`) va tezkor qidiruv.
- Yangiliklar, e'lonlar, olimpiada yutuqlari hamda to'liq maqola o'qish oynasi (Modal Reader).

### 5. 🖼️ Pro Fotogalereya va Aqlli rasm siqish (Smart Compression)
- Keng ekranli slayder, **Avto-namoyish (`▶`)**, **Fullscreen Lightbox (`🔍`)**, klaviatura va sensor (swipe) boshqaruvi.
- Admin orqali rasm yuklanganda HTML5 `<canvas>` yordamida sifatni saqlagan holda hajmni avtomatik optimallashtiradi — brauzer xotirasi to'lib qolmaydi.

### 6. 📍 Interaktiv Xarita va ✉️ Onlayn Murojaatlar
- **Leaflet** asosida oddiy xarita va **Sun'iy yo'ldosh (Satellite)** qatlamlari, shuningdek **Yandex Xarita**, **Google Maps** va **OpenStreetMap** tezkor yo'nalish tugmalari.
- Ota-onalar va fuqarolar yuborgan onlayn murojaatlar ro'yxat raqami (`#M26-XXXX`) bilan bevosita Admin panelning **«Murojaatlar»** qutisiga tushadi.

### 7. 🔐 Ko'p bo'limli Admin Boshqaruv Markazi (CMS)
Yuqori o'ng burchakdagi **«🔐 Kirish»** tugmasi orqali kiriladi (boshlang'ich parol: `1234`, sozlamalardan o'zgartirish mumkin):
1. **Ko'rsatkichlar va Pasport** — barcha raqamlar, aloqa va rahbariyat qabul kunlarini tahrirlash.
2. **Galereya** — kompyuter/telefondan rasm yuklash, URL orqali qo'shish, ketma-ketlikni surish (`←` / `→`), izoh yozish va o'chirish.
3. **Yangiliklar va E'lonlar** — yangi xabar chop etish va boshqarish.
4. **To'garaklar** — yangi fan yoki sport to'garaklarini qo'shish va tahrirlash.
5. **Murojaatlar (Inbox)** — kelib tushgan murojaatlarni o'qish va «Ko'rib chiqildi» deb belgilash.
6. **Zaxira va Xavfsizlik** — barcha ma'lumotlarni `.json` faylga eksport/import qilish va admin parolini yangilash.

---

## 📁 Loyiha tuzilmasi

```text
26-maktab/
├── index.html            # Asosiy semantik sahifa (SEO, OpenGraph, Schema.org JSON-LD)
├── 404.html              # GitHub Pages uchun maxsus 404 sahifasi
├── manifest.json         # PWA veb-ilova manifesti
├── robots.txt            # Qidiruv tizimlari uchun yo'riqnoma
├── sitemap.xml           # Google indeksatsiya xaritasi
├── assets/
│   ├── css/
│   │   └── styles.css    # Zamonaviy dizayn tizimi, Dark Mode va Print uslublari
│   ├── js/
│   │   ├── data.js       # Ma'lumotlar bazasi, v4->v5 migratsiya va 3 tilli lug'at
│   │   └── app.js        # Interaktiv modul va Admin CMS mantiqi
│   └── img/
│       └── emblem.svg    # 26-son maktab vektor gerbi
└── README.md             # Loyiha hujjati
```

---

## 🚀 Ishga tushirish

Loyiha hech qanday qo'shimcha yig'ish (build) bosqichini talab qilmaydi va **GitHub Pages** da to'g'ridan-to'g'ri ishlaydi. Lokal tekshirish uchun:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```
So'ng brauzerda `http://localhost:8000` manzilini oching.
