
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungr2 from './../lib/index.js';

// Generate a 3x4 unitary matrix Q from K=2 reflectors (RQ factorization):
var M = 3;
var N = 4;
var K = 2;

// Set up A in column-major order with reflectors in last K rows:
var A = new Complex128Array([
	0.0,
	0.0,
	0.3,
	0.1,
	0.1,
	0.05,
	0.0,
	0.0,
	0.2,
	-0.2,
	-0.1,
	0.2,
	0.0,
	0.0,
	1.0,
	0.0,
	0.5,
	-0.1,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0
]);
var TAU = new Complex128Array( [ 1.05, 0.1, 0.8, 0.15 ] );
var WORK = new Complex128Array( M );

var info = zungr2.ndarray( M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'Q:', reinterpret( A, 0 ) ); // eslint-disable-line no-console
