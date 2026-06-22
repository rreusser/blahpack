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

// MODULES //

import ddot from '../../../../blas/base/ddot/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Pre-processor for dgesvj performing a sweep of Jacobi plane rotations.
*
* Applies Jacobi plane rotations from the right to an M-by-N matrix
* `A*diag(D)` in column pivoted cyclic order. The scaled columns
* encode the actual matrix as `A(:,j)*D(j)`.
*
* @private
* @param {string} jobv - `'compute-v'` to accumulate into V (RSVEC), `'apply-v'` to apply to existing MV-by-N V (APPLV), `'no-v'` otherwise
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A (and size of the 'right' side of V)
* @param {Float64Array} A - input M-by-N matrix in column-major layout
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index into `A`
* @param {Float64Array} d - N-length diagonal scale array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index into `d`
* @param {Float64Array} sva - N-length array of scaled column norms `||A(:,j)||*D(j)`
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index into `sva`
* @param {NonNegativeInteger} mv - number of rows of V when `jobv='apply-v'`
* @param {Float64Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index into `V`
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance (must be > eps)
* @param {NonNegativeInteger} nsweep - number of sweeps to perform
* @param {Float64Array} work - workspace array of length at least `M`
* @param {integer} strideWORK - stride length for `work`
* @param {NonNegativeInteger} offsetWORK - starting index into `work`
* @param {NonNegativeInteger} lwork - length of workspace (must be >= M)
* @returns {integer} info code: 0 on convergence, otherwise last completed sweep
*/
function dgsvj0( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	var rootsfmin;
	var bigtheta;
	var pskipped;
	var roottol;
	var rooteps;
	var rootbig;
	var notrot;
	var mxaapq;
	var mxsinj;
	var blskip;
	var iswrot;
	var thsign;
	var emptsw;
	var lkahead;
	var rowskip;
	var ijblsk;
	var applv;
	var rotok;
	var rsvec;
	var aapp0;
	var apoaq;
	var aqoap;
	var small;
	var theta;
	var swband;
	var temp1;
	var aapp;
	var aaqq;
	var aapq;
	var info;
	var big;
	var mvl;
	var nbl;
	var kbl;
	var ibr;
	var jbc;
	var igl;
	var jgl;
	var ir1;
	var ap0;
	var ap1;
	var aq0;
	var vp0;
	var vq0;
	var dp0;
	var dq0;
	var res;
	var cs;
	var sn;
	var p;
	var q;
	var t;
	var i;
	var bailjbc; // bail out of jbc-loop (label 2011)
	var convergedSweep; // early termination (label 1994)

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
	kbl = ( 8 < N ) ? 8 : N;
	nbl = ( N / kbl ) | 0;
	if ( ( nbl * kbl ) !== N ) {
		nbl += 1;
	}
	blskip = ( kbl * kbl ) + 1;
	rowskip = ( 5 < kbl ) ? 5 : kbl;
	lkahead = 1;
	swband = 0;
	pskipped = 0;
	iswrot = 0;
	mxaapq = 0.0;
	mxsinj = 0.0;
	ijblsk = 0;

	convergedSweep = false;

	for ( i = 1; i <= nsweep; i++ ) {
		mxaapq = 0.0;
		mxsinj = 0.0;
		iswrot = 0;
		notrot = 0;
		pskipped = 0;

		for ( ibr = 1; ibr <= nbl; ibr++ ) {
			igl = ( ibr - 1 ) * kbl + 1;

			for ( ir1 = 0; ir1 <= Math.min( lkahead, nbl - ibr ); ir1++ ) {
				igl += ir1 * kbl;

				// p loop: p = igl .. min(igl+kbl-1, N-1) (1-based, Fortran)
				for ( p = igl; p <= Math.min( igl + kbl - 1, N - 1 ); p++ ) {
					// De Rijk's pivoting: q = argmax of sva[p..N] + p
					// Note Fortran uses idamax on SVA(p..N), returns 1-based index
					// relative to start; we add (p-1) to get absolute 1-based index.
					q = idamax( N - p + 1, sva, strideSVA, offsetSVA + ( p - 1 ) * strideSVA ) + p; // 1-based absolute
					if ( p !== q ) {
						ap0 = offsetA + ( p - 1 ) * strideA2;
						aq0 = offsetA + ( q - 1 ) * strideA2;
						dswap( M, A, strideA1, ap0, A, strideA1, aq0 );
						if ( rsvec ) {
							vp0 = offsetV + ( p - 1 ) * strideV2;
							vq0 = offsetV + ( q - 1 ) * strideV2;
							dswap( mvl, V, strideV1, vp0, V, strideV1, vq0 );
						}
						dp0 = offsetSVA + ( p - 1 ) * strideSVA;
						dq0 = offsetSVA + ( q - 1 ) * strideSVA;
						temp1 = sva[ dp0 ];
						sva[ dp0 ] = sva[ dq0 ];
						sva[ dq0 ] = temp1;
						dp0 = offsetD + ( p - 1 ) * strideD;
						dq0 = offsetD + ( q - 1 ) * strideD;
						temp1 = d[ dp0 ];
						d[ dp0 ] = d[ dq0 ];
						d[ dq0 ] = temp1;
					}
					ap0 = offsetA + ( p - 1 ) * strideA2;
					dp0 = offsetD + ( p - 1 ) * strideD;

					if ( ir1 === 0 ) {
						if ( sva[ offsetSVA + ( p - 1 ) * strideSVA ] < rootbig && sva[ offsetSVA + ( p - 1 ) * strideSVA ] > rootsfmin ) {
							sva[ offsetSVA + ( p - 1 ) * strideSVA ] = dnrm2( M, A, strideA1, ap0 ) * d[ dp0 ];
						} else {
							res = dlassq( M, A, strideA1, ap0, 0.0, 1.0 );
							sva[ offsetSVA + ( p - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq ) * d[ dp0 ];
						}
						aapp = sva[ offsetSVA + ( p - 1 ) * strideSVA ];
					} else {
						aapp = sva[ offsetSVA + ( p - 1 ) * strideSVA ];
					}

					if ( aapp > 0.0 ) {
						pskipped = 0;

						for ( q = p + 1; q <= Math.min( igl + kbl - 1, N ); q++ ) {
							aaqq = sva[ offsetSVA + ( q - 1 ) * strideSVA ];
							if ( aaqq > 0.0 ) {
								aapp0 = aapp;
								aq0 = offsetA + ( q - 1 ) * strideA2;
								dq0 = offsetD + ( q - 1 ) * strideD;

								if ( aaqq >= 1.0 ) {
									rotok = ( small * aapp ) <= aaqq;
									if ( aapp < ( big / aaqq ) ) {
										aapq = ( ( ddot( M, A, strideA1, ap0, A, strideA1, aq0 ) * d[ dp0 ] * d[ dq0 ] ) / aaqq ) / aapp;
									} else {
										dcopy( M, A, strideA1, ap0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aapp, d[ dp0 ], M, 1, work, strideWORK, strideWORK, offsetWORK );
										aapq = ( ddot( M, work, strideWORK, offsetWORK, A, strideA1, aq0 ) * d[ dq0 ] ) / aaqq;
									}
								} else {
									rotok = aapp <= ( aaqq / small );
									if ( aapp > ( small / aaqq ) ) {
										aapq = ( ( ddot( M, A, strideA1, ap0, A, strideA1, aq0 ) * d[ dp0 ] * d[ dq0 ] ) / aaqq ) / aapp;
									} else {
										dcopy( M, A, strideA1, aq0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aaqq, d[ dq0 ], M, 1, work, strideWORK, strideWORK, offsetWORK );
										aapq = ( ddot( M, work, strideWORK, offsetWORK, A, strideA1, ap0 ) * d[ dp0 ] ) / aapp;
									}
								}

								if ( Math.abs( aapq ) > mxaapq ) {
									mxaapq = Math.abs( aapq );
								}

								if ( Math.abs( aapq ) > tol ) {
									if ( ir1 === 0 ) {
										notrot = 0;
										pskipped = 0;
										iswrot += 1;
									}

									if ( rotok ) {
										aqoap = aaqq / aapp;
										apoaq = aapp / aaqq;
										theta = -0.5 * Math.abs( aqoap - apoaq ) / aapq;

										if ( Math.abs( theta ) > bigtheta ) {
											t = 0.5 / theta;
											applyFastRotation( M, A, strideA1, ap0, A, strideA1, aq0, ( t * d[ dp0 ] ) / d[ dq0 ], ( -t * d[ dq0 ] ) / d[ dp0 ] );
											if ( rsvec ) {
												vp0 = offsetV + ( p - 1 ) * strideV2;
												vq0 = offsetV + ( q - 1 ) * strideV2;
												applyFastRotation( mvl, V, strideV1, vp0, V, strideV1, vq0, ( t * d[ dp0 ] ) / d[ dq0 ], ( -t * d[ dq0 ] ) / d[ dp0 ] );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq ) );
											if ( Math.abs( t ) > mxsinj ) {
												mxsinj = Math.abs( t );
											}
										} else {
											thsign = ( aapq >= 0.0 ) ? -1.0 : 1.0;
											t = 1.0 / ( theta + thsign * Math.sqrt( 1.0 + theta * theta ) );
											cs = Math.sqrt( 1.0 / ( 1.0 + t * t ) );
											sn = t * cs;
											if ( Math.abs( sn ) > mxsinj ) {
												mxsinj = Math.abs( sn );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq ) );

											apoaq = d[ dp0 ] / d[ dq0 ];
											aqoap = d[ dq0 ] / d[ dp0 ];
											vp0 = offsetV + ( p - 1 ) * strideV2;
											vq0 = offsetV + ( q - 1 ) * strideV2;
											if ( d[ dp0 ] >= 1.0 ) {
												if ( d[ dq0 ] >= 1.0 ) {
													applyFastRotation( M, A, strideA1, ap0, A, strideA1, aq0, t * apoaq, -t * aqoap );
													d[ dp0 ] *= cs;
													d[ dq0 ] *= cs;
													if ( rsvec ) {
														applyFastRotation( mvl, V, strideV1, vp0, V, strideV1, vq0, t * apoaq, -t * aqoap );
													}
												} else {
													daxpy( M, -t * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
													daxpy( M, cs * sn * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
													d[ dp0 ] *= cs;
													d[ dq0 ] /= cs;
													if ( rsvec ) {
														daxpy( mvl, -t * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
														daxpy( mvl, cs * sn * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													}
												}
											} else if ( d[ dq0 ] >= 1.0 ) {
												daxpy( M, t * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												daxpy( M, -cs * sn * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												d[ dp0 ] /= cs;
												d[ dq0 ] *= cs;
												if ( rsvec ) {
													daxpy( mvl, t * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													daxpy( mvl, -cs * sn * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
												}
											} else if ( d[ dp0 ] >= d[ dq0 ] ) {
												daxpy( M, -t * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												daxpy( M, cs * sn * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												d[ dp0 ] *= cs;
												d[ dq0 ] /= cs;
												if ( rsvec ) {
													daxpy( mvl, -t * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
													daxpy( mvl, cs * sn * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
												}
											} else {
												daxpy( M, t * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												daxpy( M, -cs * sn * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												d[ dp0 ] /= cs;
												d[ dq0 ] *= cs;
												if ( rsvec ) {
													daxpy( mvl, t * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													daxpy( mvl, -cs * sn * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
												}
											}
										}
									} else {
										// Modified Gram-Schmidt like transformation
										dcopy( M, A, strideA1, ap0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWORK, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aaqq, 1.0, M, 1, A, strideA1, strideA2, aq0 );
										temp1 = ( -aapq * d[ dp0 ] ) / d[ dq0 ];
										daxpy( M, temp1, work, strideWORK, offsetWORK, A, strideA1, aq0 );
										dlascl( 'general', 0, 0, 1.0, aaqq, M, 1, A, strideA1, strideA2, aq0 );
										sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 - aapq * aapq ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									}

									// Recompute SVA(q), SVA(p) in case of cancellation.
									// NOTE: In the diagonal-block loop the Fortran
									// uses the *pre-rotation* aaqq for the ratio test
									// (aapp0 for p). Our local `aaqq` still holds that
									// pre-rotation value since we didn't overwrite it.
									if ( Math.pow( sva[ offsetSVA + ( q - 1 ) * strideSVA ] / aaqq, 2 ) <= rooteps ) {
										if ( aaqq < rootbig && aaqq > rootsfmin ) {
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = dnrm2( M, A, strideA1, aq0 ) * d[ dq0 ];
										} else {
											res = dlassq( M, A, strideA1, aq0, 0.0, 1.0 );
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq ) * d[ dq0 ];
										}
									}
									if ( ( aapp / aapp0 ) <= rooteps ) {
										if ( aapp < rootbig && aapp > rootsfmin ) {
											aapp = dnrm2( M, A, strideA1, ap0 ) * d[ dp0 ];
										} else {
											res = dlassq( M, A, strideA1, ap0, 0.0, 1.0 );
											aapp = res.scl * Math.sqrt( res.sumsq ) * d[ dp0 ];
										}
										sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
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

						sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
					} else {
						sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
						if ( ir1 === 0 && aapp === 0.0 ) {
							notrot += Math.min( igl + kbl - 1, N ) - p;
						}
					}
				} // p-loop
			} // ir1-loop

			// Off-diagonal blocks
			igl = ( ibr - 1 ) * kbl + 1;

			bailjbc = false;
			for ( jbc = ibr + 1; jbc <= nbl; jbc++ ) {
				jgl = ( jbc - 1 ) * kbl + 1;
				ijblsk = 0;
				for ( p = igl; p <= Math.min( igl + kbl - 1, N ); p++ ) {
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

								if ( aaqq >= 1.0 ) {
									if ( aapp >= aaqq ) {
										rotok = ( small * aapp ) <= aaqq;
									} else {
										rotok = ( small * aaqq ) <= aapp;
									}
									if ( aapp < ( big / aaqq ) ) {
										aapq = ( ( ddot( M, A, strideA1, ap0, A, strideA1, aq0 ) * d[ dp0 ] * d[ dq0 ] ) / aaqq ) / aapp;
									} else {
										dcopy( M, A, strideA1, ap0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aapp, d[ dp0 ], M, 1, work, strideWORK, strideWORK, offsetWORK );
										aapq = ( ddot( M, work, strideWORK, offsetWORK, A, strideA1, aq0 ) * d[ dq0 ] ) / aaqq;
									}
								} else {
									if ( aapp >= aaqq ) {
										rotok = aapp <= ( aaqq / small );
									} else {
										rotok = aaqq <= ( aapp / small );
									}
									if ( aapp > ( small / aaqq ) ) {
										aapq = ( ( ddot( M, A, strideA1, ap0, A, strideA1, aq0 ) * d[ dp0 ] * d[ dq0 ] ) / aaqq ) / aapp;
									} else {
										dcopy( M, A, strideA1, aq0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aaqq, d[ dq0 ], M, 1, work, strideWORK, strideWORK, offsetWORK );
										aapq = ( ddot( M, work, strideWORK, offsetWORK, A, strideA1, ap0 ) * d[ dp0 ] ) / aapp;
									}
								}

								if ( Math.abs( aapq ) > mxaapq ) {
									mxaapq = Math.abs( aapq );
								}

								if ( Math.abs( aapq ) > tol ) {
									notrot = 0;
									pskipped = 0;
									iswrot += 1;

									if ( rotok ) {
										aqoap = aaqq / aapp;
										apoaq = aapp / aaqq;
										theta = -0.5 * Math.abs( aqoap - apoaq ) / aapq;
										if ( aaqq > aapp0 ) {
											theta = -theta;
										}

										if ( Math.abs( theta ) > bigtheta ) {
											t = 0.5 / theta;
											applyFastRotation( M, A, strideA1, ap0, A, strideA1, aq0, ( t * d[ dp0 ] ) / d[ dq0 ], ( -t * d[ dq0 ] ) / d[ dp0 ] );
											if ( rsvec ) {
												vp0 = offsetV + ( p - 1 ) * strideV2;
												vq0 = offsetV + ( q - 1 ) * strideV2;
												applyFastRotation( mvl, V, strideV1, vp0, V, strideV1, vq0, ( t * d[ dp0 ] ) / d[ dq0 ], ( -t * d[ dq0 ] ) / d[ dp0 ] );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq ) );
											if ( Math.abs( t ) > mxsinj ) {
												mxsinj = Math.abs( t );
											}
										} else {
											thsign = ( aapq >= 0.0 ) ? -1.0 : 1.0;
											if ( aaqq > aapp0 ) {
												thsign = -thsign;
											}
											t = 1.0 / ( theta + thsign * Math.sqrt( 1.0 + theta * theta ) );
											cs = Math.sqrt( 1.0 / ( 1.0 + t * t ) );
											sn = t * cs;
											if ( Math.abs( sn ) > mxsinj ) {
												mxsinj = Math.abs( sn );
											}
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 + t * apoaq * aapq ) );
											aapp *= Math.sqrt( Math.max( 0.0, 1.0 - t * aqoap * aapq ) );

											apoaq = d[ dp0 ] / d[ dq0 ];
											aqoap = d[ dq0 ] / d[ dp0 ];
											vp0 = offsetV + ( p - 1 ) * strideV2;
											vq0 = offsetV + ( q - 1 ) * strideV2;
											if ( d[ dp0 ] >= 1.0 ) {
												if ( d[ dq0 ] >= 1.0 ) {
													applyFastRotation( M, A, strideA1, ap0, A, strideA1, aq0, t * apoaq, -t * aqoap );
													d[ dp0 ] *= cs;
													d[ dq0 ] *= cs;
													if ( rsvec ) {
														applyFastRotation( mvl, V, strideV1, vp0, V, strideV1, vq0, t * apoaq, -t * aqoap );
													}
												} else {
													daxpy( M, -t * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
													daxpy( M, cs * sn * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
													if ( rsvec ) {
														daxpy( mvl, -t * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
														daxpy( mvl, cs * sn * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													}
													d[ dp0 ] *= cs;
													d[ dq0 ] /= cs;
												}
											} else if ( d[ dq0 ] >= 1.0 ) {
												daxpy( M, t * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												daxpy( M, -cs * sn * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												if ( rsvec ) {
													daxpy( mvl, t * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													daxpy( mvl, -cs * sn * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
												}
												d[ dp0 ] /= cs;
												d[ dq0 ] *= cs;
											} else if ( d[ dp0 ] >= d[ dq0 ] ) {
												daxpy( M, -t * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												daxpy( M, cs * sn * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												d[ dp0 ] *= cs;
												d[ dq0 ] /= cs;
												if ( rsvec ) {
													daxpy( mvl, -t * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
													daxpy( mvl, cs * sn * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
												}
											} else {
												daxpy( M, t * apoaq, A, strideA1, ap0, A, strideA1, aq0 );
												daxpy( M, -cs * sn * aqoap, A, strideA1, aq0, A, strideA1, ap0 );
												d[ dp0 ] /= cs;
												d[ dq0 ] *= cs;
												if ( rsvec ) {
													daxpy( mvl, t * apoaq, V, strideV1, vp0, V, strideV1, vq0 );
													daxpy( mvl, -cs * sn * aqoap, V, strideV1, vq0, V, strideV1, vp0 );
												}
											}
										}
									} else if ( aapp > aaqq ) {
										dcopy( M, A, strideA1, ap0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aapp, 1.0, M, 1, work, strideWORK, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aaqq, 1.0, M, 1, A, strideA1, strideA2, aq0 );
										temp1 = ( -aapq * d[ dp0 ] ) / d[ dq0 ];
										daxpy( M, temp1, work, strideWORK, offsetWORK, A, strideA1, aq0 );
										dlascl( 'general', 0, 0, 1.0, aaqq, M, 1, A, strideA1, strideA2, aq0 );
										sva[ offsetSVA + ( q - 1 ) * strideSVA ] = aaqq * Math.sqrt( Math.max( 0.0, 1.0 - aapq * aapq ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									} else {
										dcopy( M, A, strideA1, aq0, work, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aaqq, 1.0, M, 1, work, strideWORK, strideWORK, offsetWORK );
										dlascl( 'general', 0, 0, aapp, 1.0, M, 1, A, strideA1, strideA2, ap0 );
										temp1 = ( -aapq * d[ dq0 ] ) / d[ dp0 ];
										daxpy( M, temp1, work, strideWORK, offsetWORK, A, strideA1, ap0 );
										dlascl( 'general', 0, 0, 1.0, aapp, M, 1, A, strideA1, strideA2, ap0 );
										sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp * Math.sqrt( Math.max( 0.0, 1.0 - aapq * aapq ) );
										if ( sfmin > mxsinj ) {
											mxsinj = sfmin;
										}
									}

									// Recompute sva(q) in case of cancellation
									{
										var svaqNew = sva[ offsetSVA + ( q - 1 ) * strideSVA ];
										var aaqqOld = aapp0; // NOT correct; aaqq pre-rotation was ..
										// aaqq here is still the pre-rotation value since we captured it above
									}
									// Use the actual rule: if (sva(q)/aaqq_old)**2 <= rooteps
									{
										var aaqqOld2 = sva[ offsetSVA + ( q - 1 ) * strideSVA ]; // placeholder
									}
									// Do the actual recomputation using original aaqq saved at top of q-iter.
									// To keep logic identical we stored aaqq *before* any mutation.
									// But we also overwrote it with new sva[q] via the branches above?
									// No — we updated sva[q] directly; local variable `aaqq` is still old.
									if ( Math.pow( sva[ offsetSVA + ( q - 1 ) * strideSVA ] / aaqq, 2 ) <= rooteps ) {
										if ( aaqq < rootbig && aaqq > rootsfmin ) {
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = dnrm2( M, A, strideA1, aq0 ) * d[ dq0 ];
										} else {
											res = dlassq( M, A, strideA1, aq0, 0.0, 1.0 );
											sva[ offsetSVA + ( q - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq ) * d[ dq0 ];
										}
									}
									if ( Math.pow( aapp / aapp0, 2 ) <= rooteps ) {
										if ( aapp < rootbig && aapp > rootsfmin ) {
											aapp = dnrm2( M, A, strideA1, ap0 ) * d[ dp0 ];
										} else {
											res = dlassq( M, A, strideA1, ap0, 0.0, 1.0 );
											aapp = res.scl * Math.sqrt( res.sumsq ) * d[ dp0 ];
										}
										sva[ offsetSVA + ( p - 1 ) * strideSVA ] = aapp;
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
						} // q-loop (2200)
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
				} // p-loop (2100)
				if ( bailjbc ) {
					break;
				}
			} // jbc-loop

			// 2011 continue (reached either normally or via bailjbc)
			for ( p = igl; p <= Math.min( igl + kbl - 1, N ); p++ ) {
				sva[ offsetSVA + ( p - 1 ) * strideSVA ] = Math.abs( sva[ offsetSVA + ( p - 1 ) * strideSVA ] );
			}
		} // ibr-loop

		// Update sva(N)
		ap0 = offsetA + ( N - 1 ) * strideA2;
		dp0 = offsetD + ( N - 1 ) * strideD;
		if ( sva[ offsetSVA + ( N - 1 ) * strideSVA ] < rootbig && sva[ offsetSVA + ( N - 1 ) * strideSVA ] > rootsfmin ) {
			sva[ offsetSVA + ( N - 1 ) * strideSVA ] = dnrm2( M, A, strideA1, ap0 ) * d[ dp0 ];
		} else {
			res = dlassq( M, A, strideA1, ap0, 0.0, 1.0 );
			sva[ offsetSVA + ( N - 1 ) * strideSVA ] = res.scl * Math.sqrt( res.sumsq ) * d[ dp0 ];
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
	} // i-loop

	if ( convergedSweep ) {
		info = 0;
	} else {
		info = nsweep - 1;
	}

	// Sort D by sva
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
			temp1 = d[ dp0 ];
			d[ dp0 ] = d[ dq0 ];
			d[ dq0 ] = temp1;
			dswap( M, A, strideA1, offsetA + ( p - 1 ) * strideA2, A, strideA1, offsetA + ( q - 1 ) * strideA2 );
			if ( rsvec ) {
				dswap( mvl, V, strideV1, offsetV + ( p - 1 ) * strideV2, V, strideV1, offsetV + ( q - 1 ) * strideV2 );
			}
		}
	}

	return info;
}


// HELPERS //

/**
* Applies the in-place transformation x' = x + h12*y, y' = h21*x + y
* (equivalent to DROTM with FLAG=0, where H=[[1,H12],[H21,1]]).
*
* @private
* @param {NonNegativeInteger} N - length
* @param {Float64Array} X - x vector
* @param {integer} strideX - stride of x
* @param {NonNegativeInteger} offsetX - offset into x
* @param {Float64Array} Y - y vector
* @param {integer} strideY - stride of y
* @param {NonNegativeInteger} offsetY - offset into y
* @param {number} h21 - rotation parameter h21 (FASTR(3))
* @param {number} h12 - rotation parameter h12 (FASTR(4))
* @returns {void}
*/
function applyFastRotation( N, X, strideX, offsetX, Y, strideY, offsetY, h21, h12 ) { // eslint-disable-line max-params
	var ix;
	var iy;
	var xv;
	var yv;
	var k;
	ix = offsetX;
	iy = offsetY;
	for ( k = 0; k < N; k++ ) {
		xv = X[ ix ];
		yv = Y[ iy ];
		X[ ix ] = xv + h12 * yv;
		Y[ iy ] = h21 * xv + yv;
		ix += strideX;
		iy += strideY;
	}
}

// EXPORTS //

export default dgsvj0;
