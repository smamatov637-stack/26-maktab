/* ==========================================================================
   MARG'ILON 26-SON MAKTAB — MA'LUMOTLAR BAZASI VA KO'P TILLI LUG'AT (i18n)
   ========================================================================== */
(function () {
  'use strict';

  const SCHOOL_COORDS = { lat: 40.4765, lng: 71.7380 };
  const LEGACY_STORE_KEY = 'maktab26_v4';
  const STORE_KEY = 'maktab26_portal_v5';

  const DEFAULT_IMAGES = [
    {
      src: 'https://i.ibb.co/sdQpJkkP/photo-2-2026-02-18-11-37-07.jpg',
      caption: "Marg'ilon shahri 26-son umumiy o'rta ta'lim maktabi bosh binosi"
    },
    {
      src: 'https://i.ibb.co/JFn1BZ6H/photo-1-2026-02-18-11-37-07.jpg',
      caption: "Maktab hududi va obodonlashtirilgan o'quv hovlisi"
    },
    {
      src: 'https://i.ibb.co/60LHCcWr/photo-3-2026-02-18-11-37-07.jpg',
      caption: "Zamonaviy ta'lim maskani — o'quv korpusi ko'rinishi"
    }
  ];

  const DEFAULT_NEWS = [
    {
      id: 'n1',
      category: 'yutuqlar',
      date: '2026-10-28',
      title: "Asosiy fan olimpiadasining maktab va shahar bosqichida yuqori natijalar qayd etildi",
      summary: "Maktabimizning 9–11-sinf o'quvchilari matematika, ingliz tili va ona tili fanlaridan faxrli o'rinlarni qo'lga kiritishdi.",
      body: "2026–2027 o'quv yili doirasida o'tkazilgan asosiy fan olimpiadalarida Marg'ilon shahri 26-son umumiy o'rta ta'lim maktabi o'quvchilari munosib ishtirok etishdi. Matematika, fizika, ingliz tili hamda ona tili va adabiyot yo'nalishlarida iqtidorli o'quvchilarimiz yuqori ball to'plab, keyingi bosqich yo'llanmasini qo'lga kiritdilar. G'olib o'quvchilar va ularning ustozlari maktab ma'muriyati tomonidan faxriy yorliq hamda esdalik sovg'alari bilan taqdirlandi."
    },
    {
      id: 'n2',
      category: 'elonlar',
      date: '2026-10-24',
      title: "Ota-onalar uchun «Ochiq eshiklar kuni» va choraklik muloqot uchrashuvlari",
      summary: "Farzandingizning o'zlashtirish ko'rsatkichlari, davomati va to'garaklardagi ishtiroki bilan yaqindan tanishing.",
      body: "Hurmatli ota-onalar! Maktabimizda ta'lim sifatini oshirish hamda «Oila — mahalla — maktab» hamkorligini mustahkamlash maqsadida har shanba kuni soat 10:00 dan 13:00 ga qadar ochiq muloqot soatlari tashkil etilmoqda. Tashrif davomida fan o'qituvchilari, sinf rahbarlari va maktab psixologi bilan suhbatlashishingiz, shuningdek eMaktab raqamli kundalik tizimidagi natijalar bo'yicha maslahat olishingiz mumkin."
    },
    {
      id: 'n3',
      category: 'yangiliklar',
      date: '2026-10-16',
      title: "Axborot texnologiyalari va xorijiy tillar to'garaklariga qo'shimcha qabul boshlandi",
      summary: "5–11-sinf o'quvchilari uchun kompyuter savodxonligi, algoritmlash va ingliz tili suhbat klublari bepul faoliyat yuritmoqda.",
      body: "O'quvchilarning bo'sh vaqtini mazmunli tashkil etish hamda zamonaviy kasb va til ko'nikmalarini shakllantirish maqsadida maktabimizda darsdan tashqari bepul fan va IT to'garaklari kengaytirildi. Mashg'ulotlar zamonaviy kompyuter xonalarida malakali pedagoglar tomonidan haftada 3 marotaba olib boriladi. Ro'yxatdan o'tish uchun sinf rahbari yoki o'quv ishlari bo'yicha direktor o'rinbosariga murojaat qiling."
    },
    {
      id: 'n4',
      category: 'tadbirlar',
      date: '2026-10-09',
      title: "«Besh muhim tashabbus» doirasida shaxmat va kitobxonlik haftaligi bo'lib o'tdi",
      summary: "Maktab axborot-resurs markazida «Yosh kitobxon» ko'rik-tanlovi hamda sinflararo shaxmat birinchiligi o'tkazildi.",
      body: "O'quvchi-yoshlar o'rtasida kitobxonlik madaniyatini yuksaltirish va mantiqiy fikrlashni rivojlantirish maqsadida 26-son maktabda ma'naviy-ma'rifiy haftalik tashkil etildi. Tanlovda 120 nafardan ortiq o'quvchilar o'zbek va jahon adabiyoti durdonalari bo'yicha bilimlarini sinovdan o'tkazdilar. Shaxmat musobaqasi g'oliblari shahar birinchiligida maktabimiz sharafini himoya qiladilar."
    }
  ];

  const DEFAULT_CLUBS = [
    {
      id: 'c1',
      category: 'stem',
      name: 'Yosh matematiklar va mantiq',
      grades: '5–11-sinflar',
      room: '204-xona',
      schedule: 'Dushanba · Chorshanba · Juma | 13:30 – 15:00',
      mentor: 'Aniq fanlar uslubiy birlashmasi'
    },
    {
      id: 'c2',
      category: 'lang',
      name: 'English Speaking & CEFR tayyorlov',
      grades: '5–11-sinflar',
      room: '211-xona',
      schedule: 'Seshanba · Payshanba · Shanba | 14:00 – 15:30',
      mentor: 'Xorijiy tillar kafedrasi'
    },
    {
      id: 'c3',
      category: 'it',
      name: 'Raqamli texnologiyalar va dasturlash',
      grades: '6–11-sinflar',
      room: 'AKT-1 sinfi',
      schedule: 'Dushanba · Payshanba | 14:00 – 15:30',
      mentor: 'Informatika va AKT fani'
    },
    {
      id: 'c4',
      category: 'stem',
      name: 'Amaliy fizika va laboratoriya',
      grades: '7–11-sinflar',
      room: 'Fizika lab.',
      schedule: 'Chorshanba · Juma | 14:00 – 15:30',
      mentor: 'Tabiiy va aniq fanlar'
    },
    {
      id: 'c5',
      category: 'lang',
      name: 'Rus tili erkin muloqot klubi',
      grades: '2–9-sinflar',
      room: '108-xona',
      schedule: 'Seshanba · Juma | 13:00 – 14:30',
      mentor: 'Rus tili va adabiyoti'
    },
    {
      id: 'c6',
      category: 'sport',
      name: 'Shaxmat — aql gimnastikasi',
      grades: '1–11-sinflar',
      room: "Ma'naviyat xonasi",
      schedule: 'Dushanba · Chorshanba · Shanba | 12:30 – 14:00',
      mentor: 'Sport va intellektual klub'
    },
    {
      id: 'c7',
      category: 'sport',
      name: 'Mini-futbol va voleybol seksiyasi',
      grades: '4–11-sinflar',
      room: 'Sport zali',
      schedule: 'Seshanba · Payshanba · Shanba | 15:00 – 16:30',
      mentor: 'Jismoniy tarbiya birlashmasi'
    },
    {
      id: 'c8',
      category: 'sport',
      name: 'Tasviriy san’at va ijodkorlik',
      grades: '1–8-sinflar',
      room: "San'at xonasi",
      schedule: 'Chorshanba · Shanba | 13:00 – 14:30',
      mentor: 'Estetik tarbiya yo‘nalishi'
    }
  ];

  const BELL_SCHEDULE = {
    shift1: [
      { num: 1, start: '08:00', end: '08:45', breakMin: 5 },
      { num: 2, start: '08:50', end: '09:35', breakMin: 10 },
      { num: 3, start: '09:45', end: '10:30', breakMin: 15 },
      { num: 4, start: '10:45', end: '11:30', breakMin: 5 },
      { num: 5, start: '11:35', end: '12:20', breakMin: 5 },
      { num: 6, start: '12:25', end: '13:10', breakMin: 0 }
    ],
    shift2: [
      { num: 1, start: '13:30', end: '14:15', breakMin: 5 },
      { num: 2, start: '14:20', end: '15:05', breakMin: 10 },
      { num: 3, start: '15:15', end: '16:00', breakMin: 10 },
      { num: 4, start: '16:10', end: '16:55', breakMin: 5 },
      { num: 5, start: '17:00', end: '17:45', breakMin: 5 },
      { num: 6, start: '17:50', end: '18:35', breakMin: 0 }
    ]
  };

  const DEFAULT_DATA = {
    students: 936,
    staff: 66,
    rooms: 32,
    capacity: 1000,
    teacherTop: 18,
    teacherFirst: 24,
    teacherSecond: 15,
    teacherSpec: 9,
    gradRate: 84,
    booksCount: 14500,
    itLabs: 2,
    foundedYear: 1990,
    phone: '+998 (73) 253-26-00',
    email: 'info@maktab26margilan.uz',
    telegram: 'https://t.me/margilon_26maktab',
    address: "Marg'ilon shahri, Farg'ona viloyati, O'zbekiston",
    workHours: 'Dushanba – Shanba, 08:00 – 17:00',
    shifts: '2 smenali · 1–11-sinflar',
    directorName: 'Maktab direktori',
    directorReception: 'Seshanba va Juma · 14:00 – 17:00',
    deputyAcademic: "O'quv ishlari bo'yicha direktor o'rinbosari",
    deputyAcademicReception: 'Dushanba va Payshanba · 14:00 – 16:30',
    deputySpiritual: "Ma'naviy-ma'rifiy ishlar bo'yicha o'rinbosar",
    deputySpiritualReception: 'Chorshanba va Shanba · 10:00 – 13:00',
    adminPass: '1234',
    images: DEFAULT_IMAGES,
    news: DEFAULT_NEWS,
    clubs: DEFAULT_CLUBS,
    appeals: []
  };

  function normalizeImages(imgs) {
    if (!Array.isArray(imgs) || imgs.length === 0) {
      return DEFAULT_IMAGES.map(item => ({ ...item }));
    }
    return imgs
      .map((item, idx) => {
        if (typeof item === 'string') {
          return {
            src: item,
            caption: DEFAULT_IMAGES[idx]
              ? DEFAULT_IMAGES[idx].caption
              : `Marg'ilon 26-son maktab fotolavhasi (${idx + 1}-rasm)`
          };
        }
        if (item && typeof item === 'object' && item.src) {
          return {
            src: String(item.src),
            caption: item.caption || `Marg'ilon 26-son maktab fotolavhasi (${idx + 1}-rasm)`
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  function loadPortalData() {
    try {
      const rawV5 = localStorage.getItem(STORE_KEY);
      if (rawV5) {
        const parsed = JSON.parse(rawV5);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          images: normalizeImages(parsed.images),
          news: Array.isArray(parsed.news) ? parsed.news : DEFAULT_NEWS.map(n => ({ ...n })),
          clubs: Array.isArray(parsed.clubs) ? parsed.clubs : DEFAULT_CLUBS.map(c => ({ ...c })),
          appeals: Array.isArray(parsed.appeals) ? parsed.appeals : []
        };
      }
      // Avvalgi versiyadan (maktab26_v4) ma'lumotlarni ehtiyotkorlik bilan ko'chirish
      const rawLegacy = localStorage.getItem(LEGACY_STORE_KEY);
      if (rawLegacy) {
        const legacy = JSON.parse(rawLegacy);
        const migrated = {
          ...DEFAULT_DATA,
          students: typeof legacy.students === 'number' ? legacy.students : DEFAULT_DATA.students,
          staff: typeof legacy.staff === 'number' ? legacy.staff : DEFAULT_DATA.staff,
          rooms: typeof legacy.rooms === 'number' ? legacy.rooms : DEFAULT_DATA.rooms,
          capacity: typeof legacy.capacity === 'number' ? legacy.capacity : DEFAULT_DATA.capacity,
          images: normalizeImages(legacy.images)
        };
        localStorage.setItem(STORE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch (err) {
      console.warn('LocalStorage o‘qishda xatolik:', err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function savePortalData(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  function getStorageUsageKB() {
    try {
      const str = localStorage.getItem(STORE_KEY) || '';
      return Math.round((str.length * 2) / 1024);
    } catch {
      return 0;
    }
  }

  /* ========================================================================
     O'ZBEK LOTIN -> KIRILL AVTOMATIK TRANSLITERATORI
     (URL, email va raqamlarga tegmagan holda aniq o'giradi)
     ======================================================================== */
  function latinToCyrillic(input) {
    if (!input || typeof input !== 'string') return input;

    // URL, email va xalqaro abbreviaturalarni vaqtincha himoyalash
    const protectedTokens = [];
    let text = input.replace(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\b(?:eMaktab|CEFR|STEM|IELTS|HTML|JSON|PDF|UZ|GPS|UTC)\b)/g, match => {
      protectedTokens.push(match);
      return `\uE000${protectedTokens.length - 1}\uE001`;
    });

    // Apostroflarni yagona shaklga keltirish
    text = text.replace(/[‘’ʼ`´]/g, "'");

    // Qo'sh harflar (digraflar)
    text = text
      .replace(/O'/g, 'Ў')
      .replace(/o'/g, 'ў')
      .replace(/G'/g, 'Ғ')
      .replace(/g'/g, 'ғ')
      .replace(/YO'/g, 'ЙЎ')
      .replace(/Yo'/g, 'Йў')
      .replace(/yo'/g, 'йў')
      .replace(/SH/g, 'Ш')
      .replace(/Sh/g, 'Ш')
      .replace(/sh/g, 'ш')
      .replace(/CH/g, 'Ч')
      .replace(/Ch/g, 'Ч')
      .replace(/ch/g, 'ч')
      .replace(/YO/g, 'Ё')
      .replace(/Yo/g, 'Ё')
      .replace(/yo/g, 'ё')
      .replace(/YU/g, 'Ю')
      .replace(/Yu/g, 'Ю')
      .replace(/yu/g, 'ю')
      .replace(/YA/g, 'Я')
      .replace(/Ya/g, 'Я')
      .replace(/ya/g, 'я')
      .replace(/TS/g, 'Ц')
      .replace(/Ts/g, 'Ц')
      .replace(/ts/g, 'ц')
      .replace(/YE/g, 'Е')
      .replace(/Ye/g, 'Е')
      .replace(/ye/g, 'е');

    // So'z boshida yoki unlidan/tutuq belgisidan keyin kelgan E/e -> Э/э
    text = text.replace(/(^|[\s(\["«—\-])E/g, '$1Э');
    text = text.replace(/(^|[\s(\["«—\-])e/g, '$1э');

    // Tutuq belgisi
    text = text.replace(/([A-Za-zА-Яа-яЎўҚқҒғҲҳ])'([A-Za-zА-Яа-яЎўҚқҒғҲҳ])/g, '$1ъ$2');
    text = text.replace(/'/g, '');

    const charMap = {
      A: 'А', a: 'а',
      B: 'Б', b: 'б',
      D: 'Д', d: 'д',
      E: 'Е', e: 'е',
      F: 'Ф', f: 'ф',
      G: 'Г', g: 'г',
      H: 'Ҳ', h: 'ҳ',
      I: 'И', i: 'и',
      J: 'Ж', j: 'ж',
      K: 'К', k: 'к',
      L: 'Л', l: 'л',
      M: 'М', m: 'м',
      N: 'Н', n: 'н',
      O: 'О', o: 'о',
      P: 'П', p: 'п',
      Q: 'Қ', q: 'қ',
      R: 'Р', r: 'р',
      S: 'С', s: 'с',
      T: 'Т', t: 'т',
      U: 'У', u: 'у',
      V: 'В', v: 'в',
      X: 'Х', x: 'х',
      Y: 'Й', y: 'й',
      Z: 'З', z: 'з',
      C: 'К', c: 'к',
      W: 'В', w: 'в'
    };

    text = text.replace(/[A-Za-z]/g, ch => charMap[ch] || ch);

    // Himoyalangan URL/emaillarni qayta tiklash
    text = text.replace(/\uE000(\d+)\uE001/g, (_, idx) => protectedTokens[Number(idx)] || '');
    return text;
  }

  /* ========================================================================
     RUS TILI UCHUN TARJIMALAR (RU)
     ======================================================================== */
  const RU_TRANSLATIONS = {
    ministry_line: 'Министерство дошкольного и школьного образования РУз · Отдел ММТБ г. Маргилан',
    brand_title: 'Общеобразовательная школа №26 города Маргилан',
    brand_sub: 'Официальный информационный портал · Ферганская область',
    nav_stats: 'Показатели',
    nav_about: 'О школе',
    nav_schedule: 'Расписание',
    nav_news: 'Новости',
    nav_gallery: 'Галерея',
    nav_contact: 'Контакты',
    btn_login: '🔐 Вход',
    btn_admin_panel: '⚙️ Панель',
    btn_logout: 'Выйти',
    a11y_label: 'Спец. возможности',
    a11y_font: 'Размер шрифта',
    a11y_contrast: 'Черно-белый режим',

    hero_badge: '🏛️ Качественное образование с 1990 года · город Маргилан',
    hero_title: 'Средняя общеобразовательная школа №26 города Маргилан',
    hero_desc: 'Современная образовательная среда, национальные ценности и передовые методики обучения. Раскрываем потенциал и таланты каждого ученика с 1 по 11 класс.',
    hero_cta_primary: '📬 Обращение и приём',
    hero_cta_schedule: '🕒 Расписание звонков',
    hero_cta_passport: '🖨️ Паспорт школы',
    hero_pill_1: '✓ 1–11 классы (гос. стандарт)',
    hero_pill_2: '✓ Цифровой дневник eMaktab',
    hero_pill_3: '✓ Бесплатные кружки и спорт',
    hero_live_title: 'Учебный процесс (Ташкент UTC+5)',
    hero_year_badge: '2026–2027 учебный год',

    stats_kicker: 'ОСНОВНЫЕ ПОКАЗАТЕЛИ',
    stats_title: 'Школа в цифрах и фактах',
    stats_desc: 'Открытые статистические показатели деятельности школы №26 города Маргилан за 2026–2027 учебный год',
    stat_students: 'Численность учащихся',
    stat_students_sub: 'Обучаются в 1–11 классах',
    stat_staff: 'Педагогический состав',
    stat_staff_sub: 'Квалифицированные учителя и наставники',
    stat_rooms: 'Учебные кабинеты',
    stat_rooms_sub: 'Предметные кабинеты и лаборатории',
    stat_capacity: 'Проектная мощность',
    stat_capacity_sub: 'Мест расчётной вместимости',
    analytics_teachers_title: 'Квалификационный потенциал педагогов',
    cat_top: 'Высшая категория',
    cat_first: 'I категория',
    cat_second: 'II категория',
    cat_spec: 'Специалисты',
    analytics_infra_title: 'Инфраструктура и эффективность',
    metric_occupancy: 'Заполняемость школы',
    metric_ratio: 'Соотношение ученик / учитель',
    metric_grad: 'Поступление выпускников в ВУЗы и проф. учебные заведения',
    metric_books: 'Фонд информационно-ресурсного центра (книг)',

    about_kicker: 'О НАШЕЙ ШКОЛЕ',
    about_title: 'Образовательные направления и паспорт учреждения',
    about_desc: 'Гармоничное сочетание фундаментальных знаний, цифровых навыков и духовно-просветительского воспитания',
    pillar_1_t: 'Точные и естественные науки (STEM)',
    pillar_1_d: 'Углублённые занятия по математике, физике, химии и биологии с лабораторной практикой.',
    pillar_2_t: 'Иностранные языки',
    pillar_2_d: 'Обучение английскому и русскому языкам по коммуникативной методике, подготовка к сертификатам CEFR.',
    pillar_3_t: 'Цифровые технологии и ИТ',
    pillar_3_d: 'Компьютерная грамотность, основы алгоритмизации и работа в современных компьютерных классах.',
    pillar_4_t: 'Олимпиады и работа с одарёнными',
    pillar_4_d: 'Системная подготовка к предметным олимпиадам, интеллектуальным играм «Заковат» и конкурсам.',
    pillar_5_t: 'Спорт и Пять важных инициатив',
    pillar_5_d: 'Секции шахмат, мини-футбола, волейбола, изобразительного искусства и музыкального творчества.',
    pillar_6_t: 'Информационно-ресурсный центр',
    pillar_6_d: 'Богатый библиотечный фонд учебной и художественной литературы, читальный зал для школьников.',

    passport_title: '📋 Официальный паспорт школы',
    pass_name_lbl: 'Полное наименование',
    pass_name_val: 'Общеобразовательная школа №26 г. Маргилан Ферганской области',
    pass_year_lbl: 'Год основания',
    pass_type_lbl: 'Тип учреждения',
    pass_type_val: 'Государственная средняя общеобразовательная школа (1–11 кл.)',
    pass_lang_lbl: 'Язык обучения',
    pass_lang_val: 'Узбекский язык',
    pass_shift_lbl: 'Режим сменности',
    pass_hours_lbl: 'Рабочее время',
    pass_addr_lbl: 'Юридический адрес',

    admin_card_title: '🏛️ Руководство и часы приёма граждан',
    admin_card_sub: 'Родители и граждане могут обратиться в установленные дни приёма или оставить онлайн-заявку',

    sched_kicker: 'УЧЕБНЫЙ РИТМ И КРУЖКИ',
    sched_title: 'Расписание звонков и бесплатные кружки',
    sched_desc: 'Актуальное время уроков в реальном времени и расписание внеклассных секций',
    bell_panel_title: '🔔 Расписание звонков',
    shift_1_btn: '1-я смена (08:00)',
    shift_2_btn: '2-я смена (13:30)',
    lesson_word: '-й урок',
    break_word: 'Перемена',
    break_none: 'Окончание смены',
    clubs_panel_title: '🎯 Предметные и спортивные кружки',
    filter_all: 'Все',
    filter_stem: 'Точные науки',
    filter_lang: 'Языки',
    filter_it: 'ИТ',
    filter_sport: 'Спорт и творчество',
    club_search_ph: 'Поиск кружка или класса...',

    news_kicker: 'ЖИЗНЬ ШКОЛЫ',
    news_title: 'Новости, объявления и достижения',
    news_desc: 'Важные события, результаты олимпиад и объявления для учащихся и родителей',
    news_all: 'Все',
    news_yangiliklar: 'Новости',
    news_elonlar: 'Объявления',
    news_yutuqlar: 'Достижения',
    news_tadbirlar: 'Мероприятия',
    news_search_ph: 'Поиск по новостям...',
    read_more: 'Подробнее →',

    gallery_kicker: 'ФОТОГАЛЕРЕЯ',
    gallery_title: 'Здание и учебная среда школы №26',
    gallery_desc: 'Фотографии территории, учебных корпусов и школьной жизни',
    btn_autoplay_on: '⏸ Пауза',
    btn_autoplay_off: '▶ Автопоказ',
    btn_fullscreen: '🔍 На весь экран',

    contact_kicker: 'КОНТАКТЫ И ОБРАЩЕНИЯ',
    contact_title: 'Расположение на карте и онлайн-приёмная',
    contact_desc: 'Свяжитесь с администрацией школы, проложите маршрут или отправьте обращение онлайн',
    map_head_title: '📍 Адрес школы — г. Маргилан, Ферганская область',
    map_layer_street: 'Схема',
    map_layer_sat: 'Спутник',
    map_reset: 'Центрировать',
    form_title: '✉️ Онлайн-обращение и запись на приём',
    form_sub: 'Ваше сообщение поступает напрямую в панель администрации школы',
    lbl_fullname: 'Ф.И.О. заявителя *',
    ph_fullname: 'Например: Каримов Анвар Рустамович',
    lbl_phone: 'Контактный телефон *',
    ph_phone: '+998 90 123-45-67',
    lbl_topic: 'Тема обращения',
    opt_question: 'Вопрос об обучении / школе',
    opt_reception: 'Запись на приём к директору',
    opt_club: 'Запись ребёнка в кружок',
    opt_suggestion: 'Предложение и отзыв',
    lbl_message: 'Текст обращения *',
    ph_message: 'Кратко опишите ваш вопрос или обращение...',
    btn_send_appeal: 'Отправить обращение',

    faq_kicker: 'ВОПРОСЫ И ОТВЕТЫ',
    faq_title: 'Часто задаваемые вопросы родителей',
    faq_q1: 'Как подать документы для приёма ребёнка в 1-й класс?',
    faq_a1: 'Приём в 1-й класс осуществляется ежегодно с 20 июня через единую электронную платформу Министерства дошкольного и школьного образования my.maktab.uz либо при личном обращении в приёмную комиссию школы с метрикой ребёнка и паспортом родителя.',
    faq_q2: 'Как подключиться к электронному дневнику eMaktab?',
    faq_a2: 'Логин и временный пароль для родителей и учеников выдаются классным руководителем. После получения данных войдите на платформу emaktab.uz для отслеживания оценок, расписания уроков и домашних заданий.',
    faq_q3: 'Бесплатны ли школьные кружки и спортивные секции?',
    faq_a3: 'Да, все предметные кружки, компьютерные занятия и спортивные секции в рамках «Пяти важных инициатив» внутри школы №26 проводятся абсолютно бесплатно.',
    faq_q4: 'В какие часы работает школа и когда приёмные дни администрации?',
    faq_a4: 'Школа открыта с понедельника по субботу с 08:00 до 17:00 (2-я смена учится до 18:35). График приёма директора и заместителей указан в разделе «О школе» выше, также доступна форма онлайн-обращения.',

    res_kicker: 'ГОСУДАРСТВЕННЫЕ ОБРАЗОВАТЕЛЬНЫЕ РЕСУРСЫ',
    footer_about: 'Государственная средняя общеобразовательная школа №26 города Маргилан Ферганской области. Качественное образование и воспитание с 1990 года.',
    footer_nav: 'Разделы портала',
    footer_contacts: 'Контактные данные',
    footer_rights: '© 2026 · Общеобразовательная школа №26 г. Маргилан Ферганской области. Все права защищены.'
  };

  const RU_DYNAMIC_MAP = {
    "Marg'ilon shahri 26-son umumiy o'rta ta'lim maktabi bosh binosi": "Главный учебный корпус общеобразовательной школы №26 города Маргилан",
    "Maktab hududi va obodonlashtirilgan o'quv hovlisi": "Благоустроенная территория и внутренний двор школы №26",
    "Zamonaviy ta'lim maskani — o'quv korpusi ko'rinishi": "Современное образовательное учреждение — вид учебного корпуса",
    "Asosiy fan olimpiadasining maktab va shahar bosqichida yuqori natijalar qayd etildi": "Высокие результаты учащихся на школьном и городском этапах предметных олимпиад",
    "Maktabimizning 9–11-sinf o'quvchilari matematika, ingliz tili va ona tili fanlaridan faxrli o'rinlarni qo'lga kiritishdi.": "Ученики 9–11 классов заняли призовые места по математике, английскому языку и родному языку.",
    "Ota-onalar uchun «Ochiq eshiklar kuni» va choraklik muloqot uchrashuvlari": "«День открытых дверей» и еженедельные встречи для родителей",
    "Farzandingizning o'zlashtirish ko'rsatkichlari, davomati va to'garaklardagi ishtiroki bilan yaqindan tanishing.": "Ознакомьтесь с успеваемостью, посещаемостью и участием вашего ребёнка во внеклассных кружках.",
    "Axborot texnologiyalari va xorijiy tillar to'garaklariga qo'shimcha qabul boshlandi": "Открыт дополнительный набор в бесплатные кружки по ИТ и иностранным языкам",
    "5–11-sinf o'quvchilari uchun kompyuter savodxonligi, algoritmlash va ingliz tili suhbat klublari bepul faoliyat yuritmoqda.": "Для учащихся 5–11 классов бесплатно работают клубы компьютерной грамотности, алгоритмизации и разговорного английского.",
    "«Besh muhim tashabbus» doirasida shaxmat va kitobxonlik haftaligi bo'lib o'tdi": "В рамках «Пяти важных инициатив» прошла неделя шахмат и чтения книг",
    "Maktab axborot-resurs markazida «Yosh kitobxon» ko'rik-tanlovi hamda sinflararo shaxmat birinchiligi o'tkazildi.": "В информационно-ресурсном центре школы прошли конкурс «Юный читатель» и межшкольный турнир по шахматам.",
    "Yosh matematiklar va mantiq": "Юные математики и логика",
    "English Speaking & CEFR tayyorlov": "English Speaking & подготовка к CEFR",
    "Raqamli texnologiyalar va dasturlash": "Цифровые технологии и программирование",
    "Amaliy fizika va laboratoriya": "Практическая физика и лаборатория",
    "Rus tili erkin muloqot klubi": "Клуб свободного общения на русском языке",
    "Shaxmat — aql gimnastikasi": "Шахматы — гимнастика ума",
    "Mini-futbol va voleybol seksiyasi": "Секция мини-футбола и волейбола",
    "Tasviriy san’at va ijodkorlik": "Изобразительное искусство и творчество",
    "Maktab direktori": "Директор школы",
    "O'quv ishlari bo'yicha direktor o'rinbosari": "Заместитель директора по учебной работе",
    "Ma'naviy-ma'rifiy ishlar bo'yicha o'rinbosar": "Заместитель директора по духовно-просветительской работе",
    "Seshanba va Juma · 14:00 – 17:00": "Вторник и Пятница · 14:00 – 17:00",
    "Dushanba va Payshanba · 14:00 – 16:30": "Понедельник и Четверг · 14:00 – 16:30",
    "Chorshanba va Shanba · 10:00 – 13:00": "Среда и Суббота · 10:00 – 13:00",
    "Dushanba – Shanba, 08:00 – 17:00": "Понедельник – Суббота, 08:00 – 17:00",
    "2 smenali · 1–11-sinflar": "2 смены · 1–11 классы",
    "Marg'ilon shahri, Farg'ona viloyati, O'zbekiston": "г. Маргилан, Ферганская область, Узбекистан"
  };

  function localizeDynamic(text, lang) {
    if (!text) return '';
    if (lang === 'uzc') return latinToCyrillic(text);
    if (lang === 'ru') return RU_DYNAMIC_MAP[text] || text;
    return text;
  }

  window.MaktabData = {
    SCHOOL_COORDS,
    STORE_KEY,
    DEFAULT_DATA,
    DEFAULT_IMAGES,
    DEFAULT_NEWS,
    DEFAULT_CLUBS,
    BELL_SCHEDULE,
    RU_TRANSLATIONS,
    RU_DYNAMIC_MAP,
    loadPortalData,
    savePortalData,
    getStorageUsageKB,
    latinToCyrillic,
    localizeDynamic
  };
})();
