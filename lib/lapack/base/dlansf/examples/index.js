import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansf from './../lib/index.js';

/*
* 3x3 real symmetric matrix in RFP format (upper, no-transpose).
*
* Original symmetric matrix:
*   A = [  4   2   1 ]
*       [  2   5   3 ]
*       [  1   3   6 ]
*
* RFP layout (n=3, upper, no-transpose):
*   Col 0: A(0,1), A(1,1), A(0,0)  = 2, 5, 4
*   Col 1: A(0,2), A(1,2), A(2,2)  = 1, 3, 6
*/
var A = new Float64Array( [ 2.0, 5.0, 4.0, 1.0, 3.0, 6.0 ] );
var WORK = new Float64Array( 3 );

var result = dlansf( 'max', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'max norm: %d', result ); // eslint-disable-line no-console

WORK = new Float64Array( 3 );
result = dlansf( 'one-norm', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'one-norm: %d', result ); // eslint-disable-line no-console

result = dlansf( 'frobenius', 'no-transpose', 'upper', 3, A, WORK );
console.log( 'frobenius norm: %d', result ); // eslint-disable-line no-console
