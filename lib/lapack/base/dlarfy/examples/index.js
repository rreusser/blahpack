import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfy from './../lib/index.js';

const N = 3;
const C = new Float64Array([
	4.0,
	1.0,
	2.0,
	1.0,
	5.0,
	3.0,
	2.0,
	3.0,
	6.0
]);
const v = new Float64Array( [ 1.0, 0.5, 0.25 ] );
const WORK = new Float64Array( N );
const tau = 1.0;

dlarfy( 'column-major', 'upper', N, v, 1, tau, C, N, WORK, 1 );
console.log( C ); // eslint-disable-line no-console
