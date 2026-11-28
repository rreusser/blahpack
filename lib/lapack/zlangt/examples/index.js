import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlangt from './../lib/index.js';

// 4x4 complex tridiagonal matrix:
const dl = new Complex128Array( [ 3.0, 2.0, 1.0, 4.0, 2.0, 1.0 ] );
const d = new Complex128Array( [ 2.0, 1.0, 4.0, 2.0, 5.0, 3.0, 6.0, 1.0 ] );
const du = new Complex128Array( [ -1.0, 3.0, -2.0, 1.0, -3.0, 2.0 ] );

const maxNorm = zlangt.ndarray( 'max', 4, dl, 1, 0, d, 1, 0, du, 1, 0 );
console.log( 'Max norm: %d', maxNorm ); // eslint-disable-line no-console

const oneNorm = zlangt.ndarray( 'one-norm', 4, dl, 1, 0, d, 1, 0, du, 1, 0 );
console.log( 'One norm: %d', oneNorm ); // eslint-disable-line no-console

const infNorm = zlangt.ndarray( 'inf-norm', 4, dl, 1, 0, d, 1, 0, du, 1, 0 ); // eslint-disable-line max-len
console.log( 'Infinity norm: %d', infNorm ); // eslint-disable-line no-console

const frobNorm = zlangt.ndarray( 'frobenius', 4, dl, 1, 0, d, 1, 0, du, 1, 0 ); // eslint-disable-line max-len
console.log( 'Frobenius norm: %d', frobNorm ); // eslint-disable-line no-console
