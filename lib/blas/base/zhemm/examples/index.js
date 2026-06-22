import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhemm from './../lib/base.js';

// Perform C = alpha*A*B + beta*C where A is Hermitian:
var A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var B = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] );
var C = new Float64Array( 8 );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zhemm( 'left', 'upper', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0, beta, C, 2, 1, 0 );
console.log( C ); // eslint-disable-line no-console
