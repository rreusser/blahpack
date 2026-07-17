/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for dgelqf, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `ge` -> general dense
* (schemes.dense, logical.general); `lqf` (BLOCKED LQ factorization) ->
* reconstruction A = L * Q AND orthonormality of Q.
*
* dgelqf produces exactly the same factored representation as its unblocked
* sibling dgelq2 (L on/below the diagonal; the essential Householder rows above
* it; tau in TAU) — the blocked driver merely batches the reflector application
* through dlarft/dlarfb (an optimized dgemm). The reconstruction+orthonormal
* oracle is therefore IDENTICAL to dgelq2's validated oracle (including the
* conj(tau) subtlety that is a no-op under the real trait): on exit A holds the
* M-by-N lower-trapezoidal L below the diagonal; above it, row i (i = 0..k-1,
* k = min(M,N)) stores the essential part of reflector v_i (a ROW vector) with an
* implicit 1 on the diagonal, H(i) = I - tau_i * v_iᵀ * v_i applied from the RIGHT,
* and Q = H(k-1) * ... * H(0), so A = L * Q. Both reconstruction and Q come from
* the SAME right-application loop (i = k-1 downto 0), started from L and from the
* identity respectively; it uses conj(v)/conj(tau) so it is bit-identical to the
* complex sibling under the real trait.
*
* A = L * Q is an EXACT algebraic identity for ANY general M-by-N A, so
* conditioning is irrelevant and plain random general A suffices; the (M,N) sweep
* spans the NB = 32 block-size threshold (48, 63, 64, 65, 100) so the blocked
* dlarfb path is genuinely exercised.
*/

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgelqf from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var ROUTINE = 'dgelqf';
var NB = 32; // block size hardcoded in base.js


// HELPERS //

// WORK length that generously satisfies the blocked-path minimum (M*NB scratch
// for dgelqf, which stores its NB-by-NB T factor in a SEPARATE allocation).
function workLen( M ) {
	return Math.max( 1, ( M * NB ) + ( NB * NB ) );
}

// (M,N) sweep: squares straddling the unroll AND NB=32 block thresholds +
// rectangular (M<N, M>N, blocked and unblocked) + zero-dimension corners.
var PAIRS = [];
[ 0, 1, 2, 3, 5, 8, 16, 17, 31, 32, 33, 48, 63, 64, 65, 100 ].forEach( function sq( n ) {
	PAIRS.push( [ n, n ] );
});
[ [ 5, 8 ], [ 8, 5 ], [ 3, 7 ], [ 7, 3 ], [ 16, 33 ], [ 33, 16 ], [ 48, 64 ], [ 64, 48 ], [ 33, 100 ], [ 100, 33 ], [ 40, 65 ], [ 65, 40 ], [ 1, 5 ], [ 5, 1 ], [ 0, 0 ], [ 0, 4 ], [ 4, 0 ] ].forEach( function rect( p ) {
	PAIRS.push( p );
});

// Read the essential Householder row v_i (length N): 0 before col i, implicit 1
// on the diagonal, and the stored strict-upper entries A(i,i+1:N-1) after it.
function reflectorRow( R, i, N ) {
	var v = [];
	var j;
	for ( j = 0; j < N; j++ ) {
		if ( j < i ) {
			v.push( sc.zero );
		} else if ( j === i ) {
			v.push( sc.one );
		} else {
			v.push( R.read( i, j ) );
		}
	}
	return v;
}

// Right-apply H(i)ᴴ: Mtx := Mtx - conj(tau) * (Mtx * conj(v)) * v, where v is a
// row vector of length Mtx.cols. Faithful to C*H(i)ᴴ = C - conj(tau) (C v) vᴴ,
// since A = L * H(k-1)ᴴ ... H(0)ᴴ (for real, conj(tau)=tau and conj(v)=v).
function applyHRight( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var ctau = sc.conj( tau );
	var coef;
	var dot;
	var r;
	var j;
	for ( r = 0; r < rows; r++ ) {
		dot = sc.zero;
		for ( j = 0; j < cols; j++ ) {
			dot = sc.add( dot, sc.mul( Mtx.get( r, j ), sc.conj( v[ j ] ) ) );
		}
		coef = sc.mul( ctau, dot );
		for ( j = 0; j < cols; j++ ) {
			Mtx.set( r, j, sc.sub( Mtx.get( r, j ), sc.mul( coef, v[ j ] ) ) );
		}
	}
}

