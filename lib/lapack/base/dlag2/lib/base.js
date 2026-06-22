/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, function-paren-newline, function-call-argument-newline */

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

var FUZZY1 = 1.00001;


// MAIN //

/**
* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.
*
* The scaling factor `s` results in a modified eigenvalue equation `s A - w B`
* where `s` is a non-negative scaling factor chosen so that `w`, `w B`, and
* `s A` do not overflow and, if possible, do not underflow, either.
*
* @private
* @param {Float64Array} A - input 2-by-2 matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input 2-by-2 upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {number} safmin - smallest positive number such that `1/safmin` does not overflow
* @returns {Object} object with fields: scale1, scale2, wr1, wr2, wi
*/
function dlag2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, safmin ) {
	var wscale;
	var safmax;
	var ascale;
	var bscale;
	var binv11;
	var binv22;
	var scale1;
	var scale2;
	var wsmall;
	var abi22;
	var anorm;
	var bnorm;
	var bsize;
	var rtmax;
	var rtmin;
	var shift;
	var discr;
	var wsize;
	var bmin;
	var diff;
	var wabs;
	var wbig;
	var wdet;
	var as11;
	var as12;
	var as22;
	var sum;
	var wr1;
	var wr2;
	var a11;
	var a12;
	var a21;
	var a22;
	var b11;
	var b12;
	var b22;
	var wi;
	var c1;
	var c2;
	var c3;
	var c4;
	var c5;
	var pp;
	var qq;
	var ss;
	var s1;
	var s2;
	var r;

	rtmin = Math.sqrt( safmin );
	rtmax = 1.0 / rtmin;
	safmax = 1.0 / safmin;

	// Scale A:
	anorm = Math.max(
		Math.abs( A[ offsetA ] ) + Math.abs( A[ offsetA + strideA1 ] ),
		Math.abs( A[ offsetA + strideA2 ] ) + Math.abs( A[ offsetA + strideA1 + strideA2 ] ),
		safmin
	);
	ascale = 1.0 / anorm;
	a11 = ascale * A[ offsetA ];
	a21 = ascale * A[ offsetA + strideA1 ];
	a12 = ascale * A[ offsetA + strideA2 ];
	a22 = ascale * A[ offsetA + strideA1 + strideA2 ];

	// Perturb B if necessary to ensure non-singularity:
	b11 = B[ offsetB ];
	b12 = B[ offsetB + strideB2 ];
	b22 = B[ offsetB + strideB1 + strideB2 ];
	bmin = rtmin * Math.max( Math.abs( b11 ), Math.abs( b12 ), Math.abs( b22 ), rtmin );
	if ( Math.abs( b11 ) < bmin ) {
		b11 = Math.abs( bmin ) * ( ( b11 >= 0.0 ) ? 1.0 : -1.0 ); // SIGN(BMIN, B11)
	}
	if ( Math.abs( b22 ) < bmin ) {
		b22 = Math.abs( bmin ) * ( ( b22 >= 0.0 ) ? 1.0 : -1.0 ); // SIGN(BMIN, B22)
	}

	// Scale B:
	bnorm = Math.max( Math.abs( b11 ), Math.abs( b12 ) + Math.abs( b22 ), safmin );
	bsize = Math.max( Math.abs( b11 ), Math.abs( b22 ) );
	bscale = 1.0 / bsize;
	b11 *= bscale;
	b12 *= bscale;
	b22 *= bscale;

	// Compute larger eigenvalue (AS is A shifted by -SHIFT*B):
	binv11 = 1.0 / b11;
	binv22 = 1.0 / b22;
	s1 = a11 * binv11;
	s2 = a22 * binv22;
	if ( Math.abs( s1 ) <= Math.abs( s2 ) ) {
		as12 = a12 - (s1 * b12);
		as22 = a22 - (s1 * b22);
		ss = a21 * ( binv11 * binv22 );
		abi22 = (as22 * binv22) - (ss * b12);
		pp = 0.5 * abi22;
		shift = s1;
	} else {
		as12 = a12 - (s2 * b12);
		as11 = a11 - (s2 * b11);
		ss = a21 * ( binv11 * binv22 );
		abi22 = -(ss * b12);
		pp = 0.5 * ( (as11 * binv11) + abi22 );
		shift = s2;
	}
	qq = ss * as12;

	// Overflow guard: requires |pp| >= 1/sqrt(safmin) ~ 1e154
	if ( Math.abs( pp * rtmin ) >= 1.0 ) {
		discr = ( (rtmin * pp) * (rtmin * pp) ) + (qq * safmin);
		r = Math.sqrt( Math.abs( discr ) ) * rtmax;
	} else if ( (pp * pp) + Math.abs( qq ) <= safmin ) {
		discr = ( (rtmax * pp) * (rtmax * pp) ) + (qq * safmax);
		r = Math.sqrt( Math.abs( discr ) ) * rtmin;
	} else {
		discr = (pp * pp) + qq;
		r = Math.sqrt( Math.abs( discr ) );
	}

	// Note: the test of R below covers the case when DISCR is small,
	// Negative, and flushed to zero during the calculation of R.
	if ( discr >= 0.0 || r === 0.0 ) {
		// Real eigenvalues:
		sum = pp + ( Math.abs( r ) * ( ( pp >= 0.0 ) ? 1.0 : -1.0 ) ); // SIGN(R, PP)
		diff = pp - ( Math.abs( r ) * ( ( pp >= 0.0 ) ? 1.0 : -1.0 ) ); // SIGN(R, PP)
		wbig = shift + sum;

		// Compute smaller eigenvalue:
		wsmall = shift + diff;
		if ( 0.5 * Math.abs( wbig ) > Math.max( Math.abs( wsmall ), safmin ) ) {
			wdet = ( (a11 * a22) - (a12 * a21) ) * ( binv11 * binv22 );
			wsmall = wdet / wbig;
		}

		// Choose (real) eigenvalue closest to 2,2 element of `A*B**(-1)` for WR1:
		if ( pp > abi22 ) {
			wr1 = Math.min( wbig, wsmall );
			wr2 = Math.max( wbig, wsmall );
		} else {
			wr1 = Math.max( wbig, wsmall );
			wr2 = Math.min( wbig, wsmall );
		}
		wi = 0.0;
	} else {
		// Complex eigenvalues:
		wr1 = shift + pp;
		wr2 = wr1;
		wi = r;
	}

	// Further scaling to avoid underflow and overflow in computing
	// SCALE1 and overflow in computing `w*B`.
	c1 = bsize * ( safmin * Math.max( 1.0, ascale ) );
	c2 = safmin * Math.max( 1.0, bnorm );
	c3 = bsize * safmin;
	if ( ascale <= 1.0 && bsize <= 1.0 ) {
		c4 = Math.min( 1.0, ( ascale / safmin ) * bsize );
	} else {
		c4 = 1.0;
	}
	if ( ascale <= 1.0 || bsize <= 1.0 ) {
		c5 = Math.min( 1.0, ascale * bsize );
	} else {
		c5 = 1.0;
	}

	// Scale first eigenvalue:
	wabs = Math.abs( wr1 ) + Math.abs( wi );
	wsize = Math.max(
		safmin,
		c1,
		FUZZY1 * ( (wabs * c2) + c3 ),
		Math.min( c4, 0.5 * Math.max( wabs, c5 ) )
	);
	if ( wsize === 1.0 ) {
		scale1 = ascale * bsize;
		scale2 = scale1;
	} else {
		wscale = 1.0 / wsize;
		if ( wsize > 1.0 ) {
			scale1 = ( Math.max( ascale, bsize ) * wscale ) * Math.min( ascale, bsize );
		} else {
			scale1 = ( Math.min( ascale, bsize ) * wscale ) * Math.max( ascale, bsize );
		}
		wr1 *= wscale;
		if ( wi !== 0.0 ) {
			wi *= wscale;
			wr2 = wr1;
			scale2 = scale1;
		}
	}

	// Scale second eigenvalue (if real):
	if ( wi === 0.0 ) {
		wsize = Math.max(
			safmin,
			c1,
			FUZZY1 * ( (Math.abs( wr2 ) * c2) + c3 ),
			Math.min( c4, 0.5 * Math.max( Math.abs( wr2 ), c5 ) )
		);
		if ( wsize === 1.0 ) {
			scale2 = ascale * bsize;
		} else {
			wscale = 1.0 / wsize;
			if ( wsize > 1.0 ) {
				scale2 = ( Math.max( ascale, bsize ) * wscale ) * Math.min( ascale, bsize );
			} else {
				scale2 = ( Math.min( ascale, bsize ) * wscale ) * Math.max( ascale, bsize );
			}
			wr2 *= wscale;
		}
	}

	return {
		'scale1': scale1,
		'scale2': scale2,
		'wr1': wr1,
		'wr2': wr2,
		'wi': wi
	};
}


// EXPORTS //

export default dlag2;
