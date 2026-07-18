
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrrfs from './../lib/index.js';

// 3x3 upper triangular matrix (col-major):
const A = new Complex128Array( [ 2, 1, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 3, 1, 5, 2, 6, 1 ] );
const B = new Complex128Array( [ 6, 4, 9, 3, 6, 1 ] );
const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );
const WORK = new Complex128Array( 6 );
const RWORK = new Float64Array( 3 );

const info = ztrrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, A, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );  // eslint-disable-line no-console
console.log( 'FERR:', FERR[ 0 ] );  // eslint-disable-line no-console
console.log( 'BERR:', BERR[ 0 ] );  // eslint-disable-line no-console
