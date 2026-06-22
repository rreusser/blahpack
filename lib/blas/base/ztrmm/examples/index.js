import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrmm from './../lib/base.js';

// Perform B = alpha*A*B for complex triangular A:
var A = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );

ztrmm( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0 );
console.log( B ); // eslint-disable-line no-console
