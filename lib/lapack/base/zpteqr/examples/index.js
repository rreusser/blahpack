import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zpteqr from './../lib/index.js';

const d = new Float64Array( [ 4.0, 4.0, 4.0 ] );
const e = new Float64Array( [ 1.0, 1.0 ] );
const Z = new Complex128Array( 9 );
const WORK = new Float64Array( 12 );

const info = zpteqr( 'column-major', 'initialize', 3, d, 1, e, 1, Z, 3, WORK, 1 );

console.log( 'info:', info );
console.log( 'eigenvalues:', d );
