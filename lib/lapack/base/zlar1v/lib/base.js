/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import disnan from './../../../../lapack/base/disnan/lib/base.js';


// VARIABLES //

var EPS = dlamch( 'precision' );


// MAIN //

/**
* Computes the (scaled) `r`-th column of the inverse of the submatrix in rows `b1` through `bn` of the tridiagonal matrix `L*D*L^T - lambda*I`.
*
* ## Notes
*
* -   The tridiagonal factors `D`, `L`, `LD`, `LLD` are real; the output vector `Z` is complex (matching the back-transformation step used by `zstemr` / `zstegr`), but its imaginary parts are always zero on return.
* -   Scalar outputs (`negcnt`, `ztz`, `mingma`, `r`, `nrminv`, `resid`, `rqcorr`) are written to caller-supplied length-1 typed arrays. `r` is in/out: pass `0` to select the twist automatically.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} b1 - (1-based) first index of the submatrix
* @param {integer} bn - (1-based) last index of the submatrix
* @param {number} lambda - shift (approximate eigenvalue)
* @param {Float64Array} D - diagonal `D` of `L*D*L^T`
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} L - sub-diagonal of the unit lower bidiagonal factor
* @param {integer} strideL - stride length for `L`
* @param {NonNegativeInteger} offsetL - starting index for `L`
* @param {Float64Array} LD - element-wise product `L*D`
* @param {integer} strideLD - stride length for `LD`
* @param {NonNegativeInteger} offsetLD - starting index for `LD`
* @param {Float64Array} LLD - element-wise product `L*D*L`
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} gaptol - tolerance that determines when a column of the inverse has converged
* @param {Complex128Array} Z - output eigenvector (length `N`)
* @param {integer} strideZ - stride length for `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {boolean} wantnc - if `true`, compute `negcnt`
* @param {Int32Array} negcnt - output (length >= 1)
* @param {Float64Array} ztz - output (length >= 1)
* @param {Float64Array} mingma - output (length >= 1)
* @param {Int32Array} r - in/out (length >= 1)
* @param {Int32Array} ISUPPZ - output (length >= 2)
* @param {integer} strideISUPPZ - stride length for `ISUPPZ`
* @param {NonNegativeInteger} offsetISUPPZ - starting index for `ISUPPZ`
* @param {Float64Array} nrminv - output (length >= 1)
* @param {Float64Array} resid - output (length >= 1)
* @param {Float64Array} rqcorr - output (length >= 1)
* @param {Float64Array} WORK - workspace (length >= 4*N)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
*/
function zlar1v( N, b1, bn, lambda, D, strideD, offsetD, L, strideL, offsetL, LD, strideLD, offsetLD, LLD, strideLLD, offsetLLD, pivmin, gaptol, Z, strideZ, offsetZ, wantnc, negcnt, ztz, mingma, r, ISUPPZ, strideISUPPZ, offsetISUPPZ, nrminv, resid, rqcorr, WORK, strideWORK, offsetWORK ) {
	var sawnan1;
	var sawnan2;
	var indlpl;
	var indumn;
	var dminus;
	var mgmval;
	var ztzval;
	var dplus;
	var inds;
	var indp;
	var neg1;
	var neg2;
	var tmp;
	var rin;
	var Zv;
	var zi;
	var zp;
	var rr;
	var r1;
	var r2;
	var s;
	var i;

	Zv = reinterpret( Z, 0 );

	rin = r[ 0 ];
	if ( rin === 0 ) {
		r1 = b1;
		r2 = bn;
	} else {
		r1 = rin;
		r2 = rin;
	}

	indlpl = 0;
	indumn = N;
	inds = ( 2 * N ) + 1;
	indp = ( 3 * N ) + 1;

	if ( b1 === 1 ) {
		WORK[ offsetWORK + ( ( inds - 1 ) * strideWORK ) ] = 0.0;
	} else {
		WORK[ offsetWORK + ( ( inds + b1 - 2 ) * strideWORK ) ] = LLD[ offsetLLD + ( ( b1 - 2 ) * strideLLD ) ];
	}

	sawnan1 = false;
	neg1 = 0;
	s = WORK[ offsetWORK + ( ( inds + b1 - 2 ) * strideWORK ) ] - lambda;
	for ( i = b1; i <= r1 - 1; i += 1 ) {
		dplus = D[ offsetD + ( ( i - 1 ) * strideD ) ] + s;
		WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] = LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] / dplus;
		if ( dplus < 0.0 ) {
			neg1 += 1;
		}
		WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = s * WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * L[ offsetL + ( ( i - 1 ) * strideL ) ];
		s = WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] - lambda;
	}
	sawnan1 = disnan( s );
	if ( !sawnan1 ) {
		for ( i = r1; i <= r2 - 1; i += 1 ) {
			dplus = D[ offsetD + ( ( i - 1 ) * strideD ) ] + s;
			WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] = LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] / dplus;
			WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = s * WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * L[ offsetL + ( ( i - 1 ) * strideL ) ];
			s = WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] - lambda;
		}
		sawnan1 = disnan( s );
	}

	if ( sawnan1 ) {
		neg1 = 0;
		s = WORK[ offsetWORK + ( ( inds + b1 - 2 ) * strideWORK ) ] - lambda;
		for ( i = b1; i <= r1 - 1; i += 1 ) {
			dplus = D[ offsetD + ( ( i - 1 ) * strideD ) ] + s;
			if ( Math.abs( dplus ) < pivmin ) {
				dplus = -pivmin;
			}
			WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] = LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] / dplus;
			if ( dplus < 0.0 ) {
				neg1 += 1;
			}
			WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = s * WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * L[ offsetL + ( ( i - 1 ) * strideL ) ];
			if ( WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] === 0.0 ) {
				WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = LLD[ offsetLLD + ( ( i - 1 ) * strideLLD ) ];
			}
			s = WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] - lambda;
		}
		for ( i = r1; i <= r2 - 1; i += 1 ) {
			dplus = D[ offsetD + ( ( i - 1 ) * strideD ) ] + s;
			if ( Math.abs( dplus ) < pivmin ) {
				dplus = -pivmin;
			}
			WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] = LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] / dplus;
			WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = s * WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * L[ offsetL + ( ( i - 1 ) * strideL ) ];
			if ( WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] === 0.0 ) {
				WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] = LLD[ offsetLLD + ( ( i - 1 ) * strideLLD ) ];
			}
			s = WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] - lambda;
		}
	}

	sawnan2 = false;
	neg2 = 0;
	WORK[ offsetWORK + ( ( indp + bn - 2 ) * strideWORK ) ] = D[ offsetD + ( ( bn - 1 ) * strideD ) ] - lambda;
	for ( i = bn - 1; i >= r1; i -= 1 ) {
		dminus = LLD[ offsetLLD + ( ( i - 1 ) * strideLLD ) ] + WORK[ offsetWORK + ( ( indp + i - 1 ) * strideWORK ) ];
		tmp = D[ offsetD + ( ( i - 1 ) * strideD ) ] / dminus;
		if ( dminus < 0.0 ) {
			neg2 += 1;
		}
		WORK[ offsetWORK + ( ( indumn + i - 1 ) * strideWORK ) ] = L[ offsetL + ( ( i - 1 ) * strideL ) ] * tmp;
		WORK[ offsetWORK + ( ( indp + i - 2 ) * strideWORK ) ] = ( WORK[ offsetWORK + ( ( indp + i - 1 ) * strideWORK ) ] * tmp ) - lambda;
	}
	tmp = WORK[ offsetWORK + ( ( indp + r1 - 2 ) * strideWORK ) ];
	sawnan2 = disnan( tmp );

	// Note: sawnan2 rerun is unreachable in IEEE 754 double precision without handcrafted `LLD` values.
	if ( sawnan2 ) {
		neg2 = 0;
		for ( i = bn - 1; i >= r1; i -= 1 ) {
			dminus = LLD[ offsetLLD + ( ( i - 1 ) * strideLLD ) ] + WORK[ offsetWORK + ( ( indp + i - 1 ) * strideWORK ) ];
			if ( Math.abs( dminus ) < pivmin ) {
				dminus = -pivmin;
			}
			tmp = D[ offsetD + ( ( i - 1 ) * strideD ) ] / dminus;
			if ( dminus < 0.0 ) {
				neg2 += 1;
			}
			WORK[ offsetWORK + ( ( indumn + i - 1 ) * strideWORK ) ] = L[ offsetL + ( ( i - 1 ) * strideL ) ] * tmp;
			WORK[ offsetWORK + ( ( indp + i - 2 ) * strideWORK ) ] = ( WORK[ offsetWORK + ( ( indp + i - 1 ) * strideWORK ) ] * tmp ) - lambda;
			if ( tmp === 0.0 ) {
				WORK[ offsetWORK + ( ( indp + i - 2 ) * strideWORK ) ] = D[ offsetD + ( ( i - 1 ) * strideD ) ] - lambda;
			}
		}
	}

	mgmval = WORK[ offsetWORK + ( ( inds + r1 - 2 ) * strideWORK ) ] + WORK[ offsetWORK + ( ( indp + r1 - 2 ) * strideWORK ) ];
	if ( mgmval < 0.0 ) {
		neg1 += 1;
	}
	if ( wantnc ) {
		negcnt[ 0 ] = neg1 + neg2;
	} else {
		negcnt[ 0 ] = -1;
	}
	if ( Math.abs( mgmval ) === 0.0 ) {
		mgmval = EPS * WORK[ offsetWORK + ( ( inds + r1 - 2 ) * strideWORK ) ];
	}
	rr = r1;
	for ( i = r1; i <= r2 - 1; i += 1 ) {
		tmp = WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ] + WORK[ offsetWORK + ( ( indp + i - 1 ) * strideWORK ) ];
		if ( tmp === 0.0 ) {
			tmp = EPS * WORK[ offsetWORK + ( ( inds + i - 1 ) * strideWORK ) ];
		}
		if ( Math.abs( tmp ) <= Math.abs( mgmval ) ) {
			mgmval = tmp;
			rr = i + 1;
		}
	}

	ISUPPZ[ offsetISUPPZ ] = b1;
	ISUPPZ[ offsetISUPPZ + strideISUPPZ ] = bn;
	zp = 2 * ( offsetZ + ( ( rr - 1 ) * strideZ ) );
	Zv[ zp ] = 1.0;
	Zv[ zp + 1 ] = 0.0;
	ztzval = 1.0;

	// Backward substitution (upper part of vector).
	if ( !sawnan1 && !sawnan2 ) {
		for ( i = rr - 1; i >= b1; i -= 1 ) {
			zp = 2 * ( offsetZ + ( ( i - 1 ) * strideZ ) );
			zi = 2 * ( offsetZ + ( i * strideZ ) );
			Zv[ zp ] = -( WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * Zv[ zi ] );
			Zv[ zp + 1 ] = 0.0;
			if ( ( Math.abs( Zv[ zp ] ) + Math.abs( Zv[ zi ] ) ) * Math.abs( LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) < gaptol ) {
				Zv[ zp ] = 0.0;
				Zv[ zp + 1 ] = 0.0;
				ISUPPZ[ offsetISUPPZ ] = i + 1;
				break;
			}
			ztzval += Zv[ zp ] * Zv[ zp ];
		}
	} else {
		for ( i = rr - 1; i >= b1; i -= 1 ) {
			zp = 2 * ( offsetZ + ( ( i - 1 ) * strideZ ) );
			zi = 2 * ( offsetZ + ( i * strideZ ) );
			if ( Zv[ zi ] === 0.0 && Zv[ zi + 1 ] === 0.0 ) {
				Zv[ zp ] = -( LD[ offsetLD + ( i * strideLD ) ] / LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) * Zv[ 2 * ( offsetZ + ( ( i + 1 ) * strideZ ) ) ];
			} else {
				Zv[ zp ] = -( WORK[ offsetWORK + ( ( indlpl + i - 1 ) * strideWORK ) ] * Zv[ zi ] );
			}
			Zv[ zp + 1 ] = 0.0;
			if ( ( Math.abs( Zv[ zp ] ) + Math.abs( Zv[ zi ] ) ) * Math.abs( LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) < gaptol ) {
				Zv[ zp ] = 0.0;
				Zv[ zp + 1 ] = 0.0;
				ISUPPZ[ offsetISUPPZ ] = i + 1;
				break;
			}
			ztzval += Zv[ zp ] * Zv[ zp ];
		}
	}

	// Forward substitution (lower part of vector).
	if ( !sawnan1 && !sawnan2 ) {
		for ( i = rr; i <= bn - 1; i += 1 ) {
			zp = 2 * ( offsetZ + ( i * strideZ ) );
			zi = 2 * ( offsetZ + ( ( i - 1 ) * strideZ ) );
			Zv[ zp ] = -( WORK[ offsetWORK + ( ( indumn + i - 1 ) * strideWORK ) ] * Zv[ zi ] );
			Zv[ zp + 1 ] = 0.0;
			if ( ( Math.abs( Zv[ zi ] ) + Math.abs( Zv[ zp ] ) ) * Math.abs( LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) < gaptol ) {
				Zv[ zp ] = 0.0;
				Zv[ zp + 1 ] = 0.0;
				ISUPPZ[ offsetISUPPZ + strideISUPPZ ] = i;
				break;
			}
			ztzval += Zv[ zp ] * Zv[ zp ];
		}
	} else {
		for ( i = rr; i <= bn - 1; i += 1 ) {
			zp = 2 * ( offsetZ + ( i * strideZ ) );
			zi = 2 * ( offsetZ + ( ( i - 1 ) * strideZ ) );
			if ( Zv[ zi ] === 0.0 && Zv[ zi + 1 ] === 0.0 ) {
				Zv[ zp ] = -( LD[ offsetLD + ( ( i - 2 ) * strideLD ) ] / LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) * Zv[ 2 * ( offsetZ + ( ( i - 2 ) * strideZ ) ) ];
			} else {
				Zv[ zp ] = -( WORK[ offsetWORK + ( ( indumn + i - 1 ) * strideWORK ) ] * Zv[ zi ] );
			}
			Zv[ zp + 1 ] = 0.0;
			if ( ( Math.abs( Zv[ zi ] ) + Math.abs( Zv[ zp ] ) ) * Math.abs( LD[ offsetLD + ( ( i - 1 ) * strideLD ) ] ) < gaptol ) {
				Zv[ zp ] = 0.0;
				Zv[ zp + 1 ] = 0.0;
				ISUPPZ[ offsetISUPPZ + strideISUPPZ ] = i;
				break;
			}
			ztzval += Zv[ zp ] * Zv[ zp ];
		}
	}

	tmp = 1.0 / ztzval;
	ztz[ 0 ] = ztzval;
	mingma[ 0 ] = mgmval;
	r[ 0 ] = rr;
	nrminv[ 0 ] = Math.sqrt( tmp );
	resid[ 0 ] = Math.abs( mgmval ) * nrminv[ 0 ];
	rqcorr[ 0 ] = mgmval * tmp;
}


// EXPORTS //

export default zlar1v;
