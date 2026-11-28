import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zptsvx from './../lib/index.js';

// Solve A*x = b where A is a 4x4 Hermitian PD tridiagonal matrix:
const d = new Float64Array( [ 4.0, 5.0, 6.0, 7.0 ] );
const e = new Complex128Array( [ 1.0, 0.5, 0.5, -0.3, 0.2, 0.1 ] );
const df = new Float64Array( 4 );
const ef = new Complex128Array( 3 );
const b = new Complex128Array( [ 6.5, 4.0, 12.15, -4.55, 7.1, 3.25, -3.25, 7.0 ] ); // eslint-disable-line max-len
const x = new Complex128Array( 4 );
const rcond = new Float64Array( 1 );
const ferr = new Float64Array( 1 );
const berr = new Float64Array( 1 );
const work = new Complex128Array( 4 );
const rwork = new Float64Array( 4 );

const info = zptsvx.ndarray( 'not-factored', 4, 1, d, 1, 0, e, 1, 0, df, 1, 0, ef, 1, 0, b, 1, 4, 0, x, 1, 4, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info );
console.log( 'x:', x );
console.log( 'rcond:', rcond[ 0 ] );
console.log( 'ferr:', ferr );
console.log( 'berr:', berr );
