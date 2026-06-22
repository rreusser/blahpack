import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import { ndarray as zhetf2rk } from './../lib/index.js';

var A = new Complex128Array([
	4,
	0,
	0,
	0,
	0,
	0,
	-3,
	0
]);
var e = new Complex128Array( 2 );
var ipiv = new Int32Array( 2 );

var info = zhetf2rk( 'lower', 2, A, 1, 2, 0, e, 1, 0, ipiv, 1, 0 );
console.log( 'info: ' + info ); // eslint-disable-line no-console
