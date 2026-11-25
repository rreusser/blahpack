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
import dlaed2 from './../lib/index.js';

const N = 6;
const n1 = 3;
const k = new Int32Array( 1 );
const rho = new Float64Array( 1 );
const DLAMBDA = new Float64Array( N );
const w = new Float64Array( N );
const Q2 = new Float64Array( N * N );
const INDX = new Int32Array( N );
const INDXC = new Int32Array( N );
const INDXP = new Int32Array( N );
const COLTYP = new Int32Array( Math.max( N, 4 ) );

/**
* Returns the eigen-decompositions of two 3x3 diagonal sub-problems, as merged by the divide-and-conquer algorithm.
*
* @private
* @returns {Object} sub-problem eigenvalues `d`, eigenvectors `Q` (identity), sorting permutation `INDXQ` (1-based within each sub-problem), and updating vector `z`
*/
function subproblems() {
	const Q = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Q[ ( i * N ) + i ] = 1.0;
	}
	return {
		'd': new Float64Array( [ 1.0, 3.0, 5.0, 2.0, 4.0, 6.0 ] ),
		'Q': Q,
		'INDXQ': new Int32Array( [ 1, 2, 3, 1, 2, 3 ] ),
		'z': new Float64Array( [ 0.5, 0.6, 0.7, 0.4, 0.3, 0.2 ] )
	};
}

// Using the standard interface:
let s = subproblems();
rho[ 0 ] = 1.0;
let out = {
	'info': dlaed2( 'column-major', k, N, n1, s.d, 1, s.Q, N, s.INDXQ, 1, rho, s.z, 1, DLAMBDA, 1, w, 1, Q2, 1, INDX, 1, INDXC, 1, INDXP, 1, COLTYP, 1 ),
	'K': k[ 0 ],
	'rho': rho[ 0 ],
	'DLAMBDA': DLAMBDA.slice( 0, k[ 0 ] )
};
console.log( out ); // eslint-disable-line no-console

// Using the ndarray interface:
s = subproblems();
rho[ 0 ] = 1.0;
out = {
	'info': dlaed2.ndarray( k, N, n1, s.d, 1, 0, s.Q, 1, N, 0, s.INDXQ, 1, 0, rho, s.z, 1, 0, DLAMBDA, 1, 0, w, 1, 0, Q2, 1, 0, INDX, 1, 0, INDXC, 1, 0, INDXP, 1, 0, COLTYP, 1, 0 ),
	'K': k[ 0 ],
	'rho': rho[ 0 ],
	'DLAMBDA': DLAMBDA.slice( 0, k[ 0 ] )
};
console.log( out ); // eslint-disable-line no-console
