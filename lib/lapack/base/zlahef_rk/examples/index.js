import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahefRk from './../lib/index.js';

const kb = new Int32Array( 1 );

const N = 3;
const nb = 3;
const A = new Complex128Array([
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
const e = new Complex128Array( N );
const IPIV = new Int32Array( N );
const W = new Complex128Array( N * nb );

const result = {
	'info': zlahefRk( 'column-major', 'lower', N, nb, kb, A, N, e, 1, IPIV, 1, W, N ),
	'kb': kb[ 0 ]
};
console.log( result ); // eslint-disable-line no-console
