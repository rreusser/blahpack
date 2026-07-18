/**
* Property-based validation for zgbrfs, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `rfs` (iterative refinement +
* error bounds) -> three independent properties. zgbrfs refines an approximate
* solution X to op(A)*X = B for a banded A and returns FERR (forward-error bound)
* and BERR (componentwise backward error). The LU factor AFB (+ pivots IPIV) is
* produced by the already-validated zgbtrf; the un-refined initial X by zgbtrs; the
* TRUE solution independently by the trusted zgbsv applied to op(A0) (a band matrix
* whose sub/super-bandwidths swap under transpose). We assert, against the ORIGINAL
* band matrix A0 and op = trans:
*   (a) residual  ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (still a valid solve)
*   (b) backward error  each BERR[j] tiny (~eps) and >= 0
*   (c) forward-error bound  the ACTUAL error ‖Xtrue-X‖inf/‖X‖inf <= FERR[j]*C,
*       FERR >= 0 and < 1 (a valid, not-absurdly-loose upper bound).
* trans sweeps {no-transpose, transpose, conjugate-transpose}; for conjugate-transpose
* the oracle solves A0^H, exercising the complex-conjugation seam.
*
* AB (original band) is realized WITHOUT the LU fill rows (ldab = kl+ku+1, bandrow
* = ku+i-j) — that is what zgbmv/the |A||X| loop read. AFB (the factor) is realized
* WITH the fill rows (`luFill`, ldab = 2*kl+ku+1) and factored by zgbtrf. The complex
* WORK (2*N) is poisoned; RWORK (N) is NaN-filled (written before read each RHS).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import zgbrfs from './../lib/ndarray.js';
import zgbtrf from '../../zgbtrf/lib/ndarray.js';
import zgbtrs from '../../zgbtrs/lib/ndarray.js';
import zgbsv from '../../zgbsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NS = [ 3, 5, 8, 16, 17, 33 ];
var BANDS = [ [ 1, 1 ], [ 2, 3 ] ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.layouts()[ 0 ]; // tight col-major
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Positive-first-dimension-stride banded layouts only: the factor is produced by
// zgbtrf, whose inner izamax pivot search is out of contract for a negative
// first-dim (band-row) stride (see LEARNINGS.md getrf/getf2 family).
var BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
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
	var hi = Math.max( 0, N - 1 );
	return [ Math.min( kl, hi ), Math.min( ku, hi ) ];
}

// Read column j out of physical storage as an array of scalar values.
function readCol( R, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

// Column j of a LogicalMatrix as an array of scalar values.
function logicalCol( M, n, j ) {
	var col = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

// Read the full N x nrhs matrix out of physical storage into a LogicalMatrix.
function readMat( R, n, nrhs ) {
	var X = new LogicalMatrix( sc, n, nrhs );
	var i;
	var j;
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
	var s1 = realized.args[ 0 ];
	var s2 = realized.args[ 1 ];
	var off = realized.args[ 2 ];
	var M = new LogicalMatrix( sc, ldab, n );
	var r;
	var c;
	for ( c = 0; c < n; c++ ) {
		for ( r = 0; r < ldab; r++ ) {
			M.set( r, c, sc.read( realized.data, off + ( r * s1 ) + ( c * s2 ) ) );
		}
	}
	return M;
}

// inf-norm of a vector of scalar values (max modulus).
function infNormVec( a ) {
	var mx = 0.0;
	var m;
	var i;
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
	var mx = 0.0;
	var m;
	var i;
	for ( i = 0; i < a.length; i++ ) {
		m = sc.abs( sc.sub( a[ i ], b[ i ] ) );
		if ( m > mx ) {
			mx = m;
		}
	}
	return mx;
}

// Build op(A0) as a LogicalMatrix: 'n' -> A0, 't' -> A0^T, 'c' -> A0^H. Under
// transpose the band's sub/super-bandwidths swap.
function opBanded( A0, N, code ) {
	var M = new LogicalMatrix( sc, N, N );
	var i;
	var j;
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
// zgbsv (op(A0) is banded with kl/ku swapped under transpose).
function trueSolution( A0, B0, N, nrhs, code, kl, ku ) {
	var M = opBanded( A0, N, code );
	var okl = ( code === 'n' ) ? kl : ku;
	var oku = ( code === 'n' ) ? ku : kl;
	var Ar = schemes.banded.realize( sc, M, { 'kl': okl, 'ku': oku, 'luFill': true }, BANDED_POS[ 0 ] );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( N );
	var info = zgbsv( N, okl, oku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zgbsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Steps 2-3-5: three properties across trans flags, a size sweep, (kl,ku), nrhs.
test( 'zgbrfs: refinement residual + BERR + FERR bound (trans x N x (kl,ku) x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		NS.forEach( function eachN( N ) {
			BANDS.forEach( function eachBand( b ) {
				var cb = clampBand( N, b[ 0 ], b[ 1 ] );
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( trans, N, cb[ 0 ], cb[ 1 ], nrhs );
				});
			});
		});
	});
});

function runProperty( trans, N, kl, ku, nrhs ) {
	var rng = new RNG( 0x3000 + ( N * 1000 ) + ( kl * 100 ) + ( ku * 10 ) + nrhs );
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var B0 = logical.general( sc, rng, N, nrhs );
	var code = transCode( trans );

	// AB = original band (no fill rows); AFB = its LU factor (+ pivots IPIV):
	var ABr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, BANDED_POS[ 0 ] );
	var AFBr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, BANDED_POS[ 0 ] );
	var ipiv = new Int32Array( N );
	zgbtrf( N, N, kl, ku, AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0 );

	// B (RHS, unchanged) and X (initial un-refined solve of op(A)X=B, refined in place):
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zgbtrs( trans, N, kl, ku, nrhs, AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ] );

	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = poisonedWork( sc, 2 * N ); // 2*N complex, poisoned: OOB read -> NaN
	var RWORK = new Float64Array( Math.max( N, 1 ) );
	RWORK.fill( NaN ); // poison: written before read each RHS
	zgbrfs( trans, N, kl, ku, nrhs, ABr.data, ABr.args[ 0 ], ABr.args[ 1 ], ABr.args[ 2 ], AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	var Xtrue = trueSolution( A0, B0, N, nrhs, code, kl, ku );

	var tag = 'zgbrfs '+trans+' N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs;

	// (a) residual: refined X remains a valid solution of op(A0)*X = B0.
	checked( 'zgbrfs', 'residual', function run() {
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) backward error: BERR[j] tiny and >= 0; (c) forward-error bound valid.
	checked( 'zgbrfs', 'structural', function run() {
		var xcol;
		var tcol;
		var berrCap;
		var eActual;
		var eBound;
		var j;
		berrCap = Math.max( 1e-12, 8.0 * ( N + 1 ) * EPS );
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

// Step 4: layout-invariance fuzz. zgbrfs consumes an already-computed factorization
// (AFB + IPIV) and refines a given initial X, so this test freezes A0, the LU factor
// AFB, IPIV, and the initial X ONCE at the tight positive-sgn1 layout, then
// re-realizes those FIXED values at every positive-sgn1 banded layout and runs only
// zgbrfs. Its inner residual kernel zgbmv has a col<->row fast-path switch that
// legitimately reorders the accumulation on a storage-order flip (~1 ULP), so
// bit-exactness is asserted WITHIN each storage-order family (col / row); the swept
// residual above certifies cross-order correctness. IPIV is a plain Int32Array
// (layout-independent) and is shared unchanged across all variants.
var COL_LAYOUTS = BANDED_POS.filter( function isCol( L ) {
	return L.order !== 'row';
});
var ROW_LAYOUTS = BANDED_POS.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgbrfs: bit-exact within storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, COL_LAYOUTS, 'col' );
		runInvariance( trans, ROW_LAYOUTS, 'row' );
	});
});

function runInvariance( trans, variants, fam ) {
	var N = 11;
	var kl = 2;
	var ku = 3;
	var nrhs = 2;
	var ldabFac = ( 2 * kl ) + ku + 1;
	var SEED = 0xF00D;
	var rng = new RNG( SEED );
	var A0 = logical.banded( sc, rng, N, N, kl, ku );
	var B0 = logical.general( sc, rng, N, nrhs );

	// Factor ONCE at the tight positive layout to obtain the fixed LU factor +
	// pivots, and the fixed initial X, shared by every layout variant below:
	var AFB0 = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': true }, BANDED_POS[ 0 ] );
	var ipiv = new Int32Array( N );
	zgbtrf( N, N, kl, ku, AFB0.data, AFB0.args[ 0 ], AFB0.args[ 1 ], AFB0.args[ 2 ], ipiv, 1, 0 );
	var Lfac = readBand( AFB0, ldabFac, N ); // frozen factored band array (dense ldab x N)

	var X0r = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	zgbtrs( trans, N, kl, ku, nrhs, AFB0.data, AFB0.args[ 0 ], AFB0.args[ 1 ], AFB0.args[ 2 ], ipiv, 1, 0, X0r.data, X0r.args[ 0 ], X0r.args[ 1 ], X0r.args[ 2 ] );
	var Xinit = readMat( X0r, N, nrhs );

	checked( 'zgbrfs', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var ABr = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku }, layout );
			var AFBr = schemes.dense.realize( sc, Lfac, { 'part': 'full' }, layout );
			var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			var Xr = schemes.dense.realize( sc, Xinit, { 'part': 'full' }, layout );
			var FERR = new Float64Array( nrhs );
			var BERR = new Float64Array( nrhs );
			var WORK = poisonedWork( sc, 2 * N );
			var RWORK = new Float64Array( N );
			RWORK.fill( NaN );
			zgbrfs( trans, N, kl, ku, nrhs, ABr.data, ABr.args[ 0 ], ABr.args[ 1 ], ABr.args[ 2 ], AFBr.data, AFBr.args[ 0 ], AFBr.args[ 1 ], AFBr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
			var out = check.flattenLogical( sc, readMat( Xr, N, nrhs ) );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				out.push( FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( BERR[ k ] );
			}
			return out;
		}, { 'label': 'zgbrfs '+trans+' layout invariance '+fam+'-major' } );
	});
}
