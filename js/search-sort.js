/**
 * Module 5: Searching & Sorting Algorithms (js/search-sort.js)
 * Implements Recursive Merge Sort, Recursive Quick Sort, Insertion Sort,
 * Binary Search O(log n), and Linear Search O(n) on campus records.
 */

const CampusRecords = {
  data: [
    { id: 1042, name: 'Cañastra, John Lord', role: 'Student', room: 'COMLAB-1',clearance: 3, time: '08:15' },
    { id: 1018, name: 'Managaytay, Maryjoy', role: 'Student', room: 'COMLAB-2', clearance: 3, time: '08:05' },
    { id: 1089, name: 'Reyes, Christian',    role: 'Faculty', room: 'CSM-FAC',  clearance: 5, time: '07:50' },
    { id: 1005, name: 'Bautista, Angela',    role: 'Student', room: 'MAIN-LIB', clearance: 2, time: '09:10' },
    { id: 1064, name: 'Degamo, Kenneth',     role: 'Staff',   room: 'REG-HUB',  clearance: 4, time: '08:30' },
    { id: 1027, name: 'Torreon, Maricel',    role: 'Student', room: 'SCI-LAB',  clearance: 2, time: '10:00' },
    { id: 1095, name: 'Villamor, Jerome',    role: 'Security',room: 'GATE',     clearance: 5, time: '06:45' },
    { id: 1011, name: 'Ligan, Rhea Mae',     role: 'Student', room: 'COMLAB-1', clearance: 3, time: '08:22' }
  ],

  mergeSort(arr, key = 'id') {
    let comparisons = 0;
    const sort = (items) => {
      if (items.length <= 1) return items;
      const mid = Math.floor(items.length / 2);
      const left = sort(items.slice(0, mid));
      const right = sort(items.slice(mid));
      return merge(left, right);
    };

    const merge = (left, right) => {
      const result = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i][key] <= right[j][key]) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
      return result.concat(left.slice(i)).concat(right.slice(j));
    };

    const sorted = sort([...arr]);
    return { sorted, comparisons, algorithm: 'Recursive Merge Sort O(n log n)' };
  },

  quickSort(arr, key = 'id') {
    let comparisons = 0;
    const sort = (items) => {
      if (items.length <= 1) return items;
      const pivot = items[items.length - 1];
      const left = [];
      const right = [];
      for (let i = 0; i < items.length - 1; i++) {
        comparisons++;
        if (items[i][key] <= pivot[key]) left.push(items[i]);
        else right.push(items[i]);
      }
      return [...sort(left), pivot, ...sort(right)];
    };

    const sorted = sort([...arr]);
    return { sorted, comparisons, algorithm: 'Recursive Quick Sort O(n log n)' };
  },

  insertionSort(arr, key = 'id') {
    const copy = [...arr];
    let comparisons = 0;
    for (let i = 1; i < copy.length; i++) {
      const current = copy[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        if (copy[j][key] > current[key]) {
          copy[j + 1] = copy[j];
          j--;
        } else {
          break;
        }
      }
      copy[j + 1] = current;
    }
    return { sorted: copy, comparisons, algorithm: 'Iterative Insertion Sort O(n^2)' };
  },

  binarySearch(arr, targetId) {
    const { sorted } = this.mergeSort(arr, 'id');
    let low = 0;
    let high = sorted.length - 1;
    const steps = [];
    let comparisons = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      comparisons++;
      const midVal = sorted[mid].id;
      steps.push(`Step ${comparisons}: low=${low}, high=${high}, mid=${mid} -> ID=${midVal}`);
      if (midVal === targetId) {
        steps.push(`MATCH FOUND at index ${mid}: ${sorted[mid].name}`);
        return { found: sorted[mid], comparisons, steps };
      } else if (midVal < targetId) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    steps.push(`Target ID ${targetId} not found after ${comparisons} comparisons.`);
    return { found: null, comparisons, steps };
  },

  linearSearch(arr, query) {
    const q = String(query).trim().toLowerCase();
    const steps = [];
    let comparisons = 0;

    if (!q) {
      steps.push('Empty query supplied — no comparison performed.');
      return { found: null, comparisons, steps };
    }

    for (let i = 0; i < arr.length; i++) {
      comparisons++;
      const rec = arr[i];
      steps.push(`Step ${comparisons}: Checking index ${i} (${rec.id} - ${rec.name})`);
      if (String(rec.id) === q || rec.name.toLowerCase().includes(q) || rec.room.toLowerCase().includes(q)) {
        steps.push(`MATCH FOUND at index ${i}: ${rec.name}`);
        return { found: rec, comparisons, steps };
      }
    }
    steps.push(`No record matched "${query}".`);
    return { found: null, comparisons, steps };
  }
};
