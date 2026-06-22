/* eslint-disable camelcase */

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconvf_rook from './../lib/index.js';

// 2x2 symmetric factor (column-major) with a 2x2 rook pivot:
var A = new Float64Array( [ 1.0, 0.0, 3.0, 2.0 ] );
var E = new Float64Array( 2 );
var IPIV = new Int32Array( [ -1, -2 ] );

var info = dsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, E, 1, 0, IPIV, 1, 0 );
console.log( info ); // eslint-disable-line no-console
