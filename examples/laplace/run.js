// L-shaped domain Laplace solver demo.
// Solves ∇²u = 0 with u(z) = x² on the boundary.
// Benchmark from Costa (2020), arXiv-2001.09439v1.

import { laplace, pointInPolygon } from "./laplace.js";

// ---- Build L-shaped boundary ----
// Vertices (CCW): 0, 2, 2+i, 1+i, 1+2i, 2i
const vertices = [[0,0], [2,0], [2,1], [1,1], [1,2], [0,2]];
const stp = parseFloat(process.env.STEP || '0.01');

function linspace(a, b, step) {
  const arr = [];
  if (a <= b) { for (let x = a; x <= b + step/2; x += step) arr.push(x); }
  else { for (let x = a; x >= b - step/2; x -= step) arr.push(x); }
  return arr;
}

const boundary = [];
// Bottom: y=0, x: 0 → 2
for (const x of linspace(0, 2, stp)) boundary.push([x, 0]);
// Right: x=2, y: 0 → 1
for (const y of linspace(0, 1, stp)) boundary.push([2, y]);
// Step: y=1, x: 2 → 1
for (const x of linspace(2, 1, stp)) boundary.push([x, 1]);
// Inner right: x=1, y: 1 → 2
for (const y of linspace(1, 2, stp)) boundary.push([1, y]);
// Top: y=2, x: 1 → 0
for (const x of linspace(1, 0, stp)) boundary.push([x, 2]);
// Left: x=0, y: 2 → 0
for (const y of linspace(2, 0, stp)) boundary.push([0, y]);

// Boundary condition u(z) = x²
const boundaryValues = boundary.map(([x, _y]) => x * x);

console.log(`Boundary points: ${boundary.length}`);
console.log(`Polygon vertices: ${vertices.length}`);

// ---- Verify point-in-polygon ----
console.log("\nPoint-in-polygon checks:");
console.log(`  (0.5, 0.5) inside: ${pointInPolygon([0.5, 0.5], vertices)}`);  // true
console.log(`  (1.5, 1.5) inside: ${pointInPolygon([1.5, 1.5], vertices)}`);  // false (reentrant)
console.log(`  (0.5, 1.5) inside: ${pointInPolygon([0.5, 1.5], vertices)}`);  // true
console.log(`  (-1, 0) inside:    ${pointInPolygon([-1, 0], vertices)}`);      // false

// ---- Solve ----
console.log("\nSolving Laplace problem...");
const t0 = Date.now();
const result = laplace(boundary, boundaryValues, vertices, {
  center: [0.5, 0.5],
  interior: true,
});
const elapsed = Date.now() - t0;

console.log(`Done in ${elapsed}ms`);
console.log(`Smooth part degree N: ${result.N}`);
console.log(`Total AAA poles: ${result.allPoles.length}`);
console.log(`Exterior poles used: ${result.poles.length}`);
console.log(`Max boundary error: ${result.maxError.toExponential(2)}`);

// ---- Benchmark test point ----
const u_test = result.evaluate([0.99, 0.99]);
const u_exact = 1.0267919261073;
console.log(`\nu(0.99 + 0.99i) = ${u_test}`);
console.log(`Exact:            ${u_exact}`);
console.log(`Abs error:        ${Math.abs(u_test - u_exact).toExponential(2)}`);
console.log(`Rel error:        ${(Math.abs(u_test - u_exact) / u_exact * 100).toFixed(4)}%`);

// ---- Evaluate at a few interior points ----
console.log("\nInterior evaluations:");
const testPoints = [[0.5, 0.5], [1.0, 0.5], [0.5, 1.0], [1.5, 0.5]];
for (const [x, y] of testPoints) {
  if (pointInPolygon([x, y], vertices)) {
    const u = result.evaluate([x, y]);
    console.log(`  u(${x} + ${y}i) = ${u.toFixed(8)}`);
  }
}
