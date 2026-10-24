/**
 * Module 6: Counting Methods, Discrete Probability & Random Variables (js/probability-rv.js)
 * Implements Permutations P(n,r), Combinations C(n,r), Room Availability Probability,
 * and Random Variable X expectation E[X], Variance Var(X), and Standard Deviation.
 */

const CampusProbability = {
  factorial(n) {
    const k = Math.floor(n);
    if (!Number.isFinite(k) || k < 0) return NaN;
    if (k <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= k; i++) {
      res *= i;
      if (!Number.isFinite(res)) return Infinity;
    }
    return res;
  },

  // P(n,r) and C(n,r) are computed multiplicatively rather than as n!/(n-r)!.
  // Dividing two overflowed factorials yields Infinity/Infinity = NaN, so the
  // factorial form silently printed NaN for large n; the product form stays finite.
  permutation(n, r) {
    if (!Number.isInteger(n) || !Number.isInteger(r) || r > n || n < 0 || r < 0) return 0;
    let res = 1;
    for (let i = 0; i < r; i++) {
      res *= (n - i);
      if (!Number.isFinite(res)) return Infinity;
    }
    return Math.round(res);
  },

  combination(n, r) {
    if (!Number.isInteger(n) || !Number.isInteger(r) || r > n || n < 0 || r < 0) return 0;
    const k = Math.min(r, n - r);
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = res * (n - k + i) / i;
      if (!Number.isFinite(res)) return Infinity;
    }
    return Math.round(res);
  },

  // Random Variable X: Number of concurrent student users in ComLab 1 (in puluhan/groups)
  pmfData: [
    { x: 10, p: 0.10 },
    { x: 20, p: 0.25 },
    { x: 30, p: 0.35 },
    { x: 40, p: 0.20 },
    { x: 45, p: 0.10 }
  ],

  analyzeRandomVariable(pmf = this.pmfData) {
    let expectedValue = 0;
    let expectedSquare = 0;

    pmf.forEach(item => {
      expectedValue += item.x * item.p;
      expectedSquare += (item.x * item.x) * item.p;
    });

    const variance = expectedSquare - (expectedValue * expectedValue);
    const stdDev = Math.sqrt(Math.max(0, variance));

    return {
      expectedValue: expectedValue.toFixed(2),
      variance: variance.toFixed(2),
      stdDev: stdDev.toFixed(2)
    };
  },

  simulateMonteCarlo(trials = 200) {
    // Guard the divisor: a trial count of 0 or a non-number would make the mean NaN.
    const N = Number.isFinite(trials) && trials > 0 ? Math.floor(trials) : 1;
    let sum = 0;
    const counts = {};
    this.pmfData.forEach(d => { counts[d.x] = 0; });

    for (let t = 0; t < N; t++) {
      const r = Math.random();
      let cum = 0;
      const lastIdx = this.pmfData.length - 1;
      for (let idx = 0; idx <= lastIdx; idx++) {
        const item = this.pmfData[idx];
        cum += item.p;
        // Force the final bucket: floating-point accumulation can leave the running
        // sum just below 1, which would silently drop trials with r close to 1.
        if (r <= cum || idx === lastIdx) {
          sum += item.x;
          counts[item.x]++;
          break;
        }
      }
    }
    return {
      sampleMean: (sum / N).toFixed(2),
      counts,
      trials: N
    };
  }
};
