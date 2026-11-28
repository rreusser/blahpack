import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import ztrmm from './../lib/index.js';

// Perform B = alpha*A*B for complex lower triangular A = [ [2, 0], [3, 4] ] (column-major):
const A = new Complex128Array( [ 2.0, 0.0, 3.0, 0.0, 0.0, 0.0, 4.0, 0.0 ] );
let B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const alpha = new Complex128( 1.0, 0.0 );

// Using the standard interface:
ztrmm( 'column-major', 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 2, B, 2 );
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console

// Using the strided interface:
B = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
ztrmm.strided( 'left', 'lower', 'no-transpose', 'non-unit', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0 );
console.log( reinterpret( B, 0 ) ); // eslint-disable-line no-console
