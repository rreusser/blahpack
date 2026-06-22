
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbbrd from './../lib/index.js';

// Reduce a 3x3 complex tridiagonal band matrix (KL=KU=1) to real bidiagonal form:
var N = 3;
var KL = 1;
var KU = 1;
var LDAB = KL + KU + 1;

var AB = new Complex128Array( LDAB * N );
var d = new Float64Array( N );
var e = new Float64Array( N - 1 );
var Q = new Complex128Array( N * N );
var PT = new Complex128Array( N * N );
var C = new Complex128Array( 1 );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( 2 * N );

zgbbrd( 'column-major', 'both', N, N, 0, KL, KU, AB, LDAB, d, 1, e, 1, Q, N, PT, N, C, 1, WORK, 1, RWORK, 1 );
console.log( d ); // eslint-disable-line no-console
console.log( e ); // eslint-disable-line no-console
