/**
* Property-based validation for zgbsvx, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `gb` -> GENERAL BANDED (schemes.banded
* with sub/super-bandwidths kl/ku, logical.banded); `svx` (EXPERT banded LU-solve
* DRIVER) composes an equilibration (zgbequ/zlaqgb) + banded LU factor (zgbtrf) +
* condition estimate (zgbcon) + solve (zgbtrs) + iterative refinement (zgbrfs). It
* therefore inherits the three independent properties of its parts, checked against
* the ORIGINAL A0/B0:
*   (a) residual   ‖op(A0)*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS  (valid solve)
*   (b) rcond      returned rcond ≈ 1/κ vs an INDEPENDENT true 1/κ within factor F,
*                  in (0,1]
*   (c) ferr/berr  BERR tiny (>=0); actual fwd error ‖Xtrue-X‖inf/‖X‖inf <= FERR*C;
*                  FERR ∈ [0,1).
*
* fact/equed/trans convention (confirmed from lib/base.js):
*   - fact='not-factored' forces equed='none' (rowequ=colequ=false): the
*     equilibration path is BYPASSED, so A/B are NOT scaled and X is the solution
*     of the ORIGINAL op(A0)*X = B0 directly — the residual oracle is A0/B0.
*   - rcond is returned in the result OBJECT (result.rcond), NOT via an array arg
*     (the dgesvx driver class, NOT the dpbsvx equed[]/rcond[] out-array class). The
*     ndarray wrapper returns base(...) verbatim, so base/ndarray rcond are the SAME
*     object (Object.is-equal component by component).
*   - trans in {no-transpose, transpose, conjugate-transpose}; for a COMPLEX matrix
*     these three are DISTINCT (conjugate-transpose conjugates in opMatrix). zgbcon
*     is called with 'one-norm' for no-transpose, 'inf-norm' otherwise; in EVERY
*     case that estimand equals κ₁(op(A0)) (κ_inf(A)=κ₁(A^T)=κ₁(A^H)), so the
*     INDEPENDENT true rcond is 1/(‖op‖₁·‖op⁻¹‖₁) uniformly.
*   - The equilibration path itself (fact='equilibrate') is exercised separately
*     below on a deliberately badly-scaled band matrix, confirming that even when
*     equed != 'none' the returned X still solves the ORIGINAL system (the driver
*     un-scales X on exit, lib/base.js lines ~277-303).
*
* AB is band storage (kl+ku+1) x N; AFB is the factored band (2*kl+ku+1) x N with
* KL fill rows on top (luFill), left NaN-poisoned on entry so a fill-row read before
* write trips a NaN. The complex WORK scratch is poisoned. The trusted independent
* oracle is the banded driver zgbsv (../../zgbsv/lib/ndarray.js).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import zgbsvx from './../lib/ndarray.js';
import zgbsv from '../../zgbsv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var TRANS = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
var NRHS = [ 1, 2 ];

// Positive-first-dimension-stride banded layouts only: zgbtrf's inner idamax pivot
// search walks the band-array first dimension and is out of contract for a negative
// first-dim stride (see LEARNINGS.md getrf/getf2 family).
var BANDED_POS = schemes.banded.layouts().filter( function pos( L ) {
	return L.sgn1 !== -1;
});
var TIGHT_B = BANDED_POS[ 0 ];               // tight col-major band storage
var TIGHT_D = schemes.dense.layouts()[ 0 ];  // tight col-major dense (B / X)
var RCOND_FACTOR = 5; // rcond estimate vs independent truth: within this factor
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// Small (kl,ku) pairs clamped to [0,N-1], deduped: diagonal-only, tridiagonal, and
// two asymmetric bands (upper-heavy / lower-heavy).
function bands( N ) {
	var hi = Math.max( 0, N - 1 );
	var raw = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 1 ] ];
	var seen = {};
	var out = [];
	raw.forEach( function each( p ) {
		var kl = Math.min( p[ 0 ], hi );
		var ku = Math.min( p[ 1 ], hi );
		var key = kl + ':' + ku;
		if ( !seen[ key ] ) {
			seen[ key ] = true;
			out.push( [ kl, ku ] );
		}
	});
	return out;
}

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

// Read a fully-referenced dense buffer back into a LogicalMatrix.
function readMat( R, rows, cols ) {
	var M = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			M.set( i, j, R.read( i, j ) );
		}
	}
	return M;
}

function zeros( rows, cols ) {
	return new LogicalMatrix( sc, rows, cols ); // inits to sc.zero
}

function identity( n ) {
	var M = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		M.set( i, i, sc.one );
	}
	return M;
}

// 1-norm (max abs col sum) of a LogicalMatrix.
function norm1( M ) {
	var best = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < M.cols; j++ ) {
		s = 0.0;
		for ( i = 0; i < M.rows; i++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > best ) {
			best = s;
		}
	}
	return best;
}

// inf-norm of a scalar-value vector (max modulus).
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

// Build op(A0) as a banded LogicalMatrix plus its band widths: 'n' -> A0 (kl,ku);
// 't' -> A0^T (ku,kl); 'c' -> A0^H (ku,kl). op(A0) is the system matrix the
// independent oracle solves; the transpose swaps the sub/super bandwidths.
function opMatrix( A0, N, kl, ku, code ) {
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
	return {
		'M': M,
		'kl': ( code === 'n' ) ? kl : ku,
		'ku': ( code === 'n' ) ? ku : kl
	};
}

// Independent TRUE solution of op(A0)*X = B0 on fresh copies with trusted zgbsv.
function trueSolution( A0, B0, N, kl, ku, nrhs, code ) {
	var op = opMatrix( A0, N, kl, ku, code );
	var Ar = schemes.banded.realize( sc, op.M, { 'kl': op.kl, 'ku': op.ku, 'luFill': true }, TIGHT_B );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT_D );
	var ipiv = new Int32Array( N );
	var info = zgbsv( N, op.kl, op.ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zgbsv failed (info='+info+'); matrix singular?' );
	}
	return Br;
}

// Independent true inverse of op(A0): solve op(A0)*Y = I with zgbsv.
function opInverse( A0, N, kl, ku, code ) {
	var op = opMatrix( A0, N, kl, ku, code );
	var Ar = schemes.banded.realize( sc, op.M, { 'kl': op.kl, 'ku': op.ku, 'luFill': true }, TIGHT_B );
	var Ir = schemes.dense.realize( sc, identity( N ), { 'part': 'full' }, TIGHT_D );
	var ipiv = new Int32Array( N );
	var info = zgbsv( N, op.kl, op.ku, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Ir.data, Ir.args[ 0 ], Ir.args[ 1 ], Ir.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle zgbsv (inverse) failed (info='+info+')' );
	}
	return { 'inv': readMat( Ir, N, N ), 'op': op.M };
}

// Drive zgbsvx on realized copies; return the physical output handles + result
// object. AB: band storage (kl+ku+1) rows. AFB: (2*kl+ku+1) rows with KL poisoned
// fill rows on top. WORK is a poisoned complex scratch.
function callSvx( fact, trans, N, kl, ku, nrhs, A0, B0, abLayout, bLayout ) {
	var Ar = schemes.banded.realize( sc, A0, { 'kl': kl, 'ku': ku, 'luFill': false }, abLayout );
	var AFr = schemes.banded.realize( sc, zeros( N, N ), { 'kl': kl, 'ku': ku, 'luFill': true }, abLayout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, bLayout );
	var Xr = schemes.dense.realize( sc, zeros( N, nrhs ), { 'part': 'full' }, bLayout );
	var ipiv = new Int32Array( N );
	var r = new Float64Array( Math.max( 1, N ) );
	var c = new Float64Array( Math.max( 1, N ) );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = poisonedWork( sc, Math.max( 1, 2 * N ) );
	var RWORK = new Float64Array( Math.max( 1, N ) );
	var res = zgbsvx( fact, trans, N, kl, ku, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, 'none', r, 1, 0, c, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	return {
		'X': Xr,
		'FERR': FERR,
		'BERR': BERR,
		'res': res
	};
}


// TESTS //

// Steps 2-3-5: three properties across trans flags, a size sweep, band widths, nrhs.
test( 'zgbsvx: residual + rcond + FERR/BERR bound (trans x N x (kl,ku) x nrhs)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			bands( N ).forEach( function eachBand( b ) {
				NRHS.forEach( function eachNrhs( nrhs ) {
					runProperty( trans, N, b[ 0 ], b[ 1 ], nrhs );
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

	var out = callSvx( 'not-factored', trans, N, kl, ku, nrhs, A0, B0, TIGHT_B, TIGHT_D );
	var tag = 'zgbsvx '+trans+' N='+N+' kl='+kl+' ku='+ku+' nrhs='+nrhs;

	// (a) residual: X solves op(A0)*X = B0 against the ORIGINAL band matrix.
	checked( 'zgbsvx', 'residual', function run() {
		if ( out.res.info !== 0 ) {
			throw new Error( tag+': info='+out.res.info+' (expected 0)' );
		}
		if ( out.res.equed !== 'none' ) {
			throw new Error( tag+': equed='+out.res.equed+' (expected none for fact=not-factored)' );
		}
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
				'trans': code,
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});

	// (b) rcond ≈ 1/κ₁(op(A0)) vs an INDEPENDENT true 1/κ within factor F, in (0,1].
	checked( 'zgbsvx', 'property', function run() {
		var inv = opInverse( A0, N, kl, ku, code );
		var trueRcond = 1.0 / ( norm1( inv.op ) * norm1( inv.inv ) );
		var r = out.res.rcond;
		if ( !( r > 0.0 && r <= 1.0 + 1e-9 ) ) {
			throw new Error( tag+': rcond='+r+' not in (0,1]' );
		}
		if ( !( r <= RCOND_FACTOR * trueRcond && trueRcond <= RCOND_FACTOR * r ) ) {
			throw new Error( tag+': rcond='+r.toExponential( 4 )+' disagrees with true_rcond='+trueRcond.toExponential( 4 )+' beyond factor '+RCOND_FACTOR+' (ratio '+( r / trueRcond ).toExponential( 3 )+')' );
		}
	});

	// (c) BERR tiny (>=0); actual forward error <= FERR*C; FERR ∈ [0,1).
	checked( 'zgbsvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, kl, ku, nrhs, code );
		var berrCap = Math.max( 1e-8, 8.0 * ( N + 1 ) * EPS );
		var xcol;
		var tcol;
		var eActual;
		var eBound;
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( out.BERR[ j ] ) || !( out.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+out.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( out.FERR[ j ] ) || !( out.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( out.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+out.FERR[ j ].toExponential( 3 )+' absurdly loose (>=1) for well-conditioned input' );
			}
			xcol = readCol( out.X, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( out.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual fwd error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+out.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// Equilibration path: fact='equilibrate' on a deliberately badly-scaled band matrix
// forces zgbequ to equilibrate (equed != 'none'), yet the returned X must still
// solve the ORIGINAL op(A0)*X = B0 (the driver un-scales X on exit). This both
// exercises the equilibration branch AND confirms the residual oracle is A0/B0.
function badlyScaledBand( rng, N, kl, ku ) {
	var M = logical.banded( sc, rng, N, N, kl, ku );
	var pr = [];
	var pc = [];
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		pr.push( Math.pow( 10, rng.int( -3, 3 ) ) );
		pc.push( Math.pow( 10, rng.int( -3, 3 ) ) );
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			M.set( i, j, sc.scale( M.get( i, j ), pr[ i ] * pc[ j ] ) );
		}
	}
	return M;
}

test( 'zgbsvx: equilibration path un-scales X to the ORIGINAL system', function t() {
	var sawEquil = false;
	[ 'no-transpose', 'transpose' ].forEach( function eachTrans( trans ) {
		[ 5, 8, 16 ].forEach( function eachN( N ) {
			var kl = 2;
			var ku = 1;
			var rng = new RNG( 0xEC + N );
			var A0 = badlyScaledBand( rng, N, kl, ku );
			var B0 = logical.general( sc, rng, N, 2 );
			var code = transCode( trans );
			var out = callSvx( 'equilibrate', trans, N, kl, ku, 2, A0, B0, TIGHT_B, TIGHT_D );
			if ( out.res.equed !== 'none' ) {
				sawEquil = true;
			}
			checked( 'zgbsvx', 'residual', function run() {
				var tag = 'zgbsvx EQUIL '+trans+' N='+N+' equed='+out.res.equed;
				if ( out.res.info !== 0 ) {
					throw new Error( tag+': info='+out.res.info );
				}
				var j;
				for ( j = 0; j < 2; j++ ) {
					check.assertResidual( sc, A0, readCol( out.X, N, j ), logicalCol( B0, N, j ), {
						'trans': code,
						'factor': 1000,
						'label': tag+' col='+j
					});
				}
			});
		});
	});
	if ( !sawEquil ) {
		throw new Error( 'equilibration never triggered — badly-scaled generator failed to exercise the equed path' );
	}
});

// Step 4: layout-invariance fuzz. zgbsvx factors AFB from scratch (zgbtrf: idamax
// pivot search => positive band first-dim stride required, BANDED_POS) and composes
// zgbcon/zgbtrs/zgbrfs whose inner zgbmv/zlatbs kernels switch on a col<->row storage
// flip and legitimately reorder the accumulation (~1 ULP). So bit-exactness holds
// only WITHIN a storage-order family (col / row); cross-order correctness is
// certified by the swept residual property above. AB/AFB are realized at the SAME
// banded layout and B/X at a same-order dense layout per variant. Output vector =
// flatten(X) ++ [rcond] ++ FERR ++ BERR.
function byOrder( layouts, order ) {
	return layouts.filter( function pick( L ) {
		return ( order === 'row' ) === ( L.order === 'row' );
	});
}
var AB_COL = byOrder( BANDED_POS, 'col' );
var AB_ROW = byOrder( BANDED_POS, 'row' );
var D_COL = byOrder( schemes.dense.layouts(), 'col' );
var D_ROW = byOrder( schemes.dense.layouts(), 'row' );

test( 'zgbsvx: bit-exact within storage-order family (col / row)', function t() {
	TRANS.forEach( function eachTrans( trans ) {
		runInvariance( trans, AB_COL, D_COL, 'col' );
		runInvariance( trans, AB_ROW, D_ROW, 'row' );
	});
});

function runInvariance( trans, abFamily, dFamily, fam ) {
	var N = 9;
	var kl = 2;
	var ku = 3;
	var nrhs = 2;
	var SEED = 0xF00D;

	// Pair AB- and B/X-layouts (each cycled within its own same-order family) so all
	// operands stay in one storage order while offset/pad/gap/stride-sign vary.
	var n = Math.max( abFamily.length, dFamily.length );
	var variants = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		variants.push({
			'ab': abFamily[ i % abFamily.length ],
			'd': dFamily[ i % dFamily.length ]
		});
	}

	checked( 'zgbsvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( v ) {
			var rng = new RNG( SEED ); // identical operand values every variant
			var A0 = logical.banded( sc, rng, N, N, kl, ku );
			var B0 = logical.general( sc, rng, N, nrhs );
			var out = callSvx( 'not-factored', trans, N, kl, ku, nrhs, A0, B0, v.ab, v.d );
			var flat = check.flattenLogical( sc, readMat( out.X, N, nrhs ) );
			flat.push( out.res.rcond );
			var k;
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				flat.push( out.BERR[ k ] );
			}
			return flat;
		}, { 'label': 'zgbsvx '+trans+' layout invariance '+fam+'-major' } );
	});
}
