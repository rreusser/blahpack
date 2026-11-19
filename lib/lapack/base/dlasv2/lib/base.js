/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// VARIABLES //

const EPS = 1.1102230246251565e-16; // DLAMCH('EPS') = 2^-53


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
	const mag = Math.abs( a );

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
* @param {Float64Array} ssmin - output (length-1 array): abs(SSMIN) is the smaller singular value
* @param {Float64Array} ssmax - output (length-1 array): abs(SSMAX) is the larger singular value
* @param {Float64Array} snr - output (length-1 array): `snr`
* @param {Float64Array} csr - output (length-1 array): the vector (CSR, SNR) is a unit right singular vector for the singular value abs(SSMAX)
* @param {Float64Array} snl - output (length-1 array): `snl`
* @param {Float64Array} csl - output (length-1 array): the vector (CSL, SNL) is a unit left singular vector for the singular value abs(SSMAX)
*/
function dlasv2( f, g, h, ssmin, ssmax, snr, csr, snl, csl ) {
	let gasmal, tsign, pmax, temp, clt, crt;
	let slt, srt, ft, fa, ht, ha, mm, tt, d, l, m, r, s, t, a;

	ft = f;
	fa = Math.abs( ft );
	ht = h;
	ha = Math.abs( h );

	// PMAX points to the maximum absolute element of the matrix

	// PMAX = 1 if F largest, 2 if G largest, 3 if H largest
	pmax = 1;
	const swap = ( ha > fa );
	if ( swap ) {
		pmax = 3;
		temp = ft;
		ft = ht;
		ht = temp;
		temp = fa;
		fa = ha;
		ha = temp;
	}
	const gt = g;
	const ga = Math.abs( gt );

	if ( ga === 0.0 ) {
		// Diagonal matrix
		ssmin[ 0 ] = ha;
		ssmax[ 0 ] = fa;
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
				ssmax[ 0 ] = ga;
				if ( ha > 1.0 ) {
					ssmin[ 0 ] = fa / ( ga / ha );
				} else {
					ssmin[ 0 ] = ( fa / ga ) * ha;
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
			ssmin[ 0 ] = ha / a;
			ssmax[ 0 ] = fa * a;

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
		csl[ 0 ] = srt;
		snl[ 0 ] = crt;
		csr[ 0 ] = slt;
		snr[ 0 ] = clt;
	} else {
		csl[ 0 ] = clt;
		snl[ 0 ] = slt;
		csr[ 0 ] = crt;
		snr[ 0 ] = srt;
	}

	// Correct signs of SSMAX and SSMIN
	if ( pmax === 1 ) {
		tsign = sign( 1.0, csr[ 0 ] ) * sign( 1.0, csl[ 0 ] ) * sign( 1.0, f );
	}
	if ( pmax === 2 ) {
		tsign = sign( 1.0, snr[ 0 ] ) * sign( 1.0, csl[ 0 ] ) * sign( 1.0, g );
	}
	if ( pmax === 3 ) {
		tsign = sign( 1.0, snr[ 0 ] ) * sign( 1.0, snl[ 0 ] ) * sign( 1.0, h );
	}
	ssmax[ 0 ] = sign( ssmax[ 0 ], tsign );
	ssmin[ 0 ] = sign( ssmin[ 0 ], tsign * sign( 1.0, f ) * sign( 1.0, h ) );

}


// EXPORTS //

export default dlasv2;
