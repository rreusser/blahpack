
/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/index.js';
import zlacpy from './../../../../lapack/base/zlacpy/lib/base.js';
import zlartg from './../../../../lapack/base/zlartg/lib/base.js';
import zlassq from './../../../../lapack/base/zlassq/lib/base.js';
import zrot from './../../../../lapack/base/zrot/lib/base.js';


// VARIABLES //

var TWENTY = 20.0;
var LDST = 2;


// FUNCTIONS //

/**
* Sets a complex value in a Complex128Array at the given offset.
*
* @private
* @param {Float64Array} v - reinterpreted Float64Array view
* @param {NonNegativeInteger} offset - Float64 index (i.e., 2*complex_offset)
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setAt( v, offset, re, im ) {
	v[ offset ] = re;
	v[ offset + 1 ] = im;
}


// MAIN //

/**
* Swaps adjacent diagonal 1-by-1 blocks in an upper triangular matrix pair.
* (A, B) by a unitary equivalence transformation.
*
* ## Notes
*
* -   j1 is 0-based (i.e. Fortran's 1-based J1 minus one).
*
* @private
* @param {boolean} wantq - whether to update the left transformation matrix Q
* @param {boolean} wantz - whether to update the right transformation matrix Z
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {Complex128Array} A - upper triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} B - upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Q - left transformation matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} Z - right transformation matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @param {integer} j1 - index of the first block to swap (0-based)
* @returns {integer} status code (0 = success, 1 = swap rejected)
*/
function ztgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1 ) { // eslint-disable-line max-len, max-params
	var negConjSZ;
	var threshb;
	var thresha;
	var conjSQ;
	var strong;
	var smlnum;
	var scale;
	var szArr;
	var sqArr;
	var negSQ;
	var WORK;
	var weak;
	var cdum;
	var eps;
	var sum;
	var res;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var Sv;
	var Tv;
	var Wv;
	var Av;
	var Bv;
	var fr;
	var fi;
	var gr;
	var gi;
	var cq;
	var cz;
	var sa;
	var sb;
	var oa;
	var ob;
	var sv;
	var ij;
	var M;
	var S;
	var T;
	var c;
	var f;
	var g;
	var s;
	var i;

	if ( N <= 1 ) {
		return 0;
	}

	M = LDST;
	weak = false;
	strong = false;

	// Local workspace: S(2,2), T(2,2), WORK(8) -- all complex
	S = new Complex128Array( LDST * LDST );
	T = new Complex128Array( LDST * LDST );
	WORK = new Complex128Array( 8 );

	Sv = reinterpret( S, 0 );
	Tv = reinterpret( T, 0 );
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );

	// Scratch arrays for zlartg
	f = new Complex128Array( 1 );
	g = new Complex128Array( 1 );
	c = new Float64Array( 1 );
	s = new Complex128Array( 1 );
	cdum = new Complex128Array( 1 );

	// Float64Array(2) buffers for zrot sine arguments
	szArr = new Float64Array( 2 );
	sqArr = new Float64Array( 2 );
	negConjSZ = new Float64Array( 2 );
	negSQ = new Float64Array( 2 );
	conjSQ = new Float64Array( 2 );

	// Float64 strides for direct indexing into reinterpreted views
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;

	// Copy 2x2 diagonal blocks: S = A(j1:j1+1, j1:j1+1), T = B(j1:j1+1, j1:j1+1)
	zlacpy( 'all', M, M, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), S, 1, LDST, 0 );
	zlacpy( 'all', M, M, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), T, 1, LDST, 0 );

	// Compute norms of S and T
	eps = dlamch( 'precision' );
	smlnum = dlamch( 'safe-minimum' ) / eps;

	// Copy S and T into WORK: WORK(0:3) = S, WORK(4:7) = T (in complex elements)
	zlacpy( 'all', M, M, S, 1, LDST, 0, WORK, 1, M, 0 );
	zlacpy( 'all', M, M, T, 1, LDST, 0, WORK, 1, M, M * M );

	// sa = Frobenius norm of S
	scale = 0.0;
	sum = 1.0;
	res = zlassq( M * M, WORK, 1, 0, scale, sum );
	sa = res.scl * Math.sqrt( res.sumsq );

	// sb = Frobenius norm of T
	scale = 0.0;
	sum = 1.0;
	res = zlassq( M * M, WORK, 1, M * M, scale, sum );
	sb = res.scl * Math.sqrt( res.sumsq );

	// Thresholds for weak and strong stability tests
	thresha = Math.max( TWENTY * eps * sa, smlnum );
	threshb = Math.max( TWENTY * eps * sb, smlnum );

	// S and T are stored column-major with LDST=2:

	//   S(1,1)=Sv[0,1], S(2,1)=Sv[2,3], S(1,2)=Sv[4,5], S(2,2)=Sv[6,7]

	// f = S(2,2)*T(1,1) - T(2,2)*S(1,1)
	fr = ( (Sv[6] * Tv[0]) - (Sv[7] * Tv[1]) ) - ( (Tv[6] * Sv[0]) - (Tv[7] * Sv[1]) );
	fi = ( (Sv[6] * Tv[1]) + (Sv[7] * Tv[0]) ) - ( (Tv[6] * Sv[1]) + (Tv[7] * Sv[0]) );

	// g = S(2,2)*T(1,2) - T(2,2)*S(1,2)
	gr = ( (Sv[6] * Tv[4]) - (Sv[7] * Tv[5]) ) - ( (Tv[6] * Sv[4]) - (Tv[7] * Sv[5]) );
	gi = ( (Sv[6] * Tv[5]) + (Sv[7] * Tv[4]) ) - ( (Tv[6] * Sv[5]) + (Tv[7] * Sv[4]) );

	// sa = |S(2,2)| * |T(1,1)|, sb = |S(1,1)| * |T(2,2)|
	sa = Math.sqrt( (Sv[6] * Sv[6]) + (Sv[7] * Sv[7]) ) * Math.sqrt( (Tv[0] * Tv[0]) + (Tv[1] * Tv[1]) );
	sb = Math.sqrt( (Sv[0] * Sv[0]) + (Sv[1] * Sv[1]) ) * Math.sqrt( (Tv[6] * Tv[6]) + (Tv[7] * Tv[7]) );

	// Compute column rotation: zlartg(G, F, CZ, SZ, CDUM)
	sv = reinterpret( f, 0 );
	setAt( sv, 0, gr, gi );
	sv = reinterpret( g, 0 );
	setAt( sv, 0, fr, fi );
	zlartg( f, 0, g, 0, c, 0, s, 0, cdum, 0 );
	cz = c[ 0 ];

	// SZ = -SZ
	sv = reinterpret( s, 0 );
	sv[ 0 ] = -sv[ 0 ];
	sv[ 1 ] = -sv[ 1 ];

	// Save SZ as Float64Array(2) for zrot: conj(SZ)
	szArr[ 0 ] = sv[ 0 ];
	szArr[ 1 ] = -sv[ 1 ]; // conjugate

	// -conj(SZ) for the strong test inverse rotation
	negConjSZ[ 0 ] = -szArr[ 0 ];
	negConjSZ[ 1 ] = -szArr[ 1 ];

	// Apply column rotation to S and T: ZROT(2, *(1,1), 1, *(1,2), 1, CZ, conj(SZ))
	zrot( 2, S, 1, 0, S, 1, LDST, cz, szArr );
	zrot( 2, T, 1, 0, T, 1, LDST, cz, szArr );

	// Refresh views after zrot (same buffer, but let's be explicit)
	Sv = reinterpret( S, 0 );
	Tv = reinterpret( T, 0 );

	// Compute row rotation: zlartg based on whichever has larger diagonal product
	if ( sa >= sb ) {
		// zlartg( S(1,1), S(2,1), CQ, SQ, CDUM )
		sv = reinterpret( f, 0 );
		setAt( sv, 0, Sv[ 0 ], Sv[ 1 ] );
		sv = reinterpret( g, 0 );
		setAt( sv, 0, Sv[ 2 ], Sv[ 3 ] );
	} else {
		// zlartg( T(1,1), T(2,1), CQ, SQ, CDUM )
		sv = reinterpret( f, 0 );
		setAt( sv, 0, Tv[ 0 ], Tv[ 1 ] );
		sv = reinterpret( g, 0 );
		setAt( sv, 0, Tv[ 2 ], Tv[ 3 ] );
	}
	zlartg( f, 0, g, 0, c, 0, s, 0, cdum, 0 );
	cq = c[ 0 ];
	sv = reinterpret( s, 0 );
	sqArr[ 0 ] = sv[ 0 ];
	sqArr[ 1 ] = sv[ 1 ];

	// -SQ for the strong test inverse rotation
	negSQ[ 0 ] = -sqArr[ 0 ];
	negSQ[ 1 ] = -sqArr[ 1 ];

	// conj(SQ) for Q update
	conjSQ[ 0 ] = sqArr[ 0 ];
	conjSQ[ 1 ] = -sqArr[ 1 ];

	// Apply row rotation to S and T: ZROT(2, *(1,1), LDST, *(2,1), LDST, CQ, SQ)
	zrot( 2, S, LDST, 0, S, LDST, 1, cq, sqArr );
	zrot( 2, T, LDST, 0, T, LDST, 1, cq, sqArr );

	// Weak stability test: |S(2,1)| <= thresha && |T(2,1)| <= threshb
	Sv = reinterpret( S, 0 );
	Tv = reinterpret( T, 0 );
	weak = ( Math.sqrt( (Sv[2] * Sv[2]) + (Sv[3] * Sv[3]) ) <= thresha ) &&
		( Math.sqrt( (Tv[2] * Tv[2]) + (Tv[3] * Tv[3]) ) <= threshb );

	if ( !weak ) {
		return 1;
	}

	// Strong stability test (WANDS = .TRUE.)
	// Reconstruct original blocks from rotated ones and check residual
	zlacpy( 'all', M, M, S, 1, LDST, 0, WORK, 1, M, 0 );
	zlacpy( 'all', M, M, T, 1, LDST, 0, WORK, 1, M, M * M );

	// Undo column rotation: ZROT(2, WORK(*,1), 1, WORK(*,2), 1, CZ, -conj(SZ))
	zrot( 2, WORK, 1, 0, WORK, 1, LDST, cz, negConjSZ );
	zrot( 2, WORK, 1, M * M, WORK, 1, (M * M) + LDST, cz, negConjSZ );

	// Undo row rotation: ZROT(2, WORK(1,*), M, WORK(2,*), M, CQ, -SQ)
	zrot( 2, WORK, M, 0, WORK, M, 1, cq, negSQ );
	zrot( 2, WORK, M, M * M, WORK, M, (M * M) + 1, cq, negSQ );

	// Subtract original A and B blocks from the reconstructed ones
	Wv = reinterpret( WORK, 0 );
	oa = ( offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ) ) * 2;
	ob = ( offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ) ) * 2;

	for ( i = 0; i < 2; i++ ) {
		// WORK(i,0) -= A(j1+i, j1)
		ij = 2 * i;
		Wv[ ij ] -= Av[ oa + ( i * sa1 ) ];
		Wv[ ij + 1 ] -= Av[ oa + ( i * sa1 ) + 1 ];

		// WORK(i,1) -= A(j1+i, j1+1)
		ij = 2 * ( LDST + i );
		Wv[ ij ] -= Av[ oa + ( i * sa1 ) + sa2 ];
		Wv[ ij + 1 ] -= Av[ oa + ( i * sa1 ) + sa2 + 1 ];

		// WORK(M*M+i,0) -= B(j1+i, j1)
		ij = 2 * ( (M * M) + i );
		Wv[ ij ] -= Bv[ ob + ( i * sb1 ) ];
		Wv[ ij + 1 ] -= Bv[ ob + ( i * sb1 ) + 1 ];

		// WORK(M*M+i,1) -= B(j1+i, j1+1)
		ij = 2 * ( (M * M) + LDST + i );
		Wv[ ij ] -= Bv[ ob + ( i * sb1 ) + sb2 ];
		Wv[ ij + 1 ] -= Bv[ ob + ( i * sb1 ) + sb2 + 1 ];
	}

	// Compute residual norms
	scale = 0.0;
	sum = 1.0;
	res = zlassq( M * M, WORK, 1, 0, scale, sum );
	sa = res.scl * Math.sqrt( res.sumsq );

	scale = 0.0;
	sum = 1.0;
	res = zlassq( M * M, WORK, 1, M * M, scale, sum );
	sb = res.scl * Math.sqrt( res.sumsq );

	strong = ( sa <= thresha ) && ( sb <= threshb );
	if ( !strong ) {
		return 1;
	}

	// Apply transformations to the full matrices
	// Fortran J1 is 1-based; our j1 is 0-based. Fortran count J1+1 = j1+2.

	// Column rotation on A and B: ZROT(j1+2, A(1,j1), 1, A(1,j1+1), 1, CZ, conj(SZ))
	zrot( j1 + 2, A, strideA1, offsetA + ( j1 * strideA2 ), A, strideA1, offsetA + ( ( j1 + 1 ) * strideA2 ), cz, szArr );
	zrot( j1 + 2, B, strideB1, offsetB + ( j1 * strideB2 ), B, strideB1, offsetB + ( ( j1 + 1 ) * strideB2 ), cz, szArr );

	// Row rotation on A and B: ZROT(N-j1, A(j1,j1), strideA2, A(j1+1,j1), strideA2, CQ, SQ)

	// Fortran count N-J1+1 with 1-based J1=j1+1 gives N-j1
	zrot( N - j1, A, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), A, strideA2, offsetA + ( ( j1 + 1 ) * strideA1 ) + ( j1 * strideA2 ), cq, sqArr );
	zrot( N - j1, B, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), B, strideB2, offsetB + ( ( j1 + 1 ) * strideB1 ) + ( j1 * strideB2 ), cq, sqArr );

	// Zero out the sub-diagonal entries: A(j1+1, j1) = 0, B(j1+1, j1) = 0
	oa = ( offsetA + ( ( j1 + 1 ) * strideA1 ) + ( j1 * strideA2 ) ) * 2;
	Av[ oa ] = 0.0;
	Av[ oa + 1 ] = 0.0;

	ob = ( offsetB + ( ( j1 + 1 ) * strideB1 ) + ( j1 * strideB2 ) ) * 2;
	Bv[ ob ] = 0.0;
	Bv[ ob + 1 ] = 0.0;

	// Update Z if requested: ZROT(N, Z(1,j1), 1, Z(1,j1+1), 1, CZ, conj(SZ))
	if ( wantz ) {
		zrot( N, Z, strideZ1, offsetZ + ( j1 * strideZ2 ), Z, strideZ1, offsetZ + ( ( j1 + 1 ) * strideZ2 ), cz, szArr );
	}

	// Update Q if requested: ZROT(N, Q(1,j1), 1, Q(1,j1+1), 1, CQ, conj(SQ))
	if ( wantq ) {
		zrot( N, Q, strideQ1, offsetQ + ( j1 * strideQ2 ), Q, strideQ1, offsetQ + ( ( j1 + 1 ) * strideQ2 ), cq, conjSQ );
	}

	return 0;
}


// EXPORTS //

export default ztgex2;
