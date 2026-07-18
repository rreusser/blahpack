/* eslint-disable camelcase, stdlib/require-file-extensions */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_syrcond from '@stdlib/lapack/base/dla_syrcond';

// 3x3 symmetric indefinite matrix (column-major)
const N = 3;
const A = new Float64Array( [ 2.0, -1.0, 0.5, -1.0, 3.0, -0.5, 0.5, -0.5, 4.0 ] );
const AF = new Float64Array( A );
const IPIV = new Int32Array( N );
const c = new Float64Array( [ 1.0, 2.0, 0.5 ] );
const WORK = new Float64Array( 3 * N );
const IWORK = new Int32Array( N );

const rcond = dla_syrcond( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, c, WORK, IWORK );
console.log( 'rcond:', rcond ); // eslint-disable-line no-console
