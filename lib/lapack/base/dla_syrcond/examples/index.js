/* eslint-disable camelcase, stdlib/require-file-extensions */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dla_syrcond from '@stdlib/lapack/base/dla_syrcond';

// 3x3 symmetric indefinite matrix (column-major)
var N = 3;
var A = new Float64Array( [ 2.0, -1.0, 0.5, -1.0, 3.0, -0.5, 0.5, -0.5, 4.0 ] );
var AF = new Float64Array( A );
var IPIV = new Int32Array( N );
var c = new Float64Array( [ 1.0, 2.0, 0.5 ] );
var WORK = new Float64Array( 3 * N );
var IWORK = new Int32Array( N );

var rcond = dla_syrcond( 'column-major', 'upper', N, A, N, AF, N, IPIV, 1, c, WORK, IWORK );
console.log( 'rcond:', rcond ); // eslint-disable-line no-console
