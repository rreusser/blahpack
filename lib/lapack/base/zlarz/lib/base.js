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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgerc from '../../../../blas/base/zgerc/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Applies a complex elementary reflector `H` to a complex M-by-N matrix `C`, from either the left or the right.
*
* `H` is defined in the form used by the RZ factorization (see `ztzrzf`):
* `H = I - tau * v * v^H`, where `tau` is a complex scalar and `v` is a complex
* vector whose first component is implicitly 1 and whose last `L` components
* are stored explicitly.
*
* If `tau = 0`, then `H` is taken to be the unit matrix.
*
* @private
* @param {string} side - `'left'` applies `H` from the left; `'right'` applies `H` from the right
* @param {NonNegativeInteger} M - number of rows of the matrix `C`
* @param {NonNegativeInteger} N - number of columns of the matrix `C`
* @param {NonNegativeInteger} l - number of entries of the vector `v` containing the meaningful (non-unit) part of the reflector
* @param {Complex128Array} v - reflector vector (length at least `1 + (l-1)*|strideV|`)
* @param {integer} strideV - stride for `v` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (in complex elements)
* @param {Complex128Array} tau - complex scalar `tau`
* @param {NonNegativeInteger} offsetTau - starting index for `tau` (in complex elements)
* @param {Complex128Array} C - matrix, modified in place
* @param {integer} strideC1 - stride of the first dimension of `C` (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length at least `N` if `side` is `'left'`, else at least `M`)
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
*/
function zlarz( side, M, N, l, v, strideV, offsetV, tau, offsetTau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var offsetCsub;
	var tauView;
	var negTau;
	var tauR;
	var tauI;
	var oT;

	tauView = reinterpret( tau, 0 );
	oT = offsetTau * 2;
	tauR = tauView[ oT ];
	tauI = tauView[ oT + 1 ];

	if ( tauR === 0.0 && tauI === 0.0 ) {
		return;
	}

	negTau = new Complex128( -tauR, -tauI );

	if ( side === 'left' ) {
		// Form H * C

		// w( 1:n ) = conjg( C( 1, 1:n ) )
		zcopy( N, C, strideC2, offsetC, WORK, strideWork, offsetWork );
		zlacgv( N, WORK, strideWork, offsetWork );

		// w( 1:n ) = conjg( w( 1:n ) + C( m-l+1:m, 1:n )^T * v( 1:l ) )
		offsetCsub = offsetC + ( ( M - l ) * strideC1 );
		zgemv( 'conjugate-transpose', l, N, ONE, C, strideC1, strideC2, offsetCsub, v, strideV, offsetV, ONE, WORK, strideWork, offsetWork );
		zlacgv( N, WORK, strideWork, offsetWork );

		// C( 1, 1:n ) = C( 1, 1:n ) - tau * w( 1:n )
		zaxpy( N, negTau, WORK, strideWork, offsetWork, C, strideC2, offsetC );

		// C( m-l+1:m, 1:n ) = C( m-l+1:m, 1:n ) - v( 1:l ) * w( 1:n )^T
		zgeru( l, N, negTau, v, strideV, offsetV, WORK, strideWork, offsetWork, C, strideC1, strideC2, offsetCsub );
	} else {
		// Form C * H

		// w( 1:m ) = C( 1:m, 1 )
		zcopy( M, C, strideC1, offsetC, WORK, strideWork, offsetWork );

		// w( 1:m ) = w( 1:m ) + C( 1:m, n-l+1:n ) * v( 1:l )
		offsetCsub = offsetC + ( ( N - l ) * strideC2 );
		zgemv( 'no-transpose', M, l, ONE, C, strideC1, strideC2, offsetCsub, v, strideV, offsetV, ONE, WORK, strideWork, offsetWork );

		// C( 1:m, 1 ) = C( 1:m, 1 ) - tau * w( 1:m )
		zaxpy( M, negTau, WORK, strideWork, offsetWork, C, strideC1, offsetC );

		// C( 1:m, n-l+1:n ) = C( 1:m, n-l+1:n ) - w( 1:m ) * v( 1:l )^H
		zgerc( M, l, negTau, WORK, strideWork, offsetWork, v, strideV, offsetV, C, strideC1, strideC2, offsetCsub );
	}
}


// EXPORTS //

export default zlarz;
