/* ============================================================
   MUNDA — Customization.js
   Color customization (wires, LED strip, interface accent,
   background themes) and accessibility settings panel.
   All changes preview immediately.
   ============================================================ */
(function (global) {
  'use strict';
  const MUNDA = global.MUNDA;
  const U = MUNDA;

  const Custom = {
    modal: null,

    open: function () {
      MUNDA.audio.init();
      MUNDA.audio.click();
      const html = `
        <div class="panel panel-scroll">
          <div class="panel-head"><h2>${MUNDA.t('custom.title')}</h2><button class="panel-close" data-c="close">✕</button></div>

          <div class="panel-section">
            <h3>${MUNDA.t('custom.wires')}</h3>
            <p class="panel-note">${MUNDA.t('custom.wires.note')}</p>

            <div class="set-row">
              <div class="k">${MUNDA.t('custom.wireSat')}<small>${MUNDA.t('custom.wireSat.small')}</small></div>
              <div class="ctl"><input type="range" id="c-wire-sat" min="-60" max="60" step="1" value="${(MUNDA.state.custom.wireSat||0)}"><span class="set-val" id="c-wire-sat-v">${(MUNDA.state.custom.wireSat||0)>0?'+':''}${MUNDA.state.custom.wireSat||0}</span></div>
            </div>
            <div class="set-row">
              <div class="k">${MUNDA.t('custom.wireLight')}<small>${MUNDA.t('custom.wireLight.small')}</small></div>
              <div class="ctl"><input type="range" id="c-wire-light" min="-50" max="50" step="1" value="${(MUNDA.state.custom.wireLight||0)}"><span class="set-val" id="c-wire-light-v">${(MUNDA.state.custom.wireLight||0)>0?'+':''}${MUNDA.state.custom.wireLight||0}</span></div>
            </div>

            <div class="color-list" id="c-wires"></div>
            <button class="btn btn--sm btn--ghost" id="c-wires-reset" style="margin-top:10px">${MUNDA.t('custom.resetWires')}</button>
          </div>

          <button class="btn btn--primary" data-c="done">${MUNDA.t('settings.done')}</button>
        </div>`;
      this.show(html);
      this.buildWires();
      this.bindColorPickers();
    },

    openSettings: function () {
      MUNDA.audio.init();
      MUNDA.audio.click();
      const s = MUNDA.state.settings;
      const html = `
        <div class="panel panel-scroll">
          <div class="panel-head"><h2>${MUNDA.t('settings.title')}</h2><button class="panel-close" data-s="close">✕</button></div>

          <div class="panel-section">
            <h3>${MUNDA.t('settings.language')}</h3>
            <p class="panel-note">${MUNDA.t('settings.language.note')}</p>
            <div class="lang-tabs" id="s-lang-tabs" role="radiogroup" aria-label="${MUNDA.t('settings.language')}">
              ${MUNDA.LOCALES.map((l) => `
                <button type="button" class="lang-tab ${s.language===l.code?'sel':''}" data-lang="${l.code}" role="radio" aria-checked="${s.language===l.code}" title="${l.name}">
                  <span class="lang-flag">${l.flag}</span><span class="lang-code">${l.tab}</span>
                </button>`).join('')}
              <button type="button" class="lang-tab lang-tab--other ${MUNDA.i18n.isOther(s.language)?'sel':''}" data-lang-group="other" role="radio" aria-checked="${MUNDA.i18n.isOther(s.language)}" title="${MUNDA.t('settings.language.other')}">
                <span class="lang-flag">🌐</span><span class="lang-code">OTH</span>
              </button>
            </div>
            <div class="lang-other" id="s-lang-other" ${MUNDA.i18n.isOther(s.language)?'':'hidden'}>
              <p class="panel-note">${MUNDA.t('settings.language.other')}</p>
              <div class="lang-grid">
                ${MUNDA.OTHER_LOCALES.map((l) => `
                  <button type="button" class="lang-chip ${s.language===l.code?'sel':''}" data-lang="${l.code}"><span class="lang-flag">${l.flag}</span><span>${l.name}</span></button>`).join('')}
              </div>
            </div>
          </div>

          <div class="panel-section">
            <h3>${MUNDA.t('settings.acc')}</h3>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.cb')}<small>${MUNDA.t('settings.cb.small')}</small></div>
              <label class="switch"><input type="checkbox" id="s-cb" ${s.colorblind?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.hc')}<small>${MUNDA.t('settings.hc.small')}</small></div>
              <label class="switch"><input type="checkbox" id="s-hc" ${s.highContrast?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.bright')}</div>
              <div class="ctl"><input type="range" id="s-bright" min="0.4" max="1" step="0.01" value="${s.brightness}"><span class="set-val" id="s-bright-v">${Math.round(s.brightness*100)}%</span></div>
            </div>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.motion')}<small>${MUNDA.t('settings.motion.small')}</small></div>
              <div class="ctl"><input type="range" id="s-motion" min="0" max="1" step="0.05" value="${s.motion}"><span class="set-val" id="s-motion-v">${s.motion>=0.8?MUNDA.t('settings.motionFull'):(s.motion>=0.4?MUNDA.t('settings.motionReduced'):MUNDA.t('settings.motionMin'))}</span></div>
            </div>
            ${[['largeTerminals',MUNDA.t('settings.large')],['strongPatterns',MUNDA.t('settings.patterns')],['screenShake',MUNDA.t('settings.shake')],['haptics',MUNDA.t('settings.haptics')],['tutorials',MUNDA.t('settings.tutorials')]].map(([key,label])=>`<div class="set-row"><div class="k">${label}</div><label class="switch"><input type="checkbox" data-setting="${key}" ${s[key]?'checked':''}><span class="track"></span></label></div>`).join('')}
          </div>

          <div class="panel-section">
            <h3>${MUNDA.t('settings.audio')}</h3>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.sfx')}</div>
              <label class="switch"><input type="checkbox" id="s-mute" ${s.muted?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">${MUNDA.t('settings.master')}</div>
              <div class="ctl"><input type="range" id="s-vol" min="0" max="1" step="0.05" value="${s.soundVolume}"><span class="set-val" id="s-vol-v">${Math.round(s.soundVolume*100)}%</span></div>
            </div>
            ${[['interfaceVolume',MUNDA.t('settings.interface')],['circuitVolume',MUNDA.t('settings.circuit')],['ambienceVolume',MUNDA.t('settings.ambience')]].map(([key,label])=>`<div class="set-row"><div class="k">${label}</div><div class="ctl"><input type="range" data-volume="${key}" min="0" max="1" step="0.05" value="${s[key]}"><span class="set-val">${Math.round(s[key]*100)}%</span></div></div>`).join('')}
          </div>

          <div class="panel-section">
            <h3>${MUNDA.t('settings.data')}</h3>
            <button class="btn btn--sm btn--ghost" id="s-reset-settings">${MUNDA.t('settings.resetSettings')}</button>
            <button class="btn btn--sm btn--ghost" id="s-reset-progress" style="margin-top:8px">${MUNDA.t('settings.resetProgress')}</button>
          </div>

          <button class="btn btn--primary" data-s="done">${MUNDA.t('settings.done')}</button>
        </div>`;
      this.show(html);
      this.bindSettings();
    },

    show: function (html) {
      const layer = document.getElementById('modal-layer');
      layer.innerHTML = html;
      layer.classList.add('active');
      this.modal = layer.firstElementChild;
    },

    close: function () {
      document.getElementById('modal-layer').classList.remove('active');
      document.getElementById('modal-layer').innerHTML = '';
      this.modal = null;
      MUNDA.audio.back();
    },

    setLanguage: function (code) {
      MUNDA.i18n.setLanguage(code);
      MUNDA.audio.select();
      this.openSettings(); // rebuild panel in the new language
    },

    // ---------- wires ----------
    buildWires: function () {
      const list = document.getElementById('c-wires');
      list.innerHTML = '';
      const custom = MUNDA.state.custom.wires || {};
      const defs = MUNDA.resolveWires();
      defs.forEach((w) => {
        const base = custom[w.id] || w.base;
        const hsl = U.hexToHsl(base);
        const row = document.createElement('div');
        row.className = 'color-row';
        row.innerHTML = `
          <div class="color-swatch" data-wire="${w.id}" style="background:${base}"></div>
          <span class="c-name">${w.name}</span>
          <input type="color" data-wire="${w.id}" value="${base}">
          <button type="button" class="color-edit" data-wire="${w.id}" aria-expanded="false" aria-label="Edit ${w.name}">H/S/L</button>
          <div class="color-hsl" data-wire="${w.id}" hidden>
            <label>H <input type="range" data-wire="${w.id}" data-hsl="h" min="0" max="360" step="1" value="${Math.round(hsl.h)}"><b data-wire="${w.id}" data-hslv="h">${Math.round(hsl.h)}</b></label>
            <label>S <input type="range" data-wire="${w.id}" data-hsl="s" min="0" max="100" step="1" value="${Math.round(hsl.s)}"><b data-wire="${w.id}" data-hslv="s">${Math.round(hsl.s)}</b></label>
            <label>L <input type="range" data-wire="${w.id}" data-hsl="l" min="0" max="100" step="1" value="${Math.round(hsl.l)}"><b data-wire="${w.id}" data-hslv="l">${Math.round(hsl.l)}</b></label>
          </div>`;
        list.appendChild(row);
      });
    },

    bindColorPickers: function () {
      const layer = document.getElementById('modal-layer');
      // close / done
      layer.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-c="close"], [data-c="done"]');
        if (closeBtn) this.close();
      });

      const custom = MUNDA.state.custom;
      // Live-update a wire's swatch without saving (fast, no localStorage/audio).
      const paint = (id, hex) => {
        const sw = layer.querySelector(`.color-swatch[data-wire="${id}"]`);
        if (sw) sw.style.background = hex;
        const picker = layer.querySelector(`input[type="color"][data-wire="${id}"]`);
        if (picker) picker.value = hex;
      };
      // Commit a wire color: store, save once, play sound, invalidate render cache.
      let commitTimer = null;
      const commit = (id, hex, play) => {
        if (!custom.wires) custom.wires = {};
        custom.wires[id] = hex;
        MUNDA.invalidateWireCache();
        clearTimeout(commitTimer);
        commitTimer = setTimeout(() => MUNDA.storage.saveCustom(custom), 160);
        if (play) MUNDA.audio.select();
      };
      // Recompute HSL for a wire and refresh its sliders (after HSL edits).
      const syncHsl = (id) => {
        const hex = (custom.wires && custom.wires[id]) || MUNDA.resolveWires().find((w) => w.id === id).base;
        const hsl = U.hexToHsl(hex);
        layer.querySelectorAll(`[data-wire="${id}"][data-hsl]`).forEach((inp) => {
          inp.value = Math.round(hsl[inp.getAttribute('data-hsl')]);
        });
        layer.querySelectorAll(`[data-wire="${id}"][data-hslv]`).forEach((b) => {
          b.textContent = Math.round(hsl[b.getAttribute('data-hslv')]);
        });
      };

      // wire color swatches + hex pickers
      U.$all('.color-swatch[data-wire]', layer).forEach((sw) => {
        const id = sw.getAttribute('data-wire');
        const input = layer.querySelector(`input[type="color"][data-wire="${id}"]`);
        sw.addEventListener('click', () => input.click());
        // live preview while dragging — NO save, NO audio, NO cache churn
        input.addEventListener('input', () => {
          sw.style.background = input.value;
          if (!custom.wires) custom.wires = {};
          custom.wires[id] = input.value;
        });
        // commit once on release
        input.addEventListener('change', () => { commit(id, input.value, true); syncHsl(id); });
      });

      // H/S/L edit toggle
      layer.querySelectorAll('.color-edit[data-wire]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-wire');
          const panel = layer.querySelector(`.color-hsl[data-wire="${id}"]`);
          const open = panel.hidden;
          panel.hidden = !open;
          btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (open) syncHsl(id);
        });
      });

      // HSL sliders — live-update swatch/hex, commit on release
      layer.querySelectorAll('input[data-hsl]').forEach((inp) => {
        const id = inp.getAttribute('data-wire');
        const chan = inp.getAttribute('data-hsl');
        inp.addEventListener('input', () => {
          // collect current H/S/L from the row
          let h = 0, s = 0, l = 0;
          layer.querySelectorAll(`[data-wire="${id}"][data-hsl]`).forEach((x) => {
            const ch = x.getAttribute('data-hsl');
            if (ch === 'h') h = +x.value; else if (ch === 's') s = +x.value; else l = +x.value;
          });
          const hex = U.hslToHex(h, s, l);
          paint(id, hex);
          if (!custom.wires) custom.wires = {};
          custom.wires[id] = hex;
          layer.querySelector(`[data-wire="${id}"][data-hslv="${chan}"]`).textContent = inp.value;
        });
        inp.addEventListener('change', () => {
          commit(inp.getAttribute('data-wire'), (custom.wires || {})[inp.getAttribute('data-wire')], true);
        });
      });

      // global wire tuning sliders
      const bindGlobal = (id, key, spanId) => {
        const inp = layer.querySelector('#' + id);
        if (!inp) return;
        const span = layer.querySelector('#' + spanId);
        const refresh = () => { span.textContent = (inp.value > 0 ? '+' : '') + inp.value; };
        inp.addEventListener('input', () => {
          custom[key] = +inp.value;
          refresh();
          MUNDA.invalidateWireCache();
          // repaint swatches so the user sees the global effect live
          const defs = MUNDA.resolveWires();
          defs.forEach((w) => {
            const sw = layer.querySelector(`.color-swatch[data-wire="${w.id}"]`);
            if (sw) sw.style.background = (custom.wires && custom.wires[w.id]) || w.base;
          });
        });
        inp.addEventListener('change', () => { MUNDA.storage.saveCustom(custom); MUNDA.audio.select(); });
      };
      bindGlobal('c-wire-sat', 'wireSat', 'c-wire-sat-v');
      bindGlobal('c-wire-light', 'wireLight', 'c-wire-light-v');

      layer.querySelector('#c-wires-reset').addEventListener('click', () => {
        custom.wires = null;
        custom.wireSat = 0; custom.wireLight = 0;
        MUNDA.storage.saveCustom(custom);
        MUNDA.invalidateWireCache();
        this.buildWires();
        MUNDA.audio.click();
      });
    },

    // ---------- settings ----------
    bindSettings: function () {
      const layer = document.getElementById('modal-layer');
      const s = MUNDA.state.settings;
      const save = () => MUNDA.storage.saveSettings(s);
      const apply = () => { MUNDA.applyTheme(); MUNDA.audio.setVolume(); };

      layer.addEventListener('click', (e) => {
        if (e.target.closest('[data-s="close"], [data-s="done"]')) this.close();
      });

      // ---- language flags ----
      const rebindLanguage = () => {
        layer.querySelectorAll('.lang-tab[data-lang]').forEach((btn) => {
          btn.addEventListener('click', () => this.setLanguage(btn.getAttribute('data-lang')));
        });
        layer.querySelectorAll('.lang-chip[data-lang]').forEach((btn) => {
          btn.addEventListener('click', () => this.setLanguage(btn.getAttribute('data-lang')));
        });
        const otherBtn = layer.querySelector('.lang-tab--other');
        if (otherBtn) otherBtn.addEventListener('click', () => {
          const panel = layer.querySelector('#s-lang-other');
          if (panel) panel.hidden = !panel.hidden;
          otherBtn.classList.toggle('sel');
        });
      };
      rebindLanguage();

      const cb = layer.querySelector('#s-cb');
      cb.addEventListener('change', () => { s.colorblind = cb.checked; save(); apply(); MUNDA.audio.click(); });

      const hc = layer.querySelector('#s-hc');
      hc.addEventListener('change', () => { s.highContrast = hc.checked; save(); apply(); MUNDA.audio.click(); });

      const bright = layer.querySelector('#s-bright');
      const brightV = layer.querySelector('#s-bright-v');
      bright.addEventListener('input', () => {
        s.brightness = parseFloat(bright.value); brightV.textContent = Math.round(bright.value * 100) + '%';
        save(); apply();
      });

      const motion = layer.querySelector('#s-motion');
      const motionV = layer.querySelector('#s-motion-v');
      motion.addEventListener('input', () => {
        s.motion = parseFloat(motion.value);
        motionV.textContent = s.motion >= 0.8 ? 'Full' : (s.motion >= 0.4 ? 'Reduced' : 'Minimal');
        save(); apply(); MUNDA.audio.click();
      });

      const mute = layer.querySelector('#s-mute');
      mute.addEventListener('change', () => { s.muted = mute.checked; save(); apply(); });

      layer.querySelectorAll('[data-setting]').forEach((input)=>input.addEventListener('change',()=>{s[input.dataset.setting]=input.checked;save();apply();MUNDA.audio.click()}));
      layer.querySelectorAll('[data-volume]').forEach((input)=>input.addEventListener('input',()=>{s[input.dataset.volume]=parseFloat(input.value);input.nextElementSibling.textContent=Math.round(input.value*100)+'%';save();apply()}));

      const vol = layer.querySelector('#s-vol');
      const volV = layer.querySelector('#s-vol-v');
      vol.addEventListener('input', () => {
        s.soundVolume = parseFloat(vol.value); volV.textContent = Math.round(vol.value * 100) + '%';
        save(); apply();
        if (!s.muted && vol.value > 0.02) MUNDA.audio.click();
      });

      layer.querySelector('#s-reset-settings').addEventListener('click', () => {
        const lang = MUNDA.state.settings.language || 'en';
        MUNDA.state.settings = Object.assign({}, MUNDA.DEFAULTS.settings, { language: lang });
        save(); apply();
        MUNDA.Screens.refreshMute();
        this.openSettings(); // rebuild
      });
      layer.querySelector('#s-reset-progress').addEventListener('click', () => {
        if (global.confirm(MUNDA.t('settings.confirmReset'))) {
          MUNDA.state.progress = Object.assign({}, MUNDA.DEFAULTS.progress);
          MUNDA.storage.saveProgress(MUNDA.state.progress);
          MUNDA.Screens.updateMenuBest();
          MUNDA.audio.click();
        }
      });
    },
  };

  MUNDA.Customization = Custom;

})(typeof window !== 'undefined' ? window : this);
