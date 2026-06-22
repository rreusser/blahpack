import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrf from './../../zhetrf/lib/base.js';
import zlaHercondX from './../lib/index.js';

var N = 3;
var A = new Complex128Array([
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
var AF = new Complex128Array( A );
var IPIV = new Int32Array( N );
var WORK = new Complex128Array( N * 32 );
var X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var WORK2 = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );
var rcond;

zhetrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0, WORK, 1, 0, N * 32 );

rcond = zlaHercondX( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, 0, X, 1, WORK2, 1, RWORK, 1 );
console.log( rcond ); // eslint-disable-line no-console
