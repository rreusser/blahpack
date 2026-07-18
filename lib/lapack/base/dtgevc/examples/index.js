
// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgevc from './../lib/index.js';

const N = 3;

// S: upper quasi-triangular (column-major)
const S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );

// P: upper triangular (column-major)
const P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );

const VR = new Float64Array( N * N );
const VL = new Float64Array( N * N );
const SELECT = new Float64Array( N );
const WORK = new Float64Array( 6 * N );

const info = dtgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, 0, WORK, 1 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'Right eigenvectors (VR):', VR ); // eslint-disable-line no-console
console.log( 'Left eigenvectors (VL):', VL ); // eslint-disable-line no-console
