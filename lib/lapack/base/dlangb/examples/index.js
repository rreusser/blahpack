
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlangb from './../lib/index.js';

// 3x3 diagonal matrix (KL=0, KU=0, LDAB=1):
var AB = new Float64Array( [ 3.0, -1.0, 2.0 ] );
var WORK = new Float64Array( 3 );

var v = dlangb.ndarray( 'max', 3, 0, 0, AB, 1, 1, 0, WORK, 1, 0 );
console.log( 'Max norm (diagonal): ' + v ); // eslint-disable-line no-console
// => 3.0

v = dlangb.ndarray( 'frobenius', 3, 0, 0, AB, 1, 1, 0, WORK, 1, 0 );
console.log( 'Frobenius norm (diagonal): ' + v ); // eslint-disable-line no-console
// => ~3.74
