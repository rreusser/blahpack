/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztprfb from './../lib/index.js';

// Small COL/FORWARD/LEFT example: M=5, N=4, K=3, L=2.
var V = new Complex128Array( 15 );
var T = new Complex128Array( 9 );
var A = new Complex128Array( 12 );
var B = new Complex128Array( 20 );
var W = new Complex128Array( 12 );

ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
console.log( B ); // eslint-disable-line no-console
