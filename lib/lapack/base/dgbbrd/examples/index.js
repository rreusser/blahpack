
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/index.js';

var M = 5;
var N = 5;
var LDAB = 3;

// Tridiagonal 5x5 matrix (kl=ku=1), column-major band storage with LDAB=3.
var AB = new Float64Array([
	0.0,
	4.0,
	-1.0,
	-1.0,
	4.0,
	-1.0,
	-1.0,
	4.0,
	-1.0,
	-1.0,
	4.0,
	-1.0,
	-1.0,
	4.0,
	0.0
]);

var d = new Float64Array( N );
var e = new Float64Array( N - 1 );
var Q = new Float64Array( 1 );
var PT = new Float64Array( 1 );
var C = new Float64Array( 1 );
var WORK = new Float64Array( 2 * Math.max( M, N ) );

dgbbrd( 'column-major', 'no-vectors', M, N, 0, 1, 1, AB, LDAB, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );

console.log( d ); // eslint-disable-line no-console
console.log( e ); // eslint-disable-line no-console
