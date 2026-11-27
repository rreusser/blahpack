/**
* Property-based validation for zhesv, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense
* (schemes.dense, logical.hermitian); `sv` (Bunch-Kaufman indefinite
* linear-solve DRIVER: factor A = U*D*U^H / L*D*L^H with zhetrf, then solve
* A*X = B, in ONE call) -> RESIDUAL. On exit A holds the factor, B holds X, IPIV
* the pivots. We check `A0*X = B0` against the ORIGINAL Hermitian matrix A0 —
* independent of the factor the driver produced, so the residual certifies the
* factor+solve driver against A0.
*
* WORK contract: zhesv routes by workspace size — `WORK.length - offsetWork < N`
* uses zhetrs (no scratch), otherwise the faster zhetrs2 (uses N-element
* scratch); the advertised HARD minimum is 1 element (reference LWORK >= 1).
* Both branches are exercised: the sweep gives a generous (length-N) WORK to hit
* zhetrs2, and dedicated tests drive the length-1 zhetrs branch and the length-N
* zhetrs2 minimum, both NaN-poisoned.
*/

import test from 'node:test';
import Int32Array from '@stdlib/array/int32/lib/index.js';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhesv from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

function readCol( R, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( R.read( i, j ) );
	}
	return col;
}

function logicalCol( M, n, j ) {
	const col = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		col.push( M.get( i, j ) );
	}
	return col;
}

function readB( R, n, nrhs ) {
	const X = new LogicalMatrix( sc, n, nrhs );
	let i, j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			X.set( i, j, R.read( i, j ) );
		}
	}
	return X;
}

// Steps 2-3-5: residual property over uplo x N x nrhs x every pivot-valid
// storage layout. The driver factors A in place (zhetrf's pivot search is out
// of contract for a negative first-dimension stride), so A is realized with
// pivotLayouts(); factor and solve share that layout. WORK is length N, so the
// FASTER zhetrs2 branch is exercised. Sweeping col AND row order at
// backward-error tolerance certifies cross-storage-order addressing.
// Factor+solve in one zhesv call, then verify A0*X = B0 per RHS column against
// the ORIGINAL Hermitian matrix.
test( 'zhesv: Bunch-Kaufman solve-driver residual, zhetrs2 branch (uplo x N x nrhs x layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
					runResidual( uplo, N, nrhs, layout, Math.max( N, 1 ) );
				});
			});
		});
	});
});

// The length-1 WORK branch: `WORK.length < N` routes to zhetrs (no scratch).
// Exercise it across the same sweep so the no-workspace solve path is validated
// against the residual too.
test( 'zhesv: Bunch-Kaufman solve-driver residual, zhetrs branch (WORK length 1)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			NRHS.forEach( function eachNrhs( nrhs ) {
				// WORK length 1 is < N for N > 1, forcing the zhetrs branch; for
				// N <= 1 the routine quick-returns / uses no scratch anyway.
				runResidual( uplo, N, nrhs, schemes.dense.pivotLayouts()[ 0 ], 1 );
			});
		});
	});
});

function runResidual( uplo, N, nrhs, layout, lwork ) {
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.hermitian( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( Math.max( N, 1 ) );
	const work = sc.alloc( Math.max( lwork, 1 ) ); // caller-owned, poisoned scratch

	zhesv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

	checked( 'zhesv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zhesv '+uplo+' N='+N+' nrhs='+nrhs+' lwork='+lwork+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. zhesv is a ONE-SHOT driver: its pivot search
// is data-dependent, and factor+solve are coupled, so the factor's choices
// cannot be isolated from the solve. Bit-exact invariance therefore holds only
// across a PURE-ADDRESSING family — layouts that change ONLY base offset and
// leading-dimension padding (always tight col-major, unit positive strides),
// which cannot reorder any arithmetic in either the factor or the solve.
// Cross-order/sign correctness is certified by the residual property above. Both
// A and B are fuzzed over pureAddrLayouts(); WORK stays a tight length-N array
// (zhetrs2 branch).
test( 'zhesv: bit-exact across pure-addressing layouts (one-shot driver)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;

	const rng = new RNG( SEED );
	const A0 = logical.hermitian( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const variants = schemes.dense.pureAddrLayouts();

	checked( 'zhesv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const ipiv = new Int32Array( N );
			const work = sc.alloc( N );
			zhesv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'zhesv '+uplo+' pure-addressing layout invariance' } );
	});
}

// Step 4c: WORK conformance at a blocked size (N = 64). zhesv advertises a hard
// minimum of 1 element (routing to the no-scratch zhetrs); the length-N
// workspace routes to zhetrs2. Both are driven with EXACTLY their poisoned
// buffer so a read past it surfaces as a non-finite residual, and both must
// still produce the correct X.
test( 'zhesv: WORK-branch conformance at blocked N=64 (length 1 and length N)', function t() {
	const N = 64;
	const nrhs = 3;
	const rng = new RNG( 0xC0FFEE );
	UPLO.forEach( function eachUplo( uplo ) {
		runMinWork( uplo, N, nrhs, rng, 1 );  // zhetrs branch (hard minimum)
		runMinWork( uplo, N, nrhs, rng, N );  // zhetrs2 branch (min for the fast path)
	});
});

function runMinWork( uplo, N, nrhs, rng, lwork ) {
	const A0 = logical.hermitian( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const layout = schemes.dense.pivotLayouts()[ 0 ];
	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( N );
	const work = sc.alloc( lwork ); // exactly this size, NaN-poisoned

	zhesv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

	checked( 'zhesv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'zhesv WORK='+lwork+' '+uplo+' N='+N+' col='+j
			});
		}
	});
}
