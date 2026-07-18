/**
* Property-based validation for dspsvx, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sp` -> symmetric indefinite PACKED
* (schemes.packed, logical.symmetric — the real symmetric family, NOT Hermitian);
* `svx` (EXPERT symmetric-indefinite DRIVER: Bunch-Kaufman factor (dsptrf) +
* condition estimate (dspcon) + solve (dsptrs) + iterative refinement (dsprfs) +
* error bounds, all in ONE call) -> a COMPOSITE of the three properties already
* proven for its constituent routines (dspsv residual, dspcon rcond, dsprfs
* FERR/BERR). We drive dspsvx with fact='not-factored' (copy AP -> AFP and factor
* it in place; there is no equilibration path for spsvx, so X solves the ORIGINAL
* A0*X = B0 directly) and assert, against the ORIGINAL full symmetric A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve), swept
*       over the in-contract POSITIVE packed strides (1,2,3) so cross-stride packed
*       addressing of the whole driver is certified.
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm = ‖A0‖₁ from A0 — equals ‖A0‖∞ since A0
*       is symmetric, the norm dspsvx passes to dspcon — and ‖A0⁻¹‖₁ from a trusted
*       dspsv solve of A0*X=I), and in (0,1].
*   (c) BERR tiny and >= 0; the ACTUAL forward error ‖Xtrue-X‖inf/‖X‖inf <=
*       FERR*C; FERR in [0,1) (a valid, not-absurdly-loose bound), Xtrue from the
*       trusted dspsv.
* AP / AFP are PACKED (only the uplo triangle exists); B / X are dense. The packed
* opposite triangle and all unreferenced slots stay poisoned, so a read of the
* wrong triangle / a stride-offset addressing bug trips a NaN. WORK is poisoned.
* NOTE base returns a plain integer `info` and writes rcond[0] into the caller's
* Float64Array (base.js and ndarray.js AGREE on this arg — asserted below, unlike
* the dposvx bug class where base returned an object).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import { poisonedWork } from '../../../../../test/harness/workspace.js';
import dspsvx from './../lib/ndarray.js';
import dspsvxBase from './../lib/base.js';
import dspsv from '../../dspsv/lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NRHS = [ 1, 2 ];
var TIGHTP = schemes.packed.layouts()[ 0 ]; // tight packed (AP / AFP)
var TIGHTD = schemes.dense.layouts()[ 0 ];   // tight col-major (B / X)
var F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// dsptrf's pivot search (idamax) is in contract only for a POSITIVE packed stride,
// so the whole-driver residual sweep certifies cross-stride addressing over the
// positive packed layouts (stride 1,2,3). Negative packed strides are out of
// contract for the pivoting factor and are excluded (see dsptrf validation).
var POSITIVE_PACKED = schemes.packed.layouts().filter( function positive( L ) {
	return L.stride > 0;
});

// Pure-addressing packed family for the bit-exact invariance check: UNIT stride,
// varying ONLY the base offset (lead/tail). Changing these cannot reorder any
// arithmetic (no fast-path switch, no pivot-tie flip), so a correct Bunch-Kaufman
// factor is bit-exact across them; any diff is a real offset addressing bug.
// Non-unit / negative packed strides are NOT bit-exact for a Bunch-Kaufman factor
// (a last-ULP reorder can flip a discrete pivot decision — see the zsytrf/zhetrf
// LEARNINGS), so cross-stride correctness is certified by the residual instead.
var PURE_PACKED = [
	{ 'stride': 1, 'lead': 0, 'tail': 0 },
	{ 'stride': 1, 'lead': 3, 'tail': 2 },
	{ 'stride': 1, 'lead': 5, 'tail': 0 }
];

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

// 1-norm (max abs column sum) of the FULL symmetric logical matrix. Because A0 is
// symmetric this also equals its inf-norm — the norm dspsvx forms for dspcon.
function norm1Full( M, n ) {
	var mx = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( M.get( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Identity logical matrix (n x n).
function identity( n ) {
	var I = new LogicalMatrix( sc, n, n );
	var i;
	for ( i = 0; i < n; i++ ) {
		I.set( i, i, sc.one );
	}
	return I;
}

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted packed dspsv on a fresh
// copy; X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHTD );
	var ipiv = new Int32Array( Math.max( n, 1 ) );
	var info = dspsv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dspsv failed (info='+info+'); A0 singular?' );
	}
	var mx = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		s = 0.0;
		for ( i = 0; i < n; i++ ) {
			s += sc.abs( Br.read( i, j ) );
		}
		if ( s > mx ) {
			mx = s;
		}
	}
	return mx;
}

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted dspsv.
function trueSolution( A0, B0, N, nrhs, uplo ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTD );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var info = dspsv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
	if ( info !== 0 ) {
		throw new Error( 'oracle dspsv failed (info='+info+'); A0 singular?' );
	}
	return Br;
}

function assertRcond( rcond, trueRcond, label ) {
	if ( !Number.isFinite( rcond ) ) {
		throw new Error( label+': rcond is not finite ('+rcond+')' );
	}
	if ( !( rcond > 0.0 && rcond <= 1.0 + 1e-9 ) ) {
		throw new Error( label+': rcond '+rcond+' not in (0,1]' );
	}
	if ( !( rcond <= F * trueRcond && rcond >= trueRcond / F ) ) {
		throw new Error( label+': rcond '+rcond.toExponential( 6 )+' not within factor '+F+' of true '+trueRcond.toExponential( 6 ) );
	}
}

// Drive dspsvx (fact='not-factored') on realized copies; return the physical X
// reader plus the rcond/FERR/BERR outputs and info. AP is input; AFP/IPIV are
// poisoned/scratch outputs (copied+factored in place). WORK (real, min 3*N) is
// NaN-poisoned so a read-before-write trips a NaN.
function drive( uplo, N, nrhs, A0, B0, pLayout, dLayout ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, pLayout );
	var AFr = schemes.packed.realize( sc, A0, { 'part': uplo }, pLayout ); // overwritten by dcopy+dsptrf
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, dLayout );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, dLayout ); // overwritten by dlacpy+dsptrs
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( Math.max( nrhs, 1 ) );
	var BERR = new Float64Array( Math.max( nrhs, 1 ) );
	var WORK = poisonedWork( sc, Math.max( 3 * N, 1 ) );
	var IWORK = new Int32Array( Math.max( N, 1 ) );
	var info = dspsvx( 'not-factored', uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'Xr': Xr,
		'rcond': rcond,
		'FERR': FERR,
		'BERR': BERR,
		'info': info
	};
}


// TESTS //

// Step 2-3-5 (residual): X solves the ORIGINAL A0*X = B0, swept over uplo x N x
// nrhs x every in-contract POSITIVE packed layout (stride 1,2,3). dsptrf does an
// idamax pivot search (out of contract for a negative packed stride), so AP/AFP
// are realized with POSITIVE_PACKED; factor + condition + solve + refinement all
// share that layout. Sweeping the positive strides at backward-error tolerance
// certifies cross-stride packed addressing of the whole driver.
test( 'dspsvx: expert-driver residual (uplo x N x nrhs x positive packed stride)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				POSITIVE_PACKED.forEach( function eachLayout( pLayout ) {
					runResidual( uplo, N, nrhs, pLayout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, pLayout ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N ); // full symmetric indefinite oracle
	var B0 = logical.general( sc, rng, N, nrhs );
	var d = drive( uplo, N, nrhs, A0, B0, pLayout, TIGHTD );
	var tag = 'dspsvx '+uplo+' N='+N+' nrhs='+nrhs+' stride='+pLayout.stride;

	checked( 'dspsvx', 'residual', function run() {
		if ( d.info !== 0 ) {
			throw new Error( tag+': dspsvx returned info='+d.info+' (expected 0 for well-conditioned indefinite input)' );
		}
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( d.Xr, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': tag+' col='+j
			});
		}
	});
}

// Step 2-3-5 (rcond + FERR/BERR): the two remaining composite properties, over
// uplo x N x nrhs at the tight packed/dense layout. The oracle (dspsv) is
// exercised per case for the true rcond and the true solution.
test( 'dspsvx: rcond estimate + FERR/BERR bounds (uplo x N x nrhs)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runBounds( uplo, N, nrhs );
			});
		});
	});
});

function runBounds( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // same inputs as runResidual
	var A0 = logical.symmetric( sc, rng, N );
	var B0 = logical.general( sc, rng, N, nrhs );
	var anorm = norm1Full( A0, N );
	var d = drive( uplo, N, nrhs, A0, B0, TIGHTP, TIGHTD );
	var tag = 'dspsvx '+uplo+' N='+N+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': dspsvx returned info='+d.info+' (expected 0)' );
	}

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1].
	checked( 'dspsvx', 'property', function run() {
		var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'dspsvx', 'structural', function run() {
		var Xtrue = trueSolution( A0, B0, N, nrhs, uplo );
		var berrCap = Math.max( 1e-8, 8.0 * ( N + 1 ) * EPS );
		var xcol;
		var tcol;
		var eActual;
		var eBound;
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			if ( !Number.isFinite( d.BERR[ j ] ) || !( d.BERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( d.BERR[ j ] <= berrCap ) ) {
				throw new Error( tag+' col='+j+': BERR '+d.BERR[ j ].toExponential( 3 )+' exceeds cap '+berrCap.toExponential( 3 ) );
			}
			if ( !Number.isFinite( d.FERR[ j ] ) || !( d.FERR[ j ] >= 0.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ]+' not finite/nonnegative' );
			}
			if ( !( d.FERR[ j ] < 1.0 ) ) {
				throw new Error( tag+' col='+j+': FERR '+d.FERR[ j ].toExponential( 3 )+' absurdly loose (>= 1) for well-conditioned input' );
			}
			xcol = readCol( d.Xr, N, j );
			tcol = readCol( Xtrue, N, j );
			eActual = diffInfNorm( tcol, xcol ) / ( infNormVec( xcol ) + EPS );
			eBound = ( d.FERR[ j ] * FERR_C ) + ( 16.0 * ( N + 1 ) * EPS );
			if ( !( eActual <= eBound ) ) {
				throw new Error( tag+' col='+j+': actual forward error '+eActual.toExponential( 3 )+' exceeds FERR bound '+eBound.toExponential( 3 )+' (FERR='+d.FERR[ j ].toExponential( 3 )+')' );
			}
		}
	});
}

// rcond argument-class agreement: base.js and ndarray.js must write the SAME
// rcond[0] and return the SAME integer info (bit-exact, Object.is) on identical
// fresh inputs. A mismatch or a differing arg class (array out-arg vs result
// object) would be the dposvx bug class -> LEARNINGS then fix.
test( 'dspsvx: base.js and ndarray.js agree on rcond + info (Object.is)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		[ 3, 8, 17 ].forEach( function eachN( N ) {
			var nrhs = 2;
			var rng = new RNG( 0x777 + N );
			var A0 = logical.symmetric( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var a = callOne( dspsvx, uplo, N, nrhs, A0, B0 );
			var b = callOne( dspsvxBase, uplo, N, nrhs, A0, B0 );
			if ( !Object.is( a.rcond, b.rcond ) ) {
				throw new Error( 'dspsvx '+uplo+' N='+N+': ndarray rcond '+a.rcond+' !== base rcond '+b.rcond );
			}
			if ( !Object.is( a.info, b.info ) ) {
				throw new Error( 'dspsvx '+uplo+' N='+N+': ndarray info '+a.info+' !== base info '+b.info );
			}
		});
	});
});

// Drive a dspsvx variant (base or ndarray, same signature) and return rcond[0]+info.
function callOne( fcn, uplo, N, nrhs, A0, B0 ) {
	var Ar = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var AFr = schemes.packed.realize( sc, A0, { 'part': uplo }, TIGHTP );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTD );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHTD );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( Math.max( nrhs, 1 ) );
	var BERR = new Float64Array( Math.max( nrhs, 1 ) );
	var WORK = poisonedWork( sc, Math.max( 3 * N, 1 ) );
	var IWORK = new Int32Array( Math.max( N, 1 ) );
	var info = fcn( 'not-factored', uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 );
	return {
		'rcond': rcond[ 0 ],
		'info': info
	};
}

// Step 4: layout-invariance fuzz. dspsvx is a ONE-SHOT indefinite driver: dsptrf's
// pivot search is data-dependent and factor+condition+solve+refinement are coupled,
// so the factor's choices cannot be isolated from the rest. Bit-exact invariance
// therefore holds only across a PURE-ADDRESSING family — packed AP/AFP at UNIT
// stride varying only the base offset (cannot reorder any arithmetic or flip a
// pivot tie), paired with dense B/X at unit-stride col-major varying only base
// offset + leading-dim padding. Cross-stride correctness is certified by the
// residual property (swept over POSITIVE_PACKED) above. Output vector =
// flatten(X) ++ [rcond] ++ FERR ++ BERR.
test( 'dspsvx: bit-exact across pure-addressing layouts (one-shot packed driver)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var dLayouts = schemes.dense.pureAddrLayouts();
	var nVariants = Math.max( PURE_PACKED.length, dLayouts.length );
	var variants = [];
	var k;
	for ( k = 0; k < nVariants; k++ ) {
		variants.push( k );
	}
	checked( 'dspsvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( idx ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.symmetric( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var d = drive( uplo, N, nrhs, A0, B0, PURE_PACKED[ idx % PURE_PACKED.length ], dLayouts[ idx % dLayouts.length ] );
			var out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			var m;
			out.push( d.rcond[ 0 ] );
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.FERR[ m ] );
			}
			for ( m = 0; m < nrhs; m++ ) {
				out.push( d.BERR[ m ] );
			}
			return out;
		}, { 'label': 'dspsvx '+uplo+' pure-addressing layout invariance' } );
	});
}
