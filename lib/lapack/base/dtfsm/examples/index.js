
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtfsm from './../lib/index.js';

// 3x3 lower triangular matrix in RFP format (TRANSR='N', UPLO='L'):
var A = new Float64Array( [ 4.0, 0.5, 1.0, 6.0, 5.0, 1.5 ] );

// 3x2 matrix B in column-major order:
var B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );

console.log( 'B before:' );
console.log( B );

// Solve A*X = B (SIDE='left', TRANS='no-transpose', alpha=1):
dtfsm.ndarray( 'no-transpose', 'left', 'lower', 'no-transpose', 'non-unit', 3, 2, 1.0, A, 1, 0, B, 1, 3, 0 ); // eslint-disable-line max-len

console.log( 'B after (X):' );
console.log( B );
