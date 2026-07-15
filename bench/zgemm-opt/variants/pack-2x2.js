/* eslint-disable max-len, max-params, max-statements, max-depth */

// Split re/im scratch-PACKING variant (independent of pure tile geometry).
//
// Deinterleaves the current A row-panel and B column-panel of a KC-deep block
// into separate contiguous real/imag scratch buffers (dsymm-style module
// scratch), then runs a 2x2 complex register microkernel over the packed,
// unit-stride buffers. Packing folds transpose (stride swap) and conjugation
// (sign flip on the packed imag lane) in ONCE per element, so the hot inner
// loop is branch-free and reads sequential memory regardless of the original
// layout — the hypothesis being that unit-stride packed reads beat the strided
// gathers of the in-place tile on the T/C modes.
//
// Faithful 4-mul/2-add complex product (no Gauss/Karatsuba). Gated against
// v0-reference in check.mjs.

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';

// Cache-block depth; scratch holds MR rows (A) + NR cols (B) of a KC panel,
// split into real/imag lanes. Module-level, reused across calls (kernel never
// calls out while these are live).
var KC = 256;
var APR = new Float64Array( 4 * KC ); // up to MR(=4) packed A rows, real
var API = new Float64Array( 4 * KC ); // ... imag
var BPR = new Float64Array( 4 * KC ); // up to NR(=4) packed B cols, real
var BPI = new Float64Array( 4 * KC ); // ... imag

