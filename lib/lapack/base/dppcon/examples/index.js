import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpptrf from '../../dpptrf/lib/index.js';
import dppcon from './../lib/index.js';

// 3x3 symmetric positive definite matrix in upper packed storage:

// A = [[4, 1, 1], [1, 3, 1], [1, 1, 2]]

// Upper packed: A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
var AP = new Float64Array( [ 4.0, 1.0, 3.0, 1.0, 1.0, 2.0 ] );
var rcond = new Float64Array( 1 );
var WORK = new Float64Array( 9 );
var IWORK = new Int32Array( 3 );
var info;

// Factorize with dpptrf:
dpptrf.ndarray( 'upper', 3, AP, 1, 0 );

// Estimate reciprocal condition number (anorm = 6.0, the 1-norm of A):
info = dppcon.ndarray( 'upper', 3, AP, 1, 0, 6.0, rcond, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'rcond:', rcond[ 0 ] ); // eslint-disable-line no-console
// => rcond ~ 0.177
