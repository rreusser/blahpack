
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztbrfs from './../lib/index.js';

// Upper triangular band matrix, N=3, KD=1, NRHS=1:
const AB = new Complex128Array( [ 0, 0, 3, 0, 1, 1, 4, 1, 2, -1, 5, -1 ] );
const B = new Complex128Array( [ 4, 1, 6, 0, 5, -1 ] );
const X = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );
const WORK = new Complex128Array( 6 );
const RWORK = new Float64Array( 3 );

const info = ztbrfs.ndarray( 'upper', 'no-transpose', 'non-unit', 3, 1, 1, AB, 1, 2, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'FERR:', FERR[ 0 ] );
console.log( 'BERR:', BERR[ 0 ] );
