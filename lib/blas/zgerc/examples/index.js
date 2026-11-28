import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgerc from './../lib/index.js';

// Perform A = alpha*x*conjg(y') + A:
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const y = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const A = new Complex128Array( 4 );
const alpha = new Complex128( 1.0, 0.0 );

zgerc( 'column-major', 2, 2, alpha, x, 1, y, 1, A, 2 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
const B = new Complex128Array( 4 );
zgerc.strided( 2, 2, alpha, x, 1, 0, y, 1, 0, B, 1, 2, 0 );
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
