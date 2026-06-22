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

var EPS = 1.1102230246251565e-16; // DLAMCH('EPS') = 2^-53


// FUNCTIONS //

/**
* Returns |a| with the sign of b (Fortran SIGN intrinsic).
*
* @private
* @param {number} a - magnitude source
* @param {number} b - sign source
* @returns {number} |a| * sign(b)
*/
function sign( a, b ) {
	var mag = Math.abs( a );

	// Fortran SIGN: if b >= 0 return +|a|, if b < 0 return -|a|
	// Note: SIGN(x, -0.0) returns -|x| in Fortran, but JS doesn't distinguish -0 < 0.

	// We handle -0 via Object.is for correctness:
	if ( b > 0.0 || ( b === 0.0 && !Object.is( b, -0.0 ) ) ) {
		return mag;
	}
	return -mag;
}


// MAIN //

/**
* Computes the singular value decomposition of a 2-by-2 triangular matrix:.
*
* \[ F  G \]
* \[ 0  H \]
*
* On return, abs(SSMAX) is the larger singular value, abs(SSMIN) is the
* smaller singular value, and (CSL,SNL) and (CSR,SNR) are the left and
* right singular vectors for abs(SSMAX), giving the decomposition:
*
* \[ CSL  SNL \] \[ F  G \] \[ CSR -SNR \]   \[ SSMAX   0   \]
* \[-SNL  CSL \] \[ 0  H \] \[ SNR  CSR \] = \[  0    SSMIN \]
*
* @private
* @param {number} f - the (1,1) element
* @param {number} g - the (1,2) element
* @param {number} h - the (2,2) element
* @returns {Object} object with fields { ssmin, ssmax, snr, csr, snl, csl }
*/
function dlasv2( f, g, h ) {
	var gasmal;
	var tsign;
	var ssmin;
	var ssmax;
	var swap;
	var pmax;
	var temp;
	var csl;
	var csr;
	var snl;
	var snr;
	var clt;
	var crt;
	var slt;
	var srt;
	var ft;
	var fa;
	var gt;
	var ga;
	var ht;
	var ha;
	var mm;
	var tt;
	var d;
	var l;
	var m;
	var r;
	var s;
	var t;
	var a;

	ft = f;
	fa = Math.abs( ft );
	ht = h;
	ha = Math.abs( h );

	// PMAX points to the maximum absolute element of the matrix

	// PMAX = 1 if F largest, 2 if G largest, 3 if H largest
	pmax = 1;
	swap = ( ha > fa );
	if ( swap ) {
		pmax = 3;
		temp = ft;
		ft = ht;
		ht = temp;
		temp = fa;
		fa = ha;
		ha = temp;
	}
	gt = g;
	ga = Math.abs( gt );

	if ( ga === 0.0 ) {
		// Diagonal matrix
		ssmin = ha;
		ssmax = fa;
		clt = 1.0;
		crt = 1.0;
		slt = 0.0;
		srt = 0.0;
	} else {
		gasmal = true;
		if ( ga > fa ) {
			pmax = 2;
			if ( ( fa / ga ) < EPS ) {
				// Case of very large GA
				gasmal = false;
				ssmax = ga;
				if ( ha > 1.0 ) {
					ssmin = fa / ( ga / ha );
				} else {
					ssmin = ( fa / ga ) * ha;
				}
				clt = 1.0;
				slt = ht / gt;
				srt = 1.0;
				crt = ft / gt;
			}
		}
		if ( gasmal ) {
			// Normal case
			d = fa - ha;
			if ( d === fa ) {
				// Copes with infinite F or H
				l = 1.0;
			} else {
				l = d / fa;
			}

			// Note that 0 <= L <= 1
			m = gt / ft;

			// Note that abs(M) <= 1/macheps
			t = 2.0 - l;

			// Note that T >= 1
			mm = m * m;
			tt = t * t;
			s = Math.sqrt( tt + mm );

			// Note that 1 <= S <= 1 + 1/macheps
			if ( l === 0.0 ) {
				r = Math.abs( m );
			} else {
				r = Math.sqrt( (l * l) + mm );
			}

			// Note that 0 <= R <= 1 + 1/macheps
			a = 0.5 * ( s + r );

			// Note that 1 <= A <= 1 + abs(M)
			ssmin = ha / a;
			ssmax = fa * a;

			if ( mm === 0.0 ) {
				// Note that M is very tiny
				if ( l === 0.0 ) {
					t = sign( 2.0, ft ) * sign( 1.0, gt );
				} else {
					t = (gt / sign( d, ft )) + (m / t);
				}
			} else {
				t = ( (m / ( s + t )) + (m / ( r + l )) ) * ( 1.0 + a );
			}
			l = Math.sqrt( (t * t) + 4.0 );
			crt = 2.0 / l;
			srt = t / l;
			clt = ( crt + (srt * m) ) / a;
			slt = ( ht / ft ) * srt / a;
		}
	}

	if ( swap ) {
		csl = srt;
		snl = crt;
		csr = slt;
		snr = clt;
	} else {
		csl = clt;
		snl = slt;
		csr = crt;
		snr = srt;
	}

	// Correct signs of SSMAX and SSMIN
	if ( pmax === 1 ) {
		tsign = sign( 1.0, csr ) * sign( 1.0, csl ) * sign( 1.0, f );
	}
	if ( pmax === 2 ) {
		tsign = sign( 1.0, snr ) * sign( 1.0, csl ) * sign( 1.0, g );
	}
	if ( pmax === 3 ) {
		tsign = sign( 1.0, snr ) * sign( 1.0, snl ) * sign( 1.0, h );
	}
	ssmax = sign( ssmax, tsign );
	ssmin = sign( ssmin, tsign * sign( 1.0, f ) * sign( 1.0, h ) );

	return {
		'ssmin': ssmin,
		'ssmax': ssmax,
		'snr': snr,
		'csr': csr,
		'snl': snl,
		'csl': csl
	};
}


// EXPORTS //

export default dlasv2;
