
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantb from './../lib/index.js';

/*
* 3x3 upper triangular band matrix with K=1 superdiagonal.
* Band storage (LDAB=2, column-major).
*/
const AB = new Complex128Array( [ 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5 ] );
const WORK = new Float64Array( 3 );

console.log( 'max: ' + zlantb.strided( 'max', 'upper', 'non-unit', 3, 1, AB, 1, 2, 0, WORK, 1, 0 ) ); // eslint-disable-line no-console
console.log( 'one-norm: ' + zlantb.strided( 'one-norm', 'upper', 'non-unit', 3, 1, AB, 1, 2, 0, WORK, 1, 0 ) ); // eslint-disable-line no-console
console.log( 'inf-norm: ' + zlantb.strided( 'inf-norm', 'upper', 'non-unit', 3, 1, AB, 1, 2, 0, WORK, 1, 0 ) ); // eslint-disable-line no-console
console.log( 'frobenius: ' + zlantb.strided( 'frobenius', 'upper', 'non-unit', 3, 1, AB, 1, 2, 0, WORK, 1, 0 ) ); // eslint-disable-line no-console
