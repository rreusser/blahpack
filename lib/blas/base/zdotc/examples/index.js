import Float64Array from '@stdlib/array/float64/lib/index.js';
import zdotc from './../lib/base.js';

// Compute conjugate dot product of complex vectors:
const x = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const y = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );

const result = zdotc( 2, x, 1, 0, y, 1, 0 );
console.log( result ); // eslint-disable-line no-console
