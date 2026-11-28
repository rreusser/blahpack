import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpsv from './../lib/index.js';

// Solve A*x = b for complex upper triangular packed A = [ [2, 3], [0, 4] ]:
const AP = new Complex128Array( [ 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
let x = new Complex128Array( [ 5.0, 0.0, 4.0, 0.0 ] );

// Using the standard interface:
ztpsv( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, AP, x, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
x = new Complex128Array( [ 5.0, 0.0, 4.0, 0.0 ] );
ztpsv.strided( 'upper', 'no-transpose', 'non-unit', 2, AP, 1, 0, x, 1, 0 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console
