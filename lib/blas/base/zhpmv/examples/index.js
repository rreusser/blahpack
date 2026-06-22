import Float64Array from '@stdlib/array/float64/lib/index.js';
import zhpmv from './../lib/base.js';

// Perform y = alpha*A*x + beta*y for Hermitian packed A:
var AP = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
var x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
var y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
var alpha = new Float64Array( [ 1.0, 0.0 ] );
var beta = new Float64Array( [ 0.0, 0.0 ] );

zhpmv( 'upper', 2, alpha, AP, 1, 0, x, 1, 0, beta, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
