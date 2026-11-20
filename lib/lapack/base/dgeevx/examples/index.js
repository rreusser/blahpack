/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import discreteUniform from '@stdlib/random/array/discrete-uniform/lib/index.js';
import dgeevx from './../lib/index.js';

const ilo = new Int32Array( 1 );
const ihi = new Int32Array( 1 );
const abnrm = new Float64Array( 1 );

const opts = {
	'dtype': 'float64'
};
const N = 3;
const A = discreteUniform( N * N, -10, 10, opts );
const WR = new Float64Array( N );
const WI = new Float64Array( N );
const VL = new Float64Array( N * N );
const VR = new Float64Array( N * N );
const SCALE = new Float64Array( N );
const RCONDE = new Float64Array( N );
const RCONDV = new Float64Array( N );

const out = {
	'info': dgeevx( 'column-major', 'both', 'compute-vectors', 'compute-vectors', 'none', N, A, N, WR, 1, WI, 1, VL, N, VR, N, ilo, ihi, SCALE, 1, abnrm, RCONDE, 1, RCONDV ),
	'ilo': ilo[ 0 ],
	'ihi': ihi[ 0 ],
	'abnrm': abnrm[ 0 ]
};
console.log( out ); // eslint-disable-line no-console
