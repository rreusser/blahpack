/**
* Property-based validation for zungtr, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `un`/`gtr` -> formation of the
* unitary factor Q (N x N) from the N-1 Householder reflectors that `zhetrd`
* leaves in one triangle of A (with tau in TAU) when it reduces a complex Hermitian
* matrix to real symmetric tridiagonal form (`Qᴴ·A·Q = T`). zungtr CONSUMES that
* factorization: on input A holds the reflectors, on output A is overwritten with
* the N x N unitary Q. Internally it shifts the reflectors one column and calls the
* BLOCKED zungql (uplo='upper') or zungqr (uplo='lower') on the (N-1)x(N-1)
* leading/trailing submatrix.
*
* Oracles (INDEPENDENT of the reflector algebra): (a) the columns of Q are
* unitary (QᴴQ = I), and (b) the reduction reconstructs, A0 = Q·T·Qᴴ, where T is
* the REAL symmetric tridiagonal built from the d/e that zhetrd returned. The N
* sweep straddles the sub-kernel's NB=32 block threshold (33/64/100).
*
* WORK is caller-owned (complex): the blocked sub-kernel stores the block-reflector
* T factor (leading dim N-1) + zlarfb scratch in it, so Step 4c probes that the
* wrapper's advertised minimum actually suffices under a poisoned buffer.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zungtr from './../lib/ndarray.js';
import zhetrd from '../../zhetrd/lib/ndarray.js';

var sc = S.complex; // z-routine
var RE = S.real; // d, e are ALWAYS real
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded block size in the zungql/zungqr sub-kernels

var UPLO = [ 'upper', 'lower' ];
var SWEEP = SIZES_SMALL.concat( [ 100 ] ); // 33/64/100 exercise the blocked path
var ALL_LAYOUTS = schemes.dense.layouts();
var VEC_LAYOUTS = schemes.vectorLayouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

function poisonReal( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( { 're': NaN, 'im': NaN } );
	}
	return a;
}

// Generous WORK superset covering the blocked sub-kernel ((N-1)*NB complex elems).
function workLen( N ) {
	return Math.max( 1, ( N - 1 ) * NB );
}

function readFull( Ard, N ) {
	var F = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

function freezeFactor( Ard, N, uplo ) {
	var F = new LogicalMatrix( sc, N, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				F.set( i, j, Ard.read( i, j ) );
			} else {
				F.set( i, j, sc.zero );
			}
		}
	}
	return F;
}

function buildT( dvals, evals, N ) {
	var T = new LogicalMatrix( sc, N, N );
	var i;
	for ( i = 0; i < N; i++ ) {
		T.set( i, i, sc.fromReal( dvals[ i ] ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		T.set( i + 1, i, sc.fromReal( evals[ i ] ) );
		T.set( i, i + 1, sc.fromReal( evals[ i ] ) );
	}
	return T;
}

// Factor a Hermitian A (realized as Ar, {part:uplo}) with zhetrd. Returns d/e.
// zhetrd allocates its own WORK internally (no caller WORK argument).
function factor( uplo, N, Ar, dR, eR, tauR ) {
	zhetrd(
		uplo, N,
		Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
		dR.data, dR.args[ 0 ], dR.args[ 1 ],
		eR.data, eR.args[ 0 ], eR.args[ 1 ],
		tauR.data, tauR.args[ 0 ], tauR.args[ 1 ]
	);
	var dvals = [];
	var evals = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		dvals.push( dR.read( i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		evals.push( eR.read( i ) );
	}
	return { 'dvals': dvals, 'evals': evals };
}


// Steps 2/3/5: unitarity (QᴴQ = I) AND reduction reconstruction (A0 = Q·T·Qᴴ)
// across uplo x N (SIZES_SMALL + 100, straddling NB=32) x every dense storage
// layout, at backward-error tolerance. zhetrd factors then zungtr forms Q in place;
// d/e/TAU vector layouts are fuzzed in parallel.
test( 'zungtr: QᴴQ = I and A0 = Q·T·Qᴴ (uplo x N x all layouts, blocked+unblocked)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SWEEP.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				var A0 = logical.hermitian( sc, rng, N );
				var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				var eR = schemes.realizeVector( RE, poisonReal( Math.max( N - 1, 0 ) ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				var tauR = schemes.realizeVector( sc, poison( Math.max( N - 1, 0 ) ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				var out = factor( uplo, N, Ar, dR, eR, tauR );

				var Wo = schemes.realizeVector( sc, poison( workLen( N ) ), TIGHT_VEC );
				zungtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], tauR.data, tauR.args[ 0 ], tauR.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );

				var Q = readFull( Ar, N );
				var label = 'zungtr ' + uplo + ' N=' + N + ' layout=' + li;

				checked( 'zungtr', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				var T = buildT( out.dvals, out.evals, N );
				var recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 'c' } );
				checked( 'zungtr', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 3: layout invariance. Freeze the zhetrd factor + tau ONCE at a tight layout,
// re-realize per storage layout and run ONLY zungtr; assert BIT-EXACT output WITHIN
// a storage-order family (col / row). The blocked zlarfb (zgemm/ztrmm) picks its
// summation form from operand strides, so cross-order equality is not expected.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'zungtr: bit-exact within storage-order family (col / row)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( colLayouts, 'col', uplo );
		runInvariance( rowLayouts, 'row', uplo );
	} );
} );

function runInvariance( variants, fam, uplo ) {
	var N = 48; // N-1 = 47 > NB=32 -> BLOCKED sub-kernel
	var SEED = 0xF00D;

	var rng = new RNG( SEED );
	var A0 = logical.hermitian( sc, rng, N );
	var Af = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
	var dF = schemes.realizeVector( RE, poisonReal( N ), TIGHT_VEC );
	var eF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
	var tF = schemes.realizeVector( sc, poison( N - 1 ), TIGHT_VEC );
	factor( uplo, N, Af, dF, eF, tF );
	var Frozen = freezeFactor( Af, N, uplo );
	var taus = [];
	var ti;
	for ( ti = 0; ti < N - 1; ti++ ) {
		taus.push( tF.read( ti ) );
	}

	checked( 'zungtr', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			var Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, layout );
			var Tr = schemes.realizeVector( sc, taus, VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			var Wo = schemes.realizeVector( sc, poison( workLen( N ) ), TIGHT_VEC );
			zungtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo.data, Wo.args[ 0 ], Wo.args[ 1 ] );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}, { 'label': 'zungtr ' + uplo + ' layout invariance ' + fam + '-major (N=' + N + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE (plain assertion, NOT `checked`). zungtr forwards
// the caller WORK straight to the BLOCKED zungql/zungqr, which store the
// block-reflector T factor (leading dim N-1) + zlarfb scratch in it — far more than
// the unblocked `max(1, N-1)`. Derive the advertised minimum from the wrapper's own
// throw boundary, run at exactly that length with a POISONED WORK on the blocked
// path (N=64), and require finite Q AND unitarity.
test( 'zungtr: advertised WORK minimum suffices on the blocked path (Step 4c)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		var N = 64; // N-1 = 63 > NB=32 -> blocked
		var SEED = 0xB10C;
		var label = 'zungtr WORK-min ' + uplo + ' N=' + N;

		var rng = new RNG( SEED );
		var A0 = logical.hermitian( sc, rng, N );
		var Af = schemes.dense.realize( sc, A0, { 'part': uplo }, null );
		var dF = schemes.realizeVector( RE, poisonReal( N ), TIGHT_VEC );
		var eF = schemes.realizeVector( RE, poisonReal( N - 1 ), TIGHT_VEC );
		var tF = schemes.realizeVector( sc, poison( N - 1 ), TIGHT_VEC );
		factor( uplo, N, Af, dF, eF, tF );
		var Frozen = freezeFactor( Af, N, uplo );
		var taus = [];
		var ti;
		for ( ti = 0; ti < N - 1; ti++ ) {
			taus.push( tF.read( ti ) );
		}

		function run( len ) {
			var Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, null );
			var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
			var Wo = poisonedWork( sc, len );
			zungtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
			return check.flattenLogical( sc, readFull( Ar, N ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		var Ar = schemes.dense.realize( sc, Frozen, { 'part': uplo }, null );
		var Tr = schemes.realizeVector( sc, taus, TIGHT_VEC );
		var Wo = poisonedWork( sc, minLen );
		zungtr( uplo, N, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Wo, 1, 0 );
		check.assertOrthonormal( sc, readFull( Ar, N ), { 'label': label + ' (WORK=' + minLen + ') Q' } );
	} );
} );
