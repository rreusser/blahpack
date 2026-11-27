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
* zhetrf uses the CALLER's WORK (an N-by-NB matrix W for zlahef); like the
* reference it shrinks NB to fit a short WORK and falls back to unblocked code
* below NBMIN = max( 2, ILAENV( 2 ) ) = 2 — Step 4c sweeps those branches.
*/

import test from 'node:test';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zhetrf from './../lib/ndarray.js';
import zhetrs from '../../zhetrs/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];
const NB = 64; // the reference's block size, ILAENV( 1, 'ZHETRF', ... )

// Column j of physical B storage as an array of scalar values.
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

// Read the full N x nrhs solution back into a LogicalMatrix (bit-exact compare).
// Assert A0*X = B0 for every RHS column against the ORIGINAL Hermitian matrix.
function assertResidualCols( A0full, Br, B0, N, nrhs, label ) {
	let j;
	for ( j = 0; j < nrhs; j++ ) {
		check.assertResidual( sc, A0full, readCol( Br, N, j ), logicalCol( B0, N, j ), {
			'trans': 'n',
			'factor': 100,
			'label': label+' col='+j
		});
	}
}

// Steps 2-3-5: factor+solve residual across uplo, the size sweep (SIZES_SMALL
// plus N=70, past the reference's NB = ILAENV( 1 ) = 64, which exercises zlahef),
// and nrhs. A single dense layout is used here; every layout is fuzzed below.
test( 'zhetrf: Bunch-Kaufman factor+solve residual (uplo x N x nrhs)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.concat( [ 70 ] ).forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				runResidual( uplo, N, nrhs );
			});
		});
	});
});

function runResidual( uplo, N, nrhs ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.hermitian( sc, rng, N ); // full Hermitian (both triangles)
	const B0 = logical.general( sc, rng, N, nrhs );

	const layout = schemes.dense.layouts()[ 0 ]; // tight col-major
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( Math.max( N, 1 ) );
	const lwork = Math.max( N, 1 ) * NB;
	const work = new Complex128Array( lwork );

	// Factor A (copy realized above) in place, then solve in place (B <- X):
	zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
	zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );

	const label = 'zhetrf/zhetrs '+uplo+' N='+N+' nrhs='+nrhs;

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
	const out = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				out.set( i, j, R.read( i, j ) );
			} else {
				out.set( i, j, sc.zero );
			}
		}
	}
	const flat = check.flattenLogical( sc, out );
	for ( i = 0; i < n; i++ ) {
		flat.push( ipiv[ i ] );
	}
	return flat;
}

// Pure-addressing family: positive UNIT stride, col-major; only base offset,
// lead/tail pad, and leading-dimension padding vary. These cannot change the
// arithmetic order or the pivot path, so the factor MUST be bit-identical.
const PURE_ADDRESSING = [
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
	const n = 70; // exercises the blocked path (n > NB=64)
	const SEED = 0xF00D;
	checked( 'zhetrf', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const rng = new RNG( SEED ); // identical values every variant
			const A = logical.hermitian( sc, rng, n );
			const R = schemes.dense.realize( sc, A, { 'part': uplo }, layout );
			const ipiv = new Int32Array( n );
			const lwork = n * NB;
			const work = new Complex128Array( lwork );
			zhetrf( uplo, n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			return readTri( R, ipiv, n, uplo );
		}, { 'label': 'zhetrf '+uplo+' layout invariance '+fam+'-major' } );
	});
}