// Read the M-by-N lower-trapezoidal factor L (on/below diagonal; zero above).
function readL( R, M, N ) {
	var L = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			L.set( i, j, ( i >= j ) ? R.read( i, j ) : sc.zero );
		}
	}
	return L;
}

// Arec = L * Q, formed by right-applying H(k-1)...H(0) to L (i = k-1 downto 0).
function reconstruct( R, taus, M, N, k ) {
	var L = readL( R, M, N );
	var i;
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( L, reflectorRow( R, i, N ), taus[ i ] );
	}
	return L;
}

// Q = H(k-1)...H(0), formed by right-applying the reflectors to the N-by-N
// identity. Each H(i) is N-by-N unitary, so Q is a full square unitary matrix.
function buildQ( R, taus, N, k ) {
	var Q = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q.set( i, i, sc.one );
	}
	for ( i = k - 1; i >= 0; i-- ) {
		applyHRight( Q, reflectorRow( R, i, N ), taus[ i ] );
	}
	return Q;
}

// Read the full factored A (M x N) back into a LogicalMatrix.
function readFull( R, M, N ) {
	var F = new LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			F.set( i, j, R.read( i, j ) );
		}
	}
	return F;
}

// Factor a fresh general A (seed derived from size) at a given dense layout and a
// WORK buffer of length `wlen`, returning the realized storage, tau values, and
// original matrix for oracle checks.
function factor( M, N, layout, wlen, poison ) {
	var k = Math.min( M, N );
	var rng = new RNG( 0x100 + ( M * 100 ) + N );
	var A0 = logical.general( sc, rng, M, N );
	var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var TAU = schemes.realizeVector( sc, new Array( k ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } );
	var work = ( poison ) ? poisonedWork( sc, wlen ) : schemes.realizeVector( sc, new Array( wlen ).fill( sc.zero ), { 'stride': 1, 'lead': 0, 'tail': 0 } ).data;
	dgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], work, 1, 0 );
	var taus = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		taus.push( TAU.read( i ) );
	}
	return { 'R': R, 'taus': taus, 'A0': A0, 'k': k };
}


// TESTS //

// Steps 2-3 (L2): reconstruction A = L*Q AND orthonormality of Q across the
// (M,N) sweep (through the blocked NB=32 threshold) and every dense storage
// layout. dgelqf has no pivot search, so all seven layouts (incl. negative row
// stride) are in contract; bit-exactness across the col<->row flip is deferred
// to the layout-invariance test below.
test( 'dgelqf: LQ reconstruction A=L*Q and orthonormal Q ((M,N) sweep x all layouts)', function t() {
	PAIRS.forEach( function eachPair( pr ) {
		var M = pr[ 0 ];
		var N = pr[ 1 ];
		schemes.dense.layouts().forEach( function eachLayout( layout, li ) {
			var f = factor( M, N, layout, workLen( M ) );
			var lbl = ROUTINE + ' M=' + M + ' N=' + N + ' layout=' + li;
			checked( ROUTINE, 'reconstruct', function run() {
				check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': lbl + ' A=L*Q' } );
			});
			checked( ROUTINE, 'orthonormal', function run() {
				check.assertOrthonormal( sc, buildQ( f.R, f.taus, N, f.k ), { 'label': lbl + ' Q unitary' } );
			});
		});
	});
});

