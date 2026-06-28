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

/* eslint-disable max-depth, max-statements, max-lines-per-function, max-lines, max-params, max-len */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
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
* Pre-processor for zgesvj performing a sweep of Jacobi plane rotations.
*
* Applies Jacobi plane rotations from the right to an M-by-N complex matrix
* `A*diag(D)` in column-pivoted cyclic order. `D` is a complex N-length
* phase accumulator updated with `D(p) <- -D(q)*ompq` after each rotation.
*
* @private
* @param {string} jobv - `'compute-v'` to accumulate into V (RSVEC), `'apply-v'` to apply to existing MV-by-N V (APPLV), `'no-v'` otherwise
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A (and size of right side of V)
* @param {Complex128Array} A - input M-by-N matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index into `A` (in complex elements)
* @param {Complex128Array} d - N-length diagonal phase array
* @param {integer} strideD - stride length for `d` (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index into `d` (in complex elements)
* @param {Float64Array} sva - N-length array of column norms `||A(:,j)||`
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index into `sva`
* @param {NonNegativeInteger} mv - number of rows of V when `jobv='apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {integer} strideV1 - stride of the first dimension of `V` (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of `V` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index into `V` (in complex elements)
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance (must be > eps)
* @param {NonNegativeInteger} nsweep - number of sweeps to perform
* @param {Complex128Array} work - workspace array (length at least `M` complex elements)
* @param {integer} strideWork - stride length for `work` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index into `work` (in complex elements)
* @param {NonNegativeInteger} lwork - length of workspace (in complex elements; must be >= M)
* @returns {integer} info code: 0 on convergence, otherwise last completed sweep
*/
function zgsvj0( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork, lwork ) {
	var convergedSweep;
	var rootsfmin;
	var bigtheta;
	var pskipped;
	var sScratch;
	var aapqMag;
	var bailjbc;
	var lkahead;
	var rootbig;
	var rooteps;
	var roottol;
	var rowskip;
	var blskip;
	var emptsw;
	var ijblsk;
	var iswrot;
	var mxaapq;
	var mxsinj;
	var newDpI;
	var newDpR;
	var notrot;
	var swband;
	var thsign;
	var aapp0;
	var aapq1;
	var aapqI;
	var aapqR;
	var apoaq;
	var applv;
	var aqoap;
	var ompqI;
	var ompqR;
	var rotok;
	var rsvec;
	var small;
	var temp1;
	var theta;
	var aapp;
	var aaqq;
	var dotZ;
	var info;
	var ap0;
	var aq0;
	var big;
	var dp0;
	var dq0;
	var dqI;
	var dqR;
	var ibr;
	var igl;
	var ir1;
	var jbc;
	var jgl;
	var kbl;
	var mvl;
	var nbl;
	var res;
	var vp0;
	var vq0;
	var cs;
	var dv;
	var sn;
	var i;
	var p;
	var q;
	var t;

	applv = ( jobv === 'apply-v' );
	rsvec = ( jobv === 'compute-v' );

	info = 0;
	if ( !( rsvec || applv || jobv === 'no-v' ) ) {
		info = -1;
	} else if ( M < 0 ) {
		info = -2;
	} else if ( N < 0 || N > M ) {
		info = -3;
	} else if ( ( rsvec || applv ) && mv < 0 ) {
		info = -14;
	} else if ( tol <= eps ) {
		info = -19;
	} else if ( nsweep < 0 ) {
		info = -22;
	} else if ( lwork < M ) {
		info = -26;
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

	emptsw = ( N * ( N - 1 ) ) / 2;
	notrot = 0;

	swband = 0;
	kbl = ( N > 8 ) ? 8 : N;
	nbl = ( N / kbl ) | 0;
	if ( ( nbl * kbl ) !== N ) {
		nbl += 1;
	}
	blskip = kbl * kbl;
	rowskip = ( kbl > 5 ) ? 5 : kbl;
	lkahead = 1;
	pskipped = 0;
	iswrot = 0;
	mxaapq = 0.0;
	mxsinj = 0.0;
	ijblsk = 0;

	convergedSweep = false;

	// Float64 view of d for re/im access (the OMPQ phase update D(p) = -D(q)*OMPQ touches d directly; A, V, work all go through their z* helpers).
	dv = reinterpret( d, 0 );

	sScratch = new Float64Array( 2 );

	for ( i = 1; i <= nsweep; i++ ) {
		mxaapq = 0.0;
		mxsinj = 0.0;
		iswrot = 0;
		notrot = 0;
		pskipped = 0;

		for ( ibr = 1; ibr <= nbl; ibr++ ) {
			igl = ( ( ibr - 1 ) * kbl ) + 1;

			for ( ir1 = 0; ir1 <= Math.min( lkahead, nbl - ibr ); ir1++ ) {
				igl += ir1 * kbl;

				for ( p = igl; p <= Math.min( igl + kbl - 1, N - 1 ); p++ ) {
					// De Rijk's pivoting: q = argmax of sva[p..N] + p (1-based absolute)
					q = idamax( N - p + 1, sva, strideSVA, offsetSVA + ( ( p - 1 ) * strideSVA ) ) + p; // 1-based absolute

					if ( p !== q ) {
						ap0 = offsetA + ( ( p - 1 ) * strideA2 );
						aq0 = offsetA + ( ( q - 1 ) * strideA2 );
						zswap( M, A, strideA1, ap0, A, strideA1, aq0 );
						if ( rsvec ) {
							vp0 = offsetV + ( ( p - 1 ) * strideV2 );
							vq0 = offsetV + ( ( q - 1 ) * strideV2 );
							zswap( mvl, V, strideV1, vp0, V, strideV1, vq0 );
						}
						temp1 = sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ];
						sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ];
						sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = temp1;

						// Swap d(p), d(q) (complex)
						dp0 = ( offsetD + ( ( p - 1 ) * strideD ) ) * 2;
						dq0 = ( offsetD + ( ( q - 1 ) * strideD ) ) * 2;
						temp1 = dv[ dp0 ];
						dv[ dp0 ] = dv[ dq0 ];
						dv[ dq0 ] = temp1;
						temp1 = dv[ dp0 + 1 ];
						dv[ dp0 + 1 ] = dv[ dq0 + 1 ];
						dv[ dq0 + 1 ] = temp1;
					}
					ap0 = offsetA + ( ( p - 1 ) * strideA2 );
					dp0 = ( offsetD + ( ( p - 1 ) * strideD ) ) * 2;

					if ( ir1 === 0 ) {
						if ( sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] < rootbig && sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] > rootsfmin ) {
							sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = dznrm2( M, A, strideA1, ap0 );
						} else {
							res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
							sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = res.scl * Math.sqrt( res.sumsq );
						}
						aapp = sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ];
					} else {
						aapp = sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ];
					}

					if ( aapp > 0.0 ) {
						pskipped = 0;

						for ( q = p + 1; q <= Math.min( igl + kbl - 1, N ); q++ ) {
							aaqq = sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ];
							if ( aaqq > 0.0 ) {
								aapp0 = aapp;
								aq0 = offsetA + ( ( q - 1 ) * strideA2 );
								dq0 = ( offsetD + ( ( q - 1 ) * strideD ) ) * 2;

								// Safe Gram-matrix computation.

								// Compute AAPQ = conj(A(:,p))^T * A(:,q) / (aaqq*aapp) avoiding overflow.

								// Preserve Fortran's exact order of operations (two sequential divides)

								// To match reference rounding.
								if ( aaqq >= 1.0 ) {
									rotok = ( small * aapp ) <= aaqq;
									if ( aapp < ( big / aaqq ) ) {
										dotZ = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										aapqR = ( dotZ.re / aaqq ) / aapp;
										aapqI = ( dotZ.im / aaqq ) / aapp;
									} else {
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										dotZ = zdotc( M, work, strideWork, offsetWork, A, strideA1, aq0 );
										aapqR = dotZ.re / aaqq;
										aapqI = dotZ.im / aaqq;
									}
								} else {
									rotok = aapp <= ( aaqq / small );
									if ( aapp > ( small / aaqq ) ) {
										dotZ = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										aapqR = ( dotZ.re / aapp ) / aaqq;
										aapqI = ( dotZ.im / aapp ) / aaqq;
									} else {
										zcopy( M, A, strideA1, aq0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										dotZ = zdotc( M, A, strideA1, ap0, work, strideWork, offsetWork );
										aapqR = dotZ.re / aapp;
										aapqI = dotZ.im / aapp;
									}
								}

								// aapq1 = -|aapq| (real)
								aapqMag = Math.hypot( aapqR, aapqI );
								aapq1 = -aapqMag;
								if ( -aapq1 > mxaapq ) {
									mxaapq = -aapq1;
								}

								// To rotate or not to rotate
								if ( aapqMag > tol ) {
									// Ompq = aapq / |aapq|
									ompqR = aapqR / aapqMag;
									ompqI = aapqI / aapqMag;

									if ( ir1 === 0 ) {
										notrot = 0;
										pskipped = 0;
										iswrot += 1;
									}

									if ( rotok ) {
										aqoap = aaqq / aapp;
										apoaq = aapp / aaqq;
										theta = -0.5 * Math.abs( aqoap - apoaq ) / aapq1;

										if ( Math.abs( theta ) > bigtheta ) {
											t = 0.5 / theta;
											cs = 1.0;
											// CONJG(OMPQ)*T => sine for zrot is (conj(ompq))*t
											sScratch[ 0 ] = ompqR * t;
											sScratch[ 1 ] = -ompqI * t;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sScratch );
											if ( rsvec ) {
												vp0 = offsetV + ( ( p - 1 ) * strideV2 );
												vq0 = offsetV + ( ( q - 1 ) * strideV2 );

												// Recompute sScratch (same value, but explicit)
												sScratch[ 0 ] = ompqR * t;
												sScratch[ 1 ] = -ompqI * t;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sScratch );
											}
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + ( t * apoaq * aapq1 ) ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - ( t * aqoap * aapq1 ) ) );
											if ( Math.abs( t ) > mxsinj ) {
												mxsinj = Math.abs( t );
											}
										} else {
											// Choose correct signum for theta and rotate
											thsign = ( aapq1 >= 0.0 ) ? -1.0 : 1.0;
											t = 1.0 / ( theta + ( thsign * Math.sqrt( 1.0 + ( theta * theta ) ) ) );
											cs = Math.sqrt( 1.0 / ( 1.0 + ( t * t ) ) );
											sn = t * cs;
											if ( Math.abs( sn ) > mxsinj ) {
												mxsinj = Math.abs( sn );
											}
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + ( t * apoaq * aapq1 ) ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - ( t * aqoap * aapq1 ) ) );

											// CONJG(OMPQ)*SN
											sScratch[ 0 ] = ompqR * sn;
											sScratch[ 1 ] = -ompqI * sn;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sScratch );
											if ( rsvec ) {
												vp0 = offsetV + ( ( p - 1 ) * strideV2 );
												vq0 = offsetV + ( ( q - 1 ) * strideV2 );
												sScratch[ 0 ] = ompqR * sn;
												sScratch[ 1 ] = -ompqI * sn;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sScratch );
											}
										}
										// D(p) = -D(q) * OMPQ  (complex)
										dqR = dv[ dq0 ];
										dqI = dv[ dq0 + 1 ];
										newDpR = ( dqR * ompqR ) - ( dqI * ompqI );
										newDpI = ( dqR * ompqI ) + ( dqI * ompqR );
										dv[ dp0 ] = -newDpR;
										dv[ dp0 + 1 ] = -newDpI;
									} else {
										// Modified Gram-Schmidt-like transformation: A(:,q) <- A(:,q) - aapq * A(:,p) (scaled)
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, A, strideA1, strideA2, aq0 );

										// Zaxpy with -aapq
										zaxpy( M, new Complex128( -aapqR, -aapqI ), work, strideWork, offsetWork, A, strideA1, aq0 );
										zlascl( 'general', 0, 0, 1.0, aaqq, M, 1, A, strideA1, strideA2, aq0 );
										sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 - ( aapq1 * aapq1 ) ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									}

									// In case of cancellation in updating sva(q), sva(p), recompute.
									if ( Math.pow( sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] / aaqq, 2 ) <= rooteps ) {
										if ( aaqq < rootbig && aaqq > rootsfmin ) {
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = dznrm2( M, A, strideA1, aq0 );
										} else {
											res = zlassq( M, A, strideA1, aq0, 0.0, 1.0 );
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = res.scl * Math.sqrt( res.sumsq );
										}
									}
									if ( ( aapp / aapp0 ) <= rooteps ) {
										if ( aapp < rootbig && aapp > rootsfmin ) {
											aapp = dznrm2( M, A, strideA1, ap0 );
										} else {
											res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
											aapp = res.scl * Math.sqrt( res.sumsq );
										}
										sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
									}
								} else {
									// A(:,p) and A(:,q) already numerically orthogonal
									if ( ir1 === 0 ) {
										notrot += 1;
									}
									pskipped += 1;
								}
							} else {
								// A(:,q) is zero column
								if ( ir1 === 0 ) {
									notrot += 1;
								}
								pskipped += 1;
							}

							if ( i <= swband && pskipped > rowskip ) {
								if ( ir1 === 0 ) {
									aapp = -aapp;
								}
								notrot = 0;
								break;
							}
						} // q-loop

						sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
					} else {
						sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
						if ( ir1 === 0 && aapp === 0.0 ) {
							notrot += Math.min( igl + kbl - 1, N ) - p;
						}
					}
				} // p-loop
			} // ir1-loop

			// Off-diagonal blocks
			igl = ( ( ibr - 1 ) * kbl ) + 1;

			bailjbc = false;
			for ( jbc = ibr + 1; jbc <= nbl; jbc++ ) {
				jgl = ( ( jbc - 1 ) * kbl ) + 1;
				ijblsk = 0;
				for ( p = igl; p <= Math.min( igl + kbl - 1, N ); p++ ) {
					aapp = sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ];
					if ( aapp > 0.0 ) {
						pskipped = 0;
						ap0 = offsetA + ( ( p - 1 ) * strideA2 );
						dp0 = ( offsetD + ( ( p - 1 ) * strideD ) ) * 2;

						for ( q = jgl; q <= Math.min( jgl + kbl - 1, N ); q++ ) {
							aaqq = sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ];
							if ( aaqq > 0.0 ) {
								aapp0 = aapp;
								aq0 = offsetA + ( ( q - 1 ) * strideA2 );
								dq0 = ( offsetD + ( ( q - 1 ) * strideD ) ) * 2;

								// Safe Gram-matrix computation
								if ( aaqq >= 1.0 ) {
									if ( aapp >= aaqq ) {
										rotok = ( small * aapp ) <= aaqq;
									} else {
										rotok = ( small * aaqq ) <= aapp;
									}
									if ( aapp < ( big / aaqq ) ) {
										dotZ = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										aapqR = ( dotZ.re / aaqq ) / aapp;
										aapqI = ( dotZ.im / aaqq ) / aapp;
									} else {
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										dotZ = zdotc( M, work, strideWork, offsetWork, A, strideA1, aq0 );
										aapqR = dotZ.re / aaqq;
										aapqI = dotZ.im / aaqq;
									}
								} else {
									if ( aapp >= aaqq ) {
										rotok = aapp <= ( aaqq / small );
									} else {
										rotok = aaqq <= ( aapp / small );
									}
									if ( aapp > ( small / aaqq ) ) {
										// Fortran: ( ZDOTC / MAX(aaqq,aapp) ) / MIN(aaqq,aapp)
										dotZ = zdotc( M, A, strideA1, ap0, A, strideA1, aq0 );
										if ( aaqq >= aapp ) {
											aapqR = ( dotZ.re / aaqq ) / aapp;
											aapqI = ( dotZ.im / aaqq ) / aapp;
										} else {
											aapqR = ( dotZ.re / aapp ) / aaqq;
											aapqI = ( dotZ.im / aapp ) / aaqq;
										}
									} else {
										zcopy( M, A, strideA1, aq0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										dotZ = zdotc( M, A, strideA1, ap0, work, strideWork, offsetWork );
										aapqR = dotZ.re / aapp;
										aapqI = dotZ.im / aapp;
									}
								}

								aapqMag = Math.hypot( aapqR, aapqI );
								aapq1 = -aapqMag;
								if ( -aapq1 > mxaapq ) {
									mxaapq = -aapq1;
								}

								if ( aapqMag > tol ) {
									ompqR = aapqR / aapqMag;
									ompqI = aapqI / aapqMag;
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
											t = 0.5 / theta;
											cs = 1.0;
											sScratch[ 0 ] = ompqR * t;
											sScratch[ 1 ] = -ompqI * t;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sScratch );
											if ( rsvec ) {
												vp0 = offsetV + ( ( p - 1 ) * strideV2 );
												vq0 = offsetV + ( ( q - 1 ) * strideV2 );
												sScratch[ 0 ] = ompqR * t;
												sScratch[ 1 ] = -ompqI * t;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sScratch );
											}
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + ( t * apoaq * aapq1 ) ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - ( t * aqoap * aapq1 ) ) );
											if ( Math.abs( t ) > mxsinj ) {
												mxsinj = Math.abs( t );
											}
										} else {
											thsign = ( aapq1 >= 0.0 ) ? -1.0 : 1.0;
											if ( aaqq > aapp0 ) {
												thsign = -thsign;
											}
											t = 1.0 / ( theta + ( thsign * Math.sqrt( 1.0 + ( theta * theta ) ) ) );
											cs = Math.sqrt( 1.0 / ( 1.0 + ( t * t ) ) );
											sn = t * cs;
											if ( Math.abs( sn ) > mxsinj ) {
												mxsinj = Math.abs( sn );
											}
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + ( t * apoaq * aapq1 ) ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - ( t * aqoap * aapq1 ) ) );

											sScratch[ 0 ] = ompqR * sn;
											sScratch[ 1 ] = -ompqI * sn;
											zrot( M, A, strideA1, ap0, A, strideA1, aq0, cs, sScratch );
											if ( rsvec ) {
												vp0 = offsetV + ( ( p - 1 ) * strideV2 );
												vq0 = offsetV + ( ( q - 1 ) * strideV2 );
												sScratch[ 0 ] = ompqR * sn;
												sScratch[ 1 ] = -ompqI * sn;
												zrot( mvl, V, strideV1, vp0, V, strideV1, vq0, cs, sScratch );
											}
										}
										// D(p) = -D(q) * OMPQ
										dqR = dv[ dq0 ];
										dqI = dv[ dq0 + 1 ];
										newDpR = ( dqR * ompqR ) - ( dqI * ompqI );
										newDpI = ( dqR * ompqI ) + ( dqI * ompqR );
										dv[ dp0 ] = -newDpR;
										dv[ dp0 + 1 ] = -newDpI;
									} else if ( aapp > aaqq ) {
										// Modified Gram-Schmidt: subtract aapq*A(:,p) from A(:,q)
										zcopy( M, A, strideA1, ap0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, A, strideA1, strideA2, aq0 );
										zaxpy( M, new Complex128( -aapqR, -aapqI ), work, strideWork, offsetWork, A, strideA1, aq0 );
										zlascl( 'general', 0, 0, 1.0, aaqq, M, 1, A, strideA1, strideA2, aq0 );
										sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 - ( aapq1 * aapq1 ) ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									} else {
										// Modified Gram-Schmidt: subtract conj(aapq)*A(:,q) from A(:,p)
										zcopy( M, A, strideA1, aq0, work, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWork, strideWork, offsetWork );
										zlascl( 'general', 0, 0, aapp, 1.0, M, 1, A, strideA1, strideA2, ap0 );

										// CONJG(AAPQ) = (aapqR, -aapqI); -CONJG(AAPQ) = (-aapqR, aapqI)
										zaxpy( M, new Complex128( -aapqR, aapqI ), work, strideWork, offsetWork, A, strideA1, ap0 );
										zlascl( 'general', 0, 0, 1.0, aapp, M, 1, A, strideA1, strideA2, ap0 );
										sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp * Math.sqrt( Math.max( 0.0, 1.0 - ( aapq1 * aapq1 ) ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									}

									// Recompute sva(q), sva(p) in case of cancellation.
									// Note: Fortran uses (sva(q)/aaqq_old)**2 here (squared); diagonal block above uses unsquared.
									if ( Math.pow( sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] / aaqq, 2 ) <= rooteps ) {
										if ( aaqq < rootbig && aaqq > rootsfmin ) {
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = dznrm2( M, A, strideA1, aq0 );
										} else {
											res = zlassq( M, A, strideA1, aq0, 0.0, 1.0 );
											sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = res.scl * Math.sqrt( res.sumsq );
										}
									}
									if ( Math.pow( aapp / aapp0, 2 ) <= rooteps ) {
										if ( aapp < rootbig && aapp > rootsfmin ) {
											aapp = dznrm2( M, A, strideA1, ap0 );
										} else {
											res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
											aapp = res.scl * Math.sqrt( res.sumsq );
										}
										sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
									}
								} else {
									notrot += 1;
									pskipped += 1;
									ijblsk += 1;
								}
							} else {
								notrot += 1;
								pskipped += 1;
								ijblsk += 1;
							}

							if ( i <= swband && ijblsk >= blskip ) {
								sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
								notrot = 0;
								bailjbc = true;
								break;
							}
							if ( i <= swband && pskipped > rowskip ) {
								aapp = -aapp;
								notrot = 0;
								break;
							}
						} // q-loop (2200)
						if ( bailjbc ) {
							break;
						}
						sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = aapp;
					} else {
						if ( aapp === 0.0 ) {
							notrot += Math.min( jgl + kbl - 1, N ) - jgl + 1;
						}
						if ( aapp < 0.0 ) {
							notrot = 0;
						}
					}
				} // p-loop (2100)
				if ( bailjbc ) {
					break;
				}
			} // jbc-loop

			// Label 2011 — absolute value of sva entries in this ibr block
			for ( p = igl; p <= Math.min( igl + kbl - 1, N ); p++ ) {
				sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = Math.abs( sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] );
			}
		} // ibr-loop

		// Update sva(N)
		ap0 = offsetA + ( ( N - 1 ) * strideA2 );
		if ( sva[ offsetSVA + ( ( N - 1 ) * strideSVA ) ] < rootbig && sva[ offsetSVA + ( ( N - 1 ) * strideSVA ) ] > rootsfmin ) {
			sva[ offsetSVA + ( ( N - 1 ) * strideSVA ) ] = dznrm2( M, A, strideA1, ap0 );
		} else {
			res = zlassq( M, A, strideA1, ap0, 0.0, 1.0 );
			sva[ offsetSVA + ( ( N - 1 ) * strideSVA ) ] = res.scl * Math.sqrt( res.sumsq );
		}

		// Steering: update swband if mxaapq small or few rotations
		if ( i < swband && ( mxaapq <= roottol || iswrot <= N ) ) {
			swband = i;
		}
		if ( i > swband + 1 && mxaapq < Math.sqrt( N ) * tol && ( N * mxaapq * mxsinj ) < tol ) {
			convergedSweep = true;
			break;
		}
		if ( notrot >= emptsw ) {
			convergedSweep = true;
			break;
		}
	} // i-loop

	if ( convergedSweep ) {
		info = 0;
	} else {
		info = nsweep - 1;
	}

	// Sort SVA() and reorder D, A, V accordingly.
	for ( p = 1; p <= N - 1; p++ ) {
		q = idamax( N - p + 1, sva, strideSVA, offsetSVA + ( ( p - 1 ) * strideSVA ) ) + p;
		if ( p !== q ) {
			temp1 = sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ];
			sva[ offsetSVA + ( ( p - 1 ) * strideSVA ) ] = sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ];
			sva[ offsetSVA + ( ( q - 1 ) * strideSVA ) ] = temp1;
			dp0 = ( offsetD + ( ( p - 1 ) * strideD ) ) * 2;
			dq0 = ( offsetD + ( ( q - 1 ) * strideD ) ) * 2;
			temp1 = dv[ dp0 ];
			dv[ dp0 ] = dv[ dq0 ];
			dv[ dq0 ] = temp1;
			temp1 = dv[ dp0 + 1 ];
			dv[ dp0 + 1 ] = dv[ dq0 + 1 ];
			dv[ dq0 + 1 ] = temp1;
			zswap( M, A, strideA1, offsetA + ( ( p - 1 ) * strideA2 ), A, strideA1, offsetA + ( ( q - 1 ) * strideA2 ) );
			if ( rsvec ) {
				zswap( mvl, V, strideV1, offsetV + ( ( p - 1 ) * strideV2 ), V, strideV1, offsetV + ( ( q - 1 ) * strideV2 ) );
			}
		}
	}

	return info;
}


// EXPORTS //

export default zgsvj0;
