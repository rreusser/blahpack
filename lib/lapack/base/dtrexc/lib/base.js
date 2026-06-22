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

import dlaexc from '../../dlaexc/lib/base.js';


// MAIN //

/**
* Reorders the real Schur factorization of a real matrix A = Q_T_Q^T, so that.
* the diagonal block of T with row index IFST is moved to row ILST.
*
* The real Schur form T is reordered by an orthogonal similarity transformation
* Z^T _ T _ Z, and optionally the matrix Q of Schur vectors is updated by
* postmultiplication with Z.
*
* T must be in Schur canonical form (as output by DHSEQR), that is, block
* upper triangular with 1-by-1 and 2-by-2 diagonal blocks; each 2-by-2
* diagonal block has its diagonal elements equal and its off-diagonal elements
* of opposite sign.
*
* Note: IFST and ILST are 1-based (Fortran convention). They may be adjusted
* on return when they point to the second row of a 2-by-2 block.
*
* @private
* @param {string} compq - `'update'` to update Q, `'none'` to not update Q
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - the upper quasi-triangular matrix
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - orthogonal matrix (updated if compq=`'update'`)
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {integer} ifst - row index of the block to move (1-based)
* @param {integer} ilst - target row index (1-based)
* @param {Float64Array} WORK - workspace of length N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {Object} { info, ifst, ilst }
*/
function dtrexc( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, ifst, ilst, WORK, strideWORK, offsetWORK ) {
	var nbnext;
	var wantq;
	var info;
	var here;
	var nbf;
	var nbl;

	info = 0;
	wantq = ( compq === 'update' );

	// Quick return
	if ( N <= 1 ) {
		return {
			'info': 0,
			'ifst': ifst,
			'ilst': ilst
		};
	}

	// Helper: 0-based access to T(i,j) where i,j are 1-based
	function tij( i, j ) {
		return offsetT + ( i - 1 ) * strideT1 + ( j - 1 ) * strideT2;
	}

	// Determine the first row of specified block and find out the size (NBF).
	if ( ifst > 1 ) {
		if ( T[ tij( ifst, ifst - 1 ) ] !== 0.0 ) {
			ifst -= 1;
		}
	}
	nbf = 1;
	if ( ifst < N ) {
		if ( T[ tij( ifst + 1, ifst ) ] !== 0.0 ) {
			nbf = 2;
		}
	}

	// Determine the first row of the final block and find out the size (NBL).
	if ( ilst > 1 ) {
		if ( T[ tij( ilst, ilst - 1 ) ] !== 0.0 ) {
			ilst -= 1;
		}
	}
	nbl = 1;
	if ( ilst < N ) {
		if ( T[ tij( ilst + 1, ilst ) ] !== 0.0 ) {
			nbl = 2;
		}
	}

	if ( ifst === ilst ) {
		return {
			'info': 0,
			'ifst': ifst,
			'ilst': ilst
		};
	}

	if ( ifst < ilst ) {
		// Move forward
		if ( nbf === 2 && nbl === 1 ) {
			ilst -= 1;
		}
		if ( nbf === 1 && nbl === 2 ) {
			ilst += 1;
		}

		here = ifst;

		while ( here < ilst ) {
			// Swap block at HERE with next one
			if ( nbf === 1 || nbf === 2 ) {
				// Current block has NBF rows
				nbnext = 1;
				if ( here + nbf + 1 <= N ) {
					if ( T[ tij( here + nbf + 1, here + nbf ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, nbf, nbnext, WORK, strideWORK, offsetWORK );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				here += nbnext;

				// Check if 2-by-2 block broke up
				if ( nbf === 2 ) {
					if ( T[ tij( here + 1, here ) ] === 0.0 ) {
						nbf = 3;
					}
				}
			} else {
				// Here we have NBF=3, meaning the original 2-by-2 block split into two 1-by-1
				nbnext = 1;
				if ( here + 3 <= N ) {
					if ( T[ tij( here + 3, here + 2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here + 1, 1, nbnext, WORK, strideWORK, offsetWORK );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				if ( nbnext === 1 ) {
					// Swap single with single
					info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, 1, nbnext, WORK, strideWORK, offsetWORK );
					here += 1;
				} else {
					// Recheck if 2-by-2 block is still intact
					if ( T[ tij( here + 2, here + 1 ) ] === 0.0 ) {
						nbnext = 1;
					}
					if ( nbnext === 2 ) {
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, 1, nbnext, WORK, strideWORK, offsetWORK );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here += 2;
					} else {
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, 1, 1, WORK, strideWORK, offsetWORK );
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here + 1, 1, 1, WORK, strideWORK, offsetWORK );
						here += 2;
					}
				}
			}
		}
	} else {
		// Move backward
		here = ifst;

		while ( here > ilst ) {
			if ( nbf === 1 || nbf === 2 ) {
				nbnext = 1;
				if ( here >= 3 ) {
					if ( T[ tij( here - 1, here - 2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here - nbnext, nbnext, nbf, WORK, strideWORK, offsetWORK );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				here -= nbnext;

				if ( nbf === 2 ) {
					if ( T[ tij( here + 1, here ) ] === 0.0 ) {
						nbf = 3;
					}
				}
			} else {
				nbnext = 1;
				if ( here >= 3 ) {
					if ( T[ tij( here - 1, here - 2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here - nbnext, nbnext, 1, WORK, strideWORK, offsetWORK );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				if ( nbnext === 1 ) {
					info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, nbnext, 1, WORK, strideWORK, offsetWORK );
					here -= 1;
				} else {
					if ( T[ tij( here, here - 1 ) ] === 0.0 ) {
						nbnext = 1;
					}
					if ( nbnext === 2 ) {
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here - 1, 2, 1, WORK, strideWORK, offsetWORK );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here -= 2;
					} else {
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here, 1, 1, WORK, strideWORK, offsetWORK );
						info = dlaexc( wantq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, here - 1, 1, 1, WORK, strideWORK, offsetWORK );
						here -= 2;
					}
				}
			}
		}
	}
	ilst = here;

	return {
		'info': 0,
		'ifst': ifst,
		'ilst': ilst
	};
}


// EXPORTS //

export default dtrexc;