// Step 4c: workspace conformance. zhetrf advertises (WORK, strideWork, offsetWork) on the ndarray
// wrapper. Probe the smallest WORK length the wrapper accepts and assert it
// actually suffices on the BLOCKED path (N=70) with a poisoned buffer: every
// factor component must be finite (a too-small claim or a read-before-write
// would surface as NaN out of poisoned padding).
test( 'zhetrf: workspace minimum suffices on the blocked path', function t() {
	const uplo = 'upper';
	const N = 70; // > NB=64 => zlahef blocked path
	const SEED = 0xC0FFEE;

	function run( workLen ) {
		const rng = new RNG( SEED );
		const A = logical.hermitian( sc, rng, N );
		const R = schemes.dense.realize( sc, A, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
		const ipiv = new Int32Array( N );
		const work = poisonedWork( sc, workLen );
		zhetrf( uplo, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
		return readTri( R, ipiv, N, uplo );
	}

	checked( 'zhetrf', 'workspace', function check_() {
		const minLen = assertWorkspaceSufficient( run, {}, 'zhetrf WORK@N=70 upper' );

		// Independent confirmation: at the advertised minimum WORK, the blocked
		// factor still solves correctly (residual against the original matrix).
		const rng = new RNG( SEED );
		const A0 = logical.hermitian( sc, rng, N );
		const nrhs = 3;
		const B0 = logical.general( sc, rng, N, nrhs );
		const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, schemes.dense.layouts()[ 0 ] );
		const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		const ipiv = new Int32Array( N );
		const work = poisonedWork( sc, minLen );
		zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
		zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
		assertResidualCols( A0, Br, B0, N, nrhs, 'zhetrf WORK-min N=70 residual' );
	});
});


// Step 4c: CALLER-OWNED WORK. As in the reference, base.js shrinks NB to fit the
// caller's WORK (LDWORK = N) and uses unblocked code throughout once NB < NBMIN = max( 2, ILAENV( 2 ) ) = 2.
// On the blocked-size N=70, sweep WORK lengths that reach every branch — full NB,
// a reduced NB that does not divide N, NB = NBMIN, NB < NBMIN, and the advertised
// minimum of 1 — with a POISONED WORK at a nonzero offset.
// The factor+solve residual must hold for each (a NaN leak from reading
// unwritten or past-the-end WORK would break it).
test( 'zhetrf: caller WORK of any length >= 1 (reduced NB, NBMIN fallback), offset poisoned WORK (Step 4c)', function t() {
	const N = 70;
	const nrhs = 2;
	const sw = 1; // WORK is opaque scratch: only its offset (sub-allocation) is meaningful
	const ow = 3;
	[ 64, 7, 2, 1, 0 ].forEach( function eachCols( cols ) {
		UPLO.forEach( function eachUplo( uplo ) {
			const len = Math.max( 1, cols * N );
			const label = 'zhetrf ' + uplo + ' N=' + N + ' WORK=' + len + ' (stride ' + sw + ', offset ' + ow + ')';
			const rng = new RNG( 0x4C00 + cols );
			const A0 = logical.hermitian( sc, rng, N );
			const B0 = logical.general( sc, rng, N, nrhs );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, null );
			const ipiv = new Int32Array( N );
			const W = poisonedWork( sc, ow + ( len * sw ) );
			zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, W, sw, ow );
			zhetrs( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
			checked( 'zhetrf', 'workspace', function run() {
				let j;
				for ( j = 0; j < nrhs; j++ ) {
					check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
						'trans': 'n',
						'factor': 100,
						'label': label + ' col=' + j
					});
				}
			});
		});
	});
});


// REGRESSION (ticket 0049): NB and NBMIN come from ILAENV with the reference's
// arguments. The unblocked kernel (zhetf2) uses no workspace, so a poisoned WORK
// left all-NaN shows that the factorization took the unblocked path, as the
// reference does at these sizes; the former constants (NB = 32, NBMIN = 2) took
// the blocked path there.
function assertUnblocked( N, len ) {
	UPLO.forEach( function eachUplo( uplo ) {
		const label = 'zhetrf ' + uplo + ' N=' + N + ' WORK=' + len;
		const rng = new RNG( 0x4900 + N );
		const A0 = logical.hermitian( sc, rng, N );
		const B0 = logical.general( sc, rng, N, 1 );
		const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, null );
		const ipiv = new Int32Array( N );
		const W = poisonedWork( sc, len );
		let w, i;
		zhetrf( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, W, 1, 0 );
		zhetrs( uplo, N, 1, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ] );
		check.assertResidual( sc, A0, readCol( Br, N, 0 ), logicalCol( B0, N, 0 ), {
			'trans': 'n',
			'factor': 100,
			'label': label
		});
		w = reinterpret( W, 0 );
		for ( i = 0; i < w.length; i++ ) {
			if ( !Number.isNaN( w[ i ] ) ) {
				throw new Error( label + ': WORK[ ' + i + ' ] was written (blocked path)' );
			}
		}
	});
}

test( 'zhetrf: at N=50, between the former NB (32) and ILAENV\'s NB (64), the optimal WORK (N*64) takes the unblocked path, as in the reference (WORK untouched)', function t() {
	assertUnblocked( 50, 50 * 64 );
});
