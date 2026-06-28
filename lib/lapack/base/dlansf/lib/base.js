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

/* eslint-disable max-len, max-lines, max-lines-per-function, max-statements, max-depth, max-params, no-lonely-if */

// MODULES //

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Returns the value of the one-norm, Frobenius norm, infinity-norm, or the largest absolute value of any element of a real symmetric matrix stored in Rectangular Full Packed (RFP) format.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {string} transr - `'no-transpose'` or `'transpose'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - RFP array of length N*(N+1)/2
* @param {integer} strideA - stride for `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} WORK - workspace of length N (only for `'one-norm'`/`'inf-norm'` norms)
* @param {integer} strideWork - stride of WORK
* @param {NonNegativeInteger} offsetWork - starting index of WORK
* @returns {number} the norm value
*/
function dlansf( norm, transr, uplo, N, A, strideA, offsetA, WORK, strideWork, offsetWork ) {
	var ifm;
	var ilu;
	var noe;
	var lda;
	var sa;

	if ( N === 0 ) {
		return 0.0;
	}
	if ( N === 1 ) {
		return Math.abs( A[ offsetA ] );
	}

	sa = strideA;

	// Set noe = 1 if n is odd, 0 if even
	noe = ( N % 2 === 0 ) ? 0 : 1;

	// Set ifm = 1 when transr='no-transpose', 0 when 'transpose'
	ifm = ( transr === 'transpose' ) ? 0 : 1;

	// Set ilu = 0 when uplo='upper', 1 when 'lower'
	ilu = ( uplo === 'upper' ) ? 0 : 1;

	// Compute LDA (leading dimension of the RFP rectangle)
	if ( ifm === 1 ) {
		if ( noe === 1 ) {
			lda = N;
		} else {
			lda = N + 1;
		}
	} else {
		lda = Math.floor( ( N + 1 ) / 2 );
	}

	if ( norm === 'max' ) {
		return maxNorm();
	}
	if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		return oneNorm();
	}
	if ( norm === 'frobenius' ) {
		return frobeniusNorm();
	}
	return 0.0;

	/**
	* Returns the index into A for element (ii, jj) in the RFP rectangle.
	*
	* @private
	* @param {number} ii - row index
	* @param {number} jj - column index
	* @returns {number} index into A
	*/
	function ap( ii, jj ) {
		return offsetA + ( ( ii + ( jj * lda ) ) * sa );
	}

	/**
	* Returns the WORK array index.
	*
	* @private
	* @param {number} ii - logical index
	* @returns {number} WORK index
	*/
	function wi( ii ) {
		return offsetWork + ( ii * strideWork );
	}

	/**
	* Computes the max absolute value norm.
	*
	* @private
	* @returns {number} max norm
	*/
	function maxNorm() {
		var nrows;
		var ncols;
		var val;
		var tmp;
		var kk;
		var ii;
		var jj;

		kk = Math.floor( ( N + 1 ) / 2 );
		val = 0.0;

		if ( noe === 1 ) {
			nrows = ( ifm === 1 ) ? N : kk;
			ncols = ( ifm === 1 ) ? kk : N;
		} else {
			nrows = ( ifm === 1 ) ? ( N + 1 ) : kk;
			ncols = ( ifm === 1 ) ? kk : ( N + 1 );
		}

		for ( jj = 0; jj < ncols; jj++ ) {
			for ( ii = 0; ii < nrows; ii++ ) {
				tmp = Math.abs( A[ ap( ii, jj ) ] );
				if ( val < tmp || tmp !== tmp ) {
					val = tmp;
				}
			}
		}
		return val;
	}

	/**
	* Dispatches one-norm computation.
	*
	* @private
	* @returns {number} one norm
	*/
	function oneNorm() {
		if ( ifm === 1 ) {
			return oneNormNormal();
		}
		return oneNormTranspose();
	}

	/**
	* Dispatches Frobenius norm computation.
	*
	* @private
	* @returns {number} Frobenius norm
	*/
	function frobeniusNorm() {
		if ( ifm === 1 ) {
			return frobeniusNormal();
		}
		return frobeniusTranspose();
	}

	/**
	* One-norm for normal (non-transposed) RFP layout.
	*
	* @private
	* @returns {number} norm value
	*/
	function oneNormNormal() {
		var val;
		var tmp;
		var kk;
		var ab;
		var ss;
		var ii;
		var jj;
		var ll;

		kk = Math.floor( N / 2 );

		if ( noe === 1 ) {
			// N is odd
			if ( ilu === 0 ) {
				// Upper
				for ( ii = 0; ii < kk; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = 0; jj <= kk; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk + jj; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ii ) ] += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj + kk ) ] = ss + ab;
					if ( ii === kk + kk ) {
						break; // eslint-disable-line no-restricted-syntax
					}
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj ) ] += ab;
					ss = 0.0;
					for ( ll = jj + 1; ll < kk; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			} else {
				// Lower (ilu=1)
				kk += 1;
				for ( ii = kk; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = kk - 1; jj >= 0; jj-- ) {
					ss = 0.0;
					for ( ii = 0; ii <= jj - 2; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ii + kk ) ] += ab;
					}
					if ( jj > 0 ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ii + kk ) ] += ss;
						ii += 1;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj ) ] = ab;
					ss = 0.0;
					for ( ll = jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			}
		} else {
			// N is even
			if ( ilu === 0 ) {
				// Upper
				for ( ii = 0; ii < kk; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = 0; jj < kk; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk + jj; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ii ) ] += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj + kk ) ] = ss + ab;
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj ) ] += ab;
					ss = 0.0;
					for ( ll = jj + 1; ll < kk; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			} else {
				// Lower (ilu=1)
				for ( ii = kk; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = kk - 1; jj >= 0; jj-- ) {
					ss = 0.0;
					for ( ii = 0; ii < jj; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ii + kk ) ] += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss += ab;
					WORK[ wi( ii + kk ) ] += ss;
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( jj ) ] = ab;
					ss = 0.0;
					for ( ll = jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			}
		}
		return val;
	}

	/**
	* One-norm for transposed RFP layout.
	*
	* @private
	* @returns {number} norm value
	*/
	function oneNormTranspose() {
		var val;
		var tmp;
		var n1k;
		var kk;
		var ab;
		var ss;
		var ii;
		var jj;
		var ll;

		kk = Math.floor( N / 2 );

		if ( noe === 1 ) {
			// N is odd
			if ( ilu === 0 ) {
				// Upper
				n1k = kk;
				kk += 1;
				for ( ii = n1k; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = 0; jj < n1k; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii + n1k ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj ) ] = ss;
				}
				// Jj = n1k = kk - 1 is special
				ss = Math.abs( A[ ap( 0, jj ) ] );
				for ( ii = 1; ii < kk; ii++ ) {
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( ii + n1k ) ] += ab;
					ss += ab;
				}
				WORK[ wi( jj ) ] += ss;
				for ( jj = kk; jj < N; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii <= jj - kk - 1; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss += ab;
					WORK[ wi( jj - kk ) ] += ss;
					ii += 1;
					ss = Math.abs( A[ ap( ii, jj ) ] );
					for ( ll = jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ll ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			} else {
				// Lower (ilu=1)
				kk += 1;
				for ( ii = kk; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < jj; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss += ab;
					WORK[ wi( jj ) ] = ss;
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss = ab;
					for ( ll = kk + jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( kk + jj ) ] += ss;
				}
				// Jj = kk - 1 is special
				ss = 0.0;
				for ( ii = 0; ii <= kk - 2; ii++ ) {
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( ii ) ] += ab;
					ss += ab;
				}
				ab = Math.abs( A[ ap( ii, jj ) ] );
				ss += ab;
				WORK[ wi( ii ) ] = ss;
				for ( jj = kk; jj < N; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			}
		} else {
			// N is even
			if ( ilu === 0 ) {
				// Upper
				for ( ii = kk; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				for ( jj = 0; jj < kk; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii + kk ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj ) ] = ss;
				}
				// Jj = kk
				ab = Math.abs( A[ ap( 0, jj ) ] );
				ss = ab;
				for ( ii = 1; ii < kk; ii++ ) {
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( ii + kk ) ] += ab;
					ss += ab;
				}
				WORK[ wi( jj ) ] += ss;
				for ( jj = kk + 1; jj < N; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii <= jj - 2 - kk; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss += ab;
					WORK[ wi( jj - kk - 1 ) ] += ss;
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss = ab;
					for ( ll = jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ll ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj ) ] += ss;
				}
				// Jj = N
				ss = 0.0;
				for ( ii = 0; ii <= kk - 2; ii++ ) {
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( ii ) ] += ab;
					ss += ab;
				}
				ab = Math.abs( A[ ap( ii, jj ) ] );
				ss += ab;
				WORK[ wi( ii ) ] += ss;
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			} else {
				// Lower (ilu=1)
				for ( ii = kk; ii < N; ii++ ) {
					WORK[ wi( ii ) ] = 0.0;
				}
				// Jj = 0 is special
				ss = Math.abs( A[ ap( 0, 0 ) ] );
				for ( ii = 1; ii < kk; ii++ ) {
					ab = Math.abs( A[ ap( ii, 0 ) ] );
					WORK[ wi( ii + kk ) ] += ab;
					ss += ab;
				}
				WORK[ wi( kk ) ] += ss;
				for ( jj = 1; jj < kk; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii <= jj - 2; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss += ab;
					WORK[ wi( jj - 1 ) ] = ss;
					ii += 1;
					ab = Math.abs( A[ ap( ii, jj ) ] );
					ss = ab;
					for ( ll = kk + jj + 1; ll < N; ll++ ) {
						ii += 1;
						ab = Math.abs( A[ ap( ii, jj ) ] );
						ss += ab;
						WORK[ wi( ll ) ] += ab;
					}
					WORK[ wi( kk + jj ) ] += ss;
				}
				// Jj = kk is special
				ss = 0.0;
				for ( ii = 0; ii <= kk - 2; ii++ ) {
					ab = Math.abs( A[ ap( ii, jj ) ] );
					WORK[ wi( ii ) ] += ab;
					ss += ab;
				}
				ab = Math.abs( A[ ap( ii, jj ) ] );
				ss += ab;
				WORK[ wi( ii ) ] = ss;
				for ( jj = kk + 1; jj <= N; jj++ ) {
					ss = 0.0;
					for ( ii = 0; ii < kk; ii++ ) {
						ab = Math.abs( A[ ap( ii, jj ) ] );
						WORK[ wi( ii ) ] += ab;
						ss += ab;
					}
					WORK[ wi( jj - 1 ) ] += ss;
				}
				val = WORK[ offsetWork ];
				for ( ii = 1; ii < N; ii++ ) {
					tmp = WORK[ wi( ii ) ];
					if ( val < tmp || tmp !== tmp ) {
						val = tmp;
					}
				}
			}
		}
		return val;
	}

	/**
	* Frobenius norm for normal RFP layout.
	*
	* @private
	* @returns {number} Frobenius norm
	*/
	function frobeniusNormal() {
		var scl;
		var ssq;
		var res;
		var kk;
		var jj;

		kk = Math.floor( ( N + 1 ) / 2 );
		scl = 0.0;
		ssq = 1.0;

		if ( noe === 1 ) {
			if ( ilu === 0 ) {
				// Upper
				for ( jj = 0; jj <= kk - 3; jj++ ) {
					res = dlassq( kk - jj - 2, A, sa, offsetA + ( ( kk + jj + 1 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj < kk; jj++ ) {
					res = dlassq( kk + jj - 1, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk - 1, A, ( lda + 1 ) * sa, offsetA + ( kk * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( ( kk - 1 ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			} else {
				// Lower
				for ( jj = 0; jj < kk; jj++ ) {
					res = dlassq( N - jj - 1, A, sa, offsetA + ( ( jj + 1 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( ( 1 + jj ) * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk - 1, A, ( lda + 1 ) * sa, offsetA + ( lda * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			}
		} else {
			// N is even
			if ( ilu === 0 ) {
				// Upper
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( kk - jj - 1, A, sa, offsetA + ( ( kk + jj + 2 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj < kk; jj++ ) {
					res = dlassq( kk + jj, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( ( kk + 1 ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( kk * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			} else {
				// Lower
				for ( jj = 0; jj < kk; jj++ ) {
					res = dlassq( N - jj - 1, A, sa, offsetA + ( ( jj + 2 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 1; jj < kk; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + sa, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			}
		}
		return scl * Math.sqrt( ssq );
	}

	/**
	* Frobenius norm for transposed RFP layout.
	*
	* @private
	* @returns {number} Frobenius norm
	*/
	function frobeniusTranspose() {
		var scl;
		var ssq;
		var res;
		var kk;
		var jj;

		kk = Math.floor( ( N + 1 ) / 2 );
		scl = 0.0;
		ssq = 1.0;

		if ( noe === 1 ) {
			if ( ilu === 0 ) {
				// Upper
				for ( jj = 1; jj <= kk - 2; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( ( kk + jj ) * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( kk, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( kk - jj - 1, A, sa, offsetA + ( ( jj + 1 + ( ( jj + kk - 1 ) * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk - 1, A, ( lda + 1 ) * sa, offsetA + ( ( kk * lda ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( ( ( kk - 1 ) * lda ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			} else {
				// Lower
				for ( jj = 1; jj < kk; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = kk; jj < N; jj++ ) {
					res = dlassq( kk, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 3; jj++ ) {
					res = dlassq( kk - jj - 2, A, sa, offsetA + ( ( jj + 2 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk - 1, A, ( lda + 1 ) * sa, offsetA + sa, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			}
		} else {
			// N is even
			if ( ilu === 0 ) {
				// Upper
				for ( jj = 1; jj < kk; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( ( kk + 1 + jj ) * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj < kk; jj++ ) {
					res = dlassq( kk, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( kk - jj - 1, A, sa, offsetA + ( ( jj + 1 + ( ( jj + kk ) * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( ( ( kk + 1 ) * lda ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( ( kk * lda ) * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			} else {
				// Lower
				for ( jj = 1; jj < kk; jj++ ) {
					res = dlassq( jj, A, sa, offsetA + ( ( ( jj + 1 ) * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = kk + 1; jj <= N; jj++ ) {
					res = dlassq( kk, A, sa, offsetA + ( ( jj * lda ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				for ( jj = 0; jj <= kk - 2; jj++ ) {
					res = dlassq( kk - jj - 1, A, sa, offsetA + ( ( jj + 1 + ( jj * lda ) ) * sa ), scl, ssq );
					scl = res.scl;
					ssq = res.sumsq;
				}
				ssq += ssq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA + ( lda * sa ), scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
				res = dlassq( kk, A, ( lda + 1 ) * sa, offsetA, scl, ssq );
				scl = res.scl;
				ssq = res.sumsq;
			}
		}
		return scl * Math.sqrt( ssq );
	}
}


// EXPORTS //

export default dlansf;
