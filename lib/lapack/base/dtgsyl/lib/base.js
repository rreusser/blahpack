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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dtgsy2 from '../../dtgsy2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Solves the generalized Sylvester equation (blocked):.
*
*   A_R - L_B = scale_C        (1)
_   D_R - L_E = scale_F
*
* or the transposed system (TRANS='transpose'):
*   A^T_R + D^T_L = scale_C    (3)
_   -R_B^T - L_E^T = scale_F
*
* where (A,D), (B,E), C, F are matrix pencils. (A,D) and (B,E) are in
* generalized real Schur form.
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {integer} ijob - job selector (0-4)
* @param {PositiveInteger} M - number of rows
* @param {PositiveInteger} N - number of columns
* @param {Float64Array} A - M-by-M upper quasi-triangular
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - N-by-N upper quasi-triangular
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} D - M-by-M upper triangular
* @param {integer} strideD1 - stride of the first dimension of D
* @param {integer} strideD2 - stride of the second dimension of D
* @param {NonNegativeInteger} offsetD - starting index for D
* @param {Float64Array} E - N-by-N upper triangular
* @param {integer} strideE1 - stride of the first dimension of E
* @param {integer} strideE2 - stride of the second dimension of E
* @param {NonNegativeInteger} offsetE - starting index for E
* @param {Float64Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F
* @param {integer} strideF2 - stride of the second dimension of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @param {Float64Array} scale - output: scale[0]
* @param {Float64Array} dif - output: dif[0] (for ijob >= 1)
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace size (ignored; auto-allocated internally)
* @param {Int32Array} IWORK - workspace of length M+N+6
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function dtgsyl( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork ) {
	var notran;
	var dscale;
	var scaloc;
	var scale2;
	var iround;
	var isolve;
	var ifunc;
	var SCALV;
	var DSUMV;
	var DSCLV;
	var linfo;
	var info;
	var ppqq;
	var dsum;
	var PQV;
	var is;
	var ie;
	var js;
	var je;
	var mb;
	var nb;
	var pq;
	var p;
	var q;
	var i;
	var j;
	var k;

	info = 0;
	notran = ( trans === 'no-transpose' );

	// Quick return
	if ( M === 0 || N === 0 ) {
		scale[ 0 ] = 1.0;
		if ( notran && ijob !== 0 ) {
			dif[ 0 ] = 0.0;
		}
		return info;
	}

	// Hardcoded block sizes (ILAENV equivalents)
	mb = 32;  // ILAENV(2, ...)
	nb = 32;  // ILAENV(5, ...)

	isolve = 1;
	ifunc = 0;
	if ( notran ) {
		if ( ijob >= 3 ) {
			ifunc = ijob - 2;
			dlaset( 'full', M, N, ZERO, ZERO, C, strideC1, strideC2, offsetC );
			dlaset( 'full', M, N, ZERO, ZERO, F, strideF1, strideF2, offsetF );
		} else if ( ijob >= 1 ) {
			isolve = 2;
		}
	}

	// Scalar output wrappers
	SCALV = new Float64Array( 1 );
	DSUMV = new Float64Array( 1 );
	DSCLV = new Float64Array( 1 );
	PQV = new Int32Array( 1 );

	// Check if unblocked path is sufficient
	if ( ( mb <= 1 && nb <= 1 ) || ( mb >= M && nb >= N ) ) {
		// Use unblocked code
		for ( iround = 0; iround < isolve; iround++ ) {
			DSCLV[ 0 ] = ZERO;
			DSUMV[ 0 ] = ONE;
			PQV[ 0 ] = 0;
			dtgsy2( trans, ifunc, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, SCALV, DSUMV, DSCLV, IWORK, strideIWork, offsetIWork, PQV);
			scale[ 0 ] = SCALV[ 0 ];
			dscale = DSCLV[ 0 ];
			dsum = DSUMV[ 0 ];
			pq = PQV[ 0 ];

			if ( dscale !== ZERO ) {
				if ( ijob === 1 || ijob === 3 ) {
					dif[ 0 ] = Math.sqrt( 2.0 * M * N ) / ( dscale * Math.sqrt( dsum ) );
				} else {
					dif[ 0 ] = Math.sqrt( pq ) / ( dscale * Math.sqrt( dsum ) );
				}
			}

			if ( isolve === 2 && iround === 0 ) {
				if ( notran ) {
					ifunc = ijob;
				}
				scale2 = scale[ 0 ];

				// Allocate WORK if needed
				if ( WORK === null || WORK.length < 2 * M * N ) {
					WORK = new Float64Array( 2 * M * N );
				}
				dlacpy( 'full', M, N, C, strideC1, strideC2, offsetC, WORK, 1, M, 0 );
				dlacpy( 'full', M, N, F, strideF1, strideF2, offsetF, WORK, 1, M, M * N );
				dlaset( 'full', M, N, ZERO, ZERO, C, strideC1, strideC2, offsetC );
				dlaset( 'full', M, N, ZERO, ZERO, F, strideF1, strideF2, offsetF );
			} else if ( isolve === 2 && iround === 1 ) {
				dlacpy( 'full', M, N, WORK, 1, M, 0, C, strideC1, strideC2, offsetC );
				dlacpy( 'full', M, N, WORK, 1, M, M * N, F, strideF1, strideF2, offsetF );
				scale[ 0 ] = scale2;
			}
		}
		return info;
	}

	// Blocked path: partition A into P row blocks and B into Q-P column blocks
	p = 0;
	i = 0;
	while ( i < M ) {
		IWORK[ offsetIWork + ( p * strideIWork ) ] = i;
		p += 1;
		i += mb;
		if ( i < M && A[ offsetA + ( i * strideA1 ) + ( ( i - 1 ) * strideA2 ) ] !== ZERO ) {
			i += 1;
		}
	}
	IWORK[ offsetIWork + ( p * strideIWork ) ] = M;
	if ( IWORK[ offsetIWork + ( ( p - 1 ) * strideIWork ) ] === M ) {
		p -= 1;
	}

	q = p;
	j = 0;
	while ( j < N ) {
		q += 1;
		IWORK[ offsetIWork + ( q * strideIWork ) ] = j;
		j += nb;
		if ( j < N && B[ offsetB + ( j * strideB1 ) + ( ( j - 1 ) * strideB2 ) ] !== ZERO ) {
			j += 1;
		}
	}
	IWORK[ offsetIWork + ( ( q + 1 ) * strideIWork ) ] = N;
	if ( IWORK[ offsetIWork + ( q * strideIWork ) ] === N ) {
		q -= 1;
	}

	if ( notran ) {
		for ( iround = 0; iround < isolve; iround++ ) {
			DSCLV[ 0 ] = ZERO;
			DSUMV[ 0 ] = ONE;
			pq = 0;
			scale[ 0 ] = ONE;

			for ( j = p + 1; j <= q; j++ ) {
				js = IWORK[ offsetIWork + ( j * strideIWork ) ];
				je = IWORK[ offsetIWork + ( ( j + 1 ) * strideIWork ) ] - 1;
				nb = je - js + 1;

				for ( i = p - 1; i >= 0; i-- ) {
					is = IWORK[ offsetIWork + ( i * strideIWork ) ];
					ie = IWORK[ offsetIWork + ( ( i + 1 ) * strideIWork ) ] - 1;
					mb = ie - is + 1;
					ppqq = 0;
					PQV[ 0 ] = 0;
					linfo = dtgsy2( trans, ifunc, mb, nb, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( is * strideA2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( js * strideB2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( is * strideD2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( js * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), SCALV, DSUMV, DSCLV, IWORK, strideIWork, offsetIWork + ( ( q + 2 ) * strideIWork ), PQV);
					if ( linfo > 0 ) {
						info = linfo;
					}
					scaloc = SCALV[ 0 ];
					ppqq = PQV[ 0 ];
					pq += ppqq;

					if ( scaloc !== ONE ) {
						for ( k = 0; k < js; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						for ( k = js; k <= je; k++ ) {
							dscal( is, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( is, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						for ( k = js; k <= je; k++ ) {
							dscal( M - ie - 1, scaloc, C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( k * strideC2 ) );
							dscal( M - ie - 1, scaloc, F, strideF1, offsetF + ( ( ie + 1 ) * strideF1 ) + ( k * strideF2 ) );
						}
						for ( k = je + 1; k < N; k++ ) {
							dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
							dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					// Update C and F
					if ( i > 0 ) {
						dgemm( 'no-transpose', 'no-transpose', is, nb, mb, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), ONE, C, strideC1, strideC2, offsetC + ( js * strideC2 ) );
						dgemm( 'no-transpose', 'no-transpose', is, nb, mb, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), ONE, F, strideF1, strideF2, offsetF + ( js * strideF2 ) );
					}
					if ( j < q ) {
						dgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), ONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						dgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
					}
				}
			}

			dscale = DSCLV[ 0 ];
			dsum = DSUMV[ 0 ];
			if ( dscale !== ZERO ) {
				if ( ijob === 1 || ijob === 3 ) {
					dif[ 0 ] = Math.sqrt( 2.0 * M * N ) / ( dscale * Math.sqrt( dsum ) );
				} else {
					dif[ 0 ] = Math.sqrt( pq ) / ( dscale * Math.sqrt( dsum ) );
				}
			}

			if ( isolve === 2 && iround === 0 ) {
				if ( notran ) {
					ifunc = ijob;
				}
				scale2 = scale[ 0 ];
				if ( WORK === null || WORK.length < 2 * M * N ) {
					WORK = new Float64Array( 2 * M * N );
				}
				dlacpy( 'full', M, N, C, strideC1, strideC2, offsetC, WORK, 1, M, 0 );
				dlacpy( 'full', M, N, F, strideF1, strideF2, offsetF, WORK, 1, M, M * N );
				dlaset( 'full', M, N, ZERO, ZERO, C, strideC1, strideC2, offsetC );
				dlaset( 'full', M, N, ZERO, ZERO, F, strideF1, strideF2, offsetF );
			} else if ( isolve === 2 && iround === 1 ) {
				dlacpy( 'full', M, N, WORK, 1, M, 0, C, strideC1, strideC2, offsetC );
				dlacpy( 'full', M, N, WORK, 1, M, M * N, F, strideF1, strideF2, offsetF );
				scale[ 0 ] = scale2;
			}
		}
	} else {
		// Transposed system
		scale[ 0 ] = ONE;

		for ( i = 0; i < p; i++ ) {
			is = IWORK[ offsetIWork + ( i * strideIWork ) ];
			ie = IWORK[ offsetIWork + ( ( i + 1 ) * strideIWork ) ] - 1;
			mb = ie - is + 1;

			for ( j = q; j >= p + 1; j-- ) {
				js = IWORK[ offsetIWork + ( j * strideIWork ) ];
				je = IWORK[ offsetIWork + ( ( j + 1 ) * strideIWork ) ] - 1;
				nb = je - js + 1;

				PQV[ 0 ] = 0;
				linfo = dtgsy2( trans, ifunc, mb, nb, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( is * strideA2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( js * strideB2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( is * strideD2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( js * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), SCALV, DSUMV, DSCLV, IWORK, strideIWork, offsetIWork + ( ( q + 2 ) * strideIWork ), PQV);
				if ( linfo > 0 ) {
					info = linfo;
				}
				scaloc = SCALV[ 0 ];

				if ( scaloc !== ONE ) {
					for ( k = 0; k < js; k++ ) {
						dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
						dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
					}
					for ( k = js; k <= je; k++ ) {
						dscal( is, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
						dscal( is, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
					}
					for ( k = js; k <= je; k++ ) {
						dscal( M - ie - 1, scaloc, C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( k * strideC2 ) );
						dscal( M - ie - 1, scaloc, F, strideF1, offsetF + ( ( ie + 1 ) * strideF1 ) + ( k * strideF2 ) );
					}
					for ( k = je + 1; k < N; k++ ) {
						dscal( M, scaloc, C, strideC1, offsetC + ( k * strideC2 ) );
						dscal( M, scaloc, F, strideF1, offsetF + ( k * strideF2 ) );
					}
					scale[ 0 ] *= scaloc;
				}

				if ( j > p + 1 ) {
					dgemm( 'no-transpose', 'transpose', mb, js, nb, ONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), B, strideB1, strideB2, offsetB + ( js * strideB2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
					dgemm( 'no-transpose', 'transpose', mb, js, nb, ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), E, strideE1, strideE2, offsetE + ( js * strideE2 ), ONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
				}
				if ( i < p - 1 ) {
					dgemm( 'transpose', 'no-transpose', M - ie - 1, nb, mb, -ONE, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), ONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					dgemm( 'transpose', 'no-transpose', M - ie - 1, nb, mb, -ONE, D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), ONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dtgsyl;
