/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrsna from './../lib/index.js';

// An upper triangular 2x2 matrix with well-separated diagonal eigenvalues.
var N = 2;
var T = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.3, 0.1, 2.0, 0.0 ] );

// For a diagonal T, eigenvectors are the canonical basis.
var VL = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
var VR = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );

var SELECT = new Uint8Array( N );
var S = new Float64Array( N );
var SEP = new Float64Array( N );
var M = new Int32Array( 1 );
var WORK = new Complex128Array( N * ( N + 1 ) );
var RWORK = new Float64Array( N );

ztrsna( 'column-major', 'both', 'all', SELECT, 1, N, T, N, VL, N, VR, N, S, 1, SEP, 1, N, M, WORK, N, RWORK, 1 );
console.log( S ); // eslint-disable-line no-console
console.log( SEP ); // eslint-disable-line no-console
