import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbmv from './../lib/index.js';

// Perform x = A*x for complex upper triangular banded A (N=2, K=1, column-major band storage):
const A = new Complex128Array( [ 0.0, 0.0, 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );

ztbmv( 'column-major', 'upper', 'no-transpose', 'non-unit', 2, 1, A, 2, x, 1 );
console.log( reinterpret( x, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
const y = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
ztbmv.strided( 'upper', 'no-transpose', 'non-unit', 2, 1, A, 1, 2, 0, y, 1, 0 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console
