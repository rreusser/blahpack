import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from './../lib/index.js';

// Perform C = alpha*A*B + beta*C for complex matrices:
const A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
const B = new Complex128Array( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 2.0, 0.0 ] );
let C = new Complex128Array( 4 );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

// Using the standard interface:
zgemm( 'column-major', 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 2, B, 2, beta, C, 2 );
console.log( C ); // eslint-disable-line no-console

// Using the strided interface:
C = new Complex128Array( 4 );
zgemm.strided( 'no-transpose', 'no-transpose', 2, 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 );
console.log( C ); // eslint-disable-line no-console
