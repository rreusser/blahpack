import Float64Array from '@stdlib/array/float64/lib/index.js';
import dnrm2 from './../lib/base.js';

// Compute the Euclidean norm of a vector:
const x = new Float64Array( [ 3.0, 4.0 ] );

const result = dnrm2( 2, x, 1, 0 );
console.log( result ); // eslint-disable-line no-console
// => 5.0
