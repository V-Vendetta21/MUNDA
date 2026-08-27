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
          <div class="panel-head"><h2>CUSTOMIZATION</h2><button class="panel-close" data-c="close">✕</button></div>

          <div class="panel-section">
            <h3>WIRE COLORS</h3>
            <p class="panel-note">Adjust the wire colours. Symbols and numbers stay visible for accessibility.</p>
            <div class="color-list" id="c-wires"></div>
            <button class="btn btn--sm btn--ghost" id="c-wires-reset" style="margin-top:10px">RESET WIRE COLORS</button>
          </div>

          <button class="btn btn--primary" data-c="done">DONE</button>
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
          <div class="panel-head"><h2>SETTINGS</h2><button class="panel-close" data-s="close">✕</button></div>

          <div class="panel-section">
            <h3>ACCESSIBILITY</h3>
            <div class="set-row">
              <div class="k">Colorblind-friendly palette<small>High-contrast hues + symbols always shown</small></div>
              <label class="switch"><input type="checkbox" id="s-cb" ${s.colorblind?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">High contrast UI<small>Stronger borders and text</small></div>
              <label class="switch"><input type="checkbox" id="s-hc" ${s.highContrast?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">Interface brightness</div>
              <div class="ctl"><input type="range" id="s-bright" min="0.4" max="1" step="0.01" value="${s.brightness}"><span class="set-val" id="s-bright-v">${Math.round(s.brightness*100)}%</span></div>
            </div>
            <div class="set-row">
              <div class="k">Animation intensity<small>Reduce for motion sensitivity</small></div>
              <div class="ctl"><input type="range" id="s-motion" min="0" max="1" step="0.05" value="${s.motion}"><span class="set-val" id="s-motion-v">${s.motion>=0.8?'Full':(s.motion>=0.4?'Reduced':'Minimal')}</span></div>
            </div>
            ${[['largeTerminals','Large terminal targets'],['strongPatterns','Stronger cable patterns'],['screenShake','Screen vibration'],['haptics','Mobile haptics'],['tutorials','Contextual tutorials']].map(([key,label])=>`<div class="set-row"><div class="k">${label}</div><label class="switch"><input type="checkbox" data-setting="${key}" ${s[key]?'checked':''}><span class="track"></span></label></div>`).join('')}
          </div>

          <div class="panel-section">
            <h3>AUDIO</h3>
            <div class="set-row">
              <div class="k">Sound effects</div>
              <label class="switch"><input type="checkbox" id="s-mute" ${s.muted?'checked':''}><span class="track"></span></label>
            </div>
            <div class="set-row">
              <div class="k">Master</div>
              <div class="ctl"><input type="range" id="s-vol" min="0" max="1" step="0.05" value="${s.soundVolume}"><span class="set-val" id="s-vol-v">${Math.round(s.soundVolume*100)}%</span></div>
            </div>
            ${[['interfaceVolume','Interface'],['circuitVolume','Circuit'],['ambienceVolume','Ambience']].map(([key,label])=>`<div class="set-row"><div class="k">${label}</div><div class="ctl"><input type="range" data-volume="${key}" min="0" max="1" step="0.05" value="${s[key]}"><span class="set-val">${Math.round(s[key]*100)}%</span></div></div>`).join('')}
          </div>

          <div class="panel-section">
            <h3>DATA</h3>
            <button class="btn btn--sm btn--ghost" id="s-reset-settings">RESET SETTINGS</button>
            <button class="btn btn--sm btn--ghost" id="s-reset-progress" style="margin-top:8px">RESET PROGRESS &amp; SCORES</button>
          </div>

          <button class="btn btn--primary" data-s="done">DONE</button>
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

    // ---------- wires ----------
    buildWires: function () {
      const list = document.getElementById('c-wires');
      list.innerHTML = '';
      const custom = MUNDA.state.custom.wires || {};
      const defs = MUNDA.resolveWires();
      defs.forEach((w) => {
        const base = custom[w.id] || w.base;
        const row = document.createElement('div');
        row.className = 'color-row';
        row.innerHTML = `
          <div class="color-swatch" data-wire="${w.id}" style="background:${base}"></div>
          <span class="c-name">${w.name}</span>
          <input type="color" data-wire="${w.id}" value="${base}">`;
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

      // wire color swatches
      U.$all('.color-swatch[data-wire]', layer).forEach((sw) => {
        const input = layer.querySelector(`input[data-wire="${sw.getAttribute('data-wire')}"]`);
        sw.addEventListener('click', () => input.click());
        input.addEventListener('input', () => {
          sw.style.background = input.value;
          const id = input.getAttribute('data-wire');
          if (!MUNDA.state.custom.wires) MUNDA.state.custom.wires = {};
          MUNDA.state.custom.wires[id] = input.value;
          MUNDA.storage.saveCustom(MUNDA.state.custom);
          MUNDA.audio.select();
        });
      });
      layer.querySelector('#c-wires-reset').addEventListener('click', () => {
        MUNDA.state.custom.wires = null;
        MUNDA.storage.saveCustom(MUNDA.state.custom);
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
        MUNDA.state.settings = Object.assign({}, MUNDA.DEFAULTS.settings);
        save(); apply();
        MUNDA.Screens.refreshMute();
        this.openSettings(); // rebuild
      });
      layer.querySelector('#s-reset-progress').addEventListener('click', () => {
        if (global.confirm('Reset all progression, scores and unlocked themes?')) {
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
