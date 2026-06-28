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

// VARIABLES //

var abs = Math.abs;
var min = Math.min;
var max = Math.max;


// MAIN //

/**
* Computes the number of eigenvalues of a symmetric tridiagonal matrix T.
* less than or equal to a given value, and performs bisection iteration.
*
* IJOB=1: Compute NAB for the initial intervals.
* IJOB=2: Perform bisection iteration to find eigenvalues of T.
* IJOB=3: Perform bisection iteration to invert N(w).
*
* @private
* @param {integer} ijob - specifies what is to be done (1, 2, or 3)
* @param {integer} nitmax - maximum number of bisection levels
* @param {NonNegativeInteger} N - dimension of the tridiagonal matrix
* @param {integer} mmax - maximum number of intervals
* @param {integer} minp - initial number of intervals
* @param {integer} nbmin - smallest number of intervals for vector loop
* @param {number} abstol - minimum absolute width of an interval
* @param {number} reltol - minimum relative width of an interval
* @param {number} pivmin - minimum absolute value of a pivot
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} E2 - squares of off-diagonal elements, length N
* @param {integer} strideE2 - stride for E2
* @param {NonNegativeInteger} offsetE2 - starting index for E2
* @param {Int32Array} NVAL - desired eigenvalue counts (IJOB=3 only)
* @param {integer} strideNVAL - stride for NVAL
* @param {NonNegativeInteger} offsetNVAL - starting index for NVAL
* @param {Float64Array} AB - interval endpoints, shape [MMAX, 2]
* @param {integer} strideAB1 - first dimension stride for AB
* @param {integer} strideAB2 - second dimension stride for AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} c - search points / midpoints
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - starting index for c
* @param {Int32Array} mout - output: number of eigenvalues/intervals (mout[0])
* @param {Int32Array} NAB - eigenvalue counts at interval endpoints, shape [MMAX, 2]
* @param {integer} strideNAB1 - first dimension stride for NAB
* @param {integer} strideNAB2 - second dimension stride for NAB
* @param {NonNegativeInteger} offsetNAB - starting index for NAB
* @param {Float64Array} WORK - workspace, length MMAX
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Int32Array} IWORK - workspace, length MMAX
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - starting index for IWORK
* @returns {integer} info: 0=all converged, 1..MMAX=non-converged count, MMAX+1=overflow
*/
function dlaebz( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, NVAL, strideNVAL, offsetNVAL, AB, strideAB1, strideAB2, offsetAB, c, strideC, offsetC, mout, NAB, strideNAB1, strideNAB2, offsetNAB, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	var klnew;
	var kfnew;
	var itmp1;
	var itmp2;
	var info;
	var tmp1;
	var tmp2;
	var jit;
	var kf;
	var kl;
	var ji;
	var jp;
	var j;

	// Check for errors
	info = 0;
	if ( ijob < 1 || ijob > 3 ) {
		return -1;
	}

	// IJOB=1: Compute the number of eigenvalues in the initial intervals
	if ( ijob === 1 ) {
		mout[ 0 ] = 0;
		for ( ji = 0; ji < minp; ji++ ) {
			for ( jp = 0; jp < 2; jp++ ) {
				// tmp1 = D(1) - AB(ji, jp)
				tmp1 = d[ offsetD ] - AB[ offsetAB + (ji * strideAB1) + (jp * strideAB2) ];
				if ( abs( tmp1 ) < pivmin ) {
					tmp1 = -pivmin;
				}
				NAB[ offsetNAB + (ji * strideNAB1) + (jp * strideNAB2) ] = 0;
				if ( tmp1 <= 0.0 ) {
					NAB[ offsetNAB + (ji * strideNAB1) + (jp * strideNAB2) ] = 1;
				}

				for ( j = 1; j < N; j++ ) {
					// tmp1 = D(j+1) - E2(j)/tmp1 - AB(ji, jp)
					tmp1 = d[ offsetD + (j * strideD) ] - E2[ offsetE2 + ((j - 1) * strideE2) ] / tmp1 - AB[ offsetAB + (ji * strideAB1) + (jp * strideAB2) ];
					if ( abs( tmp1 ) < pivmin ) {
						tmp1 = -pivmin;
					}
					if ( tmp1 <= 0.0 ) {
						NAB[ offsetNAB + (ji * strideNAB1) + (jp * strideNAB2) ] += 1;
					}
				}
			}
			mout[ 0 ] += NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] - NAB[ offsetNAB + (ji * strideNAB1) ];
		}
		return info;
	}

	// Initialize for loop
	// kf and kl are 0-based: intervals kf..kl-1 need refinement
	kf = 0;
	kl = minp;

	// If IJOB=2, initialize C (midpoints)
	if ( ijob === 2 ) {
		for ( ji = 0; ji < minp; ji++ ) {
			c[ offsetC + (ji * strideC) ] = 0.5 * ( AB[ offsetAB + (ji * strideAB1) ] + AB[ offsetAB + (ji * strideAB1) + strideAB2 ] );
		}
	}

	// Iteration loop
	for ( jit = 0; jit < nitmax; jit++ ) {
		// Loop over intervals
		if ( kl - kf >= nbmin && nbmin > 0 ) {
			// Parallel Version of the loop
			for ( ji = kf; ji < kl; ji++ ) {
				// Compute N(c), the number of eigenvalues less than c
				WORK[ offsetWork + (ji * strideWork) ] = d[ offsetD ] - c[ offsetC + (ji * strideC) ];
				IWORK[ offsetIWork + (ji * strideIWork) ] = 0;
				if ( WORK[ offsetWork + (ji * strideWork) ] <= pivmin ) {
					IWORK[ offsetIWork + (ji * strideIWork) ] = 1;
					WORK[ offsetWork + (ji * strideWork) ] = min( WORK[ offsetWork + (ji * strideWork) ], -pivmin );
				}

				for ( j = 1; j < N; j++ ) {
					WORK[ offsetWork + (ji * strideWork) ] = d[ offsetD + (j * strideD) ] - E2[ offsetE2 + ((j - 1) * strideE2) ] / WORK[ offsetWork + (ji * strideWork) ] - c[ offsetC + (ji * strideC) ];
					if ( WORK[ offsetWork + (ji * strideWork) ] <= pivmin ) {
						IWORK[ offsetIWork + (ji * strideIWork) ] += 1;
						WORK[ offsetWork + (ji * strideWork) ] = min( WORK[ offsetWork + (ji * strideWork) ], -pivmin );
					}
				}
			}

			if ( ijob <= 2 ) {
				// IJOB=2: Choose all intervals containing eigenvalues
				klnew = kl;
				for ( ji = kf; ji < kl; ji++ ) {
					// Ensure N(w) is monotone
					IWORK[ offsetIWork + (ji * strideIWork) ] = min(NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ], max( NAB[ offsetNAB + (ji * strideNAB1) ], IWORK[ offsetIWork + (ji * strideIWork) ] ));

					if ( IWORK[ offsetIWork + (ji * strideIWork) ] === NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] ) {
						// No eigenvalue in upper interval: use the lower interval
						AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = c[ offsetC + (ji * strideC) ];
					} else if ( IWORK[ offsetIWork + (ji * strideIWork) ] === NAB[ offsetNAB + (ji * strideNAB1) ] ) {
						// No eigenvalue in lower interval: use the upper interval
						AB[ offsetAB + (ji * strideAB1) ] = c[ offsetC + (ji * strideC) ];
					} else {
						klnew += 1;
						if ( klnew <= mmax ) {
							// Eigenvalue in both intervals -- add upper to queue
							// klnew is 1-based count here, so index is klnew-1
							AB[ offsetAB + ((klnew - 1) * strideAB1) + strideAB2 ] = AB[ offsetAB + (ji * strideAB1) + strideAB2 ];
							NAB[ offsetNAB + ((klnew - 1) * strideNAB1) + strideNAB2 ] = NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ];
							AB[ offsetAB + ((klnew - 1) * strideAB1) ] = c[ offsetC + (ji * strideC) ];
							NAB[ offsetNAB + ((klnew - 1) * strideNAB1) ] = IWORK[ offsetIWork + (ji * strideIWork) ];
							AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = c[ offsetC + (ji * strideC) ];
							NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] = IWORK[ offsetIWork + (ji * strideIWork) ];
						} else {
							info = mmax + 1;
						}
					}
				}
				if ( info !== 0 ) {
					mout[ 0 ] = kl;
					return info;
				}
				kl = klnew;
			} else {
				// IJOB=3: Binary search
				for ( ji = kf; ji < kl; ji++ ) {
					if ( IWORK[ offsetIWork + (ji * strideIWork) ] <= NVAL[ offsetNVAL + (ji * strideNVAL) ] ) {
						AB[ offsetAB + (ji * strideAB1) ] = c[ offsetC + (ji * strideC) ];
						NAB[ offsetNAB + (ji * strideNAB1) ] = IWORK[ offsetIWork + (ji * strideIWork) ];
					}
					if ( IWORK[ offsetIWork + (ji * strideIWork) ] >= NVAL[ offsetNVAL + (ji * strideNVAL) ] ) {
						AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = c[ offsetC + (ji * strideC) ];
						NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] = IWORK[ offsetIWork + (ji * strideIWork) ];
					}
				}
			}
		} else {
			// Serial Version of the loop
			klnew = kl;
			for ( ji = kf; ji < kl; ji++ ) {
				// Compute N(w), the number of eigenvalues less than w
				tmp1 = c[ offsetC + (ji * strideC) ];
				tmp2 = d[ offsetD ] - tmp1;
				itmp1 = 0;
				if ( tmp2 <= pivmin ) {
					itmp1 = 1;
					tmp2 = min( tmp2, -pivmin );
				}

				for ( j = 1; j < N; j++ ) {
					tmp2 = d[ offsetD + (j * strideD) ] - E2[ offsetE2 + ((j - 1) * strideE2) ] / tmp2 - tmp1;
					if ( tmp2 <= pivmin ) {
						itmp1 += 1;
						tmp2 = min( tmp2, -pivmin );
					}
				}

				if ( ijob <= 2 ) {
					// IJOB=2: Choose all intervals containing eigenvalues
					// Ensure N(w) is monotone
					itmp1 = min(NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ], max( NAB[ offsetNAB + (ji * strideNAB1) ], itmp1 ));

					if ( itmp1 === NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] ) {
						// No eigenvalue in upper interval
						AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = tmp1;
					} else if ( itmp1 === NAB[ offsetNAB + (ji * strideNAB1) ] ) {
						// No eigenvalue in lower interval
						AB[ offsetAB + (ji * strideAB1) ] = tmp1;
					} else if ( klnew < mmax ) {
						// Eigenvalue in both intervals -- add upper to queue
						klnew += 1;
						AB[ offsetAB + ((klnew - 1) * strideAB1) + strideAB2 ] = AB[ offsetAB + (ji * strideAB1) + strideAB2 ];
						NAB[ offsetNAB + ((klnew - 1) * strideNAB1) + strideNAB2 ] = NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ];
						AB[ offsetAB + ((klnew - 1) * strideAB1) ] = tmp1;
						NAB[ offsetNAB + ((klnew - 1) * strideNAB1) ] = itmp1;
						AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = tmp1;
						NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] = itmp1;
					} else {
						info = mmax + 1;
						mout[ 0 ] = kl;
						return info;
					}
				} else {
					// IJOB=3: Binary search
					if ( itmp1 <= NVAL[ offsetNVAL + (ji * strideNVAL) ] ) {
						AB[ offsetAB + (ji * strideAB1) ] = tmp1;
						NAB[ offsetNAB + (ji * strideNAB1) ] = itmp1;
					}
					if ( itmp1 >= NVAL[ offsetNVAL + (ji * strideNVAL) ] ) {
						AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = tmp1;
						NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] = itmp1;
					}
				}
			}
			kl = klnew;
		}

		// Check for convergence
		kfnew = kf;
		for ( ji = kf; ji < kl; ji++ ) {
			tmp1 = abs( AB[ offsetAB + (ji * strideAB1) + strideAB2 ] - AB[ offsetAB + (ji * strideAB1) ] );
			tmp2 = max( abs( AB[ offsetAB + (ji * strideAB1) + strideAB2 ] ), abs( AB[ offsetAB + (ji * strideAB1) ] ) );
			if ( tmp1 < max( abstol, pivmin, reltol * tmp2 ) ||
				NAB[ offsetNAB + (ji * strideNAB1) ] >= NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] ) {
				// Converged -- Swap with position kfnew, then increment kfnew
				if ( ji > kfnew ) {
					tmp1 = AB[ offsetAB + (ji * strideAB1) ];
					tmp2 = AB[ offsetAB + (ji * strideAB1) + strideAB2 ];
					itmp1 = NAB[ offsetNAB + (ji * strideNAB1) ];
					itmp2 = NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ];
					AB[ offsetAB + (ji * strideAB1) ] = AB[ offsetAB + (kfnew * strideAB1) ];
					AB[ offsetAB + (ji * strideAB1) + strideAB2 ] = AB[ offsetAB + (kfnew * strideAB1) + strideAB2 ];
					NAB[ offsetNAB + (ji * strideNAB1) ] = NAB[ offsetNAB + (kfnew * strideNAB1) ];
					NAB[ offsetNAB + (ji * strideNAB1) + strideNAB2 ] = NAB[ offsetNAB + (kfnew * strideNAB1) + strideNAB2 ];
					AB[ offsetAB + (kfnew * strideAB1) ] = tmp1;
					AB[ offsetAB + (kfnew * strideAB1) + strideAB2 ] = tmp2;
					NAB[ offsetNAB + (kfnew * strideNAB1) ] = itmp1;
					NAB[ offsetNAB + (kfnew * strideNAB1) + strideNAB2 ] = itmp2;
					if ( ijob === 3 ) {
						itmp1 = NVAL[ offsetNVAL + (ji * strideNVAL) ];
						NVAL[ offsetNVAL + (ji * strideNVAL) ] = NVAL[ offsetNVAL + (kfnew * strideNVAL) ];
						NVAL[ offsetNVAL + (kfnew * strideNVAL) ] = itmp1;
					}
				}
				kfnew += 1;
			}
		}
		kf = kfnew;

		// Choose Midpoints
		for ( ji = kf; ji < kl; ji++ ) {
			c[ offsetC + (ji * strideC) ] = 0.5 * ( AB[ offsetAB + (ji * strideAB1) ] + AB[ offsetAB + (ji * strideAB1) + strideAB2 ] );
		}

		// If no more intervals to refine, quit
		if ( kf >= kl ) {
			break;
		}
	}

	// Converged
	info = max( kl - kf, 0 );
	mout[ 0 ] = kl;
	return info;
}


// EXPORTS //

export default dlaebz;
