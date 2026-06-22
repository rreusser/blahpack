
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlangb from './../lib/index.js';

// 3x3 diagonal matrix (KL=0, KU=0, LDAB=1):
var AB = new Complex128Array( [ 3.0, 4.0, 1.0, 1.0, 2.0, 2.0 ] );
var WORK = new Float64Array( 3 );

var v = zlangb.ndarray( 'max', 3, 0, 0, AB, 1, 1, 0, WORK, 1, 0 );
console.log( 'Max norm (diagonal): ' + v ); // eslint-disable-line no-console
// => 5.0

v = zlangb.ndarray( 'frobenius', 3, 0, 0, AB, 1, 1, 0, WORK, 1, 0 );
console.log( 'Frobenius norm (diagonal): ' + v ); // eslint-disable-line no-console
// => ~5.92
