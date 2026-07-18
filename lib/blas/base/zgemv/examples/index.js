import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgemv from './../lib/base.js';

// Perform y = alpha*A*x + beta*y for complex A:
const A = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
const x = new Float64Array( [ 1.0, 0.0, 1.0, 0.0 ] );
const y = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
const alpha = new Float64Array( [ 1.0, 0.0 ] );
const beta = new Float64Array( [ 0.0, 0.0 ] );

zgemv( 'no-transpose', 2, 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
