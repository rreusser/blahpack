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

/* eslint-disable max-depth, max-statements, max-lines-per-function, max-lines, max-params, max-len, no-mixed-operators */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dznrm2 from '../../../../blas/base/dznrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlassq from '../../zlassq/lib/base.js';
import zrot from '../../zrot/lib/base.js';


// MAIN //

/**
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* Applies a small number of sweeps of Jacobi plane rotations to the
* `M`-by-`N` complex matrix `A*diag(D)`. The pivot pairs `(p,q)` are
* restricted to the (1,2) off-diagonal block of the Gram matrix
* `A^H * A`, i.e. `p` ranges over the first `n1` columns and `q` over
* the remaining `N-n1` columns. The off-diagonal block is tiled into
* `nblr`-by-`nblc` square tiles of side `KBL = min(8,N)` and the routine
* sweeps the tiles in row-cyclic order.
*
* @private
* @param {string} jobv - `'compute-v'` accumulates rotations into `V` (RSVEC), `'apply-v'` post-multiplies an `MV`-by-`N` `V` (APPLV), `'no-v'` discards them
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} n1 - 2x2 block partition; the first `n1` columns are rotated against the remaining `N-n1` columns
* @param {Complex128Array} A - input `M`-by-`N` matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index into `A` (in complex elements)
* @param {Complex128Array} d - `N`-length diagonal scale array
* @param {integer} strideD - stride length for `d` (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index into `d` (in complex elements)
* @param {Float64Array} sva - `N`-length array of scaled column norms `||A(:,j)||`
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index into `sva`
* @param {NonNegativeInteger} mv - number of rows of `V` when `jobv === 'apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {integer} strideV1 - stride of the first dimension of `V` (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of `V` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index into `V` (in complex elements)
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance (must be `> eps`)
* @param {NonNegativeInteger} nsweep - number of sweeps to perform
* @param {Complex128Array} work - workspace array of length at least `M`
* @param {integer} strideWork - stride length for `work` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index into `work` (in complex elements)
* @param {NonNegativeInteger} lwork - length of workspace (must be `>= M`)
* @returns {integer} info code: `0` on early convergence, `nsweep-1` if all sweeps completed without convergence, otherwise a negative argument-error code
*/
function zgsvj1( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len
	var convergedSweep;
	var rootsfmin;
	var bigtheta;
	var pskipped;
	var negAapq;
	var roottol;
	var rooteps;
	var rootbig;
	var bailjbc;
	var rowskip;
	var notrot;
	var mxaapq;
	var mxsinj;
	var blskip;
	var iswrot;
	var thsign;
	var emptsw;
	var ijblsk;
	var swband;
	var apoaq;
	var aqoap;
	var aapp0;
	var aapqR;
	var aapqI;
	var ompqR;
	var ompqI;
	var applv;
	var rotok;
	var rsvec;
	var small;
	var theta;
	var temp1;
	var aapq1;
	var sRot;
	var aapp;
	var aaqq;
	var aapq;
	var info;
	var nblc;
	var nblr;
	var big;
	var mvl;
	var kbl;
	var ibr;
	var jbc;
	var igl;
	var jgl;
	var ap0;
	var aq0;
	var vp0;
	var vq0;
	var dp0;
	var dq0;
	var dpR;
	var dpI;
	var dqR;
	var dqI;
	var res;
	var cs;
	var sn;
	var dv;
	var p;
	var q;
	var t;
	var i;

	applv = ( jobv === 'apply-v' );
	rsvec = ( jobv === 'compute-v' );

	// Argument validation (returns negative argument index, matching Fortran).
	info = 0;
	if ( !( rsvec || applv || jobv === 'no-v' ) ) {
		info = -1;
	} else if ( M < 0 ) {
		info = -2;
	} else if ( N < 0 || N > M ) {
		info = -3;
	} else if ( n1 < 0 ) {
		info = -4;
	} else if ( ( rsvec || applv ) && mv < 0 ) {
		info = -15;
	} else if ( tol <= eps ) {
		info = -21;
	} else if ( nsweep < 0 ) {
		info = -24;
	} else if ( lwork < M ) {
		info = -28;
	}
	if ( info !== 0 ) {
		return info;
	}

	if ( rsvec ) {
		mvl = N;
	} else if ( applv ) {
		mvl = mv;
	} else {
		mvl = 0;
	}
	rsvec = rsvec || applv;

	rooteps = Math.sqrt( eps );
	rootsfmin = Math.sqrt( sfmin );
	small = sfmin / eps;
	big = 1.0 / sfmin;
	rootbig = 1.0 / rootsfmin;
	bigtheta = 1.0 / rooteps;
	roottol = Math.sqrt( tol );

	// `emptsw` counts the early-out target — the total number of `(p,q)`

	// Pairs in the `n1`-by-(`N-n1`) block. If `notrot` ever hits this

	// Value we know every pair is below threshold and can stop.
	emptsw = n1 * ( N - n1 );
	notrot = 0;

	// Row-cyclic pivot strategy with `KBL`-side square tiles.
	kbl = ( N > 8 ) ? 8 : N;
	nblr = ( n1 / kbl ) | 0;
	if ( ( nblr * kbl ) !== n1 ) {
		nblr += 1;
	}
	nblc = ( ( N - n1 ) / kbl ) | 0;
	if ( ( nblc * kbl ) !== ( N - n1 ) ) {
		nblc += 1;
	}
	blskip = ( kbl * kbl ) + 1;
	rowskip = ( kbl > 5 ) ? 5 : kbl;
	swband = 0;

	pskipped = 0;
	iswrot = 0;
	mxaapq = 0.0;
	mxsinj = 0.0;
	ijblsk = 0;

	convergedSweep = false;

	// Float64 view into the complex `d` array for direct re/im access.
	dv = reinterpret( d, 0 );

	// Scratch `Float64Array(2)` for passing the complex sine to `zrot`.
	sRot = new Float64Array( 2 );

	for ( i = 1; i <= nsweep; i++ ) {
		mxaapq = 0.0;
		mxsinj = 0.0;
		iswrot = 0;
		notrot = 0;
		pskipped = 0;

		for ( ibr = 1; ibr <= nblr; ibr++ ) {
			igl = ( ibr - 1 ) * kbl + 1;

			// Off-diagonal blocks only: `jbc` indexes the column tile in

			// The (`N-n1`)-wide block to the right of column `n1`.
			bailjbc = false;
			for ( jbc = 1; jbc <= nblc; jbc++ ) {
				jgl = n1 + ( jbc - 1 ) * kbl + 1;

				ijblsk = 0;
				for ( p = igl; p <= Math.min( igl + kbl - 1, n1 ); p++ ) {
					aapp = sva[ offsetSVA + ( p - 1 ) * strideSVA ];

					if ( aapp > 0.0 ) {
						pskipped = 0;
						ap0 = offsetA + ( p - 1 ) * strideA2;
						dp0 = offsetD + ( p - 1 ) * strideD;

						for ( q = jgl; q <= Math.min( jgl + kbl - 1, N ); q++ ) {
							aaqq = sva[ offsetSVA + ( q - 1 ) * strideSVA ];

							if ( aaqq > 0.0 ) {
								aapp0 = aapp;
								aq0 = offsetA + ( q - 1 ) * strideA2;
								dq0 = offsetD + ( q - 1 ) * strideD;

								// Safe Gram dot product, mirroring Fortran's

								// pre-scaled vs direct branch on `aaqq >= 1`.
								// AAPQ is complex: zdotc returns

								// sum_{k} conj(A(k,p)) * A(k,q).
								if ( aaqq >= 1.0 ) {
									if ( aapp >= aaqq ) {
										rotok = ( small * aapp ) <= aaqq;
									} else {
										rotok = ( small * aaqq ) <= aapp;
									}
									if ( aapp < ( big / aaqq ) ) {
										aapq = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										aapqR = aapq.re / aaqq / aapp;
										aapqI = aapq.im / aaqq / aapp;
									} else {
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										aapq = zdotc( M, work, strideWork, offsetWork, A, strideA1, aq0 );
										aapqR = aapq.re / aaqq;
										aapqI = aapq.im / aaqq;
									}
								} else {
									if ( aapp >= aaqq ) {
										rotok = aapp <= ( aaqq / small );
									} else {
										rotok = aaqq <= ( aapp / small );
									}
									if ( aapp > ( small / aaqq ) ) {
										aapq = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										aapqR = aapq.re / Math.max( aaqq, aapp ) / Math.min( aaqq, aapp );
										aapqI = aapq.im / Math.max( aaqq, aapp ) / Math.min( aaqq, aapp );
									} else {
										zcopy( M, A, strideA1, aq0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										aapq = zdotc( M, A, strideA1, ap0, work, strideWork, offsetWork );
										aapqR = aapq.re / aapp;
										aapqI = aapq.im / aapp;
									}
								}

								// `aapq1 = -|aapq|` (the negative modulus,
								// Matching Fortran). `mxaapq` tracks the
								// Running max of `|aapq|`.
								aapq1 = -Math.sqrt( aapqR * aapqR + aapqI * aapqI );
								if ( -aapq1 > mxaapq ) {
									mxaapq = -aapq1;
								}

								// To rotate, or not to rotate.
								if ( Math.abs( aapq1 ) > tol ) {
									// `ompq = aapq / |aapq|` is the unit
									// phasor; we'll need conj(ompq).
									ompqR = aapqR / -aapq1;
									ompqI = aapqI / -aapq1;
									notrot = 0;
									pskipped = 0;
									iswrot += 1;

									if ( rotok ) {
										aqoap = aaqq / aapp;
										apoaq = aapp / aaqq;
										theta = -0.5 * Math.abs( aqoap - apoaq ) / aapq1;
										if ( aaqq > aapp0 ) {
											theta = -theta;
										}

										if ( Math.abs( theta ) > bigtheta ) {
											// "Fast" near-linear rotation:
											// CS = 1, complex SN = conj(ompq)*t.
											t = 0.5 / theta;
											cs = 1.0;

											// S = conj(ompq) * t = (ompqR - ompqI*i) * t
											sRot[ 0 ] = ompqR * t;
											sRot[ 1 ] = -ompqI * t;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sRot );
											if ( rsvec ) {
												vp0 = offsetV + ( p - 1 ) * strideV2;
												vq0 = offsetV + ( q - 1 ) * strideV2;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sRot );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq1 ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq1 ) );
											if ( Math.abs( t ) > mxsinj ) {
												mxsinj = Math.abs( t );
											}
										} else {
											// Choose correct sign for `theta`
											// And apply a unitary Jacobi rotation.
											thsign = ( aapq1 >= 0.0 ) ? -1.0 : 1.0;
											if ( aaqq > aapp0 ) {
												thsign = -thsign;
											}
											t = 1.0 / ( theta + thsign * Math.sqrt( 1.0 + theta * theta ) );
											cs = Math.sqrt( 1.0 / ( 1.0 + t * t ) );
											sn = t * cs;
											if ( Math.abs( sn ) > mxsinj ) {
												mxsinj = Math.abs( sn );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq1 ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq1 ) );

											// S = conj(ompq) * sn
											sRot[ 0 ] = ompqR * sn;
											sRot[ 1 ] = -ompqI * sn;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sRot );
											if ( rsvec ) {
												vp0 = offsetV + ( p - 1 ) * strideV2;
												vq0 = offsetV + ( q - 1 ) * strideV2;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sRot );
											}
										}
										// D(p) = -D(q) * OMPQ
										dqR = dv[ 2 * dq0 ];
										dqI = dv[ 2 * dq0 + 1 ];

										// -(dqR + dqI*i) * (ompqR + ompqI*i)

										// = -( dqR*ompqR - dqI*ompqI ) - i*( dqR*ompqI + dqI*ompqR )
										dv[ 2 * dp0 ] = -( dqR * ompqR - dqI * ompqI );
										dv[ 2 * dp0 + 1 ] = -( dqR * ompqI + dqI * ompqR );
									} else if ( aapp > aaqq ) {
										// Modified Gram-Schmidt fallback (rotation unsafe).
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, A, strideA1, strideA2, aq0 );

										// -aapq (Complex128).
										negAapq = new Complex128( -aapqR, -aapqI );
										zaxpy( M, negAapq, work, strideWork, offsetWork, A, strideA1, aq0 );
										zlascl( 'general', 0, 0, 1.0, aaqq, M, 1, A, strideA1, strideA2, aq0 );
										sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 - aapq1 * aapq1 ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									} else {
										zcopy( M, A, strideA1, aq0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, A, strideA1, strideA2, ap0 );

										// -conj(aapq) = -(aapqR - aapqI*i) = -aapqR + aapqI*i.
										negAapq = new Complex128( -aapqR, aapqI );
										zaxpy( M, negAapq, work, strideWork, offsetWork, A, strideA1, ap0 );
										zlascl( 'general', 0, 0, 1.0, aapp, M, 1, A, strideA1, strideA2, ap0 );
										sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp * Math.sqrt( Math.max( 0.0, 1.0 - aapq1 * aapq1 ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									}

									// Recompute `sva(q)` in case of cancellation.
									// `aaqq` here still holds the pre-rotation
									// Value because we never overwrote the local.
									if ( Math.pow( sva[ offsetSVA + ( q - 1 ) * strideSVA ] / aaqq, 2 ) <= rooteps ) {
										if ( aaqq < rootbig && aaqq > rootsfmin ) {
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = dznrm2( M, A, strideA1, aq0 );
										} else {
											res = zlassq( M, A, strideA1, aq0, 0.0, 1.0 );
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq );
										}
									}
									if ( Math.pow( aapp / aapp0, 2 ) <= rooteps ) {
										if ( aapp < rootbig && aapp > rootsfmin ) {
											aapp = dznrm2( M, A, strideA1, ap0 );
										} else {
											res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
											aapp = res.scl * Math.sqrt( res.sumsq );
										}
										sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
									}
								} else {
									// `|aapq| <= tol`: pair already (numerically) orthogonal.
									notrot += 1;
									pskipped += 1;
									ijblsk += 1;
								}
							} else {
								// `aaqq <= 0`: column `q` is empty / sentinel-flagged.
								notrot += 1;
								pskipped += 1;
								ijblsk += 1;
							}

							// Steering: bail out of `jbc` if too many skips
							// Inside the current tile or row of pivots.
							if ( i <= swband && ijblsk >= blskip ) {
								sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
								notrot = 0;
								bailjbc = true;
								break;
							}
							if ( i <= swband && pskipped > rowskip ) {
								aapp = -aapp;
								notrot = 0;
								break;
							}
						} // q-loop (Fortran 2200)

						if ( bailjbc ) {
							break;
						}
						sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
					} else {
						if ( aapp === 0.0 ) {
							notrot += Math.min( jgl + kbl - 1, N ) - jgl + 1;
						}
						if ( aapp < 0.0 ) {
							notrot = 0;
						}
					}
				} // p-loop (Fortran 2100)

				if ( bailjbc ) {
					break;
				}
			} // jbc-loop (Fortran 2010)

			// Label 2011/2012: clear sentinel sign on `sva` in the current
			// Row tile.
			for ( p = igl; p <= Math.min( igl + kbl - 1, N ); p++ ) {
				sva[ offsetSVA + ( p - 1 ) * strideSVA ] = Math.abs( sva[ offsetSVA + ( p - 1 ) * strideSVA ] );
			}
		} // ibr-loop (Fortran 2000)

		// Update `sva(N)`. Fortran refreshes the last column's norm at the
		// End of every sweep regardless of whether it sat in the touched
		// range.
		ap0 = offsetA + ( N - 1 ) * strideA2;
		if ( sva[ offsetSVA + ( N - 1 ) * strideSVA ] < rootbig && sva[ offsetSVA + ( N - 1 ) * strideSVA ] > rootsfmin ) {
			sva[ offsetSVA + ( N - 1 ) * strideSVA ] = dznrm2( M, A, strideA1, ap0 );
		} else {
			res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
			sva[ offsetSVA + ( N - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq );
		}

		if ( i < swband && ( mxaapq <= roottol || iswrot <= N ) ) {
			swband = i;
		}
		if ( i > swband + 1 && mxaapq < N * tol && N * mxaapq * mxsinj < tol ) {
			convergedSweep = true;
			break;
		}
		if ( notrot >= emptsw ) {
			convergedSweep = true;
			break;
		}
	} // i-loop (Fortran 1993)

	if ( convergedSweep ) {
		info = 0;
	} else {
		info = nsweep - 1;
	}

	// Sort the columns of `A` (and `V`, `D`, `SVA`) by descending `sva`.
	for ( p = 1; p <= N - 1; p++ ) {
		q = idamax( N - p + 1, sva, strideSVA, offsetSVA + ( p - 1 ) * strideSVA ) + p;
		if ( p !== q ) {
			dp0 = offsetSVA + ( p - 1 ) * strideSVA;
			dq0 = offsetSVA + ( q - 1 ) * strideSVA;
			temp1 = sva[ dp0 ];
			sva[ dp0 ] = sva[ dq0 ];
			sva[ dq0 ] = temp1;
			dp0 = offsetD + ( p - 1 ) * strideD;
			dq0 = offsetD + ( q - 1 ) * strideD;

			// Complex swap of d(p) and d(q).
			dpR = dv[ 2 * dp0 ];
			dpI = dv[ 2 * dp0 + 1 ];
			dv[ 2 * dp0 ] = dv[ 2 * dq0 ];
			dv[ 2 * dp0 + 1 ] = dv[ 2 * dq0 + 1 ];
			dv[ 2 * dq0 ] = dpR;
			dv[ 2 * dq0 + 1 ] = dpI;
			zswap( M, A, strideA1, offsetA + ( p - 1 ) * strideA2, A, strideA1, offsetA + ( q - 1 ) * strideA2 );
			if ( rsvec ) {
				zswap( mvl, V, strideV1, offsetV + ( p - 1 ) * strideV2, V, strideV1, offsetV + ( q - 1 ) * strideV2 );
			}
		}
	}

	return info;
}


// EXPORTS //

export default zgsvj1;
