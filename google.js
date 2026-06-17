(function () {
  // ===== AD CONFIG — flip these to control ads on this page =====
  const CONFIG = {
    showAds: true,        // MASTER switch: false hides ALL ads (nothing loads)
    showTopAd: true,      // responsive unit below the nav        (#ad-top)
    showMidAd: true,      // responsive unit between sections      (#ad-mid)
    showBottomAd: true,   // responsive unit below main grid       (#ad-bottom)
    showFixedAd: true     // fixed 300x250 bottom unit             (#fixedban)
  };

  // ----- Google AdSense settings -----
  const ADS_CLIENT = 'ca-pub-5525538810839147';
  const SLOT_RESPONSIVE = '4345862479'; // top / mid / bottom
  const SLOT_FIXED = '5912194004';       // fixed 300x250

  function loadAdsense() {
    if (document.querySelector('script[data-google-adsense="main"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADS_CLIENT;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-google-adsense', 'main');
    document.head.appendChild(s);
  }

  function createResponsiveIns() {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', ADS_CLIENT);
    ins.setAttribute('data-ad-slot', SLOT_RESPONSIVE);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    return ins;
  }

  function createFixedIns() {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'inline-block';
    ins.style.width = '300px';
    ins.style.height = '250px';
    ins.setAttribute('data-ad-client', ADS_CLIENT);
    ins.setAttribute('data-ad-slot', SLOT_FIXED);
    return ins;
  }

  // Fill a responsive placeholder by id. Returns true if a unit was added.
  function fillResponsive(id) {
    const wrap = document.getElementById(id);
    if (!wrap) return false;
    wrap.innerHTML = '';
    wrap.appendChild(createResponsiveIns());
    return true;
  }

  function initFixedAd() {
    const ban = document.getElementById('fixedban');
    const slot = document.getElementById('fixed-slot');
    const closeBtn = document.getElementById('close-fixedban');
    if (!ban || !slot || !closeBtn) return false;

    slot.innerHTML = '';
    slot.appendChild(createFixedIns());
    ban.style.display = 'block';

    closeBtn.addEventListener('click', function () {
      ban.style.display = 'none';
    });
    return true;
  }

  function pushAds(count) {
    try {
      for (let i = 0; i < count; i++) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ignore ad-init errors to avoid breaking the page.
    }
  }

  function initAds() {
    if (!CONFIG.showAds) {
      // Master off: make sure the fixed unit stays hidden too.
      const ban = document.getElementById('fixedban');
      if (ban) ban.style.display = 'none';
      return;
    }

    loadAdsense();

    let count = 0;
    if (CONFIG.showTopAd && fillResponsive('ad-top')) count++;
    if (CONFIG.showMidAd && fillResponsive('ad-mid')) count++;
    if (CONFIG.showBottomAd && fillResponsive('ad-bottom')) count++;
    if (CONFIG.showFixedAd && initFixedAd()) count++;

    // Push exactly one request per rendered unit.
    if (count > 0) setTimeout(function () { pushAds(count); }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
