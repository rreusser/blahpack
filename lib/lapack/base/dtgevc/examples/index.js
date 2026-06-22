
// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgevc from './../lib/index.js';

var N = 3;

// S: upper quasi-triangular (column-major)
var S = new Float64Array( [ 1.0, 0.0, 0.0, 0.3, 2.0, 0.0, 0.2, 0.4, 3.0 ] );

// P: upper triangular (column-major)
var P = new Float64Array( [ 1.0, 0.0, 0.0, 0.1, 1.0, 0.0, 0.05, 0.1, 1.0 ] );

var VR = new Float64Array( N * N );
var VL = new Float64Array( N * N );
var SELECT = new Float64Array( N );
var WORK = new Float64Array( 6 * N );

var info = dtgevc( 'column-major', 'both', 'all', SELECT, 1, N, S, N, P, N, VL, N, VR, N, N, 0, WORK, 1 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'Right eigenvectors (VR):', VR ); // eslint-disable-line no-console
console.log( 'Left eigenvectors (VL):', VL ); // eslint-disable-line no-console
