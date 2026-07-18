import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlasyfRk from './../lib/index.js';

const N = 3;
const nb = 3;
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
const e = new Complex128Array( N );
const IPIV = new Int32Array( N );
const W = new Complex128Array( N * nb );

const result = zlasyfRk( 'column-major', 'lower', N, nb, A, N, e, IPIV, W, N );
console.log( result ); // eslint-disable-line no-console