function zgemm( transa, transb, M, N, K, alpha, A, sa1, sa2, oa, B, sb1, sb2, ob, beta, C, sc1, sc2, oc ) {
	var alphaR, alphaI, betaR, betaI, nota, notb, csa, csb;
	var Av, Bv, Cv, ar, ak, bk, bn, sc1d, sc2d, oa2, ob2, oc2;
	var i, j, l, kc, kcEnd, kl, kn, pa, pb, pc;
	var c00R, c00I, c01R, c01I, c10R, c10I, c11R, c11I;
	var a0R, a0I, a1R, a1I, b0R, b0I, b1R, b1I;
	var sR, sI, cR, cI, mb, nb, q, pcc, tR, tI, aRe, aIm, bRe, bIm;
	var ii, jj;

	if ( M === 0 || N === 0 ) return C;
	alphaR = real( alpha ); alphaI = imag( alpha );
	betaR = real( beta ); betaI = imag( beta );
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) return C;
	nota = ( transa === 'no-transpose' ); notb = ( transb === 'no-transpose' );
	csa = ( transa === 'conjugate-transpose' ) ? -1.0 : 1.0;
	csb = ( transb === 'conjugate-transpose' ) ? -1.0 : 1.0;
	Av = reinterpret( A, 0 ); Bv = reinterpret( B, 0 ); Cv = reinterpret( C, 0 );
	oa2 = oa * 2; ob2 = ob * 2; oc2 = oc * 2;
	sa1 *= 2; sa2 *= 2; sb1 *= 2; sb2 *= 2;
	ar = nota ? sa1 : sa2; ak = nota ? sa2 : sa1;
	bk = notb ? sb1 : sb2; bn = notb ? sb2 : sb1;
	sc1d = sc1 * 2; sc2d = sc2 * 2;

	// alpha === 0: scale C by beta.
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			pc = oc2 + ( j * sc2d );
			if ( betaR === 0.0 && betaI === 0.0 ) {
				for ( i = 0; i < M; i++ ) { Cv[ pc ] = 0.0; Cv[ pc + 1 ] = 0.0; pc += sc1d; }
			} else {
				for ( i = 0; i < M; i++ ) { cR = Cv[ pc ]; cI = Cv[ pc + 1 ]; Cv[ pc ] = ( betaR * cR ) - ( betaI * cI ); Cv[ pc + 1 ] = ( betaR * cI ) + ( betaI * cR ); pc += sc1d; }
			}
		}
		return C;
	}

	// Initialize C := beta*C (once), then accumulate alpha*op(A)*op(B) additively
	// across KC panels. This matches the reference math to backward-error tol.
	for ( j = 0; j < N; j++ ) {
		pc = oc2 + ( j * sc2d );
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < M; i++ ) { Cv[ pc ] = 0.0; Cv[ pc + 1 ] = 0.0; pc += sc1d; }
		} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
			for ( i = 0; i < M; i++ ) { cR = Cv[ pc ]; cI = Cv[ pc + 1 ]; Cv[ pc ] = ( betaR * cR ) - ( betaI * cI ); Cv[ pc + 1 ] = ( betaR * cI ) + ( betaI * cR ); pc += sc1d; }
		}
	}

	mb = M - ( M % 2 );
	nb = N - ( N % 2 );

	for ( kc = 0; kc < K; kc += KC ) {
		kcEnd = kc + KC;
		if ( kcEnd > K ) kcEnd = K;
		kl = kcEnd - kc;

		for ( j = 0; j < nb; j += 2 ) {
			// Pack B columns j, j+1 over the panel into split re/im lanes.
			pb = ob2 + ( j * bn ) + ( kc * bk );
			q = 0;
			for ( l = 0; l < kl; l++ ) {
				BPR[ q ] = Bv[ pb ]; BPI[ q ] = csb * Bv[ pb + 1 ];
				BPR[ q + KC ] = Bv[ pb + bn ]; BPI[ q + KC ] = csb * Bv[ pb + bn + 1 ];
				pb += bk;
				q += 1;
			}
			for ( i = 0; i < mb; i += 2 ) {
				// Pack A rows i, i+1 over the panel.
				pa = oa2 + ( i * ar ) + ( kc * ak );
				q = 0;
				for ( l = 0; l < kl; l++ ) {
					APR[ q ] = Av[ pa ]; API[ q ] = csa * Av[ pa + 1 ];
					APR[ q + KC ] = Av[ pa + ar ]; API[ q + KC ] = csa * Av[ pa + ar + 1 ];
					pa += ak;
					q += 1;
				}
				c00R = 0.0; c00I = 0.0; c01R = 0.0; c01I = 0.0;
				c10R = 0.0; c10I = 0.0; c11R = 0.0; c11I = 0.0;
				for ( l = 0; l < kl; l++ ) {
					a0R = APR[ l ]; a0I = API[ l ];
					a1R = APR[ l + KC ]; a1I = API[ l + KC ];
					b0R = BPR[ l ]; b0I = BPI[ l ];
					b1R = BPR[ l + KC ]; b1I = BPI[ l + KC ];
					c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
					c10R += ( a1R * b0R ) - ( a1I * b0I ); c10I += ( a1R * b0I ) + ( a1I * b0R );
					c01R += ( a0R * b1R ) - ( a0I * b1I ); c01I += ( a0R * b1I ) + ( a0I * b1R );
					c11R += ( a1R * b1R ) - ( a1I * b1I ); c11I += ( a1R * b1I ) + ( a1I * b1R );
				}
				// C += alpha * tile (C already holds beta*C + prior panels).
				pc = oc2 + ( i * sc1d ) + ( j * sc2d );
				pcc = pc;
				sR = c00R; sI = c00I; Cv[ pcc ] += ( alphaR * sR ) - ( alphaI * sI ); Cv[ pcc + 1 ] += ( alphaR * sI ) + ( alphaI * sR );
				sR = c10R; sI = c10I; Cv[ pcc + sc1d ] += ( alphaR * sR ) - ( alphaI * sI ); Cv[ pcc + sc1d + 1 ] += ( alphaR * sI ) + ( alphaI * sR );
				pcc = pc + sc2d;
				sR = c01R; sI = c01I; Cv[ pcc ] += ( alphaR * sR ) - ( alphaI * sI ); Cv[ pcc + 1 ] += ( alphaR * sI ) + ( alphaI * sR );
				sR = c11R; sI = c11I; Cv[ pcc + sc1d ] += ( alphaR * sR ) - ( alphaI * sI ); Cv[ pcc + sc1d + 1 ] += ( alphaR * sI ) + ( alphaI * sR );
			}
		}
		// Edge cols [nb,N) over all rows, and edge rows [mb,M) over cols [0,nb):
		// accumulate this panel additively with a scalar complex dot.
		for ( jj = nb; jj < N; jj++ ) { packEdge( jj, 0 ); }
		for ( jj = 0; jj < nb; jj++ ) { packEdge( jj, mb ); }

		// eslint-disable-next-line no-inner-declarations
		function packEdge( col, row0 ) {
			var pbe, pae, le, pce;
			pbe = ob2 + ( col * bn ) + ( kc * bk );
			for ( ii = row0; ii < M; ii++ ) {
				tR = 0.0; tI = 0.0;
				pae = oa2 + ( ii * ar ) + ( kc * ak );
				for ( le = 0; le < kl; le++ ) {
					aRe = Av[ pae ]; aIm = csa * Av[ pae + 1 ];
					bRe = Bv[ pbe + ( le * bk ) ]; bIm = csb * Bv[ pbe + ( le * bk ) + 1 ];
					tR += ( aRe * bRe ) - ( aIm * bIm ); tI += ( aRe * bIm ) + ( aIm * bRe );
					pae += ak;
				}
				pce = oc2 + ( ii * sc1d ) + ( col * sc2d );
				Cv[ pce ] += ( alphaR * tR ) - ( alphaI * tI );
				Cv[ pce + 1 ] += ( alphaR * tI ) + ( alphaI * tR );
			}
		}
	}
	return C;
}

export default zgemm;
