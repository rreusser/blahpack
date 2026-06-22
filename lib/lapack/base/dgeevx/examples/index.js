/**
* @license Apache-2.0
*
* Copyright (c) 2026 The Stdlib Authors.
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dgeevx from './../lib/index.js';

var opts = {
	'dtype': 'float64'
};
var N = 3;
var A = discreteUniform( N * N, -10, 10, opts );
var WR = new Float64Array( N );
var WI = new Float64Array( N );
var VL = new Float64Array( N * N );
var VR = new Float64Array( N * N );
var SCALE = new Float64Array( N );
var RCONDE = new Float64Array( N );
var RCONDV = new Float64Array( N );

var out = dgeevx( 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, WR, 1, WI, 1, VL, N, VR, N, SCALE, RCONDE, RCONDV );
console.log( out ); // eslint-disable-line no-console
