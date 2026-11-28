
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzt from './../lib/index.js';

const K = 2;
const N = 4;
const V = new Float64Array([
	1.0,
	0.5,
	-0.3,
	0.7,
	0.4,
	1.0,
	-0.6,
	0.2
]);
const TAU = new Float64Array( [ 0.5, 0.7 ] );
const T = new Float64Array( K * K );

dlarzt( 'row-major', 'backward', 'rowwise', N, K, V, N, TAU, 1, T, K );

console.log( T ); // eslint-disable-line no-console
