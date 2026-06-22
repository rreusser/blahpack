
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrf from './../../zsytrf/lib/base.js';
import zlaSyrcondX from './../lib/index.js';

var N = 3;
var A = new Complex128Array([
	2.0,
	1.0,
	0.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	3.0,
	0.5,
	0.0,
	0.0,
	0.0,
	-1.0,
	1.0,
	1.0,
	4.0,
	0.0
]);
var AF = new Complex128Array( A );
var IPIV = new Int32Array( N );
var X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );
var rcond;

zsytrf( 'upper', N, AF, 1, N, 0, IPIV, 1, 0 );

rcond = zlaSyrcondX( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, X, 1, WORK, 1, RWORK, 1 );
console.log( rcond ); // eslint-disable-line no-console
