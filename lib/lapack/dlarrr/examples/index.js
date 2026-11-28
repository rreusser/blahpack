
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrr from './../lib/index.js';

// Well-conditioned tridiagonal matrix:
let d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
let e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );

let info = dlarrr( 5, d, 1, e, 1 );
console.log( 'Well-conditioned INFO:', info ); // eslint-disable-line no-console
// => 0

// Poorly-conditioned tridiagonal matrix:
d = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
e = new Float64Array( [ 0.99, 0.99, 0.99 ] );

info = dlarrr( 4, d, 1, e, 1 );
console.log( 'Poorly-conditioned INFO:', info ); // eslint-disable-line no-console
// => 1
