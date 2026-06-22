
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantb from './../lib/index.js';

/*
* 3x3 upper triangular band matrix with K=1 superdiagonal.
* Band storage (LDAB=2, column-major).
*/
var AB = new Complex128Array( [ 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ] );
var WORK = new Float64Array( 3 );

var norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
var i;
for ( i = 0; i < norms.length; i++ ) {
	console.log( norms[ i ] + ': ' + zlantb.ndarray( norms[ i ], 'upper', 'non-unit', 3, 1, AB, 1, 2, 0, WORK, 1, 0 ) ); // eslint-disable-line max-len, no-console
}
