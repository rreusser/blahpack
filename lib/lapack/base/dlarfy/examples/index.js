import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfy from './../lib/index.js';

var N = 3;
var C = new Float64Array([
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
var v = new Float64Array( [ 1.0, 0.5, 0.25 ] );
var WORK = new Float64Array( N );
var tau = 1.0;

dlarfy( 'column-major', 'upper', N, v, 1, tau, C, N, WORK, 1 );
console.log( C ); // eslint-disable-line no-console
