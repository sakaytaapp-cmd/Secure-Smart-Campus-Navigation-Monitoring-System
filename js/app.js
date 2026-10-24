/**
 * Main Application Controller (js/app.js)
 * Wires interactive UI tabs to all 6 syllabus algorithm engines.
 */

const AppController = {
  switchTab(tabId, btnEl) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    if (btnEl) btnEl.classList.add('active');

    // Sync FSM state with active module when appropriate. Every protected module is
    // entered through a defined transition, so no tab can reach a privileged state
    // without the machine actually moving there.
    if (CampusFSM.currentState === 'ACCESS_GRANTED') {
      if (tabId === 'tab-nav') {
        CampusFSM.dispatch('OPEN_NAV', 'Opened Graph Navigation Module');
      } else if (tabId === 'tab-tree' || tabId === 'tab-search' || tabId === 'tab-prob') {
        CampusFSM.dispatch('OPEN_MON', 'Opened Monitoring Module');
      }
    }
  },

  runCrypto(decrypt = false) {
    const algo = document.getElementById('crypto-algo').value;
    const text = document.getElementById('crypto-input').value;
    const key = document.getElementById('crypto-key').value;

    let res;
    if (algo === 'vigenere') {
      res = CampusCrypto.vigenere(text, key, decrypt);
    } else if (algo === 'caesar') {
      res = CampusCrypto.caesar(text, key, decrypt);
    } else {
      res = CampusCrypto.xorHex(text, key, decrypt);
    }

    document.getElementById('crypto-output').value = res.result;

    const tbody = document.getElementById('crypto-steps-body');
    const shown = res.steps.slice(0, 24);
    tbody.innerHTML = shown.map(s => `
      <tr>
        <td class="mono">${s.index}</td>
        <td class="mono">'${s.char}' (${s.pVal})</td>
        <td class="mono">'${s.keyChar}' (${s.kVal})</td>
        <td class="mono">${s.formula}</td>
        <td class="mono" style="color:#10b981;font-weight:700">${s.out}</td>
      </tr>
    `).join('') + (res.steps.length > shown.length
      ? `<tr><td colspan="5" class="mono" style="color:#94a3b8">… ${res.steps.length - shown.length} more characters not shown</td></tr>`
      : '');

    // Per-algorithm guidance so the key field's meaning is never ambiguous
    const note = document.getElementById('crypto-note');
    if (note) {
      if (algo === 'caesar' && Number.isNaN(parseInt(key, 10))) {
        note.textContent = `⚠ Non-numeric key "${key}" — Caesar requires an integer shift, so the default shift 7 was used.`;
        note.style.color = '#f59e0b';
      } else if (algo === 'caesar') {
        note.textContent = 'Caesar shift: C_i = (P_i + s) mod 26. Shift must be an integer 0–25.';
        note.style.color = 'var(--text-muted)';
      } else if (algo === 'xor') {
        note.textContent = decrypt
          ? 'XOR decrypt: paste the hex ciphertext (e.g. "01 05 12 07") into the message field, then click Decrypt.'
          : 'XOR encrypt: output is hex. Paste it back into the message field and click Decrypt to recover the plaintext.';
        note.style.color = 'var(--text-muted)';
      } else {
        note.textContent = 'Vigenère: the key repeats cyclically over letters only; digits and separators pass through unchanged.';
        note.style.color = 'var(--text-muted)';
      }
    }
  },

  async authenticateGate() {
    const user = document.getElementById('auth-user').value.trim();
    const pin = document.getElementById('auth-pin').value.trim();
    const hash = await CampusCrypto.hashCredential(user, pin);
    document.getElementById('auth-hash-out').textContent = `Salted Hash: 0x${hash} (${hash.length * 4}-bit)`;

    // Enter LOGIN only via a defined transition — never a raw state assignment
    CampusFSM.routeToLogin(`Authenticating user ${user}`);
    if (pin === '2026' || pin === 'BISU2026') {
      CampusFSM.dispatch('AUTH_OK', `Valid credential hash 0x${hash} for ${user}`);
    } else {
      CampusFSM.dispatch('AUTH_FAIL', `Invalid PIN for ${user}`);
    }
  },

  runDijkstra() {
    const start = document.getElementById('nav-start').value;
    const end = document.getElementById('nav-end').value;
    const res = CampusGraph.dijkstra(start, end);

    CampusGraph.renderMap(res.path);
    const out = document.getElementById('nav-console');

    if (!Number.isFinite(res.distance)) {
      out.textContent = [
        `=== DIJKSTRA SHORTEST PATH (${start} -> ${end}) ===`,
        `No route: the graph contains no path between these vertices.`,
        ...res.trace
      ].join('\n');
      return;
    }

    out.textContent = [
      `=== DIJKSTRA SHORTEST PATH (${start} -> ${end}) ===`,
      `Optimal Route : ${res.path.join(' -> ')}`,
      `Total Distance: ${res.distance} meters`,
      ``,
      `Step-by-Step Relaxation Log:`,
      ...res.trace
    ].join('\n');
  },

  runRecursiveDFS() {
    const start = document.getElementById('nav-start').value;
    const end = document.getElementById('nav-end').value;
    const res = CampusGraph.findAllPathsRecursive(start, end);

    if (res.allPaths.length > 0) {
      CampusGraph.renderMap(res.allPaths[0].path);
    }

    const out = document.getElementById('nav-console');
    const summary = res.allPaths.slice(0, 6).map((p, idx) =>
      `  #${idx + 1}: ${p.path.join(' -> ')} (${p.distance}m)`
    );
    out.textContent = [
      `=== RECURSIVE DFS ALL-PATHS EXPLORER (${start} -> ${end}) ===`,
      `Total Valid Simple Paths Discovered: ${res.allPaths.length}`,
      ...summary,
      ``,
      `Recursive Call Stack Trace (Top 18 frames):`,
      ...res.callTrace.slice(0, 18)
    ].join('\n');
  },

  runTreeTraversal(mode) {
    // Normalise first: an unrecognised mode used to fall through to level-order while the
    // heading still printed the bogus name, mislabelling the algorithm that actually ran.
    const MODES = ['preorder', 'postorder', 'levelorder'];
    const m = MODES.includes(mode) ? mode : 'levelorder';

    let list = [];
    if (m === 'preorder') list = CampusTree.preOrder();
    else if (m === 'postorder') list = CampusTree.postOrder();
    else list = CampusTree.levelOrder();

    CampusTree.renderTree(list.map(i => i.id));
    const totalCap = CampusTree.computeSubtreeCapacity();

    const out = document.getElementById('tree-console');
    out.textContent = [
      `=== ${m.toUpperCase()} TREE TRAVERSAL ===`,
      `Recursive Subtree Total Seating Capacity: ${totalCap} seats`,
      ``,
      `Traversal Visit Sequence:`,
      ...list.map((item, idx) => `  ${idx + 1}. ${'  '.repeat(item.depth)}[${item.id}] ${item.name} (Cap: ${item.capacity})`)
    ].join('\n');
  },

  renderRecordsTable(records = CampusRecords.data, highlightId = null) {
    const tbody = document.getElementById('records-tbody');
    if (!tbody) return;
    tbody.innerHTML = records.map(r => `
      <tr style="${r.id === highlightId ? 'background:rgba(16,185,129,0.22)' : ''}">
        <td class="mono">${r.id}</td>
        <td><strong>${r.name}</strong></td>
        <td>${r.role}</td>
        <td class="mono">${r.room}</td>
        <td class="mono">Level ${r.clearance}</td>
        <td class="mono">${r.time}</td>
      </tr>
    `).join('');
  },

  runSort(algo) {
    const key = document.getElementById('sort-key').value;
    let res;
    if (algo === 'merge') res = CampusRecords.mergeSort(CampusRecords.data, key);
    else if (algo === 'quick') res = CampusRecords.quickSort(CampusRecords.data, key);
    else res = CampusRecords.insertionSort(CampusRecords.data, key);

    // Render the sorted view without mutating the source dataset
    this.renderRecordsTable(res.sorted);
    document.getElementById('search-sort-log').textContent =
      `Executed ${res.algorithm} by key "${key}".\nTotal Element Comparisons: ${res.comparisons}`;
  },

  runSearch(type) {
    const q = document.getElementById('search-query').value.trim();
    const log = document.getElementById('search-sort-log');

    if (type === 'binary') {
      const targetId = parseInt(q, 10);
      if (!Number.isFinite(targetId)) {
        // Never substitute a default ID: reporting a match for a value the user did not
        // type is worse than reporting that the query is unusable.
        log.textContent =
          `=== BINARY SEARCH O(log n) ===\n` +
          `Binary search requires a numeric User ID, but "${q}" is not one.\n` +
          `No comparison performed. Use Linear Search to match names or rooms.`;
        return;
      }
      const res = CampusRecords.binarySearch(CampusRecords.data, targetId);
      this.renderRecordsTable(CampusRecords.data, res.found ? res.found.id : null);
      log.textContent =
        `=== BINARY SEARCH O(log n) FOR ID ${targetId} ===\n` + res.steps.join('\n');
    } else {
      const res = CampusRecords.linearSearch(CampusRecords.data, q);
      this.renderRecordsTable(CampusRecords.data, res.found ? res.found.id : null);
      log.textContent =
        `=== LINEAR SEARCH O(n) FOR "${q}" ===\n` + res.steps.join('\n');
    }
  },

  runCombinatorics() {
    const nEl = document.getElementById('prob-n');
    const rEl = document.getElementById('prob-r');
    const nRaw = parseInt(nEl.value, 10);
    const rRaw = parseInt(rEl.value, 10);

    // Clamp to the field's declared range instead of `parseInt(x) || default`, which
    // turned a legitimate 0 into 10/3 and let a typed 999 overflow the factorials to NaN.
    const n = Number.isFinite(nRaw) ? Math.min(Math.max(nRaw, 1), 15) : 10;
    const r = Number.isFinite(rRaw) ? Math.min(Math.max(rRaw, 1), 10) : 3;
    nEl.value = n;
    rEl.value = r;

    const pVal = CampusProbability.permutation(n, r);
    const cVal = CampusProbability.combination(n, r);

    document.getElementById('stat-perm').textContent = pVal.toLocaleString();
    document.getElementById('stat-comb').textContent = cVal.toLocaleString();
    // A probability cannot be negative: when r > n the event is impossible, so report 0.
    const prob = r <= n ? (n - r) / n * 100 : 0;
    document.getElementById('stat-prob').textContent = prob.toFixed(1) + '%';
  },

  runMonteCarlo() {
    const metrics = CampusProbability.analyzeRandomVariable();
    const sim = CampusProbability.simulateMonteCarlo(500);

    document.getElementById('stat-ex').textContent = metrics.expectedValue;
    document.getElementById('stat-var').textContent = metrics.variance;
    document.getElementById('stat-sd').textContent = metrics.stdDev;

    const log = document.getElementById('prob-console');
    log.textContent = [
      `=== RANDOM VARIABLE X ANALYSIS & MONTE CARLO (N = ${sim.trials} trials) ===`,
      `Theoretical E[X]  : ${metrics.expectedValue} students`,
      `Empirical Mean    : ${sim.sampleMean} students`,
      `Variance Var(X)   : ${metrics.variance}`,
      `Std Deviation (σ) : ${metrics.stdDev}`,
      ``,
      `Simulated Frequency Breakdown:`,
      ...Object.entries(sim.counts).map(([x, c]) => `  X = ${x} students : ${c} trials (${((c / sim.trials) * 100).toFixed(1)}%)`)
    ].join('\n');
  },

  init() {
    CampusFSM.render();
    this.runCrypto(false);
    CampusGraph.renderMap(['GATE', 'ADMIN', 'REGISTRAR', 'CSM', 'COMLAB1']);
    this.runDijkstra();
    CampusTree.renderTree(['BISU-CLARIN']);
    this.runTreeTraversal('preorder');
    this.renderRecordsTable();
    this.runCombinatorics();
    this.runMonteCarlo();
  }
};

window.addEventListener('DOMContentLoaded', () => AppController.init());
