import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsv from './../lib/index.js';

// Solve A*x = b for complex upper triangular A = [ [2, 3], [0, 4] ] (column-major):
const A = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
let x = new Complex128Array( [ 5.0, 0.0, 4.0, 0.0 ] );

// Using the standard interface:
ztrsv( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, A, 2, x, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
x = new Complex128Array( [ 5.0, 0.0, 4.0, 0.0 ] );
ztrsv.strided( 'upper', 'no-transpose', 'non-unit', 2, A, 1, 2, 0, x, 1, 0 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console
