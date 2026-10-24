/**
 * Module 2: Cryptography & Security Engine (js/crypto-security.js)
 * Implements Vigenere Cipher, Caesar Shift (Mod 26), XOR Stream Cipher, and Salted Hashing
 */

const CampusCrypto = {
  vigenere(text, key, decrypt = false) {
    const cleanKey = (key || 'BISU').toUpperCase().replace(/[^A-Z]/g, '') || 'BISU';
    let result = '';
    const steps = [];
    let keyIdx = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const code = text.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        const p = code - 65;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        const c = decrypt ? (p - k + 26) % 26 : (p + k) % 26;
        const outChar = String.fromCharCode(c + 65);
        result += outChar;
        steps.push({ index: i, char: ch, pVal: p, keyChar: cleanKey[keyIdx % cleanKey.length], kVal: k, formula: decrypt ? `(${p}-${k}+26) mod 26 = ${c}` : `(${p}+${k}) mod 26 = ${c}`, out: outChar });
        keyIdx++;
      } else if (code >= 97 && code <= 122) {
        const p = code - 97;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        const c = decrypt ? (p - k + 26) % 26 : (p + k) % 26;
        const outChar = String.fromCharCode(c + 97);
        result += outChar;
        steps.push({ index: i, char: ch, pVal: p, keyChar: cleanKey[keyIdx % cleanKey.length], kVal: k, formula: decrypt ? `(${p}-${k}+26) mod 26 = ${c}` : `(${p}+${k}) mod 26 = ${c}`, out: outChar });
        keyIdx++;
      } else {
        result += ch;
      }
    }
    return { result, steps };
  },

  caesar(text, shift = 7, decrypt = false) {
    // Parse explicitly: `parseInt(shift) || 7` would silently turn a valid shift of 0
    // into 7, so the identity cipher could never be demonstrated.
    const parsed = Number.parseInt(shift, 10);
    const raw = Number.isNaN(parsed) ? 7 : parsed;
    const s = ((raw % 26) + 26) % 26;
    const eff = decrypt ? (26 - s) % 26 : s;
    let result = '';
    const steps = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const code = text.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        const p = code - 65;
        const c = (p + eff) % 26;
        const outChar = String.fromCharCode(c + 65);
        result += outChar;
        steps.push({ index: i, char: ch, pVal: p, keyChar: `+${eff}`, kVal: eff, formula: `(${p}+${eff}) mod 26 = ${c}`, out: outChar });
      } else if (code >= 97 && code <= 122) {
        const p = code - 97;
        const c = (p + eff) % 26;
        const outChar = String.fromCharCode(c + 97);
        result += outChar;
        steps.push({ index: i, char: ch, pVal: p, keyChar: `+${eff}`, kVal: eff, formula: `(${p}+${eff}) mod 26 = ${c}`, out: outChar });
      } else {
        result += ch;
      }
    }
    return { result, steps };
  },

  xorHex(text, key = 'CLARIN', decrypt = false) {
    const k = key || 'CLARIN';
    const steps = [];
    const out = [];

    if (decrypt) {
      // Reverse path: hex ciphertext -> bytes -> XOR with repeating key -> plaintext
      const tokens = String(text).trim().split(/\s+/).filter(t => /^[0-9a-fA-F]{2}$/.test(t));
      for (let i = 0; i < tokens.length; i++) {
        const cCode = parseInt(tokens[i], 16);
        const kChar = k[i % k.length];
        const kCode = kChar.charCodeAt(0);
        const pCode = cCode ^ kCode;
        const ch = String.fromCharCode(pCode);
        out.push(ch);
        steps.push({
          index: i,
          char: '0x' + tokens[i].toUpperCase(),
          pVal: cCode,
          keyChar: kChar,
          kVal: kCode,
          formula: `${cCode} XOR ${kCode} = ${pCode} (0x${pCode.toString(16).toUpperCase().padStart(2, '0')})`,
          out: ch
        });
      }
      return { result: out.join(''), steps };
    }

    for (let i = 0; i < text.length; i++) {
      const pCode = text.charCodeAt(i);
      const kChar = k[i % k.length];
      const kCode = kChar.charCodeAt(0);
      const xorVal = pCode ^ kCode;
      const hex = xorVal.toString(16).toUpperCase().padStart(2, '0');
      out.push(hex);
      steps.push({
        index: i,
        char: text[i],
        pVal: pCode,
        keyChar: kChar,
        kVal: kCode,
        formula: `${pCode} XOR ${kCode} = ${xorVal} (0x${hex})`,
        out: hex
      });
    }
    return { result: out.join(' '), steps };
  },

  // Salted credential digest. Uses SHA-256 (Web Crypto) when the browser exposes
  // it (secure context: https, localhost, or file://); otherwise falls back to a
  // 64-bit FNV-style digest so the demo never hard-fails.
  async hashCredential(id, pin, salt = 'BISU-2026-SALT') {
    const raw = `${id}::${pin}::${salt}`;
    const te = new TextEncoder();

    if (globalThis.crypto && globalThis.crypto.subtle) {
      const buf = await globalThis.crypto.subtle.digest('SHA-256', te.encode(raw));
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let h1 = 0xdeadbeef ^ raw.length;
    let h2 = 0x41c6ce57 ^ raw.length;
    for (let i = 0, ch; i < raw.length; i++) {
      ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
};
