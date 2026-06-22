import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpteqr from './../lib/index.js';

var d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
var e = new Float64Array( [ 1.0, 1.0 ] );
var Z = new Complex128Array( 9 );
var WORK = new Float64Array( 12 );

var info = zpteqr( 'column-major', 'initialize', 3, d, 1, e, 1, Z, 3, WORK, 1 );

console.log( 'info:', info );
console.log( 'eigenvalues:', d );
