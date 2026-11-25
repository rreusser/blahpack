import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zaxpy from './../lib/index.js';

// Perform y = alpha*x + y for complex vectors:
const zx = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
const zy = new Complex128Array( [ 5.0, 6.0, 7.0, 8.0 ] );
const alpha = new Complex128( 1.0, 0.0 );

// Using the standard interface:
zaxpy( 2, alpha, zx, 1, zy, 1 );
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console

// Using the ndarray interface:
zaxpy.ndarray( 2, alpha, zx, 1, 0, zy, 1, 0 );
console.log( reinterpret( zy, 0 ) ); // eslint-disable-line no-console
