import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasyfRk from './../lib/index.js';

const N = 4;
const nb = 4;
const A = new Float64Array([
	4.0,
	1.0,
	2.0,
	0.5,
	0.0,
	3.0,
	0.5,
	1.0,
	0.0,
	0.0,
	5.0,
	0.2,
	0.0,
	0.0,
	0.0,
	6.0
]);
const e = new Float64Array( N );
const IPIV = new Int32Array( N );
const W = new Float64Array( N * nb );

const result = dlasyfRk( 'column-major', 'lower', N, nb, A, N, e, IPIV, W, N );
console.log( result ); // eslint-disable-line no-console
console.log( A ); // eslint-disable-line no-console
