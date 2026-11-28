/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasd2 from './../lib/index.js';

// Merge two upper bidiagonal blocks (NL = NR = 2, SQRE = 0) with identity singular vectors:
const NL = 2;
const NR = 2;
const SQRE = 0;
const N = NL + NR + 1;
const M = N + SQRE;

/**
* Returns an `n`-by-`n` identity matrix.
*
* @private
* @param {PositiveInteger} n - order
* @returns {Float64Array} identity matrix
*/
function eye( n ) {
	const out = new Float64Array( n * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		out[ ( i * n ) + i ] = 1.0;
	}
	return out;
}

let D = new Float64Array( [ 1.0, 3.0, 0.0, 2.0, 4.0 ] );
let Z = new Float64Array( M );
let U = eye( N );
let VT = eye( M );
let IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] ); // sorting permutations of each block (1-based)
const K = new Int32Array( 1 );
const DSIGMA = new Float64Array( N );
const U2 = new Float64Array( N * N );
const VT2 = new Float64Array( M * M );
const IDXP = new Int32Array( N );
const IDX = new Int32Array( N );
const IDXC = new Int32Array( N );
const COLTYP = new Int32Array( Math.max( N, 4 ) );

// Using the standard interface:
let info = dlasd2( 'column-major', NL, NR, SQRE, K, D, 1, Z, 1, 0.5, 0.7, U, N, VT, M, DSIGMA, 1, U2, N, VT2, M, IDXP, 1, IDX, 1, IDXC, 1, IDXQ, 1, COLTYP, 1 );
console.log( info, K[ 0 ], DSIGMA, Z ); // eslint-disable-line no-console

// Using the ndarray interface:
D = new Float64Array( [ 1.0, 3.0, 0.0, 2.0, 4.0 ] );
Z = new Float64Array( M );
U = eye( N );
VT = eye( M );
IDXQ = new Int32Array( [ 1, 2, 0, 1, 2 ] );
info = dlasd2.ndarray( NL, NR, SQRE, K, D, 1, 0, Z, 1, 0, 0.5, 0.7, U, 1, N, 0, VT, 1, M, 0, DSIGMA, 1, 0, U2, 1, N, 0, VT2, 1, M, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
console.log( info, K[ 0 ], DSIGMA, Z ); // eslint-disable-line no-console
