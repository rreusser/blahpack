/**
* Property-based validation for zsysvx, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `sy` -> COMPLEX-SYMMETRIC dense
* (schemes.dense, logical.symmetric — `A(j,i) = A(i,j)`, NO conjugation; the
* symmetric, NOT the Hermitian, family, matching zsytrf which factors A = A^T);
* `svx` (EXPERT complex-symmetric-indefinite DRIVER: Bunch-Kaufman factor (zsytrf)
* + condition estimate (zsycon) + solve (zsytrs) + iterative refinement (zsyrfs) +
* error bounds, in ONE call) -> a COMPOSITE of the three properties already proven
* for its constituent routines (zsysv residual, zsycon rcond, zsyrfs FERR/BERR).
* We drive zsysvx with fact='not-factored' (factor A into AF, no equilibration
* path exists, so X solves the ORIGINAL A0*X = B0 directly) and assert, against the
* ORIGINAL full complex-symmetric A0:
*   (a) residual  ‖A0*X - B0‖/(‖A0‖‖X‖+‖B0‖) small per RHS (a valid solve), swept
*       over every pivot-valid storage layout (col AND row order).
*   (b) rcond estimates 1/κ₁(A0): within a small factor F of the INDEPENDENT true
*       reciprocal condition number (anorm = ‖A0‖₁ = ‖A0‖∞ since A0 symmetric — the
*       norm zsysvx forms for zsycon — and ‖A0⁻¹‖₁ from a trusted zsysv A0*X=I), in
*       (0,1].
*   (c) BERR tiny and >= 0; the ACTUAL forward error <= FERR*C; FERR in [0,1),
*       Xtrue from the trusted zsysv.
* Only the uplo triangle of A/AF is realized; the opposite stays poisoned. zsysvx
* takes a caller-owned COMPLEX WORK (min 2*N) and a REAL RWORK (min N); both are
* NaN-poisoned. rcond is the DOCUMENTED explicit Float64Array out-arg after
* offsetX (base.js and ndarray.js agree on it).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { EPS } from '../../../../../test/harness/checks.js';
import zsysvx from './../lib/ndarray.js';
import zsysv from '../../zsysv/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLOS = [ 'upper', 'lower' ];
var NRHS = [ 1, 2 ];
var TIGHT = schemes.dense.pivotLayouts()[ 0 ]; // tight col-major (valid pivot layout)
var F = 5; // rcond estimate must be within this factor of the true reciprocal cond.
var FERR_C = 10; // forward-error safety factor: actual error <= FERR * C (+ floor)

// NaN-poisoned real workspace (RWORK is a plain Float64Array, not complex).
function poisonReal( n ) {
	return S.real.alloc( Math.max( n, 1 ) );
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

// 1-norm (max abs column sum) of the FULL complex-symmetric logical matrix.
// Because A0 is symmetric this also equals its inf-norm — the norm zsysvx forms
// for zsycon.
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

// Independent ‖A0⁻¹‖₁: solve A0·X = I with the trusted zsysv on a fresh copy;
// X = A0⁻¹, so return the 1-norm (max abs column sum) of X.
function invNorm1( A0, n, uplo ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, identity( n ), { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( Math.max( n, 1 ) );
	var work = sc.alloc( Math.max( n, 1 ) );
	var info = zsysv( uplo, n, n, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'oracle zsysv failed (info='+info+'); A0 singular?' );
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

// Independent TRUE solution: solve A0*X = B0 on fresh copies with trusted zsysv.
function trueSolution( A0, B0, N, nrhs, uplo ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, TIGHT );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, TIGHT );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var work = sc.alloc( Math.max( N, 1 ) );
	var info = zsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'oracle zsysv failed (info='+info+'); A0 singular?' );
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

// Drive zsysvx (fact='not-factored') on realized copies; return the physical X
// reader plus the rcond/FERR/BERR outputs and info. WORK (complex, min 2*N) and
// RWORK (real, min N) are NaN-poisoned so a read-before-write trips a NaN.
function drive( uplo, N, nrhs, A0, B0, layout ) {
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var AFr = schemes.dense.realize( sc, A0, { 'part': uplo }, layout ); // overwritten by zlacpy+zsytrf
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var Xr = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout ); // overwritten by zlacpy+zsytrs
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var rcond = new Float64Array( 1 );
	var FERR = new Float64Array( Math.max( nrhs, 1 ) );
	var BERR = new Float64Array( Math.max( nrhs, 1 ) );
	var WORK = sc.alloc( Math.max( 2 * N, 1 ) ); // NaN-poisoned complex scratch
	var RWORK = poisonReal( N ); // NaN-poisoned real scratch
	var info = zsysvx( 'not-factored', uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], AFr.data, AFr.args[ 0 ], AFr.args[ 1 ], AFr.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], Xr.data, Xr.args[ 0 ], Xr.args[ 1 ], Xr.args[ 2 ], rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
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
// nrhs x every pivot-valid storage layout (col AND row order). zsytrf does an
// izamax pivot search (out of contract for a negative first-dimension stride), so
// A/AF are realized with pivotLayouts(); factor + condition + solve + refinement
// all share that layout. Sweeping col AND row order certifies cross-storage-order
// addressing of the whole driver.
test( 'zsysvx: expert-driver residual (uplo x N x nrhs x pivot layout)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout );
				});
			});
		});
	});
});

function runResidual( uplo, N, nrhs, layout ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.symmetric( sc, rng, N ); // full complex-symmetric indefinite oracle
	var B0 = logical.general( sc, rng, N, nrhs );
	var d = drive( uplo, N, nrhs, A0, B0, layout );
	var tag = 'zsysvx '+uplo+' N='+N+' nrhs='+nrhs;

	checked( 'zsysvx', 'residual', function run() {
		if ( d.info !== 0 ) {
			throw new Error( tag+': zsysvx returned info='+d.info+' (expected 0 for well-conditioned indefinite input)' );
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
// uplo x N x nrhs at the tight col-major layout. The oracle (zsysv) is exercised
// per case for the true rcond and the true solution.
test( 'zsysvx: rcond estimate + FERR/BERR bounds (uplo x N x nrhs)', function t() {
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
	var d = drive( uplo, N, nrhs, A0, B0, TIGHT );
	var tag = 'zsysvx '+uplo+' N='+N+' nrhs='+nrhs;

	if ( d.info !== 0 ) {
		throw new Error( tag+': zsysvx returned info='+d.info+' (expected 0)' );
	}

	// (b) rcond estimates 1/κ₁(A0) within factor F, in (0,1].
	checked( 'zsysvx', 'property', function run() {
		var trueRcond = 1.0 / ( anorm * invNorm1( A0, N, uplo ) );
		assertRcond( d.rcond[ 0 ], trueRcond, tag );
	});

	// (c) BERR tiny and >= 0; FERR a valid, not-absurdly-loose forward-error bound.
	checked( 'zsysvx', 'structural', function run() {
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

// Step 4: layout-invariance fuzz. zsysvx is a ONE-SHOT indefinite driver: zsytrf's
// pivot search is data-dependent and factor+condition+solve+refinement are
// coupled (see the zhetrf/zsysv LEARNINGS notes). Bit-exact invariance therefore
// holds only across a PURE-ADDRESSING family — layouts that change ONLY base
// offset and leading-dimension padding (always tight col-major, unit positive
// strides). Cross-order/sign correctness is certified by the residual property
// above (swept over the full pivotLayouts()). Output vector = flatten(X) ++
// [rcond] ++ FERR ++ BERR.
test( 'zsysvx: bit-exact across pure-addressing layouts (one-shot driver)', function t() {
	UPLOS.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	var N = 9;
	var nrhs = 2;
	var SEED = 0xBEEF;
	var variants = schemes.dense.pureAddrLayouts();
	checked( 'zsysvx', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.symmetric( sc, rng, N );
			var B0 = logical.general( sc, rng, N, nrhs );
			var d = drive( uplo, N, nrhs, A0, B0, layout );
			var out = check.flattenLogical( sc, readMat( d.Xr, N, nrhs ) );
			var k;
			out.push( d.rcond[ 0 ] );
			for ( k = 0; k < nrhs; k++ ) {
				out.push( d.FERR[ k ] );
			}
			for ( k = 0; k < nrhs; k++ ) {
				out.push( d.BERR[ k ] );
			}
			return out;
		}, { 'label': 'zsysvx '+uplo+' pure-addressing layout invariance' } );
	});
}
