/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorhr_col from './../lib/index.js';

// Build a trivially orthonormal 4x2 matrix (two orthogonal columns of

// length 4) to feed into the Householder reconstruction routine.
var M = 4;
var N = 2;
var nb = 2;
var A = new Float64Array([
	0.5,
	0.5,
	0.5,
	0.5,
	0.5,
	-0.5,
	0.5,
	-0.5
]);
var T = new Float64Array( nb * N );
var d = new Float64Array( N );

dorhr_col( 'column-major', M, N, nb, A, M, T, nb, d, 1 );
console.log( 'V:', A ); // eslint-disable-line no-console
console.log( 'T:', T ); // eslint-disable-line no-console
console.log( 'D:', d ); // eslint-disable-line no-console
