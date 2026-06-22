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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartg from './../../zlartg/lib/base.js';
import zrot from './../../zrot/lib/base.js';


// FUNCTIONS //

/**
* Copies one complex element from a Float64 view into a single-element Complex128Array workspace.
*
* @private
* @param {Float64Array} src - interleaved source view
* @param {NonNegativeInteger} idx - Float64 index of the source element
* @param {Complex128Array} dst - destination single-element complex array
*/
function copyComplex( src, idx, dst ) {
	var dv = reinterpret( dst, 0 );
	dv[ 0 ] = src[ idx ];
	dv[ 1 ] = src[ idx + 1 ];
}


// MAIN //

/**
* Chases a 1-by-1 shift bulge in a complex matrix pencil `(A,B)` down a single position.
*
* On entry, the bulge is located in `(A(k+1,k), B(k+1,k))` (using 0-based indexing).
* On exit, the bulge is located in `(A(k+2,k+1), B(k+2,k+1))`. When `k+1 === ihi`,
* the shift is removed from the edge of the matrix.
*
* @private
* @param {boolean} ilq - whether to update the matrix `Q`
* @param {boolean} ilz - whether to update the matrix `Z`
* @param {NonNegativeInteger} k - 0-based index of the bulge position
* @param {NonNegativeInteger} istartm - 0-based start index for column updates to `(A,B)`
* @param {NonNegativeInteger} istopm - 0-based end index for column updates to `(A,B)`
* @param {NonNegativeInteger} ihi - 0-based upper index of the active submatrix
* @param {Complex128Array} A - input/output matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - input/output matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - 0-based start index of the matrix `Q`
* @param {Complex128Array} Q - input/output matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q` (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (in complex elements)
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - 0-based start index of the matrix `Z`
* @param {Complex128Array} Z - input/output matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
*/
function zlaqz1( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ ) {
	var fArr;
	var gArr;
	var cArr;
	var sArr;
	var rArr;
	var sNeg;
	var idx;
	var Av;
	var Bv;
	var sv;
	var rv;
	var c;

	// Workspace for zlartg input/output:
	fArr = new Complex128Array( 1 );
	gArr = new Complex128Array( 1 );
	cArr = new Float64Array( 1 );
	sArr = new Complex128Array( 1 );
	rArr = new Complex128Array( 1 );

	// Sine for zrot is a Float64Array(2) [re, im]:
	sNeg = new Float64Array( 2 );

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	sv = reinterpret( sArr, 0 );
	rv = reinterpret( rArr, 0 );

	if ( k + 1 === ihi ) {
		// Shift is located on the edge of the matrix; remove it.

		// CALL ZLARTG( B( IHI, IHI ), B( IHI, IHI-1 ), C, S, TEMP )
		idx = ( offsetB + ( ihi * strideB1 ) + ( ihi * strideB2 ) ) * 2;
		copyComplex( Bv, idx, fArr );
		copyComplex( Bv, ( offsetB + ( ihi * strideB1 ) + ( ( ihi - 1 ) * strideB2 ) ) * 2, gArr );
		zlartg( fArr, 0, gArr, 0, cArr, 0, sArr, 0, rArr, 0 );
		c = cArr[ 0 ];

		// B( IHI, IHI ) = TEMP
		Bv[ idx ] = rv[ 0 ];
		Bv[ idx + 1 ] = rv[ 1 ];

		// B( IHI, IHI-1 ) = 0
		idx = ( offsetB + ( ihi * strideB1 ) + ( ( ihi - 1 ) * strideB2 ) ) * 2;
		Bv[ idx ] = 0.0;
		Bv[ idx + 1 ] = 0.0;

		// Sine in [re, im] form for zrot:
		sNeg[ 0 ] = sv[ 0 ];
		sNeg[ 1 ] = sv[ 1 ];

		// CALL ZROT( IHI-ISTARTM, B(ISTARTM,IHI), 1, B(ISTARTM,IHI-1), 1, C, S )
		zrot(ihi - istartm, B, strideB1, offsetB + ( istartm * strideB1 ) + ( ihi * strideB2 ), B, strideB1, offsetB + ( istartm * strideB1 ) + ( ( ihi - 1 ) * strideB2 ), c, sNeg);

		// CALL ZROT( IHI-ISTARTM+1, A(ISTARTM,IHI), 1, A(ISTARTM,IHI-1), 1, C, S )
		zrot(( ihi - istartm ) + 1, A, strideA1, offsetA + ( istartm * strideA1 ) + ( ihi * strideA2 ), A, strideA1, offsetA + ( istartm * strideA1 ) + ( ( ihi - 1 ) * strideA2 ), c, sNeg);

		if ( ilz ) {
			// CALL ZROT( NZ, Z(1, IHI-ZSTART+1), 1, Z(1, IHI-1-ZSTART+1), 1, C, S )
			// 0-based Z columns: ihi - zstart and ihi - 1 - zstart
			zrot(nz, Z, strideZ1, offsetZ + ( ( ihi - zstart ) * strideZ2 ), Z, strideZ1, offsetZ + ( ( ihi - 1 - zstart ) * strideZ2 ), c, sNeg);
		}
		return;
	}

	// Normal operation: move the bulge down.

	// Apply transformation from the right.

	// CALL ZLARTG( B(K+1,K+1), B(K+1,K), C, S, TEMP )
	idx = ( offsetB + ( ( k + 1 ) * strideB1 ) + ( ( k + 1 ) * strideB2 ) ) * 2;
	copyComplex( Bv, idx, fArr );
	copyComplex( Bv, ( offsetB + ( ( k + 1 ) * strideB1 ) + ( k * strideB2 ) ) * 2, gArr );
	zlartg( fArr, 0, gArr, 0, cArr, 0, sArr, 0, rArr, 0 );
	c = cArr[ 0 ];

	// B(K+1,K+1) = TEMP
	Bv[ idx ] = rv[ 0 ];
	Bv[ idx + 1 ] = rv[ 1 ];

	// B(K+1,K) = 0
	idx = ( offsetB + ( ( k + 1 ) * strideB1 ) + ( k * strideB2 ) ) * 2;
	Bv[ idx ] = 0.0;
	Bv[ idx + 1 ] = 0.0;

	sNeg[ 0 ] = sv[ 0 ];
	sNeg[ 1 ] = sv[ 1 ];

	// CALL ZROT( K+2-ISTARTM+1, A(ISTARTM,K+1), 1, A(ISTARTM,K), 1, C, S )
	zrot(( ( k + 2 ) - istartm ) + 1, A, strideA1, offsetA + ( istartm * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA1, offsetA + ( istartm * strideA1 ) + ( k * strideA2 ), c, sNeg);

	// CALL ZROT( K-ISTARTM+1, B(ISTARTM,K+1), 1, B(ISTARTM,K), 1, C, S )
	zrot(( k - istartm ) + 1, B, strideB1, offsetB + ( istartm * strideB1 ) + ( ( k + 1 ) * strideB2 ), B, strideB1, offsetB + ( istartm * strideB1 ) + ( k * strideB2 ), c, sNeg);

	if ( ilz ) {
		// CALL ZROT( NZ, Z(1, K+1-ZSTART+1), 1, Z(1, K-ZSTART+1), 1, C, S )
		// 0-based Z columns: k+1-zstart and k-zstart
		zrot(nz, Z, strideZ1, offsetZ + ( ( ( k + 1 ) - zstart ) * strideZ2 ), Z, strideZ1, offsetZ + ( ( k - zstart ) * strideZ2 ), c, sNeg);
	}

	// Apply transformation from the left.

	// CALL ZLARTG( A(K+1,K), A(K+2,K), C, S, TEMP )
	idx = ( offsetA + ( ( k + 1 ) * strideA1 ) + ( k * strideA2 ) ) * 2;
	copyComplex( Av, idx, fArr );
	copyComplex( Av, ( offsetA + ( ( k + 2 ) * strideA1 ) + ( k * strideA2 ) ) * 2, gArr );
	zlartg( fArr, 0, gArr, 0, cArr, 0, sArr, 0, rArr, 0 );
	c = cArr[ 0 ];

	// A(K+1,K) = TEMP
	Av[ idx ] = rv[ 0 ];
	Av[ idx + 1 ] = rv[ 1 ];

	// A(K+2,K) = 0
	idx = ( offsetA + ( ( k + 2 ) * strideA1 ) + ( k * strideA2 ) ) * 2;
	Av[ idx ] = 0.0;
	Av[ idx + 1 ] = 0.0;

	sNeg[ 0 ] = sv[ 0 ];
	sNeg[ 1 ] = sv[ 1 ];

	// CALL ZROT( ISTOPM-K, A(K+1,K+1), LDA, A(K+2,K+1), LDA, C, S )

	// Note: the stride is LDA (i.e. strideA2) because we walk along the row.
	zrot(istopm - k, A, strideA2, offsetA + ( ( k + 1 ) * strideA1 ) + ( ( k + 1 ) * strideA2 ), A, strideA2, offsetA + ( ( k + 2 ) * strideA1 ) + ( ( k + 1 ) * strideA2 ), c, sNeg);

	// CALL ZROT( ISTOPM-K, B(K+1,K+1), LDB, B(K+2,K+1), LDB, C, S )
	zrot(istopm - k, B, strideB2, offsetB + ( ( k + 1 ) * strideB1 ) + ( ( k + 1 ) * strideB2 ), B, strideB2, offsetB + ( ( k + 2 ) * strideB1 ) + ( ( k + 1 ) * strideB2 ), c, sNeg);

	if ( ilq ) {
		// CALL ZROT( NQ, Q(1,K+1-QSTART+1), 1, Q(1,K+2-QSTART+1), 1, C, DCONJG(S) )
		sNeg[ 0 ] = sv[ 0 ];
		sNeg[ 1 ] = -sv[ 1 ];
		zrot(nq, Q, strideQ1, offsetQ + ( ( ( k + 1 ) - qstart ) * strideQ2 ), Q, strideQ1, offsetQ + ( ( ( k + 2 ) - qstart ) * strideQ2 ), c, sNeg);
	}
}


// EXPORTS //

export default zlaqz1;
