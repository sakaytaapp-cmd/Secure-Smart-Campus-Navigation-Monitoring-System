/**
 * Module 1: Finite State Machine (FSM) Core Engine (js/fsm-engine.js)
 * Models M = (Q, Sigma, delta, q0, F) with 7 required system states:
 * IDLE, LOGIN, ACCESS_GRANTED, ACCESS_DENIED, NAVIGATING, MONITORING, EXIT
 */

const CampusFSM = {
  currentState: 'IDLE',
  history: [
    { timestamp: new Date().toLocaleTimeString(), from: 'INIT', event: 'BOOT', to: 'IDLE', note: 'System initialized at q0 = IDLE' }
  ],

  states: {
    IDLE:           { label: 'Idle',           code: 'IDLE',    x: 110, y: 210, color: '#64748b', desc: 'Waiting for user interaction at terminal.' },
    LOGIN:          { label: 'Login',          code: 'LOGIN',   x: 230, y: 90,  color: '#f59e0b', desc: 'Verifying encrypted user credentials.' },
    ACCESS_DENIED:  { label: 'Access Denied',  code: 'DENIED',  x: 230, y: 330, color: '#f43f5e', desc: 'Authentication failed or invalid token.' },
    ACCESS_GRANTED: { label: 'Access Granted', code: 'GRANTED', x: 450, y: 90,  color: '#10b981', desc: 'Authenticated session active.' },
    NAVIGATING:     { label: 'Navigating',     code: 'NAV',     x: 660, y: 90,  color: '#06b6d4', desc: 'Computing shortest campus routes.' },
    MONITORING:     { label: 'Monitoring',     code: 'MON',     x: 790, y: 210, color: '#6366f1', desc: 'Inspecting rooms, trees & probability metrics.' },
    EXIT:           { label: 'Exit',           code: 'EXIT',    x: 660, y: 330, color: '#a855f7', desc: 'Session terminated safely (Accepting State).' }
  },

  transitions: {
    IDLE:           { START_AUTH: 'LOGIN', SHUTDOWN: 'EXIT' },
    LOGIN:          { AUTH_OK: 'ACCESS_GRANTED', AUTH_FAIL: 'ACCESS_DENIED', CANCEL: 'IDLE' },
    ACCESS_DENIED:  { RETRY: 'LOGIN', RESET: 'IDLE', SHUTDOWN: 'EXIT' },
    ACCESS_GRANTED: { OPEN_NAV: 'NAVIGATING', OPEN_MON: 'MONITORING', LOGOUT: 'IDLE', SHUTDOWN: 'EXIT' },
    NAVIGATING:     { SWITCH_MON: 'MONITORING', BACK_HUB: 'ACCESS_GRANTED', LOGOUT: 'IDLE', SHUTDOWN: 'EXIT' },
    MONITORING:     { SWITCH_NAV: 'NAVIGATING', BACK_HUB: 'ACCESS_GRANTED', LOGOUT: 'IDLE', SHUTDOWN: 'EXIT' },
    EXIT:           { REBOOT: 'IDLE' }
  },

  dispatch(event, note = '') {
    const validNext = this.transitions[this.currentState] || {};
    const nextState = validNext[event];

    if (!nextState) {
      this.history.unshift({
        timestamp: new Date().toLocaleTimeString(),
        from: this.currentState,
        event: event + ' (BLOCKED)',
        to: this.currentState,
        note: `Invalid transition from ${this.currentState} on input ${event}`
      });
      this.render();
      return false;
    }

    const prevState = this.currentState;
    this.currentState = nextState;
    this.history.unshift({
      timestamp: new Date().toLocaleTimeString(),
      from: prevState,
      event,
      to: nextState,
      note: note || `Transition delta(${prevState}, ${event}) -> ${nextState}`
    });

    this.render();
    return true;
  },

  // Clicking a state node fires the *defined* event that reaches it. If delta has
  // no such transition the move is rejected and logged, so the security invariant
  // (NAVIGATING / MONITORING only reachable via AUTH_OK) cannot be bypassed.
  clickState(targetState, reason = 'Clicked state node in SVG') {
    if (!this.states[targetState]) return false;

    const validNext = this.transitions[this.currentState] || {};
    const event = Object.keys(validNext).find(ev => validNext[ev] === targetState);

    if (!event) {
      this.history.unshift({
        timestamp: new Date().toLocaleTimeString(),
        from: this.currentState,
        event: `NAVIGATE_TO_${targetState} (BLOCKED)`,
        to: this.currentState,
        note: `No transition delta(${this.currentState}, .) -> ${targetState} exists. Move rejected.`
      });
      this.render();
      return false;
    }

    return this.dispatch(event, reason);
  },

  // Route into LOGIN strictly through the transition function (never a raw jump),
  // so re-authentication honours delta from whichever state the machine is in.
  // Looks up the event whose target is LOGIN, since delta maps events -> states.
  routeToLogin(reason = 'Credential check') {
    if (this.currentState === 'LOGIN') return true;
    const t = this.transitions[this.currentState] || {};
    const entryEvent = Object.keys(t).find(ev => t[ev] === 'LOGIN');
    return entryEvent ? !!this.dispatch(entryEvent, reason) : false;
  },

  render() {
    // Update top header badge
    const badge = document.getElementById('header-fsm-badge');
    const descEl = document.getElementById('header-fsm-desc');
    if (badge) {
      const st = this.states[this.currentState];
      badge.textContent = this.currentState;
      badge.style.borderColor = st.color;
      badge.style.color = '#fff';
      badge.style.backgroundColor = st.color + '33';
    }
    if (descEl) {
      descEl.textContent = this.states[this.currentState].desc;
    }

    // Render SVG Diagram
    const svg = document.getElementById('fsm-svg');
    if (svg) {
      // Derive the edge list from the transition function itself, so the diagram can
      // never drift out of sync with delta. Opposing transitions between the same
      // pair of nodes are bowed apart; labels are then nudged apart so none overlap.
      const pairs = new Map();
      Object.entries(this.transitions).forEach(([from, events]) => {
        Object.entries(events).forEach(([event, to]) => {
          const key = [from, to].sort().join('|');
          if (!pairs.has(key)) pairs.set(key, { a: key.split('|')[0], b: key.split('|')[1], labels: [] });
          pairs.get(key).labels.push({ from, to, event });
        });
      });

      let html = `<defs>
        <marker id="fsm-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"/>
        </marker>
      </defs>`;

      const NODE_R = 23;
      const GAP = 3;
      const curves = [];

      pairs.forEach((pair) => {
        const bowed = pair.labels.length > 1;
        // canonical pair direction, so the two opposing edges bow to opposite sides
        const A0 = this.states[pair.a];
        const B0 = this.states[pair.b];
        const d0x = B0.x - A0.x;
        const d0y = B0.y - A0.y;
        const l0 = Math.hypot(d0x, d0y) || 1;
        const basePx = -d0y / l0;
        const basePy = d0x / l0;

        pair.labels.forEach((label, i) => {
          const A = this.states[label.from];
          const B = this.states[label.to];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const len = Math.hypot(dx, dy) || 1;
          const mx = (A.x + B.x) / 2;
          const my = (A.y + B.y) / 2;

          let off;
          if (bowed) {
            off = (i === 0 ? 1 : -1) * Math.min(95, len * 0.3);
          } else {
            // single edge: bow away from the diagram centre for a balanced spread
            let px = -dy / len;
            let py = dx / len;
            if ((my < 210 && py > 0) || (my >= 210 && py < 0)) { px = -px; py = -py; }
            off = Math.min(26, len * 0.16);
            curves.push({
              label: label.event, fromKey: label.from, toKey: label.to,
              ax: A.x, ay: A.y, bx: B.x, by: B.y,
              cx: mx + px * off, cy: my + py * off
            });
            return;
          }

          curves.push({
            label: label.event, fromKey: label.from, toKey: label.to,
            ax: A.x, ay: A.y, bx: B.x, by: B.y,
            cx: mx + basePx * off, cy: my + basePy * off
          });
        });
      });

      // anchor each label at its curve apex, then resolve any remaining collisions
      curves.forEach(c => { c.lx = c.cx; c.ly = c.cy - 7; });
      const boxOf = c => {
        const w = c.label.length * 5.4;
        return { x1: c.lx - w / 2, x2: c.lx + w / 2, y1: c.ly - 10, y2: c.ly + 3 };
      };
      const hits = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
      const nodeBoxes = Object.values(this.states).map(s => ({
        x: s.x, y: s.y, x1: s.x - 34, x2: s.x + 34, y1: s.y - 30, y2: s.y + 48
      }));

      for (let iter = 0; iter < 150; iter++) {
        let moved = false;
        for (let i = 0; i < curves.length; i++) {
          const a = curves[i];
          let ab = boxOf(a);
          for (let j = i + 1; j < curves.length; j++) {
            const b = curves[j];
            if (hits(ab, boxOf(b))) {
              const ddx = a.lx - b.lx || (i - j) * 0.5;
              const ddy = a.ly - b.ly || 0.75;
              const d = Math.hypot(ddx, ddy) || 1;
              a.lx += ddx / d * 1.3; a.ly += ddy / d * 1.3;
              b.lx -= ddx / d * 1.3; b.ly -= ddy / d * 1.3;
              ab = boxOf(a);
              moved = true;
            }
          }
          for (const n of nodeBoxes) {
            if (hits(ab, n)) {
              const ddx = a.lx - n.x || 0.5;
              const ddy = a.ly - n.y || 0.75;
              const d = Math.hypot(ddx, ddy) || 1;
              a.lx += ddx / d * 1.3; a.ly += ddy / d * 1.3;
              ab = boxOf(a);
              moved = true;
            }
          }
          // spring back toward the curve apex so labels stay near their edge
          a.lx += (a.cx - a.lx) * 0.05;
          a.ly += (a.cy - a.ly) * 0.05;
        }
        if (!moved) break;
      }

      curves.forEach(c => {
        // trim both ends to that node's boundary so arrows sit clear of the circles
        const trim = (px, py, tx, ty, r) => {
          const d = Math.hypot(tx, ty) || 1;
          return [px + tx / d * r, py + ty / d * r];
        };
        const radiusOf = key => (key === this.currentState ? 28 : NODE_R) + GAP;
        const [sx, sy] = trim(c.ax, c.ay, c.cx - c.ax, c.cy - c.ay, radiusOf(c.fromKey));
        const [ex, ey] = trim(c.bx, c.by, c.cx - c.bx, c.cy - c.by, radiusOf(c.toKey));
        html += `<path d="M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${c.cx.toFixed(1)} ${c.cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="#334155" stroke-width="2" marker-end="url(#fsm-arrow)"/>`;
        html += `<text x="${c.lx.toFixed(1)}" y="${c.ly.toFixed(1)}" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">${c.label}</text>`;
      });

      Object.entries(this.states).forEach(([key, st]) => {
        const isCurrent = key === this.currentState;
        const radius = isCurrent ? 28 : NODE_R;
        const strokeWidth = isCurrent ? 4 : 2;
        html += `<g style="cursor:pointer" onclick="CampusFSM.clickState('${key}', 'Clicked state node in SVG')">
          ${isCurrent ? `<circle cx="${st.x}" cy="${st.y}" r="36" fill="${st.color}22" stroke="${st.color}" stroke-dasharray="4 2"/>` : ''}
          <circle cx="${st.x}" cy="${st.y}" r="${radius}" fill="#0f172a" stroke="${st.color}" stroke-width="${strokeWidth}"/>
          <text x="${st.x}" y="${st.y + 3}" fill="#f8fafc" font-size="8.5" font-weight="700" text-anchor="middle" font-family="monospace">${st.code}</text>
          <text x="${st.x}" y="${st.y + 38}" fill="#cbd5e1" font-size="10" text-anchor="middle">${st.label}</text>
        </g>`;
      });

      svg.innerHTML = html;
    }

    // Render History Log
    const logBody = document.getElementById('fsm-log-body');
    if (logBody) {
      logBody.innerHTML = this.history.slice(0, 10).map(item => `
        <tr>
          <td class="mono">${item.timestamp}</td>
          <td><span class="card-tag">${item.from}</span></td>
          <td class="mono" style="color:#f59e0b">${item.event}</td>
          <td><span class="card-tag" style="color:#10b981">${item.to}</span></td>
          <td>${item.note}</td>
        </tr>
      `).join('');
    }

    // Enable only the buttons whose transition exists from the current state,
    // so the UI never invites a blocked move.
    this.updateControls();
  },

  // Disable event buttons whose delta entry is missing from the current state.
  updateControls() {
    const valid = this.transitions[this.currentState] || {};
    document.querySelectorAll('button[onclick*="CampusFSM.dispatch"]').forEach(btn => {
      const m = btn.getAttribute('onclick').match(/dispatch\('([^']+)'\)/);
      const event = m ? m[1] : null;
      btn.disabled = !event || !valid[event];
      if (btn.disabled) {
        btn.classList.add('btn-disabled');
        btn.style.opacity = '0.45';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.classList.remove('btn-disabled');
        btn.style.opacity = '';
        btn.style.cursor = '';
      }
    });
  }
};
