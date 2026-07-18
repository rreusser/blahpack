import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zlaHercondX from './../lib/index.js';

const N = 3;
const A = new Complex128Array([
	4,
	0,
	1,
	2,
	3,
	-1,
	1,
	-2,
	5,
	0,
	2,
	1,
	3,
	1,
	2,
	-1,
	6,
	0
]);
const AF = new Complex128Array( A );
const IPIV = new Int32Array( N );
const WORK = new Complex128Array( N * 32 );
const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
const WORK2 = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

zhetrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0, N * 32 );

const rcond = zlaHercondX( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, X, 1, WORK2, 1, RWORK, 1 );
console.log( rcond ); // eslint-disable-line no-console
