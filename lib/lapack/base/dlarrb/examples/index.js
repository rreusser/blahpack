import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrb from './../lib/index.js';

// Diagonal 4x4 tridiagonal with known eigenvalues 1, 3, 5, 7:
var N = 4;
var d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
var LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );

// Initial eigenvalue approximations with wide error bounds:
var w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
var WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
var WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );

var WORK = new Float64Array( 2 * N );
var IWORK = new Int32Array( 2 * N );

dlarrb( N, d, 1, LLD, 1, 1, N, 1.0e-8, 1.0e-14, 0, w, 1, WGAP, 1, WERR, 1, WORK, 1, IWORK, 1, 0, 2.2e-308, 6.0, -1 ); // eslint-disable-line max-len
console.log( w ); // eslint-disable-line no-console
