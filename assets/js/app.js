/* ==========================================================================
   MARG'ILON 26-SON MAKTAB — ASOSIY INTERAKTIV ILOVA MANTIQI (app.js)
   ========================================================================== */
(function () {
  'use strict';

  const {
    SCHOOL_COORDS,
    DEFAULT_DATA,
    DEFAULT_IMAGES,
    BELL_SCHEDULE,
    RU_TRANSLATIONS,
    loadPortalData,
    savePortalData,
    getStorageUsageKB,
    latinToCyrillic,
    localizeDynamic
  } = window.MaktabData;

  /* ------------------------------------------------------------------------
     HOLAT (STATE)
     ------------------------------------------------------------------------ */
  let portalData = loadPortalData();
  let currentLang = localStorage.getItem('maktab26_lang') || 'uz';
  let activeShift = 'shift1';
  let activeClubCat = 'all';
  let activeNewsCat = 'all';
  let currentSlide = 0;
  let autoplayTimer = null;
  let isAdmin = sessionStorage.getItem('maktab26_admin') === '1';

  /* ------------------------------------------------------------------------
     YORDAMCHI FUNKSIYALAR
     ------------------------------------------------------------------------ */
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const toastEl = document.getElementById('toast');
  let toastTimeout = null;
  function showToast(msg) {
    if (!toastEl) return;
    clearTimeout(toastTimeout);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => toastEl.classList.remove('show'), 3400);
  }

  function persistAndRefresh() {
    try {
      savePortalData(portalData);
      return true;
    } catch (err) {
      showToast("⚠️ Xotira to'ldi! Ba'zi katta rasmlarni o'chiring yoki URL orqali qo'shing.");
      return false;
    }
  }

  function uiText(uzLat, ruText) {
    if (currentLang === 'ru') return ruText;
    if (currentLang === 'uzc') return latinToCyrillic(uzLat);
    return uzLat;
  }

  /* ------------------------------------------------------------------------
     1. MAVZU (DARK / LIGHT) VA MAXSUS IMKONIYATLAR (A11Y)
     ------------------------------------------------------------------------ */
  const themeBtn = document.getElementById('themeBtn');
  function applyTheme(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) {
      themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
      themeBtn.title = t === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim';
    }
    localStorage.setItem('maktab_theme', t);
  }
  applyTheme(localStorage.getItem('maktab_theme') || 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      window.Maktab3D?.setCampusLighting?.(next === 'light' ? 'day' : 'night');
    });
  }

  // Maxsus imkoniyatlar menyusi
  const a11yToggleBtn = document.getElementById('a11yToggleBtn');
  const a11yPopover = document.getElementById('a11yPopover');
  const contrastToggleBtn = document.getElementById('contrastToggleBtn');

  function applyFontScale(scale) {
    const s = ['sm', 'md', 'lg'].includes(scale) ? scale : 'md';
    document.documentElement.setAttribute('data-font-scale', s);
    localStorage.setItem('maktab26_scale', s);
    document.querySelectorAll('.scale-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.scale === s);
    });
  }
  applyFontScale(localStorage.getItem('maktab26_scale') || 'md');

  function applyGrayscale(enabled) {
    const val = enabled ? 'true' : 'false';
    document.documentElement.setAttribute('data-grayscale', val);
    localStorage.setItem('maktab26_gray', val);
    if (contrastToggleBtn) contrastToggleBtn.classList.toggle('active', enabled);
  }
  applyGrayscale(localStorage.getItem('maktab26_gray') === 'true');

  if (a11yToggleBtn && a11yPopover) {
    a11yToggleBtn.addEventListener('click', e => {
      e.stopPropagation();
      const willOpen = a11yPopover.classList.contains('hidden');
      a11yPopover.classList.toggle('hidden', !willOpen);
      a11yToggleBtn.setAttribute('aria-expanded', String(willOpen));
    });
    document.addEventListener('click', e => {
      if (!a11yPopover.contains(e.target) && e.target !== a11yToggleBtn) {
        a11yPopover.classList.add('hidden');
        a11yToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFontScale(btn.dataset.scale));
  });

  if (contrastToggleBtn) {
    contrastToggleBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-grayscale') === 'true';
      applyGrayscale(!cur);
    });
  }

  /* ------------------------------------------------------------------------
     2. MOBIL MENYU VA SCROLL ACTIVE NAV SPY
     ------------------------------------------------------------------------ */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.textContent = open ? '✕' : '☰';
    });
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileMenuBtn.textContent = '☰';
      });
    });
  }

  // Yuqoriga qaytish va Pasportni chop etish
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  const printPassportBtn = document.getElementById('printPassportBtn');
  if (printPassportBtn) {
    printPassportBtn.addEventListener('click', () => window.print());
  }

  // Bo'limlarni kuzatish (Active Nav Link)
  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const spy = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(a => {
              a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach(sec => spy.observe(sec));
  }

  /* ------------------------------------------------------------------------
     3. KO'P TILLI TIZIM (O'Z LOTIN / ЎЗ КИРИЛЛ / РУССКИЙ)
     ------------------------------------------------------------------------ */
  function convertHtmlTextNodesToCyrillic(htmlStr) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    const walker = document.createTreeWalker(temp, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      node.nodeValue = latinToCyrillic(node.nodeValue);
    }
    return temp.innerHTML;
  }

  function applyLanguage(lang) {
    currentLang = ['uz', 'uzc', 'ru'].includes(lang) ? lang : 'uz';
    localStorage.setItem('maktab26_lang', currentLang);
    document.documentElement.lang = currentLang === 'ru' ? 'ru' : 'uz';

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    // Statik matnlar
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (!el.hasAttribute('data-orig-html')) {
        el.setAttribute('data-orig-html', el.innerHTML.trim());
      }
      const key = el.getAttribute('data-i18n');
      const origHtml = el.getAttribute('data-orig-html');

      if (currentLang === 'uz') {
        el.innerHTML = origHtml;
      } else if (currentLang === 'uzc') {
        el.innerHTML = convertHtmlTextNodesToCyrillic(origHtml);
      } else if (currentLang === 'ru' && RU_TRANSLATIONS[key]) {
        el.textContent = RU_TRANSLATIONS[key];
      }
    });

    // Input placeholderlar
    document.querySelectorAll('[data-i18n-placeholder]').forEach(inp => {
      if (!inp.hasAttribute('data-orig-ph')) {
        inp.setAttribute('data-orig-ph', inp.getAttribute('placeholder') || '');
      }
      const key = inp.getAttribute('data-i18n-placeholder');
      const origPh = inp.getAttribute('data-orig-ph');

      if (currentLang === 'uz') {
        inp.setAttribute('placeholder', origPh);
      } else if (currentLang === 'uzc') {
        inp.setAttribute('placeholder', latinToCyrillic(origPh));
      } else if (currentLang === 'ru' && RU_TRANSLATIONS[key]) {
        inp.setAttribute('placeholder', RU_TRANSLATIONS[key]);
      }
    });

    // Dinamik bloklarni qayta chizish
    renderAllDynamicContent(false);
    const apBtn = document.getElementById('autoplayToggleBtn');
    if (apBtn) {
      apBtn.textContent = autoplayTimer
        ? uiText("⏸ To'xtatish", '⏸ Пауза')
        : uiText('▶ Avto-namoyish', '▶ Автопоказ');
    }
    updateLiveSchoolStatus();
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });

  /* ------------------------------------------------------------------------
     4. JONLI TOSHKENT SOATI VA QO'NG'IROQ HOLATI (UTC+5)
     ------------------------------------------------------------------------ */
  function getTashkentNow() {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Tashkent',
        hour12: false,
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).formatToParts(now);
      const map = {};
      parts.forEach(p => { map[p.type] = p.value; });
      const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const h = parseInt(map.hour, 10) || 0;
      const m = parseInt(map.minute, 10) || 0;
      const s = parseInt(map.second, 10) || 0;
      return {
        day: wdMap[map.weekday] ?? now.getDay(),
        hour: h,
        minute: m,
        second: s,
        totalMin: h * 60 + m,
        timeStr: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      };
    } catch {
      const d = new Date();
      return {
        day: d.getDay(),
        hour: d.getHours(),
        minute: d.getMinutes(),
        second: d.getSeconds(),
        totalMin: d.getHours() * 60 + d.getMinutes(),
        timeStr: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      };
    }
  }

  function parseHM(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
  }

  function evaluateBellState(tNow) {
    // Yakshanba (0) — dam olish kuni
    if (tNow.day === 0) {
      return {
        active: false,
        shift: null,
        lessonNum: null,
        progress: 0,
        shortLabel: uiText('Dam olish kuni', 'Выходной день'),
        detailLabel: uiText('Yakshanba — darslar dushanba 08:00 da boshlanadi', 'Воскресенье — занятия с понедельника в 08:00')
      };
    }

    const checkShift = (shiftKey, shiftNum) => {
      const list = BELL_SCHEDULE[shiftKey];
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const sMin = parseHM(item.start);
        const eMin = parseHM(item.end);
        if (tNow.totalMin >= sMin && tNow.totalMin < eMin) {
          const left = eMin - tNow.totalMin;
          const pct = Math.min(100, Math.max(5, Math.round(((tNow.totalMin - sMin) / (eMin - sMin)) * 100)));
          return {
            active: true,
            shift: shiftKey,
            lessonNum: item.num,
            progress: pct,
            shortLabel: uiText(
              `${shiftNum}-smena · ${item.num}-dars`,
              `${shiftNum}-я смена · ${item.num}-й урок`
            ),
            detailLabel: uiText(
              `${shiftNum}-smena, ${item.num}-soat davom etmoqda (${left} daqiqa qoldi)`,
              `Идёт ${item.num}-й урок ${shiftNum}-й смены (осталось ${left} мин.)`
            )
          };
        }
        if (i < list.length - 1) {
          const nextStart = parseHM(list[i + 1].start);
          if (tNow.totalMin >= eMin && tNow.totalMin < nextStart) {
            const left = nextStart - tNow.totalMin;
            return {
              active: true,
              shift: shiftKey,
              lessonNum: null,
              progress: 100,
              shortLabel: uiText(`${shiftNum}-smena · Tanaffus`, `${shiftNum}-я смена · Перемена`),
              detailLabel: uiText(
                `Tanaffus — ${item.num + 1}-dars ${left} daqiqadan so'ng (${list[i + 1].start})`,
                `Перемена — ${item.num + 1}-й урок через ${left} мин. (${list[i + 1].start})`
              )
            };
          }
        }
      }
      return null;
    };

    const s1 = checkShift('shift1', 1);
    if (s1) return s1;
    const s2 = checkShift('shift2', 2);
    if (s2) return s2;

    if (tNow.totalMin >= parseHM('13:10') && tNow.totalMin < parseHM('13:30')) {
      return {
        active: true,
        shift: 'shift2',
        lessonNum: null,
        progress: 50,
        shortLabel: uiText('Smena almashinuvi', 'Пересменка'),
        detailLabel: uiText('2-smena darslari soat 13:30 da boshlanadi', 'Уроки 2-й смены начнутся в 13:30')
      };
    }

    if (tNow.totalMin < parseHM('08:00')) {
      return {
        active: false,
        shift: null,
        lessonNum: null,
        progress: 0,
        shortLabel: uiText('Darsgacha vaqt', 'До начала уроков'),
        detailLabel: uiText('1-smena darslari soat 08:00 da boshlanadi', 'Уроки 1-й смены начинаются в 08:00')
      };
    }

    return {
      active: false,
      shift: null,
      lessonNum: null,
      progress: 0,
      shortLabel: uiText('Darsdan tashqari vaqt', 'Внеучебное время'),
      detailLabel: uiText("Bugungi o'quv darslari yakunlangan", 'Учебные занятия на сегодня завершены')
    };
  }

  let lastHighlightKey = '';
  function updateLiveSchoolStatus() {
    const tNow = getTashkentNow();
    const state = evaluateBellState(tNow);

    const clockEl = document.getElementById('liveClockText');
    const dotEl = document.getElementById('livePulseDot');
    const heroStatusEl = document.getElementById('heroLiveStatusText');
    const heroDotEl = document.getElementById('heroLiveDot');
    const heroSubEl = document.getElementById('heroLiveSubText');
    const heroFillEl = document.getElementById('heroLiveProgressFill');

    if (clockEl) clockEl.textContent = `${tNow.timeStr} · ${state.shortLabel}`;
    if (dotEl) dotEl.classList.toggle('idle', !state.active);
    if (heroStatusEl) heroStatusEl.textContent = state.detailLabel;
    if (heroDotEl) heroDotEl.classList.toggle('idle', !state.active);
    if (heroSubEl) heroSubEl.textContent = `${tNow.timeStr} (UTC+5)`;
    if (heroFillEl) heroFillEl.style.width = `${state.progress}%`;

    const highlightKey = `${state.shift}-${state.lessonNum}`;
    if (highlightKey !== lastHighlightKey) {
      lastHighlightKey = highlightKey;
      renderBellSchedule(state);
    }
  }

  /* ------------------------------------------------------------------------
     5. STATISTIKA VA PASPORTNI CHIZISH
     ------------------------------------------------------------------------ */
  function animateCounter(el, target, animate) {
    if (!el) return;
    if (!animate) {
      el.textContent = Number(target || 0).toLocaleString('uz-UZ');
      return;
    }
    const startVal = parseInt(String(el.textContent).replace(/\D/g, ''), 10) || 0;
    const duration = 800;
    const startTime = performance.now();

    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const cur = Math.round(startVal + (target - startVal) * ease);
      el.textContent = cur.toLocaleString('uz-UZ');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderStatsAndPassport(animate = false) {
    const d = portalData;
    animateCounter(document.getElementById('val-students'), d.students, animate);
    animateCounter(document.getElementById('val-staff'), d.staff, animate);
    animateCounter(document.getElementById('val-rooms'), d.rooms, animate);
    animateCounter(document.getElementById('val-capacity'), d.capacity, animate);

    const occupancyPct = d.capacity > 0 ? Math.min(100, +((d.students / d.capacity) * 100).toFixed(1)) : 0;
    const ratio = d.staff > 0 ? (d.students / d.staff).toFixed(1) : '0';

    const tagOcc = document.getElementById('tag-occupancy');
    const tagRatio = document.getElementById('tag-ratio');
    if (tagOcc) tagOcc.textContent = `${occupancyPct}%`;
    if (tagRatio) tagRatio.textContent = `${ratio} : 1`;

    // Hero yili va o'quvchi soni
    const heroYearStat = document.getElementById('heroYearStat');
    if (heroYearStat) {
      heroYearStat.textContent = uiText(
        `2026–2027 o'quv yili · ${d.students} o'quvchi`,
        `2026–2027 уч. год · ${d.students} уч.`
      );
    }

    // Pedagoglar toifalari
    const tTotal = Math.max(1, (d.teacherTop || 0) + (d.teacherFirst || 0) + (d.teacherSecond || 0) + (d.teacherSpec || 0));
    const setSeg = (id, cntId, val) => {
      const seg = document.getElementById(id);
      const cnt = document.getElementById(cntId);
      if (seg) seg.style.width = `${((val || 0) / tTotal) * 100}%`;
      if (cnt) cnt.textContent = String(val || 0);
    };
    setSeg('seg-top', 'cnt-top', d.teacherTop);
    setSeg('seg-first', 'cnt-first', d.teacherFirst);
    setSeg('seg-second', 'cnt-second', d.teacherSecond);
    setSeg('seg-spec', 'cnt-spec', d.teacherSpec);
    window.Maktab3D?.updateStatsHologram?.(d);

    // Infratuzilma progress-barlar
    const occVal = document.getElementById('metric-occ-val');
    const occBar = document.getElementById('metric-occ-bar');
    if (occVal) occVal.textContent = `${occupancyPct}% (${d.students} / ${d.capacity})`;
    if (occBar) occBar.style.width = `${occupancyPct}%`;

    const gradVal = document.getElementById('metric-grad-val');
    const gradBar = document.getElementById('metric-grad-bar');
    if (gradVal) gradVal.textContent = `${d.gradRate || 84}%`;
    if (gradBar) gradBar.style.width = `${Math.min(100, d.gradRate || 84)}%`;

    const booksVal = document.getElementById('metric-books-val');
    const booksBar = document.getElementById('metric-books-bar');
    if (booksVal) booksVal.textContent = `${Number(d.booksCount || 14500).toLocaleString('uz-UZ')}+`;
    if (booksBar) booksBar.style.width = `${Math.min(100, Math.round(((d.booksCount || 14500) / 18000) * 100))}%`;

    // Pasport va kontaktlar
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt;
    };
    setTxt('pass-year', uiText(`${d.foundedYear || 1990}-yil`, `${d.foundedYear || 1990} г.`));
    setTxt('pass-shifts', localizeDynamic(d.shifts, currentLang));
    setTxt('pass-hours', localizeDynamic(d.workHours, currentLang));
    setTxt('pass-address', localizeDynamic(d.address, currentLang));

    setTxt('quickPhone', d.phone);
    setTxt('quickEmail', d.email);
    setTxt('quickHours', localizeDynamic(d.workHours, currentLang));
    const tgLink = document.getElementById('quickTelegram');
    if (tgLink && d.telegram) tgLink.href = d.telegram;

    setTxt('footerAddr', `📍 ${localizeDynamic(d.address, currentLang)}`);
    setTxt('footerPhone', `📞 ${d.phone}`);
    setTxt('footerEmail', `✉️ ${d.email}`);
    setTxt('footerHours', `🕒 ${localizeDynamic(d.workHours, currentLang)}`);

    // Rahbariyat ro'yxati
    const leadEl = document.getElementById('leadershipList');
    if (leadEl) {
      const leaders = [
        { ico: '👔', role: d.directorName, hours: d.directorReception },
        { ico: '📘', role: d.deputyAcademic, hours: d.deputyAcademicReception },
        { ico: '🌟', role: d.deputySpiritual, hours: d.deputySpiritualReception }
      ];
      leadEl.innerHTML = leaders
        .map(
          l => `
          <div class="leader-card">
            <div class="leader-avatar" aria-hidden="true">${l.ico}</div>
            <div>
              <div class="leader-role">${escapeHtml(localizeDynamic(l.role, currentLang))}</div>
              <div class="leader-hours">🕒 ${escapeHtml(localizeDynamic(l.hours, currentLang))}</div>
            </div>
          </div>`
        )
        .join('');
    }
  }

  /* ------------------------------------------------------------------------
     6. QO'NG'IROQLAR JADVALI VA TO'GARAKLAR
     ------------------------------------------------------------------------ */
  function renderBellSchedule(bellState) {
    const container = document.getElementById('bellScheduleList');
    if (!container) return;
    const state = bellState || evaluateBellState(getTashkentNow());
    const lessons = BELL_SCHEDULE[activeShift] || BELL_SCHEDULE.shift1;

    container.innerHTML = lessons
      .map(item => {
        const isCurrent = state.shift === activeShift && state.lessonNum === item.num;
        const lessonLabel =
          currentLang === 'ru'
            ? `${item.num}${RU_TRANSLATIONS.lesson_word}`
            : localizeDynamic(`${item.num}-soat dars`, currentLang);

        const breakLabel =
          item.breakMin > 0
            ? uiText(`Tanaffus: ${item.breakMin} daq.`, `Перемена: ${item.breakMin} мин.`)
            : uiText('Smena yakuni', 'Конец смены');

        return `
          <div class="bell-row${isCurrent ? ' current-lesson' : ''}">
            <div class="bell-num-wrap">
              <span class="bell-num">${item.num}</span>
              <div>
                <div class="bell-name">${escapeHtml(lessonLabel)}</div>
                <div class="bell-break">${escapeHtml(breakLabel)}</div>
              </div>
            </div>
            <div class="bell-time">${item.start} – ${item.end}</div>
          </div>`;
      })
      .join('');
  }

  document.querySelectorAll('.shift-tab[data-shift]').forEach(tab => {
    tab.addEventListener('click', () => {
      activeShift = tab.dataset.shift;
      document.querySelectorAll('.shift-tab[data-shift]').forEach(t => {
        t.classList.toggle('active', t.dataset.shift === activeShift);
      });
      renderBellSchedule();
    });
  });

  function renderClubs() {
    const container = document.getElementById('clubsListContainer');
    if (!container) return;
    const searchVal = (document.getElementById('clubSearchInput')?.value || '').trim().toLowerCase();

    const filtered = (portalData.clubs || []).filter(club => {
      const catOk = activeClubCat === 'all' || club.category === activeClubCat;
      if (!catOk) return false;
      if (!searchVal) return true;
      const hay = `${club.name} ${club.grades} ${club.room} ${club.schedule} ${club.mentor}`.toLowerCase();
      return hay.includes(searchVal);
    });

    if (!filtered.length) {
      container.innerHTML = `<p style="grid-column:1/-1;color:var(--text-muted);font-size:0.88rem;padding:12px 0;">${escapeHtml(
        uiText("Qidiruv bo'yicha to'garak topilmadi.", 'Кружки по запросу не найдены.')
      )}</p>`;
      return;
    }

    container.innerHTML = filtered
      .map(
        c => `
        <article class="club-card">
          <div class="club-top">
            <span class="club-grade-badge">${escapeHtml(localizeDynamic(c.grades, currentLang))}</span>
            <span class="club-room">🚪 ${escapeHtml(localizeDynamic(c.room, currentLang))}</span>
          </div>
          <h4 class="club-name">${escapeHtml(localizeDynamic(c.name, currentLang))}</h4>
          <p class="club-meta">🗓️ ${escapeHtml(localizeDynamic(c.schedule, currentLang))}</p>
          <p class="club-meta" style="margin-top:3px;">👩‍🏫 ${escapeHtml(localizeDynamic(c.mentor, currentLang))}</p>
        </article>`
      )
      .join('');
  }

  document.querySelectorAll('.club-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeClubCat = btn.dataset.cat;
      document.querySelectorAll('.club-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.cat === activeClubCat);
      });
      renderClubs();
    });
  });
  document.getElementById('clubSearchInput')?.addEventListener('input', renderClubs);

  /* ------------------------------------------------------------------------
     7. YANGILIKLAR VA MAQOLA O'QISH MODALI
     ------------------------------------------------------------------------ */
  const NEWS_CAT_LABELS = {
    yangiliklar: { uz: 'Yangiliklar', ru: 'Новости' },
    elonlar: { uz: "E'lonlar", ru: 'Объявления' },
    yutuqlar: { uz: 'Yutuqlar', ru: 'Достижения' },
    tadbirlar: { uz: 'Tadbirlar', ru: 'Мероприятия' }
  };

  function getCatLabel(cat) {
    const item = NEWS_CAT_LABELS[cat] || NEWS_CAT_LABELS.yangiliklar;
    return uiText(item.uz, item.ru);
  }

  function renderNews() {
    const container = document.getElementById('newsGridContainer');
    if (!container) return;
    const q = (document.getElementById('newsSearchInput')?.value || '').trim().toLowerCase();

    const filtered = (portalData.news || []).filter(n => {
      const catOk = activeNewsCat === 'all' || n.category === activeNewsCat;
      if (!catOk) return false;
      if (!q) return true;
      return `${n.title} ${n.summary} ${n.body}`.toLowerCase().includes(q);
    });

    if (!filtered.length) {
      container.innerHTML = `<p style="grid-column:1/-1;color:var(--text-muted);font-size:0.9rem;">${escapeHtml(
        uiText("Ushbu ruknda hozircha ma'lumot topilmadi.", 'В данной рубрике записей пока нет.')
      )}</p>`;
      return;
    }

    const readMoreLabel = uiText("Batafsil o'qish →", 'Подробнее →');
    container.innerHTML = filtered
      .map(
        n => `
        <article class="news-card">
          <div>
            <div class="news-meta">
              <span class="news-cat ${escapeHtml(n.category)}">${escapeHtml(getCatLabel(n.category))}</span>
              <time class="news-date" datetime="${escapeHtml(n.date)}">📅 ${escapeHtml(n.date)}</time>
            </div>
            <h3 class="news-title">${escapeHtml(localizeDynamic(n.title, currentLang))}</h3>
            <p class="news-summary">${escapeHtml(localizeDynamic(n.summary, currentLang))}</p>
          </div>
          <button type="button" class="news-read-btn" data-news-id="${escapeHtml(n.id)}">${escapeHtml(readMoreLabel)}</button>
        </article>`
      )
      .join('');

    container.querySelectorAll('.news-read-btn').forEach(btn => {
      btn.addEventListener('click', () => openNewsReader(btn.dataset.newsId));
    });
    window.Maktab3D?.attach3DTiltCards?.();
  }

  function openNewsReader(id) {
    const article = (portalData.news || []).find(n => n.id === id);
    if (!article) return;
    const modal = document.getElementById('newsReaderModal');
    const catEl = document.getElementById('readerCat');
    const dateEl = document.getElementById('readerDate');
    const titleEl = document.getElementById('readerTitle');
    const bodyEl = document.getElementById('readerBody');

    if (catEl) {
      catEl.className = `news-cat ${article.category}`;
      catEl.textContent = getCatLabel(article.category);
    }
    if (dateEl) dateEl.textContent = `📅 ${article.date}`;
    if (titleEl) titleEl.textContent = localizeDynamic(article.title, currentLang);
    if (bodyEl) bodyEl.textContent = localizeDynamic(article.body || article.summary, currentLang);
    modal?.classList.add('active');
  }

  document.getElementById('closeNewsModal')?.addEventListener('click', () => {
    document.getElementById('newsReaderModal')?.classList.remove('active');
  });
  document.getElementById('newsReaderModal')?.addEventListener('click', e => {
    if (e.target.id === 'newsReaderModal') e.target.classList.remove('active');
  });

  document.querySelectorAll('.news-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeNewsCat = btn.dataset.ncat;
      document.querySelectorAll('.news-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.ncat === activeNewsCat);
      });
      renderNews();
    });
  });
  document.getElementById('newsSearchInput')?.addEventListener('input', renderNews);

  /* ------------------------------------------------------------------------
     8. FOTOGALEREYA, AVTO-NAMOYISH VA FULLSCREEN LIGHTBOX
     ------------------------------------------------------------------------ */
  const noImageState = document.getElementById('noImageState');
  const sliderWrap = document.getElementById('sliderWrap');
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDots = document.getElementById('sliderDots');
  const thumbsRow = document.getElementById('thumbsRow');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');

  function makeFallbackSvgDataUri(index) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f2454"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><text x="50%" y="46%" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="30" font-weight="700">Marg'ilon 26-son Maktab</text><text x="50%" y="55%" text-anchor="middle" fill="#cbd5e1" font-family="sans-serif" font-size="18">${index + 1}-fotolavha</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function positionCoverflowSlides() {
    if (!sliderTrack) return;
    const slides = sliderTrack.querySelectorAll('.cf-slide');
    const total = slides.length;
    if (!total) return;

    slides.forEach((slideEl, i) => {
      let diff = i - currentSlide;
      if (total > 2) {
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
      }
      const abs = Math.abs(diff);
      if (abs === 0) {
        slideEl.style.transform = 'translate(-50%, -50%) translateZ(90px) rotateY(0deg) scale(1)';
        slideEl.style.opacity = '1';
        slideEl.style.zIndex = '10';
        slideEl.style.filter = 'brightness(1)';
      } else if (abs === 1) {
        const dir = diff > 0 ? 1 : -1;
        slideEl.style.transform = `translate(calc(-50% + ${dir * 52}%), -50%) translateZ(-110px) rotateY(${-dir * 38}deg) scale(0.86)`;
        slideEl.style.opacity = '0.68';
        slideEl.style.zIndex = '6';
        slideEl.style.filter = 'brightness(0.68)';
      } else {
        const dir = diff > 0 ? 1 : -1;
        slideEl.style.transform = `translate(calc(-50% + ${dir * 82}%), -50%) translateZ(-240px) rotateY(${-dir * 52}deg) scale(0.72)`;
        slideEl.style.opacity = '0';
        slideEl.style.zIndex = '2';
        slideEl.style.filter = 'brightness(0.4)';
      }
    });
  }

  function goToSlide(idx) {
    const imgs = portalData.images || [];
    if (!imgs.length) return;
    currentSlide = ((idx % imgs.length) + imgs.length) % imgs.length;
    positionCoverflowSlides();
    document.querySelectorAll('#sliderDots .dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    document.querySelectorAll('#thumbsRow .thumb-item').forEach((t, i) => t.classList.toggle('active', i === currentSlide));

    if (lightboxOverlay?.classList.contains('active')) {
      syncLightbox();
    }
  }

  function renderGallery() {
    const imgs = portalData.images || [];
    if (!imgs.length) {
      noImageState?.classList.remove('hidden');
      sliderWrap?.classList.add('hidden');
      sliderDots?.classList.add('hidden');
      thumbsRow?.classList.add('hidden');
      return;
    }

    noImageState?.classList.add('hidden');
    sliderWrap?.classList.remove('hidden');
    sliderDots?.classList.remove('hidden');
    thumbsRow?.classList.remove('hidden');

    if (currentSlide >= imgs.length) currentSlide = 0;

    if (sliderTrack) {
      sliderTrack.innerHTML = imgs
        .map((item, i) => {
          const cap = localizeDynamic(item.caption || `26-son Maktab (${i + 1}-rasm)`, currentLang);
          return `
            <div class="cf-slide" role="listitem" data-cf-idx="${i}">
              <${"img"} src="${escapeHtml(item.src)}"
                   alt="${escapeHtml(cap)}"
                   loading="${i === 0 ? 'eager' : 'lazy'}" />
              <div class="slide-caption-bar">
                <span class="slide-caption-text">${escapeHtml(cap)}</span>
                <span class="slide-counter">${i + 1} / ${imgs.length}</span>
              </div>
            </div>`;
        })
        .join('');

      sliderTrack.querySelectorAll('.cf-slide').forEach((slideEl, idx) => {
        const imgEl = slideEl.querySelector('img');
        imgEl?.addEventListener('error', function () {
          this.src = makeFallbackSvgDataUri(idx);
        }, { once: true });
        slideEl.addEventListener('click', () => {
          if (idx === currentSlide) openLightbox(idx);
          else goToSlide(idx);
        });
      });
    }

    if (sliderDots) {
      sliderDots.innerHTML = imgs
        .map((_, i) => `<button type="button" class="dot${i === currentSlide ? ' active' : ''}" data-i="${i}" aria-label="${i + 1}-rasm"></button>`)
        .join('');
      sliderDots.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => goToSlide(Number(dot.dataset.i)));
      });
    }

    if (thumbsRow) {
      thumbsRow.innerHTML = imgs
        .map(
          (item, i) => `
          <div class="thumb-item${i === currentSlide ? ' active' : ''}" data-i="${i}">
            <${"img"} src="${escapeHtml(item.src)}" alt="Rasm ${i + 1}" loading="lazy" />
          </div>`
        )
        .join('');
      thumbsRow.querySelectorAll('img').forEach((imgEl, idx) => {
        imgEl.addEventListener('error', function () {
          this.src = makeFallbackSvgDataUri(idx);
        }, { once: true });
      });
      thumbsRow.querySelectorAll('.thumb-item').forEach(t => {
        t.addEventListener('click', () => goToSlide(Number(t.dataset.i)));
      });
    }

    goToSlide(currentSlide);
  }

  document.getElementById('slidePrev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('slideNext')?.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Avto-namoyish
  const autoplayBtn = document.getElementById('autoplayToggleBtn');
  function toggleAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      if (autoplayBtn) autoplayBtn.textContent = uiText('▶ Avto-namoyish', '▶ Автопоказ');
    } else {
      autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 4200);
      if (autoplayBtn) autoplayBtn.textContent = uiText('⏸ To‘xtatish', '⏸ Пауза');
    }
  }
  autoplayBtn?.addEventListener('click', toggleAutoplay);

  // Lightbox
  function syncLightbox() {
    const imgs = portalData.images || [];
    if (!imgs.length || !lightboxImg) return;
    const item = imgs[currentSlide] || imgs[0];
    lightboxImg.src = item.src;
    lightboxImg.onerror = function () {
      this.onerror = null;
      this.src = makeFallbackSvgDataUri(currentSlide);
    };
    if (lightboxCaption) {
      lightboxCaption.textContent = `${currentSlide + 1} / ${imgs.length} — ${localizeDynamic(item.caption, currentLang)}`;
    }
  }

  function openLightbox(idx) {
    if (typeof idx === 'number') goToSlide(idx);
    syncLightbox();
    lightboxOverlay?.classList.add('active');
  }

  function closeLightbox() {
    lightboxOverlay?.classList.remove('active');
  }

  document.getElementById('openLightboxBtn')?.addEventListener('click', () => openLightbox(currentSlide));
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => goToSlide(currentSlide - 1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => goToSlide(currentSlide + 1));
  lightboxOverlay?.addEventListener('click', e => {
    if (e.target === lightboxOverlay) closeLightbox();
  });

  // Klaviatura va sensor (swipe) boshqaruvi
  document.addEventListener('keydown', e => {
    const tag = (e.target?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (e.key === 'Escape') {
      closeLightbox();
      document.getElementById('loginModal')?.classList.remove('active');
      document.getElementById('newsReaderModal')?.classList.remove('active');
    } else if (e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentSlide + 1);
    }
  });

  let touchStartX = 0;
  sliderWrap?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  sliderWrap?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
  });

  /* ------------------------------------------------------------------------
     9. INTERAKTIV XARITA (Leaflet — Ko'cha va Sun'iy yo'ldosh qatlami)
     ------------------------------------------------------------------------ */
  let leafletMap = null;
  let streetLayer = null;
  let satLayer = null;

  function initMap() {
    const mapEl = document.getElementById('map');
    const fallbackEl = document.getElementById('mapFallback');
    if (!mapEl) return;

    if (typeof L === 'undefined') {
      mapEl.classList.add('hidden');
      fallbackEl?.classList.remove('hidden');
      return;
    }

    try {
      leafletMap = L.map('map', {
        center: [SCHOOL_COORDS.lat, SCHOOL_COORDS.lng],
        zoom: 16,
        scrollWheelZoom: false
      });

      streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(leafletMap);

      satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: '© Esri'
        }
      );

      leafletMap.on('click', () => leafletMap.scrollWheelZoom.enable());

      const pinIcon = L.divIcon({
        html: `<div style="background:#1d4ed8;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.45);"></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -28]
      });

      L.marker([SCHOOL_COORDS.lat, SCHOOL_COORDS.lng], { icon: pinIcon })
        .addTo(leafletMap)
        .bindPopup("<b>Marg'ilon shahri 26-son Maktab</b><br>Farg'ona viloyati, O'zbekiston")
        .openPopup();

      document.getElementById('mapStreetBtn')?.addEventListener('click', function () {
        if (satLayer && leafletMap.hasLayer(satLayer)) leafletMap.removeLayer(satLayer);
        streetLayer.addTo(leafletMap);
        this.classList.add('active');
        document.getElementById('mapSatBtn')?.classList.remove('active');
      });

      document.getElementById('mapSatBtn')?.addEventListener('click', function () {
        if (streetLayer && leafletMap.hasLayer(streetLayer)) leafletMap.removeLayer(streetLayer);
        satLayer.addTo(leafletMap);
        this.classList.add('active');
        document.getElementById('mapStreetBtn')?.classList.remove('active');
      });

      document.getElementById('mapResetBtn')?.addEventListener('click', () => {
        leafletMap.setView([SCHOOL_COORDS.lat, SCHOOL_COORDS.lng], 16, { animate: true });
      });
    } catch {
      mapEl.classList.add('hidden');
      fallbackEl?.classList.remove('hidden');
    }
  }
  window.addEventListener('load', initMap);

  /* ------------------------------------------------------------------------
     10. ONLAYN MUROJAAT FORMASI
     ------------------------------------------------------------------------ */
  const appealForm = document.getElementById('appealForm');
  const appealBanner = document.getElementById('appealSuccessBanner');

  appealForm?.addEventListener('submit', e => {
    e.preventDefault();
    const fullName = document.getElementById('appFullName')?.value.trim() || '';
    const phone = document.getElementById('appPhone')?.value.trim() || '';
    const topic = document.getElementById('appTopic')?.value || "Savol va ma'lumot";
    const message = document.getElementById('appMessage')?.value.trim() || '';

    if (fullName.length < 3 || phone.length < 7 || message.length < 5) {
      showToast(uiText("⚠️ Iltimos, barcha majburiy maydonlarni to'ldiring.", '⚠️ Пожалуйста, заполните все обязательные поля.'));
      return;
    }

    const refCode = `M26-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    portalData.appeals = portalData.appeals || [];
    portalData.appeals.unshift({
      id: `ap_${Date.now()}`,
      refCode,
      fullName,
      phone,
      topic,
      message,
      createdAt: nowStr,
      resolved: false
    });

    persistAndRefresh();
    updateUnreadAppealsBadges();
    if (isAdmin) renderAdminAppeals();

    appealForm.reset();
    if (appealBanner) {
      appealBanner.textContent = uiText(
        `✅ Murojaatingiz qabul qilindi! Ro'yxat raqami: #${refCode}. Ma'muriyat tez orada siz bilan bog'lanadi.`,
        `✅ Обращение принято! Номер заявки: #${refCode}. Администрация свяжется с вами.`
      );
      appealBanner.classList.remove('hidden');
    }
    showToast(uiText(`✅ Murojaat yuborildi (#${refCode})`, `✅ Заявка отправлена (#${refCode})`));
  });

  /* ------------------------------------------------------------------------
     11. ADMIN CMS TIZIMI (Kirish, Ko'rsatkichlar, Galereya, Yangiliklar, Inbox)
     ------------------------------------------------------------------------ */
  const loginBtn = document.getElementById('loginBtn');
  const adminJumpBtn = document.getElementById('adminJumpBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const loginModal = document.getElementById('loginModal');
  const passwordInput = document.getElementById('passwordInput');
  const passError = document.getElementById('passError');
  const adminSection = document.getElementById('admin-section');

  function updateUnreadAppealsBadges() {
    const unread = (portalData.appeals || []).filter(a => !a.resolved).length;
    ['unreadAppealsBadge', 'tabAppealsCount'].forEach(id => {
      const badge = document.getElementById(id);
      if (badge) {
        badge.textContent = String(unread);
        badge.classList.toggle('hidden', unread === 0);
      }
    });
  }

  function syncAdminVisibility() {
    if (isAdmin) {
      loginBtn?.classList.add('hidden');
      adminJumpBtn?.classList.remove('hidden');
      logoutBtn?.classList.remove('hidden');
      adminSection?.classList.add('visible');
      populateAdminInputs();
      renderAdminGallery();
      renderAdminNews();
      renderAdminClubs();
      renderAdminAppeals();
    } else {
      loginBtn?.classList.remove('hidden');
      adminJumpBtn?.classList.add('hidden');
      logoutBtn?.classList.add('hidden');
      adminSection?.classList.remove('visible');
    }
    updateUnreadAppealsBadges();
  }

  loginBtn?.addEventListener('click', () => {
    loginModal?.classList.add('active');
    if (passwordInput) {
      passwordInput.value = '';
      setTimeout(() => passwordInput.focus(), 160);
    }
    passError?.classList.remove('show');
  });

  document.getElementById('closeModal')?.addEventListener('click', () => loginModal?.classList.remove('active'));
  loginModal?.addEventListener('click', e => {
    if (e.target === loginModal) loginModal.classList.remove('active');
  });

  document.getElementById('confirmLogin')?.addEventListener('click', () => {
    const entered = (passwordInput?.value || '').trim();
    const expected = portalData.adminPass || '1234';
    if (entered === expected) {
      isAdmin = true;
      sessionStorage.setItem('maktab26_admin', '1');
      loginModal?.classList.remove('active');
      syncAdminVisibility();
      adminSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('✅ Admin boshqaruv markaziga xush kelibsiz!');
    } else {
      passError?.classList.add('show');
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  });

  passwordInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('confirmLogin')?.click();
  });

  adminJumpBtn?.addEventListener('click', () => {
    adminSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  logoutBtn?.addEventListener('click', () => {
    isAdmin = false;
    sessionStorage.removeItem('maktab26_admin');
    syncAdminVisibility();
    showToast('👋 Admin tizimidan chiqildi');
  });

  // Admin Tablarni almashtirish
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPane = tab.dataset.pane;
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.toggle('active', p.id === targetPane));
    });
  });

  // Pane 1: Ko'rsatkichlar va pasport
  function populateAdminInputs() {
    const d = portalData;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v ?? '';
    };
    setVal('inp-students', d.students);
    setVal('inp-staff', d.staff);
    setVal('inp-rooms', d.rooms);
    setVal('inp-capacity', d.capacity);
    setVal('inp-grad-rate', d.gradRate);
    setVal('inp-books', d.booksCount);
    setVal('inp-t-top', d.teacherTop);
    setVal('inp-t-first', d.teacherFirst);
    setVal('inp-t-second', d.teacherSecond);
    setVal('inp-t-spec', d.teacherSpec);
    setVal('inp-phone', d.phone);
    setVal('inp-email', d.email);
    setVal('inp-telegram', d.telegram);
    setVal('inp-address', d.address);
    setVal('inp-hours', d.workHours);
    setVal('inp-dir-name', d.directorName);
    setVal('inp-dir-rec', d.directorReception);
    setVal('inp-dep1-name', d.deputyAcademic);
    setVal('inp-dep1-rec', d.deputyAcademicReception);
    setVal('inp-dep2-name', d.deputySpiritual);
    setVal('inp-dep2-rec', d.deputySpiritualReception);

    const dateInp = document.getElementById('newsDateInp');
    if (dateInp && !dateInp.value) dateInp.value = new Date().toISOString().slice(0, 10);
  }

  document.getElementById('saveStatsPassportBtn')?.addEventListener('click', () => {
    const num = id => Math.max(0, parseInt(document.getElementById(id)?.value, 10) || 0);
    const str = id => (document.getElementById(id)?.value || '').trim();

    portalData.students = num('inp-students');
    portalData.staff = num('inp-staff');
    portalData.rooms = num('inp-rooms');
    portalData.capacity = Math.max(1, num('inp-capacity'));
    portalData.gradRate = Math.min(100, num('inp-grad-rate'));
    portalData.booksCount = num('inp-books');
    portalData.teacherTop = num('inp-t-top');
    portalData.teacherFirst = num('inp-t-first');
    portalData.teacherSecond = num('inp-t-second');
    portalData.teacherSpec = num('inp-t-spec');

    if (str('inp-phone')) portalData.phone = str('inp-phone');
    if (str('inp-email')) portalData.email = str('inp-email');
    if (str('inp-telegram')) portalData.telegram = str('inp-telegram');
    if (str('inp-address')) portalData.address = str('inp-address');
    if (str('inp-hours')) portalData.workHours = str('inp-hours');
    if (str('inp-dir-name')) portalData.directorName = str('inp-dir-name');
    if (str('inp-dir-rec')) portalData.directorReception = str('inp-dir-rec');
    if (str('inp-dep1-name')) portalData.deputyAcademic = str('inp-dep1-name');
    if (str('inp-dep1-rec')) portalData.deputyAcademicReception = str('inp-dep1-rec');
    if (str('inp-dep2-name')) portalData.deputySpiritual = str('inp-dep2-name');
    if (str('inp-dep2-rec')) portalData.deputySpiritualReception = str('inp-dep2-rec');

    if (persistAndRefresh()) {
      renderStatsAndPassport(true);
      showToast("✅ Barcha ko'rsatkichlar va pasport ma'lumotlari saqlandi!");
    }
  });

  // Pane 2: Galereya + Aqlli rasm siqish (Canvas Image Compression)
  function compressImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = ev => {
        const img = new Image();
        img.onerror = () => resolve(ev.target.result);
        img.onload = () => {
          const maxDim = 1400;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderAdminGallery() {
    const grid = document.getElementById('adminGallery');
    const countBadge = document.getElementById('imgCountBadge');
    const memBadge = document.getElementById('storageUsageBadge');
    const imgs = portalData.images || [];

    if (countBadge) countBadge.textContent = `🖼️ ${imgs.length} ta rasm mavjud`;
    if (memBadge) memBadge.textContent = `💾 Xotira: ${getStorageUsageKB()} KB / 5000 KB`;
    if (!grid) return;

    grid.innerHTML = imgs
      .map(
        (item, i) => `
        <div class="admin-photo-card">
          <${"img"} src="${escapeHtml(item.src)}" alt="Rasm ${i + 1}" />
          <div class="admin-photo-actions">
            <input class="form-input" style="padding:5px 8px;font-size:0.76rem;" type="text"
                   data-cap-idx="${i}" value="${escapeHtml(item.caption || '')}" placeholder="Rasm izohi..." />
            <div class="admin-photo-btns">
              <div>
                <button type="button" class="mini-btn" data-move="-1" data-idx="${i}" ${i === 0 ? 'disabled' : ''}>←</button>
                <button type="button" class="mini-btn" data-move="1" data-idx="${i}" ${i === imgs.length - 1 ? 'disabled' : ''}>→</button>
              </div>
              <button type="button" class="mini-btn danger" data-del-img="${i}">✕ O'chirish</button>
            </div>
          </div>
        </div>`
      )
      .join('');

    grid.querySelectorAll('img').forEach((imgEl, idx) => {
      imgEl.addEventListener('error', function () {
        this.src = makeFallbackSvgDataUri(idx);
      }, { once: true });
    });

    grid.querySelectorAll('[data-cap-idx]').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = Number(inp.dataset.capIdx);
        if (portalData.images[idx]) {
          portalData.images[idx].caption = inp.value.trim();
          persistAndRefresh();
          renderGallery();
        }
      });
    });

    grid.querySelectorAll('[data-move]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.idx);
        const dir = Number(btn.dataset.move);
        const target = idx + dir;
        if (target < 0 || target >= portalData.images.length) return;
        const tmp = portalData.images[idx];
        portalData.images[idx] = portalData.images[target];
        portalData.images[target] = tmp;
        persistAndRefresh();
        renderGallery();
        renderAdminGallery();
      });
    });

    grid.querySelectorAll('[data-del-img]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.delImg);
        portalData.images.splice(idx, 1);
        persistAndRefresh();
        renderGallery();
        renderAdminGallery();
        showToast("🗑️ Rasm o'chirildi");
      });
    });
  }

  document.getElementById('imgUpload')?.addEventListener('change', async function (e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    showToast('⏳ Rasmlar optimallashtirilmoqda...');
    for (const file of files) {
      try {
        const compressed = await compressImageFile(file);
        portalData.images.push({
          src: compressed,
          caption: file.name.replace(/\.[^.]+$/, '') || '26-son Maktab fotolavhasi'
        });
      } catch {
        // Xatolik bo'lsa o'tkazib yuboramiz
      }
    }
    if (persistAndRefresh()) {
      renderGallery();
      renderAdminGallery();
      showToast(`✅ ${files.length} ta rasm muvaffaqiyatli yuklandi!`);
    }
    this.value = '';
  });

  document.getElementById('addImgUrlBtn')?.addEventListener('click', () => {
    const urlInp = document.getElementById('imgUrlInput');
    const capInp = document.getElementById('imgCaptionInput');
    const url = (urlInp?.value || '').trim();
    if (!url.startsWith('http')) {
      showToast("⚠️ To'g'ri rasm URL manzilini kiriting (https://...)");
      return;
    }
    portalData.images.push({
      src: url,
      caption: (capInp?.value || '').trim() || "Marg'ilon 26-son maktab fotolavhasi"
    });
    if (persistAndRefresh()) {
      if (urlInp) urlInp.value = '';
      if (capInp) capInp.value = '';
      renderGallery();
      renderAdminGallery();
      showToast("✅ Rasm URL orqali qo'shildi!");
    }
  });

  document.getElementById('resetDefaultImgsBtn')?.addEventListener('click', () => {
    portalData.images = DEFAULT_IMAGES.map(item => ({ ...item }));
    currentSlide = 0;
    persistAndRefresh();
    renderGallery();
    renderAdminGallery();
    showToast('↺ Standart maktab rasmlari tiklandi');
  });

  // Pane 3: Yangiliklar CRUD
  function renderAdminNews() {
    const box = document.getElementById('adminNewsList');
    if (!box) return;
    const list = portalData.news || [];
    if (!list.length) {
      box.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Hozircha e'lonlar yo'q.</p>`;
      return;
    }
    box.innerHTML = list
      .map(
        n => `
        <div class="admin-list-item">
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(n.date)} · ${escapeHtml(getCatLabel(n.category))}</div>
            <strong style="font-size:0.92rem;">${escapeHtml(n.title)}</strong>
          </div>
          <button type="button" class="mini-btn danger" data-del-news="${escapeHtml(n.id)}">✕ O'chirish</button>
        </div>`
      )
      .join('');

    box.querySelectorAll('[data-del-news]').forEach(btn => {
      btn.addEventListener('click', () => {
        portalData.news = portalData.news.filter(n => n.id !== btn.dataset.delNews);
        persistAndRefresh();
        renderNews();
        renderAdminNews();
        showToast("🗑️ E'lon o'chirildi");
      });
    });
  }

  document.getElementById('addNewsBtn')?.addEventListener('click', () => {
    const title = (document.getElementById('newsTitleInp')?.value || '').trim();
    const category = document.getElementById('newsCatInp')?.value || 'yangiliklar';
    const date = document.getElementById('newsDateInp')?.value || new Date().toISOString().slice(0, 10);
    const summary = (document.getElementById('newsSummaryInp')?.value || '').trim();
    const body = (document.getElementById('newsBodyInp')?.value || '').trim();

    if (!title || !summary) {
      showToast("⚠️ Sarlavha va qisqacha mazmunni kiriting!");
      return;
    }

    portalData.news.unshift({
      id: `n_${Date.now()}`,
      category,
      date,
      title,
      summary,
      body: body || summary
    });

    if (persistAndRefresh()) {
      document.getElementById('newsTitleInp').value = '';
      document.getElementById('newsSummaryInp').value = '';
      document.getElementById('newsBodyInp').value = '';
      renderNews();
      renderAdminNews();
      showToast("📢 Yangi e'lon chop etildi!");
    }
  });

  // Pane 4: To'garaklar CRUD
  function renderAdminClubs() {
    const box = document.getElementById('adminClubsList');
    if (!box) return;
    const list = portalData.clubs || [];
    box.innerHTML = list
      .map(
        c => `
        <div class="admin-list-item">
          <div>
            <strong style="font-size:0.9rem;">${escapeHtml(c.name)}</strong>
            <div style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(c.grades)} · ${escapeHtml(c.room)} · ${escapeHtml(c.schedule)}</div>
          </div>
          <button type="button" class="mini-btn danger" data-del-club="${escapeHtml(c.id)}">✕ O'chirish</button>
        </div>`
      )
      .join('');

    box.querySelectorAll('[data-del-club]').forEach(btn => {
      btn.addEventListener('click', () => {
        portalData.clubs = portalData.clubs.filter(c => c.id !== btn.dataset.delClub);
        persistAndRefresh();
        renderClubs();
        renderAdminClubs();
        showToast("🗑️ To'garak o'chirildi");
      });
    });
  }

  document.getElementById('addClubBtn')?.addEventListener('click', () => {
    const name = (document.getElementById('clubNameInp')?.value || '').trim();
    const category = document.getElementById('clubCatInp')?.value || 'stem';
    const grades = (document.getElementById('clubGradesInp')?.value || '').trim() || '5–11-sinflar';
    const room = (document.getElementById('clubRoomInp')?.value || '').trim() || "O'quv xonasi";
    const schedule = (document.getElementById('clubSchedInp')?.value || '').trim();
    const mentor = (document.getElementById('clubMentorInp')?.value || '').trim() || 'Fan o‘qituvchisi';

    if (!name || !schedule) {
      showToast("⚠️ To'garak nomi va vaqtini kiriting!");
      return;
    }

    portalData.clubs.unshift({
      id: `c_${Date.now()}`,
      category,
      name,
      grades,
      room,
      schedule,
      mentor
    });

    if (persistAndRefresh()) {
      document.getElementById('clubNameInp').value = '';
      document.getElementById('clubSchedInp').value = '';
      renderClubs();
      renderAdminClubs();
      showToast("✅ Yangi to'garak qo'shildi!");
    }
  });

  // Pane 5: Murojaatlar Inbox
  function renderAdminAppeals() {
    const box = document.getElementById('adminAppealsList');
    if (!box) return;
    const list = portalData.appeals || [];
    if (!list.length) {
      box.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;">Hozircha kelib tushgan murojaatlar yo'q.</p>`;
      return;
    }

    box.innerHTML = list
      .map(
        a => `
        <div class="admin-list-item" style="border-left:4px solid ${a.resolved ? 'var(--emerald)' : 'var(--gold)'};">
          <div style="flex:1;">
            <div style="font-size:0.76rem;color:var(--text-muted);margin-bottom:4px;">
              <strong>#${escapeHtml(a.refCode)}</strong> · ${escapeHtml(a.createdAt)} · ${escapeHtml(a.topic)}
              ${a.resolved ? '<span style="color:var(--emerald);font-weight:700;"> · ✓ Ko‘rib chiqildi</span>' : '<span style="color:var(--gold);font-weight:700;"> · ● Yangi</span>'}
            </div>
            <div style="font-weight:700;font-size:0.94rem;">${escapeHtml(a.fullName)} — <a href="tel:${escapeHtml(a.phone)}" style="color:var(--accent);">${escapeHtml(a.phone)}</a></div>
            <p style="font-size:0.86rem;color:var(--text-secondary);margin-top:6px;">${escapeHtml(a.message)}</p>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0;">
            ${!a.resolved ? `<button type="button" class="mini-btn" data-resolve-ap="${escapeHtml(a.id)}">✓ Bajarildi</button>` : ''}
            <button type="button" class="mini-btn danger" data-del-ap="${escapeHtml(a.id)}">✕</button>
          </div>
        </div>`
      )
      .join('');

    box.querySelectorAll('[data-resolve-ap]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = portalData.appeals.find(x => x.id === btn.dataset.resolveAp);
        if (item) item.resolved = true;
        persistAndRefresh();
        updateUnreadAppealsBadges();
        renderAdminAppeals();
      });
    });

    box.querySelectorAll('[data-del-ap]').forEach(btn => {
      btn.addEventListener('click', () => {
        portalData.appeals = portalData.appeals.filter(x => x.id !== btn.dataset.delAp);
        persistAndRefresh();
        updateUnreadAppealsBadges();
        renderAdminAppeals();
      });
    });
  }

  // Pane 6: JSON Eksport / Import, Parol va Reset
  document.getElementById('exportJsonBtn')?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(portalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `margilon-26-maktab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇️ Zaxira nusxa (JSON) yuklab olindi!');
  });

  document.getElementById('importJsonInput')?.addEventListener('change', function (e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);
        portalData = { ...DEFAULT_DATA, ...imported };
        persistAndRefresh();
        renderAllDynamicContent(true);
        syncAdminVisibility();
        showToast('✅ Zaxira fayl muvaffaqiyatli tiklandi!');
      } catch {
        showToast("⚠️ Noto'g'ri JSON fayl formati!");
      }
    };
    reader.readAsText(file);
    this.value = '';
  });

  document.getElementById('savePassBtn')?.addEventListener('click', () => {
    const inp = document.getElementById('newAdminPassInp');
    const newPass = (inp?.value || '').trim();
    if (newPass.length < 4) {
      showToast("⚠️ Parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    portalData.adminPass = newPass;
    if (persistAndRefresh()) {
      inp.value = '';
      showToast('🔑 Admin paroli muvaffaqiyatli yangilandi!');
    }
  });

  document.getElementById('factoryResetBtn')?.addEventListener('click', () => {
    if (!window.confirm("Haqiqatan ham barcha ma'lumotlarni boshlang'ich holatga qaytarmoqchimisiz?")) return;
    localStorage.removeItem('maktab26_portal_v5');
    localStorage.removeItem('maktab26_v4');
    portalData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    currentSlide = 0;
    renderAllDynamicContent(true);
    syncAdminVisibility();
    showToast("↺ Portal boshlang'ich holatga qaytarildi");
  });

  /* ------------------------------------------------------------------------
     UMUMIY BOSHLANG'ICH ISHGA TUSHIRISH
     ------------------------------------------------------------------------ */
  function renderAllDynamicContent(animateStats = true) {
    renderStatsAndPassport(animateStats);
    renderBellSchedule();
    renderClubs();
    renderNews();
    renderGallery();
  }

  (function bootstrap() {
    // Agar Toshkent vaqtida 2-smena payti bo'lsa, jadvalni 2-smenaga moslab ochish
    const tNow = getTashkentNow();
    if (tNow.totalMin >= parseHM('13:15') && tNow.totalMin <= parseHM('18:45')) {
      activeShift = 'shift2';
      document.querySelectorAll('.shift-tab[data-shift]').forEach(t => {
        t.classList.toggle('active', t.dataset.shift === 'shift2');
      });
    }

    applyLanguage(currentLang);
    renderStatsAndPassport(true);
    syncAdminVisibility();
    updateLiveSchoolStatus();
    setInterval(updateLiveSchoolStatus, 15000);
    initAiAssistant();
  })();

  /* ------------------------------------------------------------------------
     12. 26-MAKTAB INTELLEKTUAL AI YORDAMCHISI (Floating Widget)
     ------------------------------------------------------------------------ */
  function answerSchoolQuestion(rawQ) {
    const q = rawQ.toLowerCase();
    const d = portalData;
    const bell = evaluateBellState(getTashkentNow());

    if (q.includes('dars') || q.includes('soat') || q.includes('smena') || q.includes('звон') || q.includes('урок')) {
      return uiText(
        `🕒 Hozirgi holat: ${bell.detailLabel}. 1-smena 08:00–13:10 da, 2-smena 13:30–18:35 da o'tiladi.`,
        `🕒 Текущий статус: ${bell.detailLabel}. 1-я смена: 08:00–13:10, 2-я смена: 13:30–18:35.`
      );
    }
    if (q.includes('oquvchi') || q.includes("o'quvchi") || q.includes('sigim') || q.includes("sig'im") || q.includes('soni') || q.includes('ученик')) {
      return uiText(
        `🎓 Maktabimizda hozirda ${d.students} nafar o'quvchi tahsil olmoqda. Loyihaviy sig'im: ${d.capacity} o'rin, pedagoglar: ${d.staff} nafar, o'quv xonalari: ${d.rooms} ta.`,
        `🎓 В школе обучаются ${d.students} учащихся. Вместимость: ${d.capacity} мест, педагогов: ${d.staff}, кабинетов: ${d.rooms}.`
      );
    }
    if (q.includes('togarak') || q.includes("to'garak") || q.includes('sport') || q.includes('круж')) {
      const names = (d.clubs || []).slice(0, 4).map(c => c.name).join(', ');
      return uiText(
        `🎯 Maktabda ${(d.clubs || []).length} ta BEPUL to'garak mavjud: ${names} va boshqalar. Barchasi darsdan tashqari bepul o'tiladi!`,
        `🎯 В школе работают ${(d.clubs || []).length} БЕСПЛАТНЫХ кружков: ${names} и др.`
      );
    }
    if (q.includes('manzil') || q.includes('qayer') || q.includes('telefon') || q.includes('direktor') || q.includes('qabul') || q.includes('адрес')) {
      return uiText(
        `📍 Manzil: ${d.address} (GPS: 40.4765, 71.7380). Tel: ${d.phone}. Direktor qabuli: ${d.directorReception}.`,
        `📍 Адрес: ${d.address}. Тел: ${d.phone}. Приём директора: ${d.directorReception}.`
      );
    }
    if (q.includes('1-sinf') || q.includes('hujjat') || q.includes('класс')) {
      return uiText(
        `🎒 1-sinfga qabul har yili 20-iyundan my.maktab.uz portali orqali onlayn yoki maktab qabul komissiyasida amalga oshiriladi.`,
        `🎒 Приём в 1-й класс открывается с 20 июня через платформу my.maktab.uz.`
      );
    }
    if (q.includes('3d') || q.includes('qot') || q.includes('gpu')) {
      return uiText(
        `🔥 Tepada «🔥 MAX STRESS» tugmasini bossangiz 125 000 ta WebGL zarracha, TorusKnot gologrammalar va 3D mushakbozlik baravariga yonadi!`,
        `🔥 Нажмите кнопку «🔥 MAX STRESS» в верхней панели для запуска 125 000 частиц WebGL и 3D-салюта!`
      );
    }
    return uiText(
      `🏫 Marg'ilon shahri 26-son maktab bo'yicha: dars jadvali, ${d.students} o'quvchi ko'rsatkichlari, bepul to'garaklar, 3D kampus yoki qabul kunlari haqida so'rashingiz mumkin!`,
      `🏫 Вы можете спросить о расписании уроков, числе учеников (${d.students}), бесплатных кружках, 3D-кампусе или часах приёма!`
    );
  }

  function initAiAssistant() {
    const fab = document.getElementById('aiFabBtn');
    const panel = document.getElementById('aiPanel');
    const closeBtn = document.getElementById('aiCloseBtn');
    const form = document.getElementById('aiChatForm');
    const inp = document.getElementById('aiChatInput');
    const msgs = document.getElementById('aiMessages');

    if (!fab || !panel || !msgs) return;

    const pushMsg = (text, who) => {
      const div = document.createElement('div');
      div.className = `ai-msg ${who}`;
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    };

    fab.addEventListener('click', () => {
      window.Maktab3D?.SoundFX?.click?.(760);
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden') && !msgs.children.length) {
        pushMsg(
          uiText(
            "Assalomu alaykum! 👋 Men Marg'ilon 26-son maktabning virtual AI yordamchisiman. Dars vaqti, to'garaklar, qabul yoki 3D kampus bo'yicha savolingizni bering!",
            'Здравствуйте! 👋 Я виртуальный помощник школы №26 г. Маргилан. Задайте вопрос о расписании, кружках или приёме!'
          ),
          'bot'
        );
      }
    });

    closeBtn?.addEventListener('click', () => panel.classList.add('hidden'));

    document.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.ask || chip.textContent;
        pushMsg(q, 'user');
        setTimeout(() => pushMsg(answerSchoolQuestion(q), 'bot'), 220);
      });
    });

    form?.addEventListener('submit', e => {
      e.preventDefault();
      const q = (inp?.value || '').trim();
      if (!q) return;
      pushMsg(q, 'user');
      inp.value = '';
      setTimeout(() => pushMsg(answerSchoolQuestion(q), 'bot'), 240);
    });
  }
})();
