/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsbgvx from './../lib/index.js';

// 5x5 symmetric band matrix A (KA=2), upper band storage:
var AB = new Float64Array([
	0.0,
	0.0,
	10.0,
	0.0,
	1.0,
	8.0,
	0.5,
	2.0,
	6.0,
	0.3,
	1.5,
	9.0,
	0.4,
	1.0,
	7.0
]);

// 5x5 symmetric positive definite band matrix B (KB=1), upper storage:
var BB = new Float64Array([
	0.0,
	4.0,
	0.2,
	5.0,
	0.3,
	3.0,
	0.1,
	6.0,
	0.2,
	4.0
]);

var Q = new Float64Array( 25 );
var W = new Float64Array( 5 );
var Z = new Float64Array( 25 );
var WORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );
var out = {
	M: 0
};

// Compute all eigenvalues and eigenvectors:
var info = dsbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );       // eslint-disable-line no-console
console.log( 'M:', out.M );         // eslint-disable-line no-console
console.log( 'Eigenvalues:', W );   // eslint-disable-line no-console
