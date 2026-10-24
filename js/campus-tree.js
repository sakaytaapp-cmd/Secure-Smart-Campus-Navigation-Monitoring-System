/**
 * Module 4: Hierarchical Tree & Recursive Traversals (js/campus-tree.js)
 * Organizes BISU Clarin Campus -> Colleges -> Departments -> Rooms
 * Implements Recursive Pre-Order, Post-Order, Level-Order, and Recursive Capacity Aggregation
 */

const CampusTree = {
  root: {
    id: 'BISU-CLARIN',
    name: 'BISU Clarin Campus',
    type: 'Campus',
    capacity: 0,
    x: 380, y: 45,
    children: [
      {
        id: 'CSM',
        name: 'College of Science & Mgmt',
        type: 'College',
        capacity: 0,
        x: 190, y: 130,
        children: [
          {
            id: 'DCS',
            name: 'Dept. of Comp. Science',
            type: 'Department',
            capacity: 0,
            x: 110, y: 225,
            children: [
              { id: 'COMLAB-1', name: 'ComLab 1 (45 seats)', type: 'Room', capacity: 45, x: 65,  y: 320, children: [] },
              { id: 'COMLAB-2', name: 'ComLab 2 (40 seats)', type: 'Room', capacity: 40, x: 155, y: 320, children: [] }
            ]
          },
          {
            id: 'DENV',
            name: 'Dept. of Env. Science',
            type: 'Department',
            capacity: 0,
            x: 270, y: 225,
            children: [
              { id: 'SCI-LAB', name: 'Bio/Env Lab (35 seats)', type: 'Room', capacity: 35, x: 270, y: 320, children: [] }
            ]
          }
        ]
      },
      {
        id: 'ADMIN-DIV',
        name: 'Admin & Academic Support',
        type: 'Division',
        capacity: 0,
        x: 560, y: 130,
        children: [
          {
            id: 'LIB-UNIT',
            name: 'Library & Research Unit',
            type: 'Unit',
            capacity: 0,
            x: 470, y: 225,
            children: [
              { id: 'MAIN-LIB', name: 'Reading Hall (120 seats)', type: 'Room', capacity: 120, x: 470, y: 320, children: [] }
            ]
          },
          {
            id: 'SEC-UNIT',
            name: 'Security & Student Services',
            type: 'Unit',
            capacity: 0,
            x: 645, y: 225,
            children: [
              { id: 'REG-HUB', name: 'Registrar Lobby (50 seats)', type: 'Room', capacity: 50, x: 600, y: 320, children: [] },
              { id: 'GYM-HALL', name: 'Campus Gym (400 seats)', type: 'Room', capacity: 400, x: 700, y: 320, children: [] }
            ]
          }
        ]
      }
    ]
  },

  preOrder(node = this.root, list = [], depth = 0) {
    if (!node) return list;
    list.push({ id: node.id, name: node.name, depth, capacity: node.capacity });
    for (const child of node.children) {
      this.preOrder(child, list, depth + 1);
    }
    return list;
  },

  postOrder(node = this.root, list = [], depth = 0) {
    if (!node) return list;
    for (const child of node.children) {
      this.postOrder(child, list, depth + 1);
    }
    list.push({ id: node.id, name: node.name, depth, capacity: node.capacity });
    return list;
  },

  levelOrder(rootNode = this.root) {
    const list = [];
    const queue = [{ node: rootNode, depth: 0 }];
    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      list.push({ id: node.id, name: node.name, depth, capacity: node.capacity });
      for (const child of node.children) {
        queue.push({ node: child, depth: depth + 1 });
      }
    }
    return list;
  },

  computeSubtreeCapacity(node = this.root) {
    if (!node.children || node.children.length === 0) {
      return node.capacity || 0;
    }
    let total = node.capacity || 0;
    for (const child of node.children) {
      total += this.computeSubtreeCapacity(child);
    }
    return total;
  },

  renderTree(highlightIds = []) {
    const svg = document.getElementById('campus-tree-svg');
    if (!svg) return;

    let edgesHtml = '';
    let nodesHtml = '';

    const walk = (node) => {
      for (const child of node.children) {
        edgesHtml += `<line x1="${node.x}" y1="${node.y}" x2="${child.x}" y2="${child.y}" stroke="#334155" stroke-width="2"/>`;
        walk(child);
      }
      const orderIdx = highlightIds.indexOf(node.id);
      const active = orderIdx !== -1;
      const fill = active ? '#10b981' : '#1e293b';
      const stroke = active ? '#ffffff' : '#6366f1';

      nodesHtml += `<g>
        <rect x="${node.x - 42}" y="${node.y - 16}" width="84" height="32" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${node.x}" y="${node.y + 4}" fill="${active ? '#052e16' : '#f8fafc'}" font-size="8.5" font-weight="700" text-anchor="middle">${node.id}</text>
        ${active ? `<circle cx="${node.x + 40}" cy="${node.y - 14}" r="9" fill="#f59e0b"/><text x="${node.x + 40}" y="${node.y - 11}" fill="#000" font-size="8" font-weight="800" text-anchor="middle">${orderIdx + 1}</text>` : ''}
      </g>`;
    };

    walk(this.root);
    svg.innerHTML = edgesHtml + nodesHtml;
  }
};
