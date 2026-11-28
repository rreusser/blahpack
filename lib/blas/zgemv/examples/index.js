import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemv from './../lib/index.js';

// Perform y = alpha*A*x + beta*y for complex A:
const A = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
const x = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0 ] );
let y = new Complex128Array( 2 );
const alpha = new Complex128( 1.0, 0.0 );
const beta = new Complex128( 0.0, 0.0 );

// Using the standard interface:
zgemv( 'column-major', 'no-transpose', 2, 2, alpha, A, 2, x, 1, beta, y, 1 );
console.log( y ); // eslint-disable-line no-console

// Using the strided interface:
y = new Complex128Array( 2 );
zgemv.strided( 'no-transpose', 2, 2, alpha, A, 1, 2, 0, x, 1, 0, beta, y, 1, 0 );
console.log( y ); // eslint-disable-line no-console
