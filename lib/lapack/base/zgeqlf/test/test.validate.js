/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgeqlf, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); `qlf` (BLOCKED QL factorization) ->
* reconstruction A = Q * L AND unitarity of Q.
*
* zgeqlf produces EXACTLY the same factored representation as its unblocked
* sibling zgeql2 (reflectors stored ABOVE their pivots, L in the bottom
* trapezoid, tau in TAU); the blocked driver batches the reflector application
* through zlarft/zlarfb (an optimized zgemm) working BACKWARD / COLUMNWISE. The
* reconstruction+unitary oracle is therefore IDENTICAL to zgeql2's (see that
* routine's test.validate.js for the derivation, incl. the conj subtlety — the
* stored reflector is v itself and Q = H(k)...H(1), so H(i) = I - tau v vᴴ is
* applied with tau DIRECTLY, v conjugated only in the dot):
*   reflector i in column j = N-k+i with pivot row p = M-k+i (essential v ABOVE
*   the pivot, implicit 1 at the pivot); L(i,j) = A(i,j) iff i-j >= M-N.
*   Reconstruction applies H(0) innermost then upward (loop i = 0..k-1) from L;
*   the economy Q is the trailing N columns of I_M through the same loop.
*   A = Q*L is an EXACT identity for any general A.
*
* Sweep uses M >= N (k = N); the NB = 32 threshold is crossed (N = 48/63/64/65/100)
* so the blocked zlarft/zlarfb path is genuinely exercised.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant, SIZES } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgeqlf from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const LogicalMatrix = logical.LogicalMatrix;
const ROUTINE = 'zgeqlf';
const NB = 32; // block size hardcoded in base.js
const TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Blocked-path WORK length (complex elements): N*NB + NB*NB (T stored separately).
function workLen( M, N ) {
	const K = Math.min( M, N );
	return ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
}

const PAIRS = [];
SIZES.forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 3 ], [ 8, 4 ], [ 16, 7 ], [ 33, 17 ], [ 48, 20 ], [ 65, 40 ], [ 100, 33 ], [ 100, 64 ], [ 64, 33 ], [ 40, 16 ], [ 4, 1 ], [ 3, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

function readVecs( Ard, M, N, k ) {
	const vs = [];
	let v, i, j, p, r;
	for ( i = 0; i < k; i++ ) {
		j = ( N - k ) + i;
		p = ( M - k ) + i;
		v = new Array( M );
		for ( r = 0; r < M; r++ ) {
			if ( r < p ) {
				v[ r ] = Ard.read( r, j );
			} else if ( r === p ) {
				v[ r ] = sc.one;
			} else {
				v[ r ] = sc.zero;
			}
		}
		vs.push( v );
	}
	return vs;
}

function readL( Ard, M, N ) {
	const L = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( ( i - j ) >= ( M - N ) ) ? Ard.read( i, j ) : sc.zero );
		}
	}
	return L;
}

function applyH( Mtx, v, tau ) {
	const rows = Mtx.rows;
	const cols = Mtx.cols;
	let w, tw, c, r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero;
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

function reconstruct( Ard, taus, M, N, k ) {
	const Mtx = readL( Ard, M, N );
	const vs = readVecs( Ard, M, N, k );
	let i;
	for ( i = 0; i < k; i++ ) {
		applyH( Mtx, vs[ i ], taus[ i ] );
	}
	return Mtx;
}

function formQ( Ard, taus, M, N, k ) {
	const Q = new LogicalMatrix( sc, M, N );
	const vs = readVecs( Ard, M, N, k );
	let i, r, c;
	for ( c = 0; c < N; c++ ) {
		for ( r = 0; r < M; r++ ) {
			Q.set( r, c, ( r === ( ( M - N ) + c ) ) ? sc.one : sc.zero );
		}
	}
	for ( i = 0; i < k; i++ ) {
		applyH( Q, vs[ i ], taus[ i ] );
	}
	return Q;
}

function readFull( Ard, M, N ) {
	const F = new LogicalMatrix( sc, M, N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

function factor( M, N, layout, wlen, doPoison ) {
	const k = Math.min( M, N );
	const rng = new RNG( 0x100 + ( M * 100 ) + N );
	const A0 = logical.general( sc, rng, M, N );
	const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	const Tr = schemes.realizeVector( sc, poison( k ), TIGHT_VEC );
	const work = ( doPoison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, poison( wlen ), TIGHT_VEC ).data;
	zgeqlf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], work, 1, 0 );
	const taus = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		taus.push( Tr.read( i ) );
	}
	return { 'A': Ar, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

test( 'zgeqlf: A = Q*L and QᴴQ = I ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		const M = pr[ 0 ];
		const N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			const f = factor( M, N, layout, workLen( M, N ), false );
			const lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.A, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=Q*L' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, formQ( f.A, f.taus, M, N, f.k ), { 'label': lbl + ' Q' } );
			});
		});
	});
});

const VLAYOUTS = schemes.vectorLayouts();
const TAULAYOUTS = VLAYOUTS.filter( function pos( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
const WLAYOUTS = VLAYOUTS.filter( function unit( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
const colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
const rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgeqlf: bit-exact within storage-order family (col / row), blocked path', function t() {
	[ [ 40, 40 ], [ 48, 40 ], [ 50, 40 ], [ 64, 48 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	const k = Math.min( M, N );
	const SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.general( sc, rng, M, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			const Tr = schemes.realizeVector( sc, poison( k ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			const Wr = schemes.realizeVector( sc, poison( workLen( M, N ) ), WLAYOUTS[ i % WLAYOUTS.length ] );
			zgeqlf( M, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

// Step 4c: WORKSPACE conformance (see dgeqlf). Blocked-path T lives in a separate
// trailing WORK segment; probe the advertised minimum, run poisoned at exactly
// that length, require finite output AND reconstruction. Square + tall blocked.
test( 'zgeqlf: advertised WORK minimum suffices on the blocked path (poisoned)', function t() {
	[ [ 80, 80 ], [ 200, 40 ] ].forEach( function eachCase( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const k = Math.min( M, N );
		const label = ROUTINE + ' WORK-min M=' + M + ' N=' + N;
		if ( k <= NB ) {
			throw new Error( label + ': case is not on the blocked path (min<=NB)' );
		}
		const min = assertWorkspaceSufficient( function run( wlen ) {
			const f = factor( M, N, schemes.dense.layouts()[ 0 ], wlen, true );
			let flat = check.flattenLogical( sc, readFull( f.A, M, N ) );
			let i;
			for ( i = 0; i < f.taus.length; i++ ) {
				flat = flat.concat( sc.components( f.taus[ i ] ) );
			}
			return flat;
		}, {}, label );

		const f = factor( M, N, schemes.dense.layouts()[ 0 ], min, true );
		check.assertReconstruct( sc, reconstruct( f.A, f.taus, M, N, f.k ), f.A0, { 'label': label + ' A=Q*L @ WORK=' + min } );
	});
});
