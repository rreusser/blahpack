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

var BLKLEN = 128;


// MAIN //

/**
* Computes the Sturm count, i.e. the number of negative pivots arising from the factorization `T - sigma*I = L*D*L^T` of a symmetric tridiagonal matrix.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal of the original LDL^T factorization (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} LLD - `(N-1)` elements `L(i)*L(i)*D(i)`
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {number} sigma - shift amount
* @param {number} pivmin - minimum pivot allowed (unused in reference body)
* @param {integer} r - twist index for the twisted factorization (1-based; the twist occurs at position `r`)
* @returns {integer} Sturm count (number of negative pivots)
*/
function dlaneg( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, sigma, pivmin, r ) { // eslint-disable-line max-len, max-params, no-unused-vars
	var dminus;
	var negcnt;
	var sawnan;
	var dplus;
	var gamma;
	var bsav;
	var neg1;
	var neg2;
	var bjj;
	var tmp;
	var bj;
	var jj;
	var j;
	var p;
	var t;

	negcnt = 0;

	// I) Upper part: L D L^T - sigma I = L+ D+ L+^T
	t = -sigma;
	for ( bj = 1; bj <= r - 1; bj += BLKLEN ) {
		neg1 = 0;
		bsav = t;
		bjj = ( bj + BLKLEN - 1 < r - 1 ) ? bj + BLKLEN - 1 : r - 1;
		for ( j = bj; j <= bjj; j++ ) {
			jj = j - 1; // 0-based logical index into d/LLD
			dplus = d[ offsetD + ( jj * strideD ) ] + t;
			if ( dplus < 0.0 ) {
				neg1 += 1;
			}
			tmp = t / dplus;
			t = ( tmp * LLD[ offsetLLD + ( jj * strideLLD ) ] ) - sigma;
		}
		sawnan = ( t !== t );

		// Run a slower version of the above loop if a NaN is detected. Only NaNs from the factorization are handled here; NaNs in the input must be propagated.
		if ( sawnan ) {
			neg1 = 0;
			t = bsav;
			for ( j = bj; j <= bjj; j++ ) {
				jj = j - 1;
				dplus = d[ offsetD + ( jj * strideD ) ] + t;
				if ( dplus < 0.0 ) {
					neg1 += 1;
				}
				tmp = t / dplus;
				if ( tmp !== tmp ) {
					tmp = 1.0;
				}
				t = ( tmp * LLD[ offsetLLD + ( jj * strideLLD ) ] ) - sigma;
			}
		}
		negcnt += neg1;
	}

	// II) Lower part: L D L^T - sigma I = U- D- U-^T
	p = d[ offsetD + ( ( N - 1 ) * strideD ) ] - sigma;
	for ( bj = N - 1; bj >= r; bj -= BLKLEN ) {
		neg2 = 0;
		bsav = p;
		bjj = ( bj - BLKLEN + 1 > r ) ? bj - BLKLEN + 1 : r;
		for ( j = bj; j >= bjj; j-- ) {
			jj = j - 1;
			dminus = LLD[ offsetLLD + ( jj * strideLLD ) ] + p;
			if ( dminus < 0.0 ) {
				neg2 += 1;
			}
			tmp = p / dminus;
			p = ( tmp * d[ offsetD + ( jj * strideD ) ] ) - sigma;
		}
		sawnan = ( p !== p );
		if ( sawnan ) {
			neg2 = 0;
			p = bsav;
			for ( j = bj; j >= bjj; j-- ) {
				jj = j - 1;
				dminus = LLD[ offsetLLD + ( jj * strideLLD ) ] + p;
				if ( dminus < 0.0 ) {
					neg2 += 1;
				}
				tmp = p / dminus;
				if ( tmp !== tmp ) {
					tmp = 1.0;
				}
				p = ( tmp * d[ offsetD + ( jj * strideD ) ] ) - sigma;
			}
		}
		negcnt += neg2;
	}

	// III) Twist index
	gamma = ( t + sigma ) + p;
	if ( gamma < 0.0 ) {
		negcnt += 1;
	}

	return negcnt;
}


// EXPORTS //

export default dlaneg;
