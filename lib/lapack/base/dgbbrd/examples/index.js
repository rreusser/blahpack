
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/index.js';

const M = 5;
const N = 5;
const LDAB = 3;

// Tridiagonal 5x5 matrix (kl=ku=1), column-major band storage with LDAB=3.
const AB = new Float64Array([
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

const d = new Float64Array( N );
const e = new Float64Array( N - 1 );
const Q = new Float64Array( 1 );
const PT = new Float64Array( 1 );
const C = new Float64Array( 1 );
const WORK = new Float64Array( 2 * Math.max( M, N ) );

dgbbrd( 'column-major', 'no-vectors', M, N, 0, 1, 1, AB, LDAB, d, 1, e, 1, Q, 1, PT, 1, C, 1, WORK, 1 );

console.log( d ); // eslint-disable-line no-console
console.log( e ); // eslint-disable-line no-console
