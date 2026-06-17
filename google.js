(function () {
  // ===== AD CONFIG — flip these to control ads on this page =====
  const CONFIG = {
    showAds: true,        // MASTER switch: false hides ALL ads (nothing loads)
    showTopAd: true,      // responsive unit below the nav   (#ad-top)    primary acct
    showMidAd: true,      // responsive unit between sections (#ad-mid)    SECOND acct
    showBottomAd: true,   // responsive unit below main grid  (#ad-bottom) SECOND acct
    showFixedAd: true     // fixed 300x250 bottom unit         (#fixedban)  primary acct
  };

  // ----- Primary AdSense account (top, mid, fixed) -----
  const ADS_CLIENT = 'ca-pub-5525538810839147';
  const SLOT_RESPONSIVE = '4345862479';
  const SLOT_FIXED = '5912194004';

  // ----- Second AdSense account (bottom unit only) -----
  const ALT_CLIENT = 'ca-pub-7981191925382455';
  const ALT_SLOT = '3322637685'; // used by ad-mid + ad-bottom

  // Load the AdSense library for a given account (once per account).
  function loadAdsense(client) {
    if (document.querySelector('script[data-adsense-client="' + client + '"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + client;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-adsense-client', client);
    document.head.appendChild(s);
  }

  function createResponsiveIns(client, slot) {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', client);
    ins.setAttribute('data-ad-slot', slot);
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
  function fillResponsive(id, client, slot) {
    const wrap = document.getElementById(id);
    if (!wrap) return false;
    wrap.innerHTML = '';
    wrap.appendChild(createResponsiveIns(client, slot));
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
      const ban = document.getElementById('fixedban');
      if (ban) ban.style.display = 'none';
      return;
    }

    // Load the library for whichever accounts are actually used.
    loadAdsense(ADS_CLIENT);
    if (CONFIG.showBottomAd) loadAdsense(ALT_CLIENT);

    let count = 0;
    if (CONFIG.showTopAd    && fillResponsive('ad-top',    ADS_CLIENT, SLOT_RESPONSIVE)) count++;
    if (CONFIG.showMidAd    && fillResponsive('ad-mid',    ALT_CLIENT, ALT_SLOT)) count++;
    if (CONFIG.showBottomAd && fillResponsive('ad-bottom', ALT_CLIENT, ALT_SLOT)) count++;
    if (CONFIG.showFixedAd  && initFixedAd()) count++;

    // Push exactly one request per rendered unit (works across accounts).
    if (count > 0) setTimeout(function () { pushAds(count); }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
