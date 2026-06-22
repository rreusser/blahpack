
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgbsvx from './../lib/index.js';

// 3x3 tridiagonal system (KL=1, KU=1):
// A = [ 4  1  0 ]    b = [ 5 ]
//     [ 1  3  1 ]        [ 5 ]
//     [ 0  1  2 ]        [ 3 ]
// Solution: x = [1, 1, 1]

var N = 3;
var KL = 1;
var KU = 1;
var nrhs = 1;
var nRows = KL + KU + 1;

// Band storage (KL+KU+1 = 3 rows, N = 3 columns):
// Row 0 (superdiag): [0, 1, 1]
// Row 1 (diagonal):  [4, 3, 2]
// Row 2 (subdiag):   [1, 1, 0]
var AB = new Complex128Array([
	0, 0, 1, 0, 1, 0,  // row 0
	4, 0, 3, 0, 2, 0,  // row 1
	1, 0, 1, 0, 0, 0   // row 2
]);

var AFB = new Complex128Array( ((2 * KL) + KU + 1) * N );
var IPIV = new Int32Array( N );
var r = new Float64Array( N );
var c = new Float64Array( N );
var B = new Complex128Array( [ 5, 0, 5, 0, 3, 0 ] );
var X = new Complex128Array( N );
var FERR = new Float64Array( nrhs );
var BERR = new Float64Array( nrhs );
var WORK = new Complex128Array( 2 * N );
var RWORK = new Float64Array( N );

var result = zgbsvx.ndarray( 'not-factored', 'no-transpose', N, KL, KU, nrhs, AB, 1, nRows, 0, AFB, 1, (2 * KL) + KU + 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', result.info );
console.log( 'rcond:', result.rcond );
console.log( 'rpvgrw:', result.rpvgrw );
console.log( 'equed:', result.equed );
