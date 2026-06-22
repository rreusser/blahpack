import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlansf from './../lib/index.js';

/*
* 3x3 complex symmetric matrix in RFP format (upper, no-transpose).
*
* Original symmetric matrix:
*   A = [ (2,1)   (1,2)   (3,-1) ]
*       [ (1,2)   (5,-1)  (2,1)  ]
*       [ (3,-1)  (2,1)   (4,2)  ]
*
* RFP layout (n=3, upper, no-transpose):
*   Col 0: A(0,1), A(1,1), A(0,0)
*   Col 1: A(0,2), A(1,2), A(2,2)
*/
var A = new Complex128Array( [
	1.0, 2.0, 5.0, -1.0, 2.0, 1.0,
	3.0, -1.0, 2.0, 1.0, 4.0, 2.0
] );
var WORK = new Float64Array( 3 );

var result = zlansf( 'max', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'max norm: %d', result );

WORK = new Float64Array( 3 );
result = zlansf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'one-norm: %d', result );

result = zlansf( 'frobenius', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'frobenius norm: %d', result );
