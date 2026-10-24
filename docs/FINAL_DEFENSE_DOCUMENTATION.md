# BISU Clarin — Secure Smart Campus Navigation and Monitoring System
**Final Project Technical Documentation**

## 1. Project Overview
The **Secure Smart Campus Navigation and Monitoring System** is an integrated web application designed for **Bohol Island State University (BISU) — Clarin Campus (College of Science and Management)**. It extends a campus monitoring prototype by integrating discrete structures and algorithmic foundations:
1. **Cryptography** (`js/crypto-security.js`)
2. **Searching & Sorting Algorithms** (`js/search-sort.js`)
3. **Recursion** (`js/campus-graph.js`, `js/campus-tree.js`, `js/search-sort.js`)
4. **Counting Methods & Discrete Probability** (`js/probability-rv.js`)
5. **Random Variables & Expectation Analysis** (`js/probability-rv.js`)
6. **Graph-Based Campus Navigation** (`js/campus-graph.js`)
7. **Tree-Based Organizational Hierarchy** (`js/campus-tree.js`)
8. **Finite State Machine (FSM) System Core** (`js/fsm-engine.js`)

---

## 2. Folder Structure
```text
bisu-smart-campus/
├── index.html                        # Main Modern Dashboard UI
├── README.md                         # Quick Start Instructions
├── css/
│   └── modern-ui.css                 # Glassmorphic Dark Theme Stylesheet
├── js/
│   ├── fsm-engine.js                 # 7-State Finite State Machine Engine
│   ├── crypto-security.js            # Vigenere, Caesar, XOR & Salted Hash
│   ├── campus-graph.js               # Weighted Graph, Dijkstra & Recursive DFS
│   ├── campus-tree.js                # Campus Tree Hierarchy & Recursive Traversals
│   ├── search-sort.js                # Merge/Quick/Insertion Sort & Binary/Linear Search
│   ├── probability-rv.js             # P(n,r), C(n,r), Discrete Probability & Random Variables
│   └── app.js                        # Main Application Controller
└── docs/
    ├── FINAL_DEFENSE_DOCUMENTATION.md # Complete Defense Guide & Mathematical Proofs
    └── screenshots/                    # Sample outputs, one per module
        ├── 1-finite-state-machine.png
        ├── 2-cryptography-auth-gate.png
        ├── 3-graph-navigation.png
        ├── 4-campus-tree.png
        ├── 5-searching-sorting.png
        └── 6-probability-random-variables.png
```

---

## 3. Mathematical & Algorithmic Explanations

### 3.1 Finite State Machine (FSM)
Defined formally as a 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$:
- **States ($Q$)**: `{IDLE, LOGIN, ACCESS_GRANTED, ACCESS_DENIED, NAVIGATING, MONITORING, EXIT}`
- **Initial State ($q_0$)**: `IDLE`
- **Accepting State ($F$)**: `{EXIT}`
- **Transition Function ($\delta : Q \times \Sigma \rightarrow Q$)**: 21 defined transitions. Enforces security boundaries so that `NAVIGATING` and `MONITORING` can only be reached after `AUTH_OK` transitions `LOGIN` to `ACCESS_GRANTED`.

Every state change goes through `dispatch(event)`, which validates the input symbol against $\delta$ and rejects anything undefined. The diagram renders the transition function directly, so it cannot drift out of sync with the machine. Clicking a state node fires the *defined* event that reaches it; a move with no entry in $\delta$ is rejected and written to the trace log rather than silently applied.

### 3.2 Cryptography
- **Vigenère Cipher**: $C_i = (P_i + K_{i \bmod m}) \bmod 26$ and $P_i = (C_i - K_{i \bmod m} + 26) \bmod 26$.
- **Caesar Shift**: $C_i = (P_i + s) \bmod 26$.
- **XOR Hex Stream Cipher**: $C_i = P_i \oplus K_{i \bmod m}$, emitted as hex. Decryption parses the hex back to bytes and applies the same XOR, since the operation is self-inverse.
- **Salted Credential Hash**: Combines User ID, PIN, and `BISU-2026-SALT` and digests with **SHA-256** (Web Crypto), giving a 256-bit digest. A 64-bit FNV-style digest is retained only as a fallback for browsers without a secure context. The hash gates the FSM: it is computed before `AUTH_OK` or `AUTH_FAIL` is dispatched.

### 3.3 Searching & Sorting Algorithms
- **Recursive Merge Sort**: Divide-and-conquer sorting in $O(n \log n)$ worst-case time.
- **Recursive Quick Sort**: Partition-based sorting in $O(n \log n)$ average time.
- **Binary Search**: Searches sorted student/room records by ID in $O(\log n)$ comparisons.
- **Linear Search**: Scans records sequentially in $O(n)$ time for substring matching.

### 3.4 Recursion
Used in four distinct ways across the system:
1. **Recursive DFS Route Explorer** (`findAllPathsRecursive` in `js/campus-graph.js`)
2. **Recursive Pre-Order & Post-Order Tree Traversals** (`preOrder`, `postOrder` in `js/campus-tree.js`)
3. **Recursive Subtree Capacity Aggregation** (`computeSubtreeCapacity` in `js/campus-tree.js`)
4. **Recursive Divide-and-Conquer Sorting** (`mergeSort`, `quickSort` in `js/search-sort.js`)

### 3.5 Counting Methods, Discrete Probability & Random Variables
- **Permutations**: $P(n, r) = \frac{n!}{(n-r)!}$ models ordered security patrol schedules.
- **Combinations**: $C(n, r) = \frac{n!}{r!(n-r)!}$ models unordered room subset selections.
- Both are evaluated as running products rather than by dividing two factorials. The factorial form overflows to `Infinity` for large $n$, and `Infinity / Infinity` is `NaN`, so the product form is used to keep the result finite and exact.
- **Random Variable $X$**: Represents concurrent student occupancy in ComLab 1 with Expected Value $E[X] = \sum x \cdot P(X=x)$ and Variance $\text{Var}(X) = E[X^2] - (E[X])^2$.

### 3.6 Sample Outputs
Screenshots of each working module are in `docs/screenshots/`, one per required feature (FSM, cryptography, graph navigation, tree, searching/sorting, probability).
