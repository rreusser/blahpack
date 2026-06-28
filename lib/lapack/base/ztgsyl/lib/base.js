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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import ztgsy2 from '../../ztgsy2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Solves the generalized Sylvester equation (blocked).
*
* If TRANS = 'no-transpose', solves (1):
*
* ```text
* A*R - L*B = scale*C
* D*R - L*E = scale*F
* ```
*
* If TRANS = 'conjugate-transpose', solves (3):
*
* ```text
* A^H*R + D^H*L = scale*C
* -R*B^H - L*E^H = scale*F
* ```
*
* where (A,D), (B,E), C, F are matrix pencils. (A,D) and (B,E) are in
* generalized (complex) Schur form.
*
* @private
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {integer} ijob - job selector (0-4)
* @param {PositiveInteger} M - number of rows
* @param {PositiveInteger} N - number of columns
* @param {Complex128Array} A - M-by-M upper triangular
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Complex128Array} B - N-by-N upper triangular
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Complex128Array} C - M-by-N right-hand side / solution
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Complex128Array} D - M-by-M upper triangular
* @param {integer} strideD1 - stride of the first dimension of D
* @param {integer} strideD2 - stride of the second dimension of D
* @param {NonNegativeInteger} offsetD - starting index for D
* @param {Complex128Array} E - N-by-N upper triangular
* @param {integer} strideE1 - stride of the first dimension of E
* @param {integer} strideE2 - stride of the second dimension of E
* @param {NonNegativeInteger} offsetE - starting index for E
* @param {Complex128Array} F - M-by-N right-hand side / solution
* @param {integer} strideF1 - stride of the first dimension of F
* @param {integer} strideF2 - stride of the second dimension of F
* @param {NonNegativeInteger} offsetF - starting index for F
* @param {Float64Array} scale - output: scale[0]
* @param {Float64Array} dif - output: dif[0] (for ijob >= 1)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace size (ignored; auto-allocated internally)
* @param {Int32Array} IWORK - workspace of length M+N+6
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info - 0 if successful
*/
function ztgsyl( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, dif, WORK, strideWork, offsetWork, lwork, IWORK, strideIWork, offsetIWork ) {
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
	var dsum;
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
	mb = 32; // ILAENV(2, ...)
	nb = 32; // ILAENV(5, ...)

	isolve = 1;
	ifunc = 0;
	if ( notran ) {
		if ( ijob >= 3 ) {
			ifunc = ijob - 2;
			zlaset( 'full', M, N, CZERO, CZERO, C, strideC1, strideC2, offsetC );
			zlaset( 'full', M, N, CZERO, CZERO, F, strideF1, strideF2, offsetF );
		} else if ( ijob >= 1 ) {
			isolve = 2;
		}
	}

	// Scalar output wrappers
	SCALV = new Float64Array( 1 );
	DSUMV = new Float64Array( 1 );
	DSCLV = new Float64Array( 1 );

	// Check if unblocked path is sufficient
	if ( ( mb <= 1 && nb <= 1 ) || ( mb >= M && nb >= N ) ) {
		// Use unblocked code
		for ( iround = 0; iround < isolve; iround++ ) {
			DSCLV[ 0 ] = ZERO;
			DSUMV[ 0 ] = ONE;
			scale[ 0 ] = ONE;
			linfo = ztgsy2( trans, ifunc, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, SCALV, DSUMV, DSCLV );
			scale[ 0 ] = SCALV[ 0 ];
			dscale = DSCLV[ 0 ];
			dsum = DSUMV[ 0 ];

			if ( dscale !== ZERO ) {
				if ( ijob === 1 || ijob === 3 ) {
					dif[ 0 ] = Math.sqrt( 2.0 * M * N ) / ( dscale * Math.sqrt( dsum ) );
				} else {
					dif[ 0 ] = Math.sqrt( M * N ) / ( dscale * Math.sqrt( dsum ) );
				}
			}

			if ( isolve === 2 && iround === 0 ) {
				if ( notran ) {
					ifunc = ijob;
				}
				scale2 = scale[ 0 ];

				// Allocate WORK if needed
				if ( WORK === null || WORK.length < 2 * M * N ) {
					WORK = new Complex128Array( 2 * M * N );
				}
				zlacpy( 'full', M, N, C, strideC1, strideC2, offsetC, WORK, 1, M, 0 );
				zlacpy( 'full', M, N, F, strideF1, strideF2, offsetF, WORK, 1, M, M * N );
				zlaset( 'full', M, N, CZERO, CZERO, C, strideC1, strideC2, offsetC );
				zlaset( 'full', M, N, CZERO, CZERO, F, strideF1, strideF2, offsetF );
			} else if ( isolve === 2 && iround === 1 ) {
				zlacpy( 'full', M, N, WORK, 1, M, 0, C, strideC1, strideC2, offsetC );
				zlacpy( 'full', M, N, WORK, 1, M, M * N, F, strideF1, strideF2, offsetF );
				scale[ 0 ] = scale2;
			}
		}
		return info;
	}

	// Blocked path: partition A into P row blocks and B into Q-P column blocks
	// Complex Schur form: only 1x1 diagonal blocks (no quasi-triangular 2x2)
	p = 0;
	i = 0;
	while ( i < M ) {
		IWORK[ offsetIWork + ( p * strideIWork ) ] = i;
		p += 1;
		i += mb;
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
					linfo = ztgsy2( trans, ifunc, mb, nb, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( is * strideA2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( js * strideB2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( is * strideD2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( js * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), SCALV, DSUMV, DSCLV );
					if ( linfo > 0 ) {
						info = linfo;
					}
					scaloc = SCALV[ 0 ];
					pq += mb * nb;

					if ( scaloc !== ONE ) {
						for ( k = 0; k < js; k++ ) {
							zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
							zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
						}
						for ( k = js; k <= je; k++ ) {
							zscal( is, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
							zscal( is, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
						}
						for ( k = js; k <= je; k++ ) {
							zscal( M - ie - 1, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( k * strideC2 ) );
							zscal( M - ie - 1, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( ( ie + 1 ) * strideF1 ) + ( k * strideF2 ) );
						}
						for ( k = je + 1; k < N; k++ ) {
							zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
							zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
						}
						scale[ 0 ] *= scaloc;
					}

					// Update C and F
					if ( i > 0 ) {
						zgemm( 'no-transpose', 'no-transpose', is, nb, mb, CNEGONE, A, strideA1, strideA2, offsetA + ( is * strideA2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), CONE, C, strideC1, strideC2, offsetC + ( js * strideC2 ) );
						zgemm( 'no-transpose', 'no-transpose', is, nb, mb, CNEGONE, D, strideD1, strideD2, offsetD + ( is * strideD2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), CONE, F, strideF1, strideF2, offsetF + ( js * strideF2 ) );
					}
					if ( j < q ) {
						zgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( ( je + 1 ) * strideB2 ), CONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( ( je + 1 ) * strideC2 ) );
						zgemm( 'no-transpose', 'no-transpose', mb, N - je - 1, nb, CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( ( je + 1 ) * strideE2 ), CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( ( je + 1 ) * strideF2 ) );
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
					WORK = new Complex128Array( 2 * M * N );
				}
				zlacpy( 'full', M, N, C, strideC1, strideC2, offsetC, WORK, 1, M, 0 );
				zlacpy( 'full', M, N, F, strideF1, strideF2, offsetF, WORK, 1, M, M * N );
				zlaset( 'full', M, N, CZERO, CZERO, C, strideC1, strideC2, offsetC );
				zlaset( 'full', M, N, CZERO, CZERO, F, strideF1, strideF2, offsetF );
			} else if ( isolve === 2 && iround === 1 ) {
				zlacpy( 'full', M, N, WORK, 1, M, 0, C, strideC1, strideC2, offsetC );
				zlacpy( 'full', M, N, WORK, 1, M, M * N, F, strideF1, strideF2, offsetF );
				scale[ 0 ] = scale2;
			}
		}
	} else {
		// Conjugate-transposed system
		scale[ 0 ] = ONE;

		for ( i = 0; i < p; i++ ) {
			is = IWORK[ offsetIWork + ( i * strideIWork ) ];
			ie = IWORK[ offsetIWork + ( ( i + 1 ) * strideIWork ) ] - 1;
			mb = ie - is + 1;

			for ( j = q; j >= p + 1; j-- ) {
				js = IWORK[ offsetIWork + ( j * strideIWork ) ];
				je = IWORK[ offsetIWork + ( ( j + 1 ) * strideIWork ) ] - 1;
				nb = je - js + 1;

				linfo = ztgsy2( trans, ifunc, mb, nb, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( is * strideA2 ), B, strideB1, strideB2, offsetB + ( js * strideB1 ) + ( js * strideB2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( is * strideD2 ), E, strideE1, strideE2, offsetE + ( js * strideE1 ) + ( js * strideE2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), SCALV, DSUMV, DSCLV );
				if ( linfo > 0 ) {
					info = linfo;
				}
				scaloc = SCALV[ 0 ];

				if ( scaloc !== ONE ) {
					for ( k = 0; k < js; k++ ) {
						zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
						zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
					}
					for ( k = js; k <= je; k++ ) {
						zscal( is, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
						zscal( is, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
					}
					for ( k = js; k <= je; k++ ) {
						zscal( M - ie - 1, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( ( ie + 1 ) * strideC1 ) + ( k * strideC2 ) );
						zscal( M - ie - 1, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( ( ie + 1 ) * strideF1 ) + ( k * strideF2 ) );
					}
					for ( k = je + 1; k < N; k++ ) {
						zscal( M, new Complex128( scaloc, ZERO ), C, strideC1, offsetC + ( k * strideC2 ) );
						zscal( M, new Complex128( scaloc, ZERO ), F, strideF1, offsetF + ( k * strideF2 ) );
					}
					scale[ 0 ] *= scaloc;
				}

				if ( j > p + 1 ) {
					zgemm( 'no-transpose', 'conjugate-transpose', mb, js, nb, CONE, C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), B, strideB1, strideB2, offsetB + ( js * strideB2 ), CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
					zgemm( 'no-transpose', 'conjugate-transpose', mb, js, nb, CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), E, strideE1, strideE2, offsetE + ( js * strideE2 ), CONE, F, strideF1, strideF2, offsetF + ( is * strideF1 ) );
				}
				if ( i < p - 1 ) {
					zgemm( 'conjugate-transpose', 'no-transpose', M - ie - 1, nb, mb, CNEGONE, A, strideA1, strideA2, offsetA + ( is * strideA1 ) + ( ( ie + 1 ) * strideA2 ), C, strideC1, strideC2, offsetC + ( is * strideC1 ) + ( js * strideC2 ), CONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
					zgemm( 'conjugate-transpose', 'no-transpose', M - ie - 1, nb, mb, CNEGONE, D, strideD1, strideD2, offsetD + ( is * strideD1 ) + ( ( ie + 1 ) * strideD2 ), F, strideF1, strideF2, offsetF + ( is * strideF1 ) + ( js * strideF2 ), CONE, C, strideC1, strideC2, offsetC + ( ( ie + 1 ) * strideC1 ) + ( js * strideC2 ) );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default ztgsyl;
