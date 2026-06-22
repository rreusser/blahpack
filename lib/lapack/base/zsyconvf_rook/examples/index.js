/* eslint-disable camelcase */

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsyconvf_rook from './../lib/index.js';

// 2x2 complex symmetric factor (column-major) with a 2x2 rook pivot:
var A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 3.0, 0.5, 2.0, 0.0 ] );
var E = new Complex128Array( 2 );
var IPIV = new Int32Array( [ -1, -1 ] );

var info = zsyconvf_rook.ndarray( 'upper', 'convert', 2, A, 1, 2, 0, E, 1, 0, IPIV, 1, 0 );
console.log( info ); // eslint-disable-line no-console
