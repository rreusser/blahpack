
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztpcon from './../lib/index.js';

// 3x3 upper triangular matrix in packed storage:
// A = [[4+i, 1+i, 0.5], [0, 3, 1-i], [0, 0, 2+i]]
const AP = new Complex128Array( [ 4.0, 1.0, 1.0, 1.0, 3.0, 0.0, 0.5, 0.0, 1.0, -1.0, 2.0, 1.0 ] );
const RCOND = new Float64Array( 1 );
const WORK = new Complex128Array( 6 );
const RWORK = new Float64Array( 3 );

const info = ztpcon( 'one-norm', 'upper', 'non-unit', 3, AP, RCOND, WORK, RWORK );
console.log( 'info:', info );
console.log( 'rcond:', RCOND[ 0 ] );
