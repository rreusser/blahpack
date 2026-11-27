import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfRook from './../lib/index.js';

const kb = new Int32Array( 1 );

const N = 3;
const nb = 3;

// 3x3 complex symmetric matrix in column-major (lower triangle filled):
const A = new Complex128Array([
	4.0,
	0.2,
	1.0,
	0.5,
	2.0,
	-1.0,
	0.0,
	0.0,
	3.0,
	-0.1,
	0.5,
	-0.2,
	0.0,
	0.0,
	0.0,
	0.0,
	5.0,
	0.3
]);
const IPIV = new Int32Array( N );
const W = new Complex128Array( N * nb );

const result = {
	'info': zlasyfRook( 'column-major', 'lower', N, nb, kb, A, N, IPIV, 1, W, N ),
	'kb': kb[ 0 ]
};
console.log( result ); // eslint-disable-line no-console
