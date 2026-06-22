/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhbgvx from './../lib/index.js';

// 5x5 Hermitian band matrix A (KA=2), upper band storage (interleaved re/im):
var AB = new Complex128Array([
	0,
	0,
	0,
	0,
	10,
	0,
	0,
	0,
	1,
	0.5,
	8,
	0,
	0.5,
	0.1,
	2,
	-0.3,
	6,
	0,
	0.3,
	-0.2,
	1.5,
	0.2,
	9,
	0,
	0.4,
	0.15,
	1,
	-0.4,
	7,
	0
]);

// 5x5 Hermitian positive definite band matrix B (KB=1), upper storage:
var BB = new Complex128Array([
	0,
	0,
	4,
	0,
	0.2,
	0.1,
	5,
	0,
	0.3,
	-0.1,
	3,
	0,
	0.1,
	0.05,
	6,
	0,
	0.2,
	-0.1,
	4,
	0
]);

var Q = new Complex128Array( 25 );
var W = new Float64Array( 5 );
var Z = new Complex128Array( 25 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 50 );
var IWORK = new Int32Array( 30 );
var IFAIL = new Int32Array( 5 );
var out = {
	M: 0
};

// Compute all eigenvalues and eigenvectors:
var info = zhbgvx.ndarray( 'compute-vectors', 'all', 'upper', 5, 2, 1, AB, 1, 3, 0, BB, 1, 2, 0, Q, 1, 5, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 5, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );       // eslint-disable-line no-console
console.log( 'M:', out.M );         // eslint-disable-line no-console
console.log( 'Eigenvalues:', W );   // eslint-disable-line no-console
