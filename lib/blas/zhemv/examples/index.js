import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhemv from './../lib/index.js';

// Perform y = alpha*A*x + beta*y for Hermitian A:
const A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 2.0, 0.0, 3.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
const y = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

zhemv.strided( 'upper', 2, alpha, A, 2, 1, 0, x, 1, 0, beta, y, 1, 0 );
console.log( reinterpret( y, 0 ) ); // eslint-disable-line no-console
