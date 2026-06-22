(function () {
  // ===== AD CONFIG — flip these to control ads on this page =====
  const CONFIG = {
    showAds: true,         // MASTER switch: false hides ALL ads (nothing loads)
    showTopAd: true,       // responsive unit below the nav   (#ad-top)    primary acct
    showMidAd: true,       // responsive unit between sections (#ad-mid)    SECOND acct
    showBottomAd: true,    // responsive unit below main grid  (#ad-bottom) SECOND acct
    showFixedAd: true,     // fixed 300x250 bottom unit         (#fixedban)  primary acct
    detectAdblock: true    // show a "disable ad blocker" popup if ads are blocked
  };

  // ----- Primary AdSense account (top, fixed) -----
  const ADS_CLIENT = 'ca-pub-5525538810839147';
  const SLOT_RESPONSIVE = '4345862479';
  const SLOT_FIXED = '5912194004';

  // ----- Second AdSense account (mid + bottom) -----
  const ALT_CLIENT = 'ca-pub-5525538810839147';
  const ALT_SLOT = '4345862479'; // used by mid + bottom

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

  /* =====================================================================
     AD-BLOCK DETECTION + POPUP
     Self-contained: injects its own styles and markup, no HTML edits.
     ===================================================================== */
  function showAdblockPopup() {
    if (document.getElementById('gab-overlay')) return; // already shown

    const style = document.createElement('style');
    style.textContent = [
      '#gab-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;',
      'align-items:center;justify-content:center;padding:20px;',
      'background:rgba(8,14,33,.92);backdrop-filter:blur(8px);}',
      '#gab-card{max-width:420px;width:100%;background:#fff;color:#101935;',
      'border-radius:18px;padding:34px 26px;text-align:center;',
      'box-shadow:0 25px 50px -12px rgba(0,0,0,.5);',
      "font-family:'Manrope',system-ui,sans-serif;}",
      '#gab-card .gab-ico{font-size:46px;margin-bottom:12px;}',
      '#gab-card h2{font-size:22px;margin-bottom:10px;}',
      '#gab-card p{font-size:14.5px;line-height:1.6;color:#526080;margin-bottom:22px;}',
      '#gab-btn{width:100%;border:none;cursor:pointer;padding:14px;border-radius:12px;',
      'font-weight:700;font-size:15px;color:#fff;',
      'background:linear-gradient(135deg,#165dff,#0a3fc7);}',
      '#gab-btn:hover{filter:brightness(1.05);}'
    ].join('');
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'gab-overlay';
    overlay.innerHTML =
      '<div id="gab-card">' +
        '<div class="gab-ico">🚫</div>' +
        '<h2>Ad-blocker Detected</h2>' +
        '<p>YoSinTV is free thanks to ads. Please turn off your ad-blocker for this ' +
        'site, then reload to continue.</p>' +
        '<button id="gab-btn" type="button">I\'ve disabled it — Reload</button>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    document.getElementById('gab-btn').addEventListener('click', function () {
      window.location.reload();
    });
  }

  // Two independent signals; if either fires we treat ads as blocked.
  function detectAdblock() {
    // 1) Bait element using class names ad-blocker filter lists hide.
    const bait = document.createElement('div');
    bait.className = 'adsbox ad-banner ads ad adsbygoogle';
    bait.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:10px;';
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);

    setTimeout(function () {
      const cs = window.getComputedStyle(bait);
      const baitBlocked =
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        cs.display === 'none' ||
        cs.visibility === 'hidden';

      // 2) Did the AdSense library actually finish loading?
      const scriptBlocked = !(window.adsbygoogle && window.adsbygoogle.loaded === true);

      bait.remove();

      if (baitBlocked || scriptBlocked) showAdblockPopup();
    }, 1800); // give the network a moment so we don't false-positive on slow loads
  }

  function initAds() {
    if (!CONFIG.showAds) {
      const ban = document.getElementById('fixedban');
      if (ban) ban.style.display = 'none';
      return;
    }

    loadAdsense(ADS_CLIENT);
    if (CONFIG.showMidAd || CONFIG.showBottomAd) loadAdsense(ALT_CLIENT);

    let count = 0;
    if (CONFIG.showTopAd    && fillResponsive('ad-top',    ADS_CLIENT, SLOT_RESPONSIVE)) count++;
    if (CONFIG.showMidAd    && fillResponsive('ad-mid',    ALT_CLIENT, ALT_SLOT)) count++;
    if (CONFIG.showBottomAd && fillResponsive('ad-bottom', ALT_CLIENT, ALT_SLOT)) count++;
    if (CONFIG.showFixedAd  && initFixedAd()) count++;

    if (count > 0) setTimeout(function () { pushAds(count); }, 400);

    if (CONFIG.detectAdblock) detectAdblock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
