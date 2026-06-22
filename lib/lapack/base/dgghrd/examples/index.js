
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgghrd from './../lib/index.js';

// 3x3 general matrix A (column-major):
var A = new Float64Array([
	2.0,
	3.0,
	1.0,
	1.0,
	1.0,
	0.5,
	0.5,
	2.0,
	3.0
]);

// 3x3 upper triangular B (column-major):
var B = new Float64Array([
	1.0,
	0.0,
	0.0,
	0.5,
	2.0,
	0.0,
	0.25,
	1.0,
	3.0
]);

var Q = new Float64Array( 9 );
var Z = new Float64Array( 9 );

// Reduce (A, B) to generalized upper Hessenberg form:
var info = dgghrd( 'column-major', 'initialize', 'initialize', 3, 1, 3, A, 3, B, 3, Q, 3, Z, 3 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'A (Hessenberg):', A ); // eslint-disable-line no-console
console.log( 'B (triangular):', B ); // eslint-disable-line no-console
console.log( 'Q:', Q ); // eslint-disable-line no-console
console.log( 'Z:', Z ); // eslint-disable-line no-console
