/**
* Property-based validation for dsysv, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — the real analogue of the complex-symmetric
* dsytrf is a plain symmetric matrix, NOT Hermitian); `sv` (Bunch-Kaufman
* indefinite linear-solve DRIVER: factor A = U*D*U^T / L*D*L^T with dsytrf, then
* solve A*X = B with dsytrs2, in ONE call) -> RESIDUAL. On exit A holds the
* factor, B holds X, IPIV the pivots. We check `A0*X = B0` against the ORIGINAL
* symmetric matrix A0, which is independent of the factorization the driver
* produced: a wrong factor would still have to yield an X that reproduces B0
* through A0. dsysv takes a caller-owned WORK array (length >= N for the dsytrs2
* solve); Step 4c probes the advertised minimum under NaN poison.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsysv from './../lib/ndarray.js';

const sc = S.real; // d-routine
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const NRHS = [ 1, 2, 3 ];

// Read column j of the solution X out of physical B storage as an array of
// scalar values.
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

// Read the full N x nrhs solution back into a LogicalMatrix (for bit-exact
// layout comparison).
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
// storage layout. The driver factors A in place (dsytrf does an idamax pivot
// search, out of contract for a negative first-dimension stride), so A is
// realized with pivotLayouts(); factor and solve share that layout. Sweeping
// col AND row order at backward-error tolerance certifies cross-storage-order
// addressing. Factor+solve in one dsysv call, then verify A0*X = B0 per RHS
// column against the ORIGINAL symmetric matrix. WORK (length N, the min) is
// NaN-poisoned so any read-before-write is caught.
test( 'dsysv: Bunch-Kaufman solve-driver residual (uplo x N x nrhs x layout)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
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
	const rng = new RNG( 0x100 + ( N * 10 ) + nrhs ); // reproducible; log on failure
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );

	const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
	const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
	const ipiv = new Int32Array( Math.max( N, 1 ) );
	const work = sc.alloc( Math.max( N, 1 ) ); // caller-owned, poisoned scratch

	dsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

	checked( 'dsysv', 'residual', function run() {
		let j;
		for ( j = 0; j < nrhs; j++ ) {
			check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
				'trans': 'n',
				'factor': 100,
				'label': 'dsysv '+uplo+' N='+N+' nrhs='+nrhs+' col='+j
			});
		}
	});
}

// Step 4: layout-invariance fuzz. dsysv is a ONE-SHOT driver: its pivot search
// is data-dependent, and factor+solve are coupled, so the factor's choices
// cannot be isolated from the solve (see the zhetrf LEARNINGS note). Bit-exact
// invariance therefore holds only across a PURE-ADDRESSING family — layouts that
// change ONLY base offset and leading-dimension padding (always tight
// col-major, unit positive strides), which cannot reorder any arithmetic in
// either the factor or the solve. Cross-order/sign correctness is certified by
// the residual property above (swept over the full pivotLayouts()). Both A and B
// are fuzzed over pureAddrLayouts(); WORK stays a tight length-N array.
test( 'dsysv: bit-exact across pure-addressing layouts (one-shot driver)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	});
});

function runInvariance( uplo ) {
	const N = 9;
	const nrhs = 3;
	const SEED = 0xBEEF;

	const rng = new RNG( SEED );
	const A0 = logical.symmetric( sc, rng, N );
	const B0 = logical.general( sc, rng, N, nrhs );
	const variants = schemes.dense.pureAddrLayouts();

	checked( 'dsysv', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout ) {
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
			const ipiv = new Int32Array( N );
			const work = sc.alloc( N );
			dsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );
			return check.flattenLogical( sc, readB( Br, N, nrhs ) );
		}, { 'label': 'dsysv '+uplo+' pure-addressing layout invariance' } );
	});
}

// Step 4c: WORK conformance. dsysv advertises a minimum workspace of N for the
// dsytrs2 solve. At a blocked size (N = 64) with EXACTLY N poisoned elements,
// the solve must (a) never read past the buffer (a NaN would surface as a
// non-finite residual) and (b) still produce the correct X. This pins the
// advertised minimum as both sufficient and honest.
test( 'dsysv: minimum WORK (length N) suffices at blocked N=64', function t() {
	const N = 64;
	const nrhs = 3;
	const rng = new RNG( 0xC0FFEE );
	UPLO.forEach( function eachUplo( uplo ) {
		const A0 = logical.symmetric( sc, rng, N );
		const B0 = logical.general( sc, rng, N, nrhs );
		const layout = schemes.dense.pivotLayouts()[ 0 ];
		const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
		const Br = schemes.dense.realize( sc, B0, { 'part': 'full' }, layout );
		const ipiv = new Int32Array( N );
		const work = sc.alloc( N ); // exactly the advertised minimum, NaN-poisoned

		dsysv( uplo, N, nrhs, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], ipiv, 1, 0, Br.data, Br.args[ 0 ], Br.args[ 1 ], Br.args[ 2 ], work, 1, 0 );

		checked( 'dsysv', 'residual', function run() {
			let j;
			for ( j = 0; j < nrhs; j++ ) {
				check.assertResidual( sc, A0, readCol( Br, N, j ), logicalCol( B0, N, j ), {
					'trans': 'n',
					'factor': 100,
					'label': 'dsysv min-WORK '+uplo+' N='+N+' col='+j
				});
			}
		});
	});
});
