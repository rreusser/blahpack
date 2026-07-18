import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarfy from './../lib/index.js';

const N = 3;

// Hermitian 3x3 matrix in column-major upper form:
const C = new Complex128Array([
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	0.0,
	2.0,
	1.0,
	3.0,
	0.0,
	0.0,
	0.0,
	1.0,
	-1.0,
	2.0,
	2.0,
	4.0,
	0.0
]);
const v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.25, 0.25, -0.5 ] );
const tau = new Complex128( 0.7, 0.3 );
const WORK = new Complex128Array( N );

zlarfy( 'column-major', 'upper', N, v, 1, tau, C, N, WORK, 1 );
console.log( C.length ); // eslint-disable-line no-console
