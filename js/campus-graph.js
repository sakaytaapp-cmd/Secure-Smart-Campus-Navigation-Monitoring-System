/**
 * Module 3: Graph-Based Campus Navigation & Recursive Route Explorer (js/campus-graph.js)
 * Models BISU Clarin Campus as weighted undirected graph G = (V, E, w)
 * Implements Dijkstra's Shortest Path & Recursive DFS All-Paths Enumeration
 */

const CampusGraph = {
  nodes: {
    GATE:      { id: 'GATE',      name: 'Main Gate',       x: 80,  y: 200 },
    GUARD:     { id: 'GUARD',     name: 'Security Office', x: 185, y: 110 },
    ADMIN:     { id: 'ADMIN',     name: 'Admin Building',  x: 230, y: 210 },
    REGISTRAR: { id: 'REGISTRAR', name: 'Registrar',       x: 345, y: 120 },
    LIBRARY:   { id: 'LIBRARY',   name: 'Campus Library',  x: 470, y: 110 },
    CSM:       { id: 'CSM',       name: 'CSM Building',    x: 500, y: 230 },
    COMLAB1:   { id: 'COMLAB1',   name: 'ComLab 1',        x: 650, y: 150 },
    COMLAB2:   { id: 'COMLAB2',   name: 'ComLab 2',        x: 660, y: 270 },
    CAFETERIA: { id: 'CAFETERIA', name: 'Cafeteria',       x: 350, y: 300 },
    GYM:       { id: 'GYM',       name: 'Gymnasium',       x: 530, y: 340 }
  },

  edges: [
    { u: 'GATE',      v: 'GUARD',     w: 45 },
    { u: 'GATE',      v: 'ADMIN',     w: 60 },
    { u: 'GUARD',     v: 'REGISTRAR', w: 70 },
    { u: 'ADMIN',     v: 'REGISTRAR', w: 50 },
    { u: 'ADMIN',     v: 'CAFETERIA', w: 65 },
    { u: 'REGISTRAR', v: 'LIBRARY',   w: 55 },
    { u: 'REGISTRAR', v: 'CSM',       w: 80 },
    { u: 'LIBRARY',   v: 'CSM',       w: 60 },
    { u: 'LIBRARY',   v: 'COMLAB1',   w: 75 },
    { u: 'CSM',       v: 'COMLAB1',   w: 40 },
    { u: 'CSM',       v: 'COMLAB2',   w: 45 },
    { u: 'COMLAB1',   v: 'COMLAB2',   w: 30 },
    { u: 'CAFETERIA', v: 'CSM',       w: 70 },
    { u: 'CAFETERIA', v: 'GYM',       w: 85 },
    { u: 'CSM',       v: 'GYM',       w: 55 }
  ],

  getAdjacency() {
    const adj = {};
    Object.keys(this.nodes).forEach(k => { adj[k] = []; });
    this.edges.forEach(e => {
      adj[e.u].push({ node: e.v, weight: e.w });
      adj[e.v].push({ node: e.u, weight: e.w });
    });
    return adj;
  },

  dijkstra(start, end) {
    if (!this.nodes[start] || !this.nodes[end]) {
      const bad = !this.nodes[start] ? start : end;
      return { path: [], distance: Infinity, trace: [`Invalid vertex "${bad}": not a member of V.`] };
    }
    const adj = this.getAdjacency();
    const dist = {};
    const prev = {};
    const visited = new Set();
    const trace = [];

    Object.keys(this.nodes).forEach(k => {
      dist[k] = Infinity;
      prev[k] = null;
    });
    dist[start] = 0;

    while (visited.size < Object.keys(this.nodes).length) {
      let u = null;
      let best = Infinity;
      for (const k of Object.keys(this.nodes)) {
        if (!visited.has(k) && dist[k] < best) {
          best = dist[k];
          u = k;
        }
      }
      if (u === null || dist[u] === Infinity) break;
      visited.add(u);
      trace.push(`Relaxed vertex ${this.nodes[u].name} (d = ${dist[u]}m)`);
      if (u === end) break;

      for (const neighbor of adj[u]) {
        if (!visited.has(neighbor.node)) {
          const alt = dist[u] + neighbor.weight;
          if (alt < dist[neighbor.node]) {
            dist[neighbor.node] = alt;
            prev[neighbor.node] = u;
            trace.push(`  -> Updated ${this.nodes[neighbor.node].name}: ${alt}m via ${this.nodes[u].name}`);
          }
        }
      }
    }

    const path = [];
    let curr = end;
    while (curr) {
      path.unshift(curr);
      curr = prev[curr];
    }
    return {
      path: path[0] === start ? path : [],
      distance: dist[end],
      trace
    };
  },

  findAllPathsRecursive(start, target) {
    if (!this.nodes[start] || !this.nodes[target]) {
      const bad = !this.nodes[start] ? start : target;
      return { allPaths: [], callTrace: [`Invalid vertex "${bad}": not a member of V.`] };
    }
    const adj = this.getAdjacency();
    const allPaths = [];
    const callTrace = [];

    const dfs = (current, visited, path, totalDist, depth) => {
      const indent = '  '.repeat(depth);
      callTrace.push(`${indent}dfs(${current}, dist=${totalDist}m, path=[${path.join('->')}])`);

      if (current === target) {
        allPaths.push({ path: [...path], distance: totalDist });
        callTrace.push(`${indent}  [BASE CASE HIT] Target ${target} reached! Total = ${totalDist}m`);
        return;
      }

      for (const edge of adj[current]) {
        if (!visited.has(edge.node)) {
          visited.add(edge.node);
          path.push(edge.node);
          dfs(edge.node, visited, path, totalDist + edge.weight, depth + 1);
          path.pop();
          visited.delete(edge.node);
        }
      }
    };

    const visitedSet = new Set([start]);
    dfs(start, visitedSet, [start], 0, 0);
    allPaths.sort((a, b) => a.distance - b.distance);
    return { allPaths, callTrace };
  },

  renderMap(highlightPath = []) {
    const svg = document.getElementById('campus-graph-svg');
    if (!svg) return;

    const pathEdges = new Set();
    for (let i = 0; i < highlightPath.length - 1; i++) {
      const a = highlightPath[i];
      const b = highlightPath[i + 1];
      pathEdges.add(`${a}-${b}`);
      pathEdges.add(`${b}-${a}`);
    }

    let html = '';
    this.edges.forEach(e => {
      const n1 = this.nodes[e.u];
      const n2 = this.nodes[e.v];
      const active = pathEdges.has(`${e.u}-${e.v}`);
      const stroke = active ? '#06b6d4' : '#334155';
      const width = active ? 4 : 2;
      const mx = (n1.x + n2.x) / 2;
      const my = (n1.y + n2.y) / 2 - 6;

      html += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="${stroke}" stroke-width="${width}"/>`;
      html += `<text x="${mx}" y="${my}" fill="${active ? '#22d3ee' : '#94a3b8'}" font-size="10" font-family="monospace" text-anchor="middle">${e.w}m</text>`;
    });

    Object.values(this.nodes).forEach(n => {
      const inPath = highlightPath.includes(n.id);
      const fill = inPath ? '#06b6d4' : '#1e293b';
      const stroke = inPath ? '#ffffff' : '#6366f1';
      html += `<g>
        <circle cx="${n.x}" cy="${n.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
        <text x="${n.x}" y="${n.y + 4}" fill="${inPath ? '#082f49' : '#f8fafc'}" font-size="8.5" font-weight="700" text-anchor="middle">${n.id}</text>
        <text x="${n.x}" y="${n.y + 34}" fill="#cbd5e1" font-size="10" text-anchor="middle">${n.name}</text>
      </g>`;
    });

    svg.innerHTML = html;
  }
};
