
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztbcon from './../lib/index.js';

/*
* 3x3 identity band matrix (KD=0), rcond should be 1.
*/
var AB = new Complex128Array( [ 1, 0, 1, 0, 1, 0 ] );
var RCOND = new Float64Array( 1 );
var WORK = new Complex128Array( 6 );
var RWORK = new Float64Array( 3 );

var info = ztbcon.ndarray( 'one-norm', 'upper', 'non-unit', 3, 0, AB, 1, 1, 0, RCOND, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
console.log( 'info:', info, 'rcond:', RCOND[ 0 ] ); // eslint-disable-line no-console
