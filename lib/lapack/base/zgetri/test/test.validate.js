/**
* Property-based validation for zgetri, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `tri` (matrix inverse from an LU
* factorization) -> RECONSTRUCTION: A0 * inv(A0) = I. The input is the LU factor
* (produced here by the already-validated zgetrf); zgetri overwrites it with
* inv(A0). The ORIGINAL general matrix A0 is the independent oracle: the product
* of the original with the computed inverse must be the identity — independent of
* zgetrf's correctness.
*
* zgetri is BLOCKED (ztrtri + Level-3 zgemm/ztrsm on the N*NB path), so the size
* sweep includes 33 and 64 to cross the NB=32 threshold, WORK is sized to N*NB to
* exercise the blocked kernels, and the layout-invariance check uses a PURE-
* ADDRESSING family (the complex Level-3 kernels are not proven order-agnostic;
* cf. the real dgetri/dpotri blocked-reorder entry in LEARNINGS.md). A dedicated
* workspace test certifies the advertised WORK minimum actually suffices on a
* blocked size.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, norms, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgetri from './../lib/ndarray.js';
import zgetrf from '../../zgetrf/lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;

const NB = 32; // zgetri's hardcoded block size; N*NB enables the blocked path.

// Read the full N x N computed inverse back out of physical A storage into a
// LogicalMatrix (zgetri overwrites A entirely, so every (i,j) is referenced).
function readFull( R, n ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Backward-error residual for the inverse: ‖A0*inv(A0) - I‖_F normalized by
// ‖A0‖_F·‖inv(A0)‖_F + ‖I‖_F (NOT ‖I‖ alone), recovering the backward-stable
// ~n·eps quantity even when A0 is moderately ill-conditioned (cf. dpotri).
function assertInvResidual( A0, invA, n, label, factor ) {
	const P = ref.matmul( sc, A0, invA );
	const R = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			R.set( i, j, sc.sub( P.get( i, j ), ( i === j ) ? sc.one : sc.zero ) );
		}
	}
	check.assertFinite( sc, R, label+' (residual)' ); // NaN => OOB read into poisoned storage
	const scale = ( norms.frobenius( sc, A0 ) * norms.frobenius( sc, invA ) ) + Math.sqrt( n );
	check.assertScaled( norms.frobenius( sc, R ), scale, check.tol( n, factor ), label );
}

// Steps 2-3-5: reconstruction A0 * inv(A0) = I across the size sweep and EVERY
// storage layout valid for the pivoting factor (pivotLayouts: izamax cannot
// search a negative FIRST-dimension stride). Factor with zgetrf, invert with
// zgetri, then verify the product against the original. WORK = N*NB (poisoned)
// exercises the blocked kernels for N >= 33 and turns any read-before-write /
// over-read into a loud NaN.
test( 'zgetri: inverse reconstruction A*inv(A)=I (size sweep x pivot layouts)', function t() {
	SIZES_SMALL.forEach( function eachN( N ) {
		schemes.dense.pivotLayouts().forEach( function eachLayout( layout ) {
			const rng = new RNG( 0x100 + N ); // reproducible; log on failure
			const A0 = logical.general( sc, rng, N, N );
			const R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const ipiv = new Int32Array( N ); // 0-based pivots from zgetrf
			const work = poisonedWork( sc, Math.max( 1, N * NB ) );

			// Factor A (copy realized above) in place, then invert in place:
			zgetrf( N, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0 );
			zgetri( N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );

			const invA = readFull( R, N );
			checked( 'zgetri', 'reconstruct', function run() {
				assertInvResidual( A0, invA, N, 'zgetri n='+N, 100 );
			});
		});
	});
});

// Step 4: layout-invariance fuzz — the inverse must be bit-exact across storage
// layouts that change ONLY addressing while holding arithmetic order fixed.
// zgetri reaches BLOCKED Level-3 kernels (ztrsm/zgemm) whose reference
// implementations may reorder on stride/order; bit-equality is therefore
// asserted across a PURE-ADDRESSING family (identical strides+signs; only base
// offset / leading-dim pad vary), which cannot change arithmetic order. Any
// residual diff is a genuine offset/stride-base addressing bug. Cross-order/
// sign/gap correctness is certified by the reconstruction sweep above. N=40
// exercises the blocked path.
//
// zgetri consumes a PRE-COMPUTED factorization, so — as in zgetrs — this test
// factors ONCE at a tight col-major layout, freezes the LU factor + IPIV, then
// re-realizes those FIXED factor values at each layout and runs only zgetri.
// Composing zgetrf inside the layout loop would re-run the pivoting factor per
// layout, and the getrf pivoting family is out of contract for a negative FIRST-
// dimension stride (izamax returns -1 -> IPIV=-1 -> NaN; see
// test/harness/LEARNINGS.md). zgetri has no pivot search of its own.
test( 'zgetri: bit-exact across pure-addressing layouts (offset / leading-dim)', function t() {
	runInvariance( 40 );
} );

function readFac( R, n ) {
	const F = new LogicalMatrix( sc, n, n );
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

function runInvariance( n ) {
	const SEED = 0xF00D;

	// Factor ONCE at the tight col-major layout to obtain fixed LU factors +
	// pivots shared by every layout variant below:
	const rng = new RNG( SEED );
	const A0 = logical.general( sc, rng, n, n );
	const tight = schemes.dense.pivotLayouts()[ 0 ];
	const Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, tight );
	const ipiv = new Int32Array( n );
	zgetrf( n, n, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
	const Afac = readFac( Af, n );

	checked( 'zgetri', 'layout-invariance', function run() {
		layoutInvariant( schemes.dense.pureAddrLayouts(), function build( layout ) {
			const R = schemes.dense.realize( sc, Afac, { 'part': 'full' }, layout );
			const work = poisonedWork( sc, Math.max( 1, n * NB ) );
			zgetri( n, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			return check.flattenLogical( sc, readFull( R, n ) );
		}, { 'label': 'zgetri n='+n+' pure-addressing layout invariance' } );
	} );
}

// Step 4c: workspace conformance. zgetri is blocked; its wrapper advertises a
// WORK minimum of max(1,N) complex elements. This certifies that minimum
// actually SUFFICES on a size that CAN take the blocked path (N in {33,64}):
// probe the smallest WORK length the wrapper accepts, run at exactly that length
// with a POISONED complex buffer, and require finite output. zgetri adapts its
// block size down to the available WORK (nb = floor(lwork/ldwork)), like
// reference LAPACK, so the minimum falls back to the unblocked kernel and
// remains correct — asserted here by also reconstructing A0*inv(A0)=I.
test( 'zgetri: advertised WORK minimum suffices on a blocked size', function t() {
	[ 33, 64 ].forEach( function eachN( N ) {
		const rng = new RNG( 0x900 + N );
		const A0 = logical.general( sc, rng, N, N );
		const tight = schemes.dense.pivotLayouts()[ 0 ];
		const Af = schemes.dense.realize( sc, A0, { 'part': 'full' }, tight );
		const ipiv = new Int32Array( N );
		zgetrf( N, N, Af.data, Af.args[ 0 ], Af.args[ 1 ], Af.args[ 2 ], ipiv, 1, 0 );
		const Afac = readFac( Af, N );

		function run( workLen ) {
			const R = schemes.dense.realize( sc, Afac, { 'part': 'full' }, tight );
			const work = poisonedWork( sc, workLen );
			zgetri( N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			return check.flattenLogical( sc, readFull( R, N ) );
		}

		checked( 'zgetri', 'reconstruct', function chk() {
			const minLen = assertWorkspaceSufficient( run, { 'max': N * NB * 2 }, 'zgetri N='+N+' WORK sufficiency' );

			// The min-WORK output must also be a correct inverse:
			const R = schemes.dense.realize( sc, Afac, { 'part': 'full' }, tight );
			const work = poisonedWork( sc, minLen );
			zgetri( N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], ipiv, 1, 0, work, 1, 0 );
			assertInvResidual( A0, readFull( R, N ), N, 'zgetri N='+N+' min-WORK inverse', 100 );
		} );
	} );
} );
