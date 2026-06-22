import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpgv from './../lib/index.js';

// 3x3 Hermitian A = [[4,1-i,2+i],[1+i,5,3],[2-i,3,6]] lower packed:
var AP = new Complex128Array( [ 4, 0, 1, 1, 2, -1, 5, 0, 3, 0, 6, 0 ] );

// 3x3 positive definite B lower packed:
var BP = new Complex128Array( [ 2, 0, 0.5, 0.5, 0, 0, 3, 0, 0.5, 0, 2, 0 ] );

var W = new Float64Array( 3 );
var Z = new Complex128Array( 9 );
var WORK = new Complex128Array( 10 );
var RWORK = new Float64Array( 10 );

zhpgv.ndarray( 1, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, W, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'eigenvalues:', W ); // eslint-disable-line no-console
