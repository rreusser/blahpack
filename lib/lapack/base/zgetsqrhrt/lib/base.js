/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlatsqr from './../../zlatsqr/lib/base.js';
import zungtsqrRow from './../../zungtsqr_row/lib/base.js';
import zunhrCol from './../../zunhr_col/lib/base.js';


// MAIN //

/**
* Computes a column-blocked QR factorization of a complex `M`-by-`N` matrix `A` using TSQR followed by Householder reconstruction.
*
* ## Notes
*
* -   Computes `A = Q * R` where the output `Q` and `R` factors are stored in the same format as `zgeqrt` (`Q` in blocked compact `WY`-representation).
* -   Internally performs an `mb1`-row, `nb1`-column blocked TSQR factorization (`zlatsqr`), reconstructs the orthonormal columns of `Q` (`zungtsqr_row`), and recovers the Householder vectors and block reflector factor `T` (`zunhr_col`). The R-factor from TSQR is then sign-corrected to match the Householder QR.
* -   Requires `M >= N`, `mb1 > N`, `nb1 >= 1`, `nb2 >= 1`. Leading dimensions of `T` must satisfy `LDT >= max(1, min(nb2, N))`.
* -   `WORK` is a caller-provided complex workspace partitioned into three contiguous segments: (a) the TSQR `T` array of length `LWT` (leading dim `ldwt = min(nb1,N)`), (b) an `N`-by-`N` scratch matrix holding the TSQR `R` factor (also reused as the `zlatsqr` scratch during step 1), and (c) workspace for `zungtsqr_row` (size `lw2 = nb1local * max(nb1local, N - nb1local)`). Required total complex `WORK` length: `LWT + N*N + lw2`, where `nb1local = min(nb1, N)`, `num_all_row_blocks = max(1, ceil((M-N)/(mb1-N)))`, and `LWT = num_all_row_blocks * N * nb1local`.
* -   `RWORK` is a caller-provided real workspace holding the diagonal sign vector `D` for `zunhr_col`; required length `N`.
*
* @private
* @param {NonNegativeInteger} M - number of rows of the matrix `A` (`M >= N`)
* @param {NonNegativeInteger} N - number of columns of the matrix `A`
* @param {PositiveInteger} mb1 - row block size for the internal TSQR (`mb1 > N`)
* @param {PositiveInteger} nb1 - column block size for the internal TSQR (`nb1 >= 1`)
* @param {PositiveInteger} nb2 - block size for the output blocked QR (`nb2 >= 1`)
* @param {Complex128Array} A - input/output matrix (column-major). On exit, the upper-triangular part contains `R` and the strictly lower part contains the Householder vectors `V` (compact `WY` representation).
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} T - output upper-triangular block reflector factors, stored as a sequence of `min(nb2,N)`-by-`min(nb2,N)` blocks of leading dimension `min(nb2,N)`
* @param {integer} strideT1 - stride of the first dimension of `T`
* @param {integer} strideT2 - stride of the second dimension of `T`
* @param {NonNegativeInteger} offsetT - starting index for `T`
* @param {Complex128Array} WORK - complex workspace array (see Notes for layout and required length)
* @param {integer} strideWork - stride length for `WORK` (must be `1`; `WORK` is treated as a contiguous column-major scratch buffer)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Float64Array} RWORK - real workspace array of length `N` (diagonal sign vector `D`)
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} status code (`0` = success)
*/
function zgetsqrhrt( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let numBlocks, ar, ai, oA, oR, i, j;

	// Quick return if possible.
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	const nb1local = ( nb1 < N ) ? nb1 : N;
	const nb2local = ( nb2 < N ) ? nb2 : N;

	// NUM_ALL_ROW_BLOCKS = max(1, ceil((M-N)/(mb1-N))). Safe because the caller guarantees mb1 > N.
	if ( M > N ) {
		numBlocks = Math.ceil( ( M - N ) / ( mb1 - N ) );
		if ( numBlocks < 1 ) {
			numBlocks = 1;
		}
	} else {
		numBlocks = 1;
	}

	// Workspace partitioning within the caller-provided WORK buffer (matches the Fortran reference):
	//   Twork = nb1local-by-(numBlocks*N) tile of T-blocks for zlatsqr (leading dim ldwt = nb1local), at offsetWork.
	//   Rwork = N-by-N scratch holding R_tsqr column-by-column, at oWR (also reused as the zlatsqr scratch during step 1).
	//   WORK2 = zungtsqr_row scratch (size lw2), at oWD.
	// The diagonal-sign vector D for zunhr_col lives in the real RWORK buffer.
	const ldwt = nb1local;
	const lwt = numBlocks * N * nb1local;

	// Offset (within WORK) of the temporary N-by-N R buffer.
	const oWR = offsetWork + ( lwt * strideWork );

	// Offset (within WORK) of the zungtsqr_row scratch segment.
	const oWD = oWR + ( N * N * strideWork );

	// (1) Perform TSQR-factorization of the M-by-N matrix A. The TSQR T array lives at WORK[offsetWork..] (leading dim ldwt); the zlatsqr scratch is placed in the N-by-N R region at oWR (not yet populated).
	zlatsqr( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, WORK, strideWork, ldwt * strideWork, offsetWork, WORK, strideWork, oWR );

	// (2) Copy R_tsqr (upper-triangular part of A) into the square N-by-N matrix Rwork column-by-column.
	for ( j = 0; j < N; j++ ) {
		// Zcopy of length j+1 from A(:, j) -> Rwork(:, j).
		zcopy( j + 1, A, strideA1, offsetA + ( j * strideA2 ), WORK, strideWork, oWR + ( j * N * strideWork ) );
	}

	// (3) Generate the M-by-N matrix Q with orthonormal columns from the result stored below the diagonal in A (in place). The zungtsqr_row scratch (size lw2) lives at WORK[oWD..].
	zungtsqrRow( M, N, mb1, nb1local, A, strideA1, strideA2, offsetA, WORK, strideWork, ldwt * strideWork, offsetWork, WORK, strideWork, oWD );

	// (4) Reconstruct Householder vectors from the matrix Q (stored in A) in place; produces V (in A), the block reflector T, and the diagonal sign vector D (written into RWORK).
	zunhrCol( M, N, nb2local, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, RWORK, strideRWork, offsetRWork );

	// (5) and (6): Combined loop. Copy R_tsqr from Rwork back into the upper-triangular part of A while applying the diagonal sign correction R_hr = S * R_tsqr.

	// D[i] is +/- 1; when D[i] === -1, negate row i of R during the copy.
	const Av = reinterpret( A, 0 );
	const Rv = reinterpret( WORK, 0 );
	for ( i = 0; i < N; i++ ) {
		if ( RWORK[ offsetRWork + ( i * strideRWork ) ] === -1.0 ) {
			// Row i needs negation: A(i, j) = -R_tsqr(i, j) for j = i..N-1.
			for ( j = i; j < N; j++ ) {
				oA = 2 * ( offsetA + ( i * strideA1 ) + ( j * strideA2 ) );
				oR = 2 * ( oWR + ( ( ( j * N ) + i ) * strideWork ) );
				ar = Rv[ oR ];
				ai = Rv[ oR + 1 ];
				Av[ oA ] = -ar;
				Av[ oA + 1 ] = -ai;
			}
		} else {
			// D[i] === +1: copy R_tsqr row i into A row i unchanged. Length = N - i. Source stride is N (across columns of Rwork), dest stride is strideA2 (across columns of A).
			zcopy( N - i, WORK, N * strideWork, oWR + ( ( ( i * N ) + i ) * strideWork ), A, strideA2, offsetA + ( i * strideA1 ) + ( i * strideA2 ) );
		}
	}

	return 0;
}


// EXPORTS //

export default zgetsqrhrt;
