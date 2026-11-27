/**
* Property-based validation for dgbrfs, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `rfs` (iterative refinement +
* error bounds) -> three independent properties. dgbrfs refines an approximate
* solution X to op(A)*X = B for a banded A and returns FERR (forward-error bound)
* and BERR (componentwise backward error). The LU factor AFB (+ pivots IPIV) is
* produced by the already-validated dgbtrf; the un-refined initial X by dgbtrs; the
* TRUE solution independently by the trusted dgbsv applied to op(A0) (a band matrix
* whose sub/super-bandwidths swap under transpose). We assert, against the ORIGINAL
* band matrix A0 and op = trans:
*   (a) residual  ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* trans sweeps {no-transpose, transpose, conjugate-transpose}; for a real matrix
* transpose and conjugate-transpose coincide, but both API paths are exercised.
*
* AB (original band) is realized WITHOUT the LU fill rows (ldab = kl+ku+1, bandrow
* = ku+i-j) — that is what dgbmv/the |A||X| loop read. AFB (the factor) is realized
* WITH the fill rows (`luFill`, ldab = 2*kl+ku+1) and factored by dgbtrf. Storage is
* poisoned so any out-of-bounds read trips a NaN.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dgbrfs from './../lib/ndarray.js';
import dgbtrf from '../../dgbtrf/lib/ndarray.js';
import dgbtrs from '../../dgbtrs/lib/ndarray.js';
import dgbsv from '../../dgbsv/lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
const NS = [ 3, 5, 8, 16, 17, 33 ];
const BANDS = [ [ 1, 1 ], [ 2, 3 ] ];
const NRHS = [ 1, 2 ];
const TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
const FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Positive-first-dimension-stride banded layouts only: the factor is produced by
// dgbtrf, whose inner idamax pivot search is out of contract for a negative
// first-dim (band-row) stride (see LEARNINGS.md getrf/getf2 family).
const BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});

// Map an API transpose flag to a reference transpose code.
function transCode( trans ) {
	if ( trans === 'transpose' ) {
		return 't';
	}
	if ( trans === 'conjugate-transpose' ) {
		return 'c';
	}
	return 'n';
}

// Clamp (kl,ku) to [0,N-1].
function clampBand( N, kl, ku ) {
	const hi = Math.max( 0, N - 1 );
	return [ Math.min( kl, hi ), Math.min( ku, hi ) ];
}

// Read column j out of physical storage as an array of scalar values.
function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Capture a realized band array as a raw (ldab x N) dense LogicalMatrix — every
// physical (bandrow, col) slot, poisoned corners included — so a FIXED factor can
// be re-realized bit-identically at any dense layout.
function readBand( realized, ldab, n ) {
	const s1 = realized.args[ 0 ];
	const s2 = realized.args[ 1 ];
	const off = realized.args[ 2 ];
	const M = new LogicalMatrix( sc, ldab, n );
	let r, c;
	for ( c = 0; c < n; c++ ) {
		for ( r = 0; r < ldab; r++ ) {
			M.set( r, c, sc.read( realized.data, off + ( r * s1 ) + ( c * s2 ) ) );
		}
	}
	return M;
}

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( a[ i ] );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// inf-norm of the difference of two scalar-value vectors.
function diffInfNorm( a, b ) {
	let mx = 0.0;
	let m, i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Build op(A0) as a LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H (= A0^T for
// a real matrix). Under transpose the band's sub/super-bandwidths swap.
function opBanded( A0, N, code ) {
	const M = new LogicalMatrix( sc, N, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( code === 'n' ) {
				M.set( i, j, A0.get( i, j ) );
			} else if ( code === 'c' ) {
				M.set( i, j, sc.conj( A0.get( j, i ) ) );
			} else {
				M.set( i, j, A0.get( j, i ) );
			}
		}
	}
	return M;
}

// Independent TRUE solution of op(A0)*X = B0 on fresh banded copies with trusted
// dgbsv (op(A0) is banded with kl/ku swapped under transpose).
function trueSolution( A0, B0, N, nrhs, code, kl, ku ) {
	const M = opBanded( A0, N, code );
	const okl = ( code === 'n' ) ? kl : ku;
	const oku = ( code === 'n' ) ? ku : kl;
	const Ar = schemes.banded.realize( sc, M, { 'kl': okl, 'ku': oku, 'luFill': true }, BANDED_POS[ 0 ] );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const ipiv = new Int32Array( N );
	const info = dgbsv( N, okl, oku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dgbsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across trans flags, a size sweep, (kl,ku), nrhs.
test( 'dgbrfs: refinement residual + BERR + FERR bound (trans x N x (kl,ku) x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		NS.forEach( function eachN( N ) {
			BANDS.forEach( function eachBand( b ) {
				const cb = clampBand( N, b[ 0 ], b[ 1 ] );
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( trans, N, cb[ 0 ], cb[ 1 ], nrhs );
				});
			});
		});
	});
});

function runProperty( trans, N, kl, ku, nrhs ) {
	const rng = new RNG( 0x3000 + ( N * 1000 ) + ( kl * 100 ) + ( ku * 10 ) + nrhs );
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const B0 = logical.general( sc, rng, N, nrhs );
	const code = transCode( trans );

	// AB = original band (no fill rows); AFB = its LU factor (+ pivots IPIV):
	const ABr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, BANDED_POS[ 0 ] );
	const AFBr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, BANDED_POS[ 0 ] );
	const ipiv = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0 );

	// B (RHS, unchanged) and X (initial un-refined solve of op(A)X=B, refined in place):
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	const Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	dgbtrs( trans, N, kl, ku, nrhs, AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = poisonedWork( sc, 3 * N ); // poisoned: OOB read -> NaN
	const IWORK = new Int32Array( N );
	dgbrfs( trans, N, kl, ku, nrhs, ABr.data, ABr.args[ 0 ], ABr.args[ 1 ], ABr.args[ 2 ], AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );

	const Xtrue = trueSolution( A0, B0, N, nrhs, code, kl, ku );

	const tag = 'dgbrfs '+trans+' N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of op(A0)*X = B0.
	checked( 'dgbrfs', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'dgbrfs', 'structural', function run() {
		let xcol, tcol, eActual, eBound, j;
		const berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
		for ( j = 0; j < nrhs; j++ ) {
			// BERR:
			if ( !Number.isFinite( BERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': BERR not finite ('+BERR[ j ]+')' );
			}
			if ( !( BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ]+' is negative' );
			}
			if ( !( BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}

			// FERR bound validity vs the independent true solution:
			if ( !Number.isFinite( FERR[ j ] ) ) {
				throw new Error( tag+' col='+j+': FERR not finite ('+FERR[ j ]+')' );
			}
			if ( !( FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ]+' is negative' );
			}
			if ( !( FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Step 4: layout-invariance fuzz. dgbrfs consumes an already-computed factorization
// (AFB + IPIV) and refines a given initial X, so this test freezes A0, the LU factor
// AFB, IPIV, and the initial X ONCE at the tight positive-sgn1 layout, then
// re-realizes those FIXED values at every positive-sgn1 banded layout and runs only
// dgbrfs. Its inner residual kernel dgbmv has a col<->row fast-path switch that
// legitimately reorders the accumulation on a storage-order flip (~1 ULP), so
// bit-exactness is asserted WITHIN each storage-order family (col / row); the swept
// residual above certifies cross-order correctness. IPIV is a plain Int32Array
// (layout-independent) and is shared unchanged across all variants.
const COL_LAYOUTS = BANDED_POS.filter( function isCol( L ) {
	return L.order !== 'row';
});
const ROW_LAYOUTS = BANDED_POS.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgbrfs: bit-exact within storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, COL_LAYOUTS, 'col' );
		runInvariance( trans, ROW_LAYOUTS, 'row' );
	});
});

function runInvariance( trans, variants, fam ) {
	const N = 11;
	const kl = 2;
	const ku = 3;
	const nrhs = 2;
	const ldabFac = ( 2 * kl ) + ku + 1;
	const SEED = 0xF00D;
	const rng = new RNG( SEED );
	const A0 = logical.banded( sc, rng, N, N, kl, ku );
	const B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE at the tight positive layout to obtain the fixed LU factor +
	// pivots, and the fixed initial X, shared by every layout variant below:
	const AFB0 = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, BANDED_POS[ 0 ] );
	const ipiv = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AFB0.data, AFB0.args[ 0 ], AFB0.args[ 1 ], AFB0.args[ 2 ], ipiv, 1, 0 );
	const Lfac = readBand( AFB0, ldabFac, N ); // frozen factored band array (dense ldab x N)

	const X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	dgbtrs( trans, N, kl, ku, nrhs, AFB0.data, AFB0.args[ 0 ], AFB0.args[ 1 ], AFB0.args[ 2 ], ipiv, 1, 0, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	const Xinit = readMat( X0r, N, nrhs );

	checked( 'dgbrfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const ABr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, layout );
			const AFBr = schemes.dense.realize( sc, Lfac, { 'part': 'full' }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, layout );
			const FERR = new Float64Array( nrhs );
			const BERR = new Float64Array( nrhs );
			const WORK = poisonedWork( sc, 3 * N );
			const IWORK = new Int32Array( N );
			dgbrfs( trans, N, kl, ku, nrhs, ABr.data, ABr.args[ 0 ], ABr.args[ 1 ], ABr.args[ 2 ], AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
			const out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			let k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'dgbrfs '+trans+' layout invariance '+fam+'-major' } );
	});
}
