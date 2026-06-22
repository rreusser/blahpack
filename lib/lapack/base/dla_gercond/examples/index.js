
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlaGercond from './../lib/index.js';

// 3x3 well-conditioned matrix (column-major):
var A = new Float64Array( [ 2.0, 1.0, 0.0, 1.0, 3.0, 1.0, 0.0, 1.0, 4.0 ] );

// Pre-factored LU (from dgetrf):
var AF = new Float64Array( [ 2.0, 0.5, 0.0, 1.0, 2.5, 1.0, 0.0, 0.4, 3.6 ] );
var IPIV = new Int32Array( [ 0, 1, 2 ] );

// Scaling vector:
var c = new Float64Array( [ 1.0, 1.0, 1.0 ] );

// Workspace:
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );

var result = dlaGercond.ndarray( 'no-transpose', 3, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 1, c, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
console.log( 'Reciprocal Skeel condition number:', result ); // eslint-disable-line no-console
