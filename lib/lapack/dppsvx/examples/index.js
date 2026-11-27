import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dppsvx from './../lib/index.js';

// 3x3 symmetric positive definite matrix in lower packed storage:

// A = [4 2 1; 2 5 3; 1 3 6]
const AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
const AFP = new Float64Array( 6 );
const S = new Float64Array( 3 );
const equed = [ 'none' ];

// Right-hand side: b = A * [1; 1; 1] = [7; 10; 10]
const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
const X = new Float64Array( 3 );
const rcond = new Float64Array( 1 );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );
const WORK = new Float64Array( 9 );
const IWORK = new Int32Array( 3 );

const info = dppsvx.ndarray( 'not-factored', 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, 3, 0, X, 1, 3, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'X:', X );
console.log( 'rcond:', rcond[ 0 ] );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