// Step 4 (L3): layout-invariance fuzz on genuinely BLOCKED sizes (min(M,N) > 32,
// each triggering dlarft/dlarfb). Within a single storage-order family the
// factored A must be bit-exact across offset, leading-dim padding, and stride
// SIGN; the col<->row FLIP legitimately reorders the optimized dlarfb->dgemm
// accumulation (~1 ULP), so cross-order agreement is certified by the
// reconstruction property above, not bit-equality (see dgels/dgelqf LEARNINGS).
// TAU is fuzzed over positive-stride layouts (its stride is honored end-to-end);
// WORK is fuzzed over UNIT-stride layouts only, because base.js passes stride 1
// (not strideWork) to dlarfb, so a non-unit WORK stride is out of contract on the
// blocked path — offset/lead are still varied.
var VLAYOUTS = schemes.vectorLayouts();
var TAULAYOUTS = VLAYOUTS.filter( function posStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) > 0;
});
var WLAYOUTS = VLAYOUTS.filter( function unitStride( L ) {
	return ( L.stride === void 0 ? 1 : L.stride ) === 1;
});
var colLayouts = schemes.dense.layouts().filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = schemes.dense.layouts().filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgelqf: bit-exact within storage-order family (col / row), blocked path', function t() {
	[ [ 40, 50 ], [ 50, 40 ], [ 33, 48 ], [ 48, 64 ] ].forEach( function eachSize( sz ) {
		runInvariance( colLayouts, 'col', sz[ 0 ], sz[ 1 ] );
		runInvariance( rowLayouts, 'row', sz[ 0 ], sz[ 1 ] );
	});
});

function runInvariance( variants, fam, M, N ) {
	var k = Math.min( M, N );
	var SEED = 0xF00D + ( M * 17 ) + N;
	checked( ROUTINE, 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.general( sc, rng, M, N );
			var R = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var TAU = schemes.realizeVector( sc, new Array( k ).fill( sc.zero ), TAULAYOUTS[ i % TAULAYOUTS.length ] );
			var WORK = schemes.realizeVector( sc, new Array( workLen( M ) ).fill( sc.zero ), WLAYOUTS[ i % WLAYOUTS.length ] );
			dgelqf( M, N, R.data, R.args[ 0 ], R.args[ 1 ], R.args[ 2 ], TAU.data, TAU.args[ 0 ], TAU.args[ 1 ], WORK.data, WORK.args[ 0 ], WORK.args[ 1 ] );
			return check.flattenLogical( sc, readFull( R, M, N ) );
		}, { 'label': ROUTINE + ' layout invariance ' + fam + '-major ' + M + 'x' + N } );
	});
}

// Step 4c: workspace conformance. The blocked path consumes a WORK scratch whose
// advertised minimum the wrapper enforces (throwing below it). Probe that minimum
// from the throw boundary, then run at EXACTLY that length with a POISONED buffer
// and require finite output — a too-small claim over-reads poisoned padding -> NaN.
// Additionally assert reconstruction still holds at the minimum length. Uses a
// square blocked case and a wide (M<N) blocked case.
test( 'dgelqf: advertised WORK minimum suffices on the blocked path (poisoned)', function t() {
	[ [ 80, 80 ], [ 40, 100 ] ].forEach( function eachCase( c ) {
		var M = c[ 0 ];
		var N = c[ 1 ];
		var label = ROUTINE + ' WORK-sufficiency ' + M + 'x' + N;
		var min = assertWorkspaceSufficient( function run( wlen ) {
			var f = factor( M, N, schemes.dense.layouts()[ 0 ], wlen, true );
			var flat = check.flattenLogical( sc, readFull( f.R, M, N ) );
			var i;
			for ( i = 0; i < f.taus.length; i++ ) {
				flat = flat.concat( sc.components( f.taus[ i ] ) );
			}
			return flat;
		}, {}, label );

		// Reconstruction must hold at exactly the advertised minimum WORK length:
		var f = factor( M, N, schemes.dense.layouts()[ 0 ], min, true );
		check.assertReconstruct( sc, reconstruct( f.R, f.taus, M, N, f.k ), f.A0, { 'label': label + ' A=L*Q @ WORK=' + min } );
	});
});
