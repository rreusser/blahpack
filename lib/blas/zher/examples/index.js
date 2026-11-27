import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zher from './../lib/index.js';

// Perform A = alpha*x*conjg(x') + A for Hermitian A:
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

zher.ndarray( 'upper', 2, 1.0, x, 1, 0, A, 2, 1, 0 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
