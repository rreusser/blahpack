import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zher2 from './../lib/index.js';

// Perform Hermitian rank-2 update of A:
const x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const y = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
const A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const alpha = new Complex128( 1.0, 0.0 );

zher2.ndarray( 'upper', 2, alpha, x, 1, 0, y, 1, 0, A, 2, 1, 0 );
console.log( reinterpret( A, 0 ) ); // eslint-disable-line no-console
