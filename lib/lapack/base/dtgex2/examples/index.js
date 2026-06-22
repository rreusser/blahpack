
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgex2 from './../lib/index.js';

// 3x3 upper triangular matrix pair (column-major):
var N = 3;
var A = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.5,
	2.0,
	0.0,
	0.3,
	0.4,
	3.0
]);
var B = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.2,
	1.5,
	0.0,
	0.1,
	0.3,
	2.0
]);
var Q = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	1.0
]);
var Z = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	1.0
]);
var WORK = new Float64Array( 200 );

// Swap 1x1 blocks at positions 1 and 2 (0-based j1=0):
var info = dtgex2.ndarray( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 1, 1, WORK, 1, 0, 200 );
console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'A:', A ); // eslint-disable-line no-console
console.log( 'Q:', Q ); // eslint-disable-line no-console
