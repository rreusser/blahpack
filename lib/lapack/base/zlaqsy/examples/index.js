import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqsy from './../lib/index.js';

// 2x2 complex symmetric matrix (column-major):
var A = new Complex128Array( [ 4.0, 1.0, 1.0, 0.5, 1.0, 0.5, 9.0, 2.0 ] );

// Scaling factors:
var s = new Float64Array( [ 0.5, 0.25 ] );

// Equilibrate with poor scaling condition:
var equed = zlaqsy.ndarray( 'upper', 2, A, 1, 2, 0, s, 1, 0, 0.05, 9.0 );

console.log( 'equed:', equed );
// => equed: yes
