import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlanht from './../lib/index.js';

// 5x5 complex Hermitian tridiagonal matrix:
var d = new Float64Array( [ 2.0, -4.0, 6.0, -1.0, 3.0 ] );
var e = new Complex128Array( [ 1.0, 2.0, -2.0, 3.0, 3.0, -1.0, 5.0, 4.0 ] );
var maxNorm;
var oneNorm;
var infNorm;
var frobNorm;

maxNorm = zlanht.ndarray( 'max', 5, d, 1, 0, e, 1, 0 );
console.log( 'Max norm: %d', maxNorm ); // eslint-disable-line no-console

oneNorm = zlanht.ndarray( 'one-norm', 5, d, 1, 0, e, 1, 0 );
console.log( 'One norm: %d', oneNorm ); // eslint-disable-line no-console

infNorm = zlanht.ndarray( 'inf-norm', 5, d, 1, 0, e, 1, 0 );
console.log( 'Infinity norm: %d', infNorm ); // eslint-disable-line no-console

frobNorm = zlanht.ndarray( 'frobenius', 5, d, 1, 0, e, 1, 0 );
console.log( 'Frobenius norm: %d', frobNorm ); // eslint-disable-line no-console
