/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsbevx from './../lib/index.js';

// 4x4 symmetric tridiagonal matrix (KD=1), lower band storage:

//   4  1  0  0

//   1  5  2  0

//   0  2  6  3

//   0  0  3  7
const AB = new Float64Array([
	4.0,
	1.0,
	5.0,
	2.0,
	6.0,
	3.0,
	7.0,
	0.0
]);
const Q = new Float64Array( 16 );
const W = new Float64Array( 4 );
const Z = new Float64Array( 16 );
const WORK = new Float64Array( 50 );
const IWORK = new Int32Array( 30 );
const IFAIL = new Int32Array( 4 );
const out = {
	M: 0
};

// Compute all eigenvalues and eigenvectors:
const info = dsbevx.ndarray( 'compute-vectors', 'all', 'lower', 4, 1, AB, 1, 2, 0, Q, 1, 4, 0, 0, 0, 0, 0, 0, out, W, 1, 0, Z, 1, 4, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'M (eigenvalues found):', out.M );
console.log( 'Eigenvalues (W):', W );
