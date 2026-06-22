import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgeqlf from './../lib/index.js';

// Define a 4-by-3 complex matrix in column-major layout (interleaved re/im):
var A = new Complex128Array([
	1.0,
	0.5,
	2.0,
	1.0,
	3.0,
	1.5,
	4.0,
	2.0,
	0.5,
	1.0,
	1.0,
	0.5,
	1.5,
	1.0,
	2.0,
	1.5,
	1.0,
	0.0,
	2.0,
	0.5,
	3.0,
	1.0,
	4.0,
	1.5
]);
var TAU = new Complex128Array( 3 );
var WORK = new Complex128Array( 256 );

var info = zgeqlf( 'column-major', 4, 3, A, 4, TAU, 1, WORK, 1, -1 );
console.log( info ); // eslint-disable-line no-console
