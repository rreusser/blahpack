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

import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dspmv from '../../../../blas/base/dspmv/lib/base.js';
import dspr2 from '../../../../blas/base/dspr2/lib/base.js';
import dtpmv from '../../../../blas/base/dtpmv/lib/base.js';
import dtpsv from '../../../../blas/base/dtpsv/lib/base.js';


// MAIN //

/**
* Reduces a real symmetric-definite generalized eigenproblem to standard form, using packed storage.
*
* If `itype = 1`, the problem is `A*x = lambda*B*x`,
* and A is overwritten by `inv(U^T)*A*inv(U)` or `inv(L)*A*inv(L^T)`.
*
* If `itype = 2` or `3`, the problem is `A*B*x = lambda*x` or `B*A*x = lambda*x`,
* and A is overwritten by `U*A*U^T` or `L^T*A*L`.
*
* B must have been previously factorized as `U^T*U` or `L*L^T` by `dpptrf`.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} AP - input/output symmetric matrix in packed storage
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} BP - triangular factor from Cholesky factorization of B in packed storage
* @param {integer} strideBP - stride length for `BP`
* @param {NonNegativeInteger} offsetBP - starting index for `BP`
* @returns {integer} info - 0 if successful
*/
function dspgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP ) {
	var upper;
	var k1k1;
	var j1j1;
	var ajj;
	var akk;
	var bjj;
	var bkk;
	var oap;
	var obp;
	var sap;
	var sbp;
	var ct;
	var jj;
	var kk;
	var j1;
	var k1;
	var j;
	var k;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	sap = strideAP;
	sbp = strideBP;
	oap = offsetAP;
	obp = offsetBP;

	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U^T)*A*inv(U)
			// JJ is 0-based index of A(j,j) in packed upper storage
			jj = 0;
			for ( j = 1; j <= N; j++ ) {
				j1 = jj;         // 0-based index of A(1,j) = start of column j
				jj += j;    // 0-based index of A(j,j) = end of column j (exclusive of next)

				// jj-1 is the 0-based index of the diagonal A(j,j)

				// j1 is the 0-based index of A(1,j)

				// Actually: in Fortran, JJ = JJ + J makes JJ point to A(J,J).

				// After loop: JJ = j*(j+1)/2  (1-based), so JJ-1 = j*(j+1)/2 - 1 (0-based diag index)

				// j1 (0-based) = JJ - j = (j-1)*j/2  (0-based index of A(1,j))

				bjj = BP[ obp + ( ( jj - 1 ) * sbp ) ];

				// DTPSV( 'U', 'Transpose', 'Nonunit', j, BP, AP(J1), 1 )

				// Solves U^T * x = AP(j1:jj), where x replaces AP(j1:jj)
				dtpsv( uplo, 'transpose', 'non-unit', j, BP, sbp, obp, AP, sap, oap + ( j1 * sap ) );

				// DSPMV( 'U', j-1, -1, AP, BP(J1), 1, 1, AP(J1), 1 )

				// Y = -1*A*BP(j1:jj-2) + 1*AP(j1:jj-2), where A is the (j-1)x(j-1) leading submatrix
				if ( j - 1 > 0 ) {
					dspmv( uplo, j - 1, -1.0, AP, sap, oap, BP, sbp, obp + ( j1 * sbp ), 1.0, AP, sap, oap + ( j1 * sap ) );
				}

				// DSCAL( j-1, 1/bjj, AP(J1), 1 )
				if ( j - 1 > 0 ) {
					dscal( j - 1, 1.0 / bjj, AP, sap, oap + ( j1 * sap ) );
				}

				// AP(JJ) = ( AP(JJ) - DDOT(j-1, AP(J1), 1, BP(J1), 1) ) / bjj
				AP[ oap + ( ( jj - 1 ) * sap ) ] = ( AP[ oap + ( ( jj - 1 ) * sap ) ] - ( ( j - 1 > 0 ) ? ddot( j - 1, AP, sap, oap + ( j1 * sap ), BP, sbp, obp + ( j1 * sbp ) ) : 0.0 ) ) / bjj;
			}
		} else {
			// Compute inv(L)*A*inv(L^T)
			// KK is 0-based index of A(k,k) in packed lower storage
			kk = 0;
			for ( k = 1; k <= N; k++ ) {
				k1k1 = kk + N - k + 1; // 0-based index of A(k+1,k+1)

				akk = AP[ oap + ( kk * sap ) ];
				bkk = BP[ obp + ( kk * sbp ) ];
				akk /= ( bkk * bkk );
				AP[ oap + ( kk * sap ) ] = akk;
				if ( k < N ) {
					// DSCAL( N-K, 1/BKK, AP(KK+1), 1 )
					dscal( N - k, 1.0 / bkk, AP, sap, oap + ( ( kk + 1 ) * sap ) );

					ct = -0.5 * akk;

					// DAXPY( N-K, CT, BP(KK+1), 1, AP(KK+1), 1 )
					daxpy( N - k, ct, BP, sbp, obp + ( ( kk + 1 ) * sbp ), AP, sap, oap + ( ( kk + 1 ) * sap ) );

					// DSPR2( 'L', N-K, -1, AP(KK+1), 1, BP(KK+1), 1, AP(K1K1) )
					dspr2( uplo, N - k, -1.0, AP, sap, oap + ( ( kk + 1 ) * sap ), BP, sbp, obp + ( ( kk + 1 ) * sbp ), AP, sap, oap + ( k1k1 * sap ) );

					// DAXPY( N-K, CT, BP(KK+1), 1, AP(KK+1), 1 )
					daxpy( N - k, ct, BP, sbp, obp + ( ( kk + 1 ) * sbp ), AP, sap, oap + ( ( kk + 1 ) * sap ) );

					// DTPSV( 'L', 'No transpose', 'Non-unit', N-K, BP(K1K1), AP(KK+1), 1 )
					dtpsv( uplo, 'no-transpose', 'non-unit', N - k, BP, sbp, obp + ( k1k1 * sbp ), AP, sap, oap + ( ( kk + 1 ) * sap ) );
				}
				kk = k1k1;
			}
		}
	} else if ( upper ) {
		// Compute U*A*U^T
		// KK is 0-based index of A(k,k) in packed upper storage
		kk = 0;
		for ( k = 1; k <= N; k++ ) {
			k1 = kk;          // 0-based index of A(1,k)
			kk += k;     // after: kk-1 is 0-based index of A(k,k)

			akk = AP[ oap + ( ( kk - 1 ) * sap ) ];
			bkk = BP[ obp + ( ( kk - 1 ) * sbp ) ];

			// DTPMV( 'U', 'No transpose', 'Non-unit', k-1, BP, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				dtpmv( uplo, 'no-transpose', 'non-unit', k - 1, BP, sbp, obp, AP, sap, oap + ( k1 * sap ) );
			}

			ct = 0.5 * akk;

			// DAXPY( k-1, CT, BP(K1), 1, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				daxpy( k - 1, ct, BP, sbp, obp + ( k1 * sbp ), AP, sap, oap + ( k1 * sap ) );
			}

			// DSPR2( 'U', k-1, 1, AP(K1), 1, BP(K1), 1, AP )
			if ( k - 1 > 0 ) {
				dspr2( uplo, k - 1, 1.0, AP, sap, oap + ( k1 * sap ), BP, sbp, obp + ( k1 * sbp ), AP, sap, oap );
			}

			// DAXPY( k-1, CT, BP(K1), 1, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				daxpy( k - 1, ct, BP, sbp, obp + ( k1 * sbp ), AP, sap, oap + ( k1 * sap ) );
			}

			// DSCAL( k-1, BKK, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				dscal( k - 1, bkk, AP, sap, oap + ( k1 * sap ) );
			}

			// AP(KK) = AKK * BKK^2
			AP[ oap + ( ( kk - 1 ) * sap ) ] = akk * bkk * bkk;
		}
	} else {
		// Compute L^T*A*L
		// JJ is 0-based index of A(j,j) in packed lower storage
		jj = 0;
		for ( j = 1; j <= N; j++ ) {
			j1j1 = jj + N - j + 1; // 0-based index of A(j+1,j+1)

			ajj = AP[ oap + ( jj * sap ) ];
			bjj = BP[ obp + ( jj * sbp ) ];

			// AP(JJ) = AJJ*BJJ + DDOT( N-J, AP(JJ+1), 1, BP(JJ+1), 1 )
			AP[ oap + ( jj * sap ) ] = ( ajj * bjj ) + ( ( N - j > 0 ) ? ddot( N - j, AP, sap, oap + ( ( jj + 1 ) * sap ), BP, sbp, obp + ( ( jj + 1 ) * sbp ) ) : 0.0 ); // eslint-disable-line max-len

			// DSCAL( N-J, BJJ, AP(JJ+1), 1 )
			if ( N - j > 0 ) {
				dscal( N - j, bjj, AP, sap, oap + ( ( jj + 1 ) * sap ) );
			}

			// DSPMV( 'L', N-J, 1, AP(J1J1), BP(JJ+1), 1, 1, AP(JJ+1), 1 )
			if ( N - j > 0 ) {
				dspmv( uplo, N - j, 1.0, AP, sap, oap + ( j1j1 * sap ), BP, sbp, obp + ( ( jj + 1 ) * sbp ), 1.0, AP, sap, oap + ( ( jj + 1 ) * sap ) ); // eslint-disable-line max-len
			}

			// DTPMV( 'L', 'Transpose', 'Non-unit', N-J+1, BP(JJ), AP(JJ), 1 )
			dtpmv( uplo, 'transpose', 'non-unit', N - j + 1, BP, sbp, obp + ( jj * sbp ), AP, sap, oap + ( jj * sap ) ); // eslint-disable-line max-len

			jj = j1j1;
		}
	}
	return 0;
}


// EXPORTS //

export default dspgst;
