// Notebook entry point for the potential flow solvers. The implementations
// live in examples/; esbuild bundles this file and its dependencies into
// naca-bundle.js for the browser.

export { potentialFlow } from '../../examples/naca/potential-flow.js';
export { nacaAirfoil } from '../../examples/naca/naca.js';
export { squareFlow } from '../../examples/naca/square-flow.js';
export { exteriorFlow } from '../../examples/naca/exterior-flow.js';
export { aaa } from '../../examples/aaa-pure.js';
export { pointInPolygon } from '../../examples/laplace/laplace.js';
