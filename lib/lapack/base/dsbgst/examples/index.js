
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgst from './../lib/index.js';

// Small symmetric band matrix A (upper, ka=1, N=3):
var AB = new Float64Array( [ 0, 5, 1, 6, 0.5, 7 ] );

// Band Cholesky factor B (upper, kb=0, N=3):
var BB = new Float64Array( [ 2, 3, 4 ] );

var X = new Float64Array( 1 );
var WORK = new Float64Array( 6 );

var info = dsbgst.ndarray( 'none', 'upper', 3, 1, 0, AB, 1, 2, 0, BB, 1, 1, 0, X, 1, 1, 0, WORK, 1, 0 );
console.log( 'info = %d', info );
console.log( 'AB =', AB );
