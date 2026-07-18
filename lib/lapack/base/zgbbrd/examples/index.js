
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbbrd from './../lib/index.js';

// Reduce a 3x3 complex tridiagonal band matrix (KL=KU=1) to real bidiagonal form:
const N = 3;
const KL = 1;
const KU = 1;
const LDAB = KL + KU + 1;

const AB = new Complex128Array( LDAB * N );
const d = new Float64Array( N );
const e = new Float64Array( N - 1 );
const Q = new Complex128Array( N * N );
const PT = new Complex128Array( N * N );
const C = new Complex128Array( 1 );
const WORK = new Complex128Array( 2 * N );
const RWORK = new Float64Array( 2 * N );

zgbbrd( 'column-major', 'both', N, N, 0, KL, KU, AB, LDAB, d, 1, e, 1, Q, N, PT, N, C, 1, WORK, 1, RWORK, 1 );
console.log( d ); // eslint-disable-line no-console
console.log( e ); // eslint-disable-line no-console
