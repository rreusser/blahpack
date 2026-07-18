import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgemm from './../lib/base.js';

// Perform C = alpha*A*B + beta*C for complex matrices:
const A = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const B = new Float64Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] );
const C = new Float64Array( 8 );
const alpha = new Float64Array( [ 1.0, 0.0 ] );
const beta = new Float64Array( [ 0.0, 0.0 ] );

zgemm( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0, beta, C, 2, 1, 0 );
console.log( C ); // eslint-disable-line no-console
