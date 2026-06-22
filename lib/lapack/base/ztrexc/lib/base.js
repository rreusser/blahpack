/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartg from '../../zlartg/lib/base.js';
import zrot from '../../zrot/lib/base.js';


// MAIN //

/**
* Reorders the Schur factorization of a complex matrix A = Q*T*Q^H, so that
* the diagonal element of T with row index IFST is moved to row ILST.
*
* The Schur form T is reordered by a unitary similarity transformation
* Z^H * T * Z, and optionally the matrix Q of Schur vectors is updated by
* postmultiplication with Z.
*
* In the complex case, T is upper triangular (no 2x2 blocks), so this is
* simpler than the real case (dtrexc).
*
* Note: IFST and ILST are 1-based (Fortran convention).
*
* @private
* @param {string} compq - `'update'` to update Q, `'none'` to not update Q
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - the upper triangular Schur matrix
* @param {integer} strideT1 - stride of the first dimension of T (complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (complex elements)
* @param {Complex128Array} Q - unitary matrix (updated if compq=`'update'`)
* @param {integer} strideQ1 - stride of the first dimension of Q (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of Q (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (complex elements)
* @param {integer} ifst - row index of the element to move (1-based)
* @param {integer} ilst - target row index (1-based)
* @returns {integer} info - 0 on success
*/
function ztrexc( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, ifst, ilst ) {
	var conjSn;
	var wantq;
	var fIn;
	var gIn;
	var cArr;
	var sArr;
	var rArr;
	var fInv;
	var gInv;
	var Tv;
	var st1;
	var st2;
	var oT;
	var t11R;
	var t11I;
	var t22R;
	var t22I;
	var snv;
	var sn;
	var cs;
	var m1;
	var m2;
	var m3;
	var k;

	wantq = ( compq === 'update' );

	// Quick return
	if ( N <= 1 || ifst === ilst ) {
		return 0;
	}

	Tv = reinterpret( T, 0 );
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	oT = offsetT * 2;

	// Working arrays for zlartg
	fIn = new Complex128Array( 1 );
	fInv = reinterpret( fIn, 0 );
	gIn = new Complex128Array( 1 );
	gInv = reinterpret( gIn, 0 );
	cArr = new Float64Array( 1 );
	sArr = new Complex128Array( 1 );
	snv = reinterpret( sArr, 0 );
	rArr = new Complex128Array( 1 );
	sn = new Float64Array( 2 );
	conjSn = new Float64Array( 2 );

	if ( ifst < ilst ) {
		m1 = 0;
		m2 = -1;
		m3 = 1;
	} else {
		m1 = -1;
		m2 = 0;
		m3 = -1;
	}

	for ( k = ifst + m1; ( m3 > 0 ) ? ( k <= ilst + m2 ) : ( k >= ilst + m2 ); k += m3 ) {
		// k is 1-based Fortran index
		// T11 = T(k,k), T22 = T(k+1,k+1)
		t11R = Tv[ oT + ( k - 1 ) * st1 + ( k - 1 ) * st2 ];
		t11I = Tv[ oT + ( k - 1 ) * st1 + ( k - 1 ) * st2 + 1 ];
		t22R = Tv[ oT + k * st1 + k * st2 ];
		t22I = Tv[ oT + k * st1 + k * st2 + 1 ];

		// Compute Givens rotation: zlartg( T(k,k+1), T22-T11 )
		fInv[ 0 ] = Tv[ oT + ( k - 1 ) * st1 + k * st2 ];
		fInv[ 1 ] = Tv[ oT + ( k - 1 ) * st1 + k * st2 + 1 ];
		gInv[ 0 ] = t22R - t11R;
		gInv[ 1 ] = t22I - t11I;
		zlartg( fIn, 0, gIn, 0, cArr, 0, sArr, 0, rArr, 0 );

		cs = cArr[ 0 ];
		sn[ 0 ] = snv[ 0 ];
		sn[ 1 ] = snv[ 1 ];
		conjSn[ 0 ] = snv[ 0 ];
		conjSn[ 1 ] = -snv[ 1 ];

		// Apply rotation from the left: rows k, k+1, columns k+2..N
		if ( k + 2 <= N ) {
			zrot( N - k - 1, T, strideT2, offsetT + ( k - 1 ) * strideT1 + ( k + 1 ) * strideT2, T, strideT2, offsetT + k * strideT1 + ( k + 1 ) * strideT2, cs, sn );
		}

		// Apply rotation from the right: columns k, k+1, rows 1..k-1
		if ( k - 1 > 0 ) {
			zrot( k - 1, T, strideT1, offsetT + ( k - 1 ) * strideT2, T, strideT1, offsetT + k * strideT2, cs, conjSn );
		}

		// Swap diagonal elements: T(k,k) = T22, T(k+1,k+1) = T11
		Tv[ oT + ( k - 1 ) * st1 + ( k - 1 ) * st2 ] = t22R;
		Tv[ oT + ( k - 1 ) * st1 + ( k - 1 ) * st2 + 1 ] = t22I;
		Tv[ oT + k * st1 + k * st2 ] = t11R;
		Tv[ oT + k * st1 + k * st2 + 1 ] = t11I;

		// Update Q if needed
		if ( wantq ) {
			zrot( N, Q, strideQ1, offsetQ + ( k - 1 ) * strideQ2, Q, strideQ1, offsetQ + k * strideQ2, cs, conjSn );
		}
	}

	return 0;
}


// EXPORTS //

export default ztrexc;
