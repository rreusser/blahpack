
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgexc from './../lib/index.js';

// 4x4 upper triangular matrices in row-major order:
var A = new Float64Array([
	1.0,
	0.5,
	0.3,
	0.2,
	0.0,
	2.0,
	0.4,
	0.1,
	0.0,
	0.0,
	3.0,
	0.6,
	0.0,
	0.0,
	0.0,
	4.0
]);
var B = new Float64Array([
	1.0,
	0.2,
	0.1,
	0.05,
	0.0,
	1.5,
	0.3,
	0.15,
	0.0,
	0.0,
	2.0,
	0.4,
	0.0,
	0.0,
	0.0,
	2.5
]);
var Q = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
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
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0
]);
var WORK = new Float64Array( 32 );

// Move eigenvalue at position 0 to position 3:
var out = dtgexc( 'row-major', true, true, 4, A, 4, B, 4, Q, 4, Z, 4, 0, 3, WORK, 1, 32 );

console.log( 'info:', out.info ); // eslint-disable-line no-console
console.log( 'ifst:', out.ifst ); // eslint-disable-line no-console
console.log( 'ilst:', out.ilst ); // eslint-disable-line no-console
console.log( 'A:', A ); // eslint-disable-line no-console
console.log( 'B:', B ); // eslint-disable-line no-console
