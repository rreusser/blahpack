import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahefRk from './../lib/index.js';

var N = 3;
var nb = 3;
var A = new Complex128Array([
	4.0,
	0.0,
	1.0,
	0.5,
	2.0,
	-1.0,
	0.0,
	0.0,
	3.0,
	0.0,
	0.5,
	-0.2,
	0.0,
	0.0,
	0.0,
	0.0,
	5.0,
	0.0
]);
var e = new Complex128Array( N );
var IPIV = new Int32Array( N );
var W = new Complex128Array( N * nb );

var result = zlahefRk( 'column-major', 'lower', N, nb, A, N, e, IPIV, W, N );
console.log( result ); // eslint-disable-line no-console
