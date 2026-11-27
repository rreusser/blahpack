#!/usr/bin/env node
// Profiling harness for the Laplace solver / AAA algorithm.
//
// Usage:
//   node examples/laplace/profile.js                  # timing breakdown
//   node --cpu-prof examples/laplace/profile.js       # V8 CPU profile (.cpuprofile)
//   node --prof examples/laplace/profile.js           # V8 tick log
//
// The timing breakdown identifies which phases dominate wall time:
//   - lssolve (smooth + singular polynomial fits)
//   - AAA iteration (Cauchy matrix, A-matrix, SVD, rational eval)
//   - PRZ (poles/residues/zeros via QZ algorithm)
//   - Evaluation (final solution at interior points)

import { laplace, pointInPolygon } from './laplace.js';
import { timings as aaaTimings } from '../aaa-pure.js';

// ---- Configuration ----
const BOUNDARY_STEP = parseFloat(process.env.STEP || '0.01');
const NUM_EVAL_POINTS = parseInt(process.env.EVAL_POINTS || '10000', 10);
const WARMUP_RUNS = parseInt(process.env.WARMUP || '0', 10);

// ---- Build L-shaped boundary ----
const vertices = [[0,0], [2,0], [2,1], [1,1], [1,2], [0,2]];

function linspace(a, b, step) {
  const arr = [];
  if (a <= b) { for (let x = a; x <= b + step/2; x += step) arr.push(x); }
  else { for (let x = a; x >= b - step/2; x -= step) arr.push(x); }
  return arr;
}

function buildBoundary(stp) {
  const boundary = [];
  for (const x of linspace(0, 2, stp)) boundary.push([x, 0]);
  for (const y of linspace(0, 1, stp)) boundary.push([2, y]);
  for (const x of linspace(2, 1, stp)) boundary.push([x, 1]);
  for (const y of linspace(1, 2, stp)) boundary.push([1, y]);
  for (const x of linspace(1, 0, stp)) boundary.push([x, 2]);
  for (const y of linspace(2, 0, stp)) boundary.push([0, y]);
  return boundary;
}

function generateInteriorGrid(vertices, nx, ny) {
  const points = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const x = 2 * i / (nx - 1);
      const y = 2 * j / (ny - 1);
      if (pointInPolygon([x, y], vertices)) {
        points.push([x, y]);
      }
    }
  }
  return points;
}

// ---- Timing utility ----
function formatMs(ms) {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function printBar(label, ms, total) {
  const pct = total > 0 ? (ms / total * 100) : 0;
  const barLen = Math.round(pct / 2);
  const bar = '█'.repeat(barLen) + '░'.repeat(50 - barLen);
  console.log(`  ${label.padEnd(16)} ${bar} ${formatMs(ms).padStart(8)} (${pct.toFixed(1)}%)`);
}

// ---- Run solver with timing ----
function solve(boundary, boundaryValues) {
  aaaTimings.reset();

  const t = {};

  t.total_start = performance.now();

  // Phase 1: Laplace solve (includes smooth fit, AAA, singular fit)
  t.solve_start = performance.now();
  const result = laplace(boundary, boundaryValues, vertices, {
    center: [0.5, 0.5],
    interior: true,
  });
  t.solve_end = performance.now();

  // Phase 2: Evaluation at many interior points
  const grid = generateInteriorGrid(vertices, Math.ceil(Math.sqrt(NUM_EVAL_POINTS * 4/3)), Math.ceil(Math.sqrt(NUM_EVAL_POINTS * 4/3)));
  t.eval_start = performance.now();
  let checksum = 0;
  for (let i = 0; i < grid.length; i++) {
    checksum += result.evaluate(grid[i]);
  }
  t.eval_end = performance.now();

  t.total_end = performance.now();

  return { result, t, checksum, gridSize: grid.length };
}

// ---- Main ----
const boundary = buildBoundary(BOUNDARY_STEP);
const boundaryValues = boundary.map(([x]) => x * x);

console.log(`\n=== Laplace Solver Profiling ===`);
console.log(`Boundary points: ${boundary.length}  (step=${BOUNDARY_STEP})`);
console.log(`Eval grid target: ${NUM_EVAL_POINTS} points\n`);

// Warmup runs (for JIT compilation)
for (let i = 0; i < WARMUP_RUNS; i++) {
  console.log(`Warmup ${i + 1}/${WARMUP_RUNS}...`);
  solve(boundary, boundaryValues);
}

// Timed run
const { result, t, checksum, gridSize } = solve(boundary, boundaryValues);

const solveTime = t.solve_end - t.solve_start;
const evalTime = t.eval_end - t.eval_start;
const totalTime = t.total_end - t.total_start;

// The laplace() call includes lssolve + aaa + lssolve + overhead.
// AAA internal timings come from the instrumented aaa-pure.js.
const aaaSvd = aaaTimings.svd;
const aaaCauchy = aaaTimings.cauchy;
const aaaAMatrix = aaaTimings.aMatrix;
const aaaRatEval = aaaTimings.ratEval;
const aaaPRZ = aaaTimings.prz;
const aaaTotal = aaaTimings.total;
const aaaIters = aaaTimings.iters;
// lssolve + overhead = solveTime - aaaTotal
const lssolveAndOverhead = solveTime - aaaTotal;

console.log(`--- Results ---`);
console.log(`Max boundary error: ${result.maxError.toExponential(2)}`);
console.log(`Poles (total/filtered): ${result.allPoles.length}/${result.poles.length}`);
console.log(`AAA iterations: ${aaaIters}`);
console.log(`Eval grid size: ${gridSize} points`);
console.log(`Eval checksum: ${checksum.toFixed(6)}`);
console.log(`SVD functional: ${aaaTimings.svd > 0 ? 'yes' : 'NO (migration pending)'}`);

console.log(`\n--- Timing Breakdown ---`);
console.log(`Total: ${formatMs(totalTime)}\n`);

printBar('solve', solveTime, totalTime);
printBar('  lssolve+other', lssolveAndOverhead, totalTime);
printBar('  AAA total', aaaTotal, totalTime);
printBar('    SVD', aaaSvd, totalTime);
printBar('    Cauchy build', aaaCauchy, totalTime);
printBar('    A-matrix', aaaAMatrix, totalTime);
printBar('    rat. eval', aaaRatEval, totalTime);
printBar('    PRZ (QZ)', aaaPRZ, totalTime);
printBar('evaluation', evalTime, totalTime);

console.log(`\n--- Per-iteration (${aaaIters} iters) ---`);
if (aaaIters > 0) {
  console.log(`  SVD:          ${formatMs(aaaSvd / aaaIters)}/iter`);
  console.log(`  Cauchy build: ${formatMs(aaaCauchy / aaaIters)}/iter`);
  console.log(`  A-matrix:     ${formatMs(aaaAMatrix / aaaIters)}/iter`);
  console.log(`  Rat. eval:    ${formatMs(aaaRatEval / aaaIters)}/iter`);
}

if (gridSize > 0) {
  console.log(`\n--- Evaluation throughput ---`);
  console.log(`  ${gridSize} points in ${formatMs(evalTime)}`);
  console.log(`  ${(gridSize / (evalTime / 1000)).toFixed(0)} points/sec`);
  console.log(`  ${formatMs(evalTime / gridSize)}/point`);
}

console.log('');
