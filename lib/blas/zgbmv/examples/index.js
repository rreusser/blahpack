import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgbmv from './../lib/index.js';

// Perform y = alpha*A*x + beta*y for a complex 2x2 banded A (kl=0, ku=1):
// Band storage (LDA=2, column-major): column 1 = [ *, a11 ], column 2 = [ a12, a22 ]
const A = new Complex128Array( [ 0.0, 0.0, 1.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
const y = new Complex128Array( 2 );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

// Using the standard interface:
zgbmv( 'column-major', 'no-transpose', 2, 2, 0, 1, alpha, A, 2, x, 1, beta, y, 1 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
zgbmv.ndarray( 'no-transpose', 2, 2, 0, 1, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console
