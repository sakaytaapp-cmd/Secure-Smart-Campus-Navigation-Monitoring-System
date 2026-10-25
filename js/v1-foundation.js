/**
 * =============================================================================
 * Module 0: V1 Foundation - Student Access & Number Theory (js/v1-foundation.js)
 * Original Concept & Implementation: Honielyn A. Torres and Jheanne Mae M. Cabudlan
 * Upgraded & Formalized for BISU Clarin Secure Smart Campus System
 * =============================================================================
 * Implements:
 * 1. Rule-Based Access Verification (Role vs Area)
 * 2. Access Control Binary Relation Matrix M_R ⊆ UserTypes × Areas
 * 3. Elementary Number Theory:
 *    - Parity: n ≡ 0 (mod 2)
 *    - Divisibility: 5 | n ⇔ n ≡ 0 (mod 5)
 *    - Euclidean Algorithm for gcd(a, b) with quotient-remainder tableau
 * =============================================================================
 */

const V1Foundation = {
  roles: ['Student', 'Teacher', 'Visitor'],
  areas: ['Library', 'Laboratory', 'Office'],

  // Formal Binary Relation Matrix: R ⊆ UserTypes × Areas
  matrix: {
    Student: {
      Library:    { allowed: 'granted', text: 'Yes',  note: 'Academic Resource Area' },
      Laboratory: { allowed: 'granted', text: 'Yes',  note: 'Practical Workstation' },
      Office:     { allowed: 'denied',  text: 'No',   note: 'Faculty / Admin Clearance Required' }
    },
    Teacher: {
      Library:    { allowed: 'granted', text: 'Yes',  note: 'Full Academic Access' },
      Laboratory: { allowed: 'granted', text: 'Yes',  note: 'Instructional Workstation' },
      Office:     { allowed: 'granted', text: 'Yes',  note: 'Faculty Office Authorized' }
    },
    Visitor: {
      Library:    { allowed: 'limited', text: 'Yes*', note: 'Limited Access: Guest Reading Pass' },
      Laboratory: { allowed: 'denied',  text: 'No',   note: 'Restricted Safety Area' },
      Office:     { allowed: 'denied',  text: 'No',   note: 'Restricted Administration Area' }
    }
  },

  checkAccess(userType, area) {
    const roleKey = Object.keys(this.matrix).find(r => r.toLowerCase() === String(userType).trim().toLowerCase());
    const areaKey = this.areas.find(a => a.toLowerCase() === String(area).trim().toLowerCase());

    if (!roleKey) {
      return {
        status: 'invalid',
        userType,
        area,
        message: 'Invalid user type.',
        description: 'Allowed user types: Student, Teacher, Visitor.'
      };
    }

    if (!areaKey) {
      return {
        status: 'invalid',
        userType: roleKey,
        area,
        message: 'Invalid campus area.',
        description: 'Allowed areas: Library, Laboratory, Office.'
      };
    }

    const rule = this.matrix[roleKey][areaKey];

    if (rule.allowed === 'granted') {
      return {
        status: 'granted',
        userType: roleKey,
        area: areaKey,
        message: 'Access Granted.',
        description: `${roleKey} is fully authorized to enter ${areaKey}. (${rule.note})`
      };
    } else if (rule.allowed === 'limited') {
      return {
        status: 'limited',
        userType: roleKey,
        area: areaKey,
        message: 'Limited Access Granted.',
        description: `${roleKey} has restricted guest privileges in ${areaKey}. (${rule.note})`
      };
    } else {
      return {
        status: 'denied',
        userType: roleKey,
        area: areaKey,
        message: 'Access Denied.',
        description: `${roleKey} does NOT have clearance for ${areaKey}. (${rule.note})`
      };
    }
  },

  checkNumberTheory(num1Input, num2Input) {
    const n1 = parseInt(num1Input, 10);
    const n2 = parseInt(num2Input, 10);

    if (isNaN(n1)) {
      return { error: 'Please enter a valid numeric ID number for the first input.' };
    }

    const isEven = (n1 % 2 === 0);
    const parityText = isEven ? 'EVEN' : 'ODD';
    const parityExplanation = `${n1} is ${parityText} because ${n1} ≡ ${Math.abs(n1 % 2)} (mod 2).`;

    const isDivBy5 = (n1 % 5 === 0);
    const divBy5Text = isDivBy5 ? 'divisible by 5' : 'NOT divisible by 5';
    const divBy5Explanation = `${n1} is ${divBy5Text} because ${n1} mod 5 = ${Math.abs(n1 % 5)}.`;

    // Euclidean Algorithm for GCD
    let gcdResult = null;
    const steps = [];

    if (!isNaN(n2)) {
      let a = Math.abs(n1);
      let b = Math.abs(n2);
      const origA = a;
      const origB = b;

      if (a === 0 && b === 0) {
        gcdResult = { gcd: 0, steps: [{ step: 1, a: 0, b: 0, q: 0, r: 0, equation: 'gcd(0, 0) is undefined, conventionally 0.' }] };
      } else if (b === 0) {
        gcdResult = { gcd: a, steps: [{ step: 1, a, b: 0, q: 0, r: 0, equation: `gcd(${a}, 0) = ${a}` }] };
      } else {
        let stepCount = 1;
        while (b !== 0) {
          const q = Math.floor(a / b);
          const r = a % b;
          steps.push({
            step: stepCount,
            dividend: a,
            divisor: b,
            quotient: q,
            remainder: r,
            equation: `${a} = (${b} × ${q}) + ${r}`
          });
          a = b;
          b = r;
          stepCount++;
        }
        gcdResult = {
          gcd: a,
          origA,
          origB,
          steps,
          summary: `gcd(${origA}, ${origB}) = ${a}`
        };
      }
    }

    return {
      num1: n1,
      num2: isNaN(n2) ? null : n2,
      isEven,
      parityText,
      parityExplanation,
      isDivBy5,
      divBy5Text,
      divBy5Explanation,
      gcdResult
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = V1Foundation;
}

