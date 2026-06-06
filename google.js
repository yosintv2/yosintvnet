/**
 * GoogleAdsManager - Handles Google AdSense ad placements
 * Supports multiple accounts and fixed/inline ad formats
 */
class GoogleAdsManager {
  constructor(config = {}) {
    this.accounts = config.accounts || [];
    this.defaultAccountIndex = config.defaultAccount || 0;
    this.initialized = false;
    this._pendingAds = [];
    this._init();
  }

  _getClientId(index) {
    const idx = (index !== undefined ? index : this.defaultAccountIndex);
    return this.accounts[idx] ? this.accounts[idx].clientId : null;
  }

  _loadAdSenseScript(clientId) {
    if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) return;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    document.head.appendChild(script);
  }

  _init() {
    const clientId = this._getClientId();
    if (!clientId) {
      console.warn('[GoogleAdsManager] No client ID configured.');
      return;
    }

    this._loadAdSenseScript(clientId);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._flushPending());
    } else {
      // Slight delay to allow DOM to settle
      setTimeout(() => this._flushPending(), 100);
    }

    this.initialized = true;
  }

  _flushPending() {
    this._pendingAds.forEach(fn => fn());
    this._pendingAds = [];
  }

  _pushAd(fn) {
    if (document.readyState === 'loading') {
      this._pendingAds.push(fn);
    } else {
      fn();
    }
  }

  /**
   * Add an inline ad to a container element
   * @param {string} containerId - The element ID to inject the ad into
   * @param {object} options - Ad options: slotId, format, responsive, accountIndex
   */
  addAd(containerId, options = {}) {
    this._pushAd(() => {
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`[GoogleAdsManager] Container #${containerId} not found.`);
        return;
      }

      const clientId = this._getClientId(options.accountIndex);
      if (!clientId) return;

      // Avoid duplicate injection
      if (container.querySelector('ins.adsbygoogle')) return;

      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = 'display:block;';
      ins.setAttribute('data-ad-client', clientId);
      ins.setAttribute('data-ad-slot', options.slotId || '');

      if (options.responsive) {
        ins.setAttribute('data-ad-format', options.format || 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');
      } else {
        ins.setAttribute('data-ad-format', options.format || 'auto');
      }

      container.appendChild(ins);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('[GoogleAdsManager] adsbygoogle.push error:', e);
      }
    });
  }

  /**
   * Add a fixed (sticky) ad overlay
   * @param {object} options - slotId, position ('bottom'|'top'), width, height, closeable, accountIndex
   */
  addFixedAd(options = {}) {
    this._pushAd(() => {
      const clientId = this._getClientId(options.accountIndex);
      if (!clientId) return;

      const position = options.position || 'bottom';
      const width = options.width || 300;
      const height = options.height || 250;
      const closeable = options.closeable !== false;
      const wrapperId = `gam-fixed-ad-${Date.now()}`;

      // Avoid duplicates
      if (document.getElementById(wrapperId)) return;

      const wrapper = document.createElement('div');
      wrapper.id = wrapperId;
      wrapper.style.cssText = `
        position: fixed;
        ${position === 'bottom' ? 'bottom: 0;' : 'top: 0;'}
        left: 50%;
        transform: translateX(-50%);
        width: ${width}px;
        z-index: 9990;
        background: #fff;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.15);
        border-radius: ${position === 'bottom' ? '8px 8px 0 0' : '0 0 8px 8px'};
        overflow: hidden;
      `;

      if (closeable) {
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.setAttribute('aria-label', 'Close ad');
        closeBtn.style.cssText = `
          position: absolute;
          top: 4px;
          right: 6px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          line-height: 1;
        `;
        closeBtn.addEventListener('click', () => wrapper.remove());
        wrapper.appendChild(closeBtn);
      }

      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.cssText = `display:inline-block;width:${width}px;height:${height}px;`;
      ins.setAttribute('data-ad-client', clientId);
      ins.setAttribute('data-ad-slot', options.slotId || '');
      wrapper.appendChild(ins);

      document.body.appendChild(wrapper);

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('[GoogleAdsManager] Fixed ad push error:', e);
      }
    });
  }
}

// Expose globally
window.GoogleAdsManager = GoogleAdsManager;

/* ─── Auto-initialization ─────────────────────────────────────────────────── */
const googleAdsManager = new GoogleAdsManager({
  accounts: [
    { clientId: 'ca-pub-5525538810839147' },
    // Add more accounts here:
    // { clientId: 'ca-pub-xxxxxxxxxxxxxxxx' },
    // { clientId: 'ca-pub-yyyyyyyyyyyyyyyy' }
  ],
  defaultAccount: 0
});

document.addEventListener('DOMContentLoaded', function () {
  // Top banner ad
  googleAdsManager.addAd('ad-top-banner', {
    slotId: '4345862479',
    format: 'horizontal',
    responsive: true
  });

  // Middle banner ad
  googleAdsManager.addAd('ad-middle-banner', {
    slotId: '4345862479',
    format: 'auto',
    responsive: true
  });

  // Fixed bottom ad
  googleAdsManager.addFixedAd({
    slotId: '5912194004',
    position: 'bottom',
    width: 300,
    height: 250,
    closeable: true
  });

  // Legacy close button support (jQuery-compatible fallback)
  if (window.jQuery) {
    jQuery(document).on('click', '#close-fixedban', function () {
      jQuery('#fixedban').hide(90);
    });
  } else {
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'close-fixedban') {
        const el = document.getElementById('fixedban');
        if (el) el.style.display = 'none';
      }
    });
  }
});
