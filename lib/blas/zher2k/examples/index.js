import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zher2k from './../lib/index.js';

// Perform Hermitian rank-2k update of C:
const A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const C = new Complex128Array( 4 );
const alpha = new Complex128( 1.0, 0.0 );

zher2k.strided( 'upper', 'no-transpose', 2, 2, alpha, A, 2, 1, 0, B, 2, 1, 0, 0.0, C, 2, 1, 0 );
console.log( reinterpret( C, 0 ) ); // eslint-disable-line no-console
