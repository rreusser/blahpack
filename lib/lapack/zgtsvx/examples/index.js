import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zgtsvx from './../lib/index.js';

// Solve A*x = b for a 3x3 complex tridiagonal system:
const dl = new Complex128Array( new Float64Array( [1, 0.5, 2, -1] ) );
const d = new Complex128Array( new Float64Array( [4, 1, 5, 0, 3, -0.5] ) );
const du = new Complex128Array( new Float64Array( [-1, 0.5, 1, 1] ) );
const dlf = new Complex128Array( 2 );
const df = new Complex128Array( 3 );
const duf = new Complex128Array( 2 );
const du2 = new Complex128Array( 1 );
const ipiv = new Int32Array( 3 );

// b = A * [1; 1; 1]
const b = new Complex128Array( new Float64Array( [3, 1.5, 8, 0.5, 5, -1.5] ) );
const x = new Complex128Array( 3 );
const rcond = new Float64Array( 1 );
const ferr = new Float64Array( 1 );
const berr = new Float64Array( 1 );
const work = new Complex128Array( 6 );
const rwork = new Float64Array( 3 );

const info = zgtsvx.ndarray( 'not-factored', 'no-transpose', 3, 1, dl, 1, 0, d, 1, 0, du, 1, 0, dlf, 1, 0, df, 1, 0, duf, 1, 0, du2, 1, 0, ipiv, 1, 0, b, 1, 3, 0, x, 1, 3, 0, rcond, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'rcond:', rcond[ 0 ] ); // eslint-disable-line no-console
