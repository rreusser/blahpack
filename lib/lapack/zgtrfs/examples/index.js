
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgttrf from './../../zgttrf/lib/index.js';
import zgttrs from './../../zgttrs/lib/index.js';
import zgtrfs from './../lib/index.js';

const n = 4;
const DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
const d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
const DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
const DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
const DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
const DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
const DU2 = new Complex128Array( n );
const IPIV = new Int32Array( n );
const B = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
const X = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
const WORK = new Complex128Array( 2 * n );
const RWORK = new Float64Array( n );
const FERR = new Float64Array( 1 );
const BERR = new Float64Array( 1 );

zgttrf.ndarray( n, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
zgttrs.ndarray( 'no-transpose', n, 1, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 2, n * 2, 0 ); // eslint-disable-line max-len
const info = zgtrfs.ndarray( 'no-transpose', n, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

console.log( 'info:', info ); // eslint-disable-line no-console
console.log( 'X (Float64 view):', reinterpret( X, 0 ) ); // eslint-disable-line no-console
console.log( 'FERR:', FERR ); // eslint-disable-line no-console
console.log( 'BERR:', BERR ); // eslint-disable-line no-console
