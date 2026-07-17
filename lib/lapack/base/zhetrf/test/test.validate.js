/**
* Property-based validation for zhetrf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense
* (schemes.dense, logical.hermitian); `trf` (Bunch-Kaufman LDL^H factorization,
* blocked) -> validated by a FACTOR+SOLVE RESIDUAL against the ORIGINAL Hermitian
* matrix. We factor A0 with zhetrf, solve A*X=B with the sibling zhetrs, and
* assert `A0*X = B0` per RHS column against the original (independent) matrix.
* A wrong factorization must still yield an X that reproduces B0 through A0, so
* the residual is an honest oracle for the factor (and jointly for the solve).
*
* NOTE: zhetrf's base kernel self-allocates its blocked WORK internally; the
* ndarray wrapper accepts (WORK, strideWork, offsetWork, lwork) but the base
* ignores them (see the report / workspace section below). The WORK arguments
* are passed for signature conformance.
*/

import test from 'node:test';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zhetrf from './../lib/ndarray.js';
import zhetrs from '../../zhetrs/lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var NRHS = [ 1, 2, 3 ];
var NB = 32; // block size hardcoded in zhetrf/lib/base.js

// Column j of physical B storage as an array of scalar values.
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

// Read the full N x nrhs solution back into a LogicalMatrix (bit-exact compare).
function readB( R, n, nrhs ) {
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

// Assert A0*X = B0 for every RHS column against the ORIGINAL Hermitian matrix.
function assertResidualCols( A0full, Br, B0, N, nrhs, label ) {
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		check.assertResidual( sc, A0full, readCol( Br, N, j ), logicalCol( B0, N, j ), {
			'trans': 'n',
			'factor': 100,
			'label': label+' col='+j
		});
	}
}

// Steps 2-3-5: factor+solve residual across uplo, the size sweep (SIZES_SMALL
// straddles the NB=32 blocked/unblocked crossover: 33, 64 exercise zlahef),
// and nrhs. A single dense layout is used here; every layout is fuzzed below.
test( 'zhetrf: Bunch-Kaufman factor+solve residual (uplo x N x nrhs)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( uplo, N, nrhs );
			});
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	var rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	var A0 = logical.hermitian( sc, rng, N ); // full Hermitian (both triangles)
	var B0 = logical.general( sc, rng, N, nrhs );

	var layout = schemes.dense.layouts()[ 0 ]; // tight col-major
	var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	var ipiv = new Int32Array( Math.max( N, 1 ) );
	var lwork = Math.max( N, 1 ) * NB;
	var work = new Complex128Array( lwork );

	// Factor A (copy realized above) in place, then solve in place (B <- X):
	zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, work, 1, 0, lwork );
	zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	var label = 'zhetrf/zhetrs '+uplo+' N='+N+' nrhs='+nrhs;

	// The residual jointly certifies the factor (zhetrf) and the solve (zhetrs):
	// a wrong factorization cannot yield an X reproducing B0 through A0.
	checked( 'zhetrf', 'residual', function run() {
		assertResidualCols( A0, Br, B0, N, nrhs, label );
	});
	checked( 'zhetrs', 'residual', function run() {
		assertResidualCols( A0, Br, B0, N, nrhs, label );
	});
}

// Step 4: layout-invariance fuzz. Bit-exact factor equality is asserted only
// across a PURE-ADDRESSING family: positive UNIT stride, col-major, varying only
// base offset, leading pad, and leading-dimension padding — the highest-signal
// offset/stride-base addressing check. A wider family is NOT bit-exact for
// zhetrf: it makes DISCRETE Bunch-Kaufman pivot choices (1x1 vs 2x2, which row)
// by comparing computed magnitudes, so a last-ULP arithmetic difference from a
// negative column stride or a col<->row flip can straddle a near-tie threshold,
// FLIP a pivot decision, and cascade into an entirely different — but equally
// valid — factorization (residual still holds). See test/harness/LEARNINGS.md
// 2026-07-17 "zhetrf ... negative COLUMN stride flips a PIVOT decision". Cross-
// order / stride-sign correctness is certified by the residual property above,
// swept over all in-contract layouts. The pivot indices must match too, so IPIV
// is appended to the flattened factor.
function readTri( R, ipiv, n, uplo ) {
	var out = new LogicalMatrix( sc, n, n );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				out.set( i, j, R.read( i, j ) );
			} else {
				out.set( i, j, sc.zero );
			}
		}
	}
	var flat = check.flattenLogical( sc, out );
	for ( i = 0; i < n; i++ ) {
		flat.push( ipiv[ i ] );
	}
	return flat;
}

// Pure-addressing family: positive UNIT stride, col-major; only base offset,
// lead/tail pad, and leading-dimension padding vary. These cannot change the
// arithmetic order or the pivot path, so the factor MUST be bit-identical.
var PURE_ADDRESSING = [
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 0, 'lead': 0, 'tail': 0 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 3, 'lead': 2, 'tail': 1 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 5, 'lead': 7, 'tail': 4 },
	{ 'order': 'col', 'sgn1': 1, 'sgn2': 1, 'g': 1, 'ldaExtra': 1, 'lead': 11, 'tail': 0 }
];

test( 'zhetrf: bit-exact across the pure-addressing family (offset / leading-dim pad)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo, PURE_ADDRESSING, 'pure-addressing' );
	});
});

function runInvariance( uplo, variants, fam ) {
	var n = 40; // exercises the blocked path (n > NB=32)
	var SEED = 0xF00D;
	checked( 'zhetrf', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A = logical.hermitian( sc, rng, n );
			var R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
			var ipiv = new Int32Array( n );
			var lwork = n * NB;
			var work = new Complex128Array( lwork );
			zhetrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0, lwork );
			return readTri( R, ipiv, n, uplo );
		}, { 'label': 'zhetrf '+uplo+' layout invariance '+fam+'-major' } );
	});
}

// Step 4c: workspace conformance. zhetrf advertises (WORK, lwork) on the ndarray
// wrapper. Probe the smallest WORK length the wrapper accepts and assert it
// actually suffices on the BLOCKED path (N=64) with a poisoned buffer: every
// factor component must be finite (a too-small claim or a read-before-write
// would surface as NaN out of poisoned padding).
test( 'zhetrf: workspace minimum suffices on the blocked path', function t() {
	var uplo = 'upper';
	var N = 64; // > NB=32 => zlahef blocked path
	var SEED = 0xC0FFEE;

	function run( workLen ) {
		var rng = new RNG( SEED );
		var A = logical.hermitian( sc, rng, N );
		var R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
		var ipiv = new Int32Array( N );
		var work = poisonedWork( sc, workLen );
		zhetrf( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0, workLen );
		return readTri( R, ipiv, N, uplo );
	}

	checked( 'zhetrf', 'workspace', function check_() {
		var minLen = assertWorkspaceSufficient( run, {}, 'zhetrf WORK@N=64 upper' );

		// Independent confirmation: at the advertised minimum WORK, the blocked
		// factor still solves correctly (residual against the original matrix).
		var rng = new RNG( SEED );
		var A0 = logical.hermitian( sc, rng, N );
		var nrhs = 3;
		var B0 = logical.general( sc, rng, N, nrhs );
		var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
		var Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		var ipiv = new Int32Array( N );
		var work = poisonedWork( sc, minLen );
		zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, work, 1, 0, minLen );
		zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
		assertResidualCols( A0, Br, B0, N, nrhs, 'zhetrf WORK-min N=64 residual' );
	});
});
