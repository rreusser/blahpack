
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansp from './../lib/index.js';

// 3x3 symmetric matrix in upper packed storage:

//   A = [  2.0   3.0  -1.0 ]

//       [  3.0   5.0   2.0 ]

//       [ -1.0   2.0   7.0 ]
var AP = new Float64Array( [ 2.0, 3.0, 5.0, -1.0, 2.0, 7.0 ] );
var WORK = new Float64Array( 3 );
var result;

result = dlansp( 'max', 'upper', 3, AP, WORK );
console.log( 'Max norm:', result );

result = dlansp( 'one-norm', 'upper', 3, AP, WORK );
console.log( 'One norm:', result );

result = dlansp( 'inf-norm', 'upper', 3, AP, WORK );
console.log( 'Inf norm:', result );

result = dlansp( 'frobenius', 'upper', 3, AP, WORK );
console.log( 'Frobenius norm:', result );
