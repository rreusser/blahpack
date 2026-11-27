import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from '../../dsptrf/lib/index.js';
import dspcon from './../lib/index.js';

// 3x3 symmetric positive definite matrix in upper packed storage:

// A = [[4, 1, 1], [1, 3, 1], [1, 1, 2]]

// Upper packed: A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
const AP = new Float64Array( [ 4.0, 1.0, 3.0, 1.0, 1.0, 2.0 ] );
const IPIV = new Int32Array( 3 );
const rcond = new Float64Array( 1 );
const WORK = new Float64Array( 6 );
const IWORK = new Int32Array( 3 );

// Factorize with dsptrf:
dsptrf.ndarray( 'upper', 3, AP, 1, 0, IPIV, 1, 0 );

// Estimate reciprocal condition number (anorm = 6.0, the 1-norm of A):
const info = dspcon.ndarray( 'upper', 3, AP, 1, 0, IPIV, 1, 0, 6.0, rcond, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'rcond:', rcond[ 0 ] ); // eslint-disable-line no-console
// => rcond ~ 0.177
