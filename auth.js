// ─── Southmead PIN Gate ───────────────────────────────────────
// Change PIN here. That's the only thing you ever need to touch.
var SMC_PIN = '2025';

// Session lasts 8 hours before asking again
var SESSION_HOURS = 8;
var SESSION_KEY   = 'smc_auth';

(function() {
  // Inject gate styles
  var style = document.createElement('style');
  style.textContent = [
    '#pin-gate{position:fixed;inset:0;background:#0F0D0B;z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem}',
    '#pin-gate.hidden{display:none}',
    '.pin-box{background:#181512;border:1px solid #2E2820;border-radius:14px;padding:2rem 1.75rem;width:100%;max-width:300px;text-align:center}',
    '.pin-logo{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#C8923A;margin-bottom:1.5rem}',
    '.pin-title{font-size:17px;font-weight:600;color:#F0E8DC;margin-bottom:.35rem}',
    '.pin-sub{font-family:"DM Mono",monospace;font-size:10px;color:#6E5E4A;margin-bottom:1.5rem}',
    '.pin-dots{display:flex;justify-content:center;gap:10px;margin-bottom:1.5rem}',
    '.pin-dot{width:12px;height:12px;border-radius:50%;border:1.5px solid #2E2820;background:transparent;transition:all .15s}',
    '.pin-dot.filled{background:#C8923A;border-color:#C8923A}',
    '.pin-dot.error{background:#A83232;border-color:#A83232;animation:shake .3s ease}',
    '.pin-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:6px}',
    '.pin-key{padding:15px;border-radius:10px;border:1px solid #2E2820;background:#242018;color:#F0E8DC;font-size:18px;font-weight:500;cursor:pointer;font-family:"DM Mono",monospace;transition:all .12s;-webkit-tap-highlight-color:transparent;user-select:none}',
    '.pin-key:hover{background:rgba(200,146,58,.12);border-color:#8A6028;color:#C8923A}',
    '.pin-key:active{transform:scale(.94)}',
    '.pin-err{font-family:"DM Mono",monospace;font-size:11px;color:#A83232;min-height:16px;margin-top:6px}',
    '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'
  ].join('');
  document.head.appendChild(style);

  // Inject gate HTML
  var gate = document.createElement('div');
  gate.id  = 'pin-gate';
  gate.innerHTML = [
    '<div class="pin-box">',
    '  <div class="pin-logo">Southmead & Co</div>',
    '  <div class="pin-title">Owner access</div>',
    '  <div class="pin-sub">Enter PIN to continue</div>',
    '  <div class="pin-dots">',
    '    <div class="pin-dot" id="pd0"></div>',
    '    <div class="pin-dot" id="pd1"></div>',
    '    <div class="pin-dot" id="pd2"></div>',
    '    <div class="pin-dot" id="pd3"></div>',
    '  </div>',
    '  <div class="pin-grid">',
    '    <button class="pin-key" onclick="pinKey(\'1\')">1</button>',
    '    <button class="pin-key" onclick="pinKey(\'2\')">2</button>',
    '    <button class="pin-key" onclick="pinKey(\'3\')">3</button>',
    '    <button class="pin-key" onclick="pinKey(\'4\')">4</button>',
    '    <button class="pin-key" onclick="pinKey(\'5\')">5</button>',
    '    <button class="pin-key" onclick="pinKey(\'6\')">6</button>',
    '    <button class="pin-key" onclick="pinKey(\'7\')">7</button>',
    '    <button class="pin-key" onclick="pinKey(\'8\')">8</button>',
    '    <button class="pin-key" onclick="pinKey(\'9\')">9</button>',
    '    <button class="pin-key" onclick="pinClear()" style="font-size:13px;color:#6E5E4A">Clear</button>',
    '    <button class="pin-key" onclick="pinKey(\'0\')">0</button>',
    '    <button class="pin-key" onclick="pinBack()" style="font-size:18px;color:#6E5E4A">⌫</button>',
    '  </div>',
    '  <div class="pin-err" id="pin-err"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(gate);

  // Check existing session
  checkSession();
})();

var pinEntry = '';

function checkSession() {
  try {
    var stored = localStorage.getItem(SESSION_KEY);
    if (!stored) { showGate(); return; }
    var data = JSON.parse(stored);
    var elapsed = (Date.now() - data.ts) / 3600000;
    if (elapsed < SESSION_HOURS && data.ok === true) {
      hideGate();
    } else {
      localStorage.removeItem(SESSION_KEY);
      showGate();
    }
  } catch(e) {
    showGate();
  }
}

function showGate() {
  var gate = document.getElementById('pin-gate');
  if (gate) gate.classList.remove('hidden');
}

function hideGate() {
  var gate = document.getElementById('pin-gate');
  if (gate) gate.classList.add('hidden');
}

function pinKey(digit) {
  if (pinEntry.length >= 4) return;
  pinEntry += digit;
  updateDots();
  if (pinEntry.length === 4) {
    setTimeout(checkPin, 120);
  }
}

function pinBack() {
  pinEntry = pinEntry.slice(0, -1);
  updateDots();
  document.getElementById('pin-err').textContent = '';
}

function pinClear() {
  pinEntry = '';
  updateDots();
  document.getElementById('pin-err').textContent = '';
}

function updateDots() {
  for (var i = 0; i < 4; i++) {
    var dot = document.getElementById('pd' + i);
    if (!dot) continue;
    dot.classList.toggle('filled', i < pinEntry.length);
    dot.classList.remove('error');
  }
}

function checkPin() {
  if (pinEntry === SMC_PIN) {
    // Correct — save session and unlock
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
    } catch(e) {}
    hideGate();
  } else {
    // Wrong — shake dots, clear after delay
    for (var i = 0; i < 4; i++) {
      var dot = document.getElementById('pd' + i);
      if (dot) { dot.classList.remove('filled'); dot.classList.add('error'); }
    }
    document.getElementById('pin-err').textContent = 'Incorrect PIN';
    setTimeout(function() {
      pinEntry = '';
      updateDots();
    }, 800);
  }
}

// Keyboard support
document.addEventListener('keydown', function(e) {
  if (document.getElementById('pin-gate') && !document.getElementById('pin-gate').classList.contains('hidden')) {
    if (e.key >= '0' && e.key <= '9') pinKey(e.key);
    else if (e.key === 'Backspace') pinBack();
    else if (e.key === 'Escape') pinClear();
  }
});
