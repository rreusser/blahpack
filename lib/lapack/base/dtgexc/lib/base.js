/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dtgex2 from '../../dtgex2/lib/base.js';


// MAIN //

/**
* Reorders the generalized real Schur decomposition of a real matrix pair (A, B), using an orthogonal equivalence transformation, so that the diagonal block of (A, B) with row index IFST is moved to row ILST.
*
* ## Notes
*
* -   (A, B) must be in generalized real Schur canonical form (as output by DGGES), i.e., A is block upper triangular with 1-by-1 and 2-by-2 diagonal blocks. B is upper triangular.
* -   Optionally the matrices Q and Z of generalized Schur vectors are updated: `Q^T * A * Z = S` and `Q^T * B * Z = T`.
* -   IFST and ILST are 0-based. They may be adjusted on return when they point to the second row of a 2-by-2 block.
*
* @private
* @param {boolean} wantq - whether to update the matrix Q
* @param {boolean} wantz - whether to update the matrix Z
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {Float64Array} A - upper quasi-triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - upper triangular matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - orthogonal matrix (updated if wantq is true)
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - orthogonal matrix (updated if wantz is true)
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {integer} ifst - row index of the block to move (0-based)
* @param {integer} ilst - target row index (0-based)
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {integer} lwork - length of the workspace array
* @returns {Object} result object with `info`, `ifst`, and `ilst` properties
*/
function dtgexc( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	var nbnext;
	var info;
	var here;
	var nbf;
	var nbl;

	info = 0;

	// Quick return if possible...
	if ( N <= 1 ) {
		return {
			'info': 0,
			'ifst': ifst,
			'ilst': ilst
		};
	}

	// Determine the first row of the specified block and find its structure (1x1 or 2x2).
	// If IFST points to the second row of a 2x2 block, adjust to point to the first row.
	if ( ifst > 0 ) {
		if ( A[ offsetA + ( ifst * strideA1 ) + ( ( ifst - 1 ) * strideA2 ) ] !== 0.0 ) {
			ifst -= 1;
		}
	}
	nbf = 1;
	if ( ifst < N - 1 ) {
		if ( A[ offsetA + ( ( ifst + 1 ) * strideA1 ) + ( ifst * strideA2 ) ] !== 0.0 ) {
			nbf = 2;
		}
	}

	// Determine the first row of the target block and find its structure.
	if ( ilst > 0 ) {
		if ( A[ offsetA + ( ilst * strideA1 ) + ( ( ilst - 1 ) * strideA2 ) ] !== 0.0 ) {
			ilst -= 1;
		}
	}
	nbl = 1;
	if ( ilst < N - 1 ) {
		if ( A[ offsetA + ( ( ilst + 1 ) * strideA1 ) + ( ilst * strideA2 ) ] !== 0.0 ) {
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
		// Move block forward (increasing index)...
		if ( nbf === 2 && nbl === 1 ) {
			ilst -= 1;
		}
		if ( nbf === 1 && nbl === 2 ) {
			ilst += 1;
		}

		here = ifst;

		while ( here < ilst ) {
			if ( nbf === 1 || nbf === 2 ) {
				// Current block is either 1x1 or 2x2...
				nbnext = 1;
				if ( here + nbf + 1 <= N - 1 ) {
					if ( A[ offsetA + ( ( here + nbf + 1 ) * strideA1 ) + ( ( here + nbf ) * strideA2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, nbf, nbnext, WORK, strideWork, offsetWork, lwork );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				here += nbnext;

				// Test if 2x2 block breaks into two 1x1 blocks...
				if ( nbf === 2 ) {
					if ( A[ offsetA + ( ( here + 1 ) * strideA1 ) + ( here * strideA2 ) ] === 0.0 ) {
						nbf = 3;
					}
				}
			} else {
				// Current block consists of two 1x1 blocks each of which must be swapped individually...
				nbnext = 1;
				if ( here + 3 <= N - 1 ) {
					if ( A[ offsetA + ( ( here + 3 ) * strideA1 ) + ( ( here + 2 ) * strideA2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here + 1, 1, nbnext, WORK, strideWork, offsetWork, lwork );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				if ( nbnext === 1 ) {
					// Swap two 1x1 blocks, no problems possible...
					info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, 1, WORK, strideWork, offsetWork, lwork );
					if ( info !== 0 ) {
						ilst = here;
						return {
							'info': info,
							'ifst': ifst,
							'ilst': ilst
						};
					}
					here += 1;
				} else {
					// Recompute NBNEXT in case 2x2 split...
					if ( A[ offsetA + ( ( here + 2 ) * strideA1 ) + ( ( here + 1 ) * strideA2 ) ] === 0.0 ) {
						nbnext = 1;
					}
					if ( nbnext === 2 ) {
						// 2x2 block did not split...
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, nbnext, WORK, strideWork, offsetWork, lwork );
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
						// 2x2 block did split...
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, 1, WORK, strideWork, offsetWork, lwork );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here += 1;
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, 1, WORK, strideWork, offsetWork, lwork );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here += 1;
					}
				}
			}
		}
	} else {
		// Move block backward (decreasing index)...
		here = ifst;

		while ( here > ilst ) {
			if ( nbf === 1 || nbf === 2 ) {
				// Current block is either 1x1 or 2x2...
				nbnext = 1;
				if ( here >= 2 ) {
					if ( A[ offsetA + ( ( here - 1 ) * strideA1 ) + ( ( here - 2 ) * strideA2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here - nbnext, nbnext, nbf, WORK, strideWork, offsetWork, lwork );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				here -= nbnext;

				// Test if 2x2 block breaks into two 1x1 blocks...
				if ( nbf === 2 ) {
					if ( A[ offsetA + ( ( here + 1 ) * strideA1 ) + ( here * strideA2 ) ] === 0.0 ) {
						nbf = 3;
					}
				}
			} else {
				// Current block consists of two 1x1 blocks each of which must be swapped individually...
				nbnext = 1;
				if ( here >= 2 ) {
					if ( A[ offsetA + ( ( here - 1 ) * strideA1 ) + ( ( here - 2 ) * strideA2 ) ] !== 0.0 ) {
						nbnext = 2;
					}
				}
				info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here - nbnext, nbnext, 1, WORK, strideWork, offsetWork, lwork );
				if ( info !== 0 ) {
					ilst = here;
					return {
						'info': info,
						'ifst': ifst,
						'ilst': ilst
					};
				}
				if ( nbnext === 1 ) {
					// Swap two 1x1 blocks, no problems possible...
					info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, nbnext, 1, WORK, strideWork, offsetWork, lwork );
					if ( info !== 0 ) {
						ilst = here;
						return {
							'info': info,
							'ifst': ifst,
							'ilst': ilst
						};
					}
					here -= 1;
				} else {
					// Recompute NBNEXT in case 2x2 split...
					if ( A[ offsetA + ( here * strideA1 ) + ( ( here - 1 ) * strideA2 ) ] === 0.0 ) {
						nbnext = 1;
					}
					if ( nbnext === 2 ) {
						// 2x2 block did not split...
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here - 1, 2, 1, WORK, strideWork, offsetWork, lwork );
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
						// 2x2 block did split...
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, 1, WORK, strideWork, offsetWork, lwork );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here -= 1;
						info = dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, here, 1, 1, WORK, strideWork, offsetWork, lwork );
						if ( info !== 0 ) {
							ilst = here;
							return {
								'info': info,
								'ifst': ifst,
								'ilst': ilst
							};
						}
						here -= 1;
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

export default dtgexc;
