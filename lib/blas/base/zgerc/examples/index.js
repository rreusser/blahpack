import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgerc from './../lib/base.js';

// Perform A = alpha*x*conjg(y') + A:
const x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const A = new Float64Array( 8 );
const alpha = new Float64Array( [ 1.0, 0.0 ] );

zgerc( 2, 2, alpha, x, 1, 0, y, 1, 0, A, 2, 1, 0 );
console.log( A ); // eslint-disable-line no-console
