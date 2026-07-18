
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zlaGercondX from './../lib/index.js';

const N = 3;
const A = new Complex128Array([
	2,
	1,
	1,
	-1,
	0,
	1,
	1,
	0,
	3,
	0,
	1,
	-0.5,
	0,
	-1,
	1,
	1,
	4,
	0
]);
const AF = new Complex128Array( A );
const IPIV = new Int32Array( N );
const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( N );

zgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );

const rcond = zlaGercondX( 'column-major', 'no-transpose', N, A, N, AF, N, IPIV, 1, 0, X, 1, WORK, 1, RWORK, 1 );
console.log( rcond ); // eslint-disable-line no-console
