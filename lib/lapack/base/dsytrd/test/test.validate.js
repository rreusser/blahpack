/**
* Property-based validation for dsytrd, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — dsytrd reduces a REAL SYMMETRIC matrix);
* `trd` (BLOCKED reduction to real symmetric tridiagonal form `Qᵀ·A·Q = T`).
*
* The BLOCKED algorithm (dlatrd panel + dsyr2k trailing update, then an unblocked
* dsytd2 tail; NB=32 hardcoded) stores EXACTLY the same result as the unblocked
* dsytd2: d (diagonal, REAL), e (off-diagonal, REAL), the Householder reflectors
* packed into A, and TAU. Storage (data/lapack-3.12.0/SRC/dsytd2.f Further Details):
*
*   uplo='lower':  Q = H(1)·H(2)···H(n-1); H(i)=I−tau·v·vᵀ with v(1:i)=0, v(i+1)=1,
*                  v(i+2:n) stored in A(i+2:n,i), E(i)=A(i+1,i) (subdiagonal).
*   uplo='upper':  Q = H(n-1)···H(2)·H(1); H(i)=I−tau·v·vᵀ with v(i+1:n)=0, v(i)=1,
*                  v(1:i-1) stored in A(1:i-1,i+1), E(i)=A(i,i+1) (superdiagonal).
*
* Validation (kinds reconstruct + orthonormal): build a symmetric A0, realize its
* referenced triangle, run dsytrd, read d/e and the reflectors, form Q by applying
* the reflectors to I, then assert (a) QᴴQ = I and (b) A0 = Q·T·Qᴴ. The N sweep
* straddles the NB=32 block threshold (…,33,64,100) so both the unblocked and
* blocked paths are exercised. The blocked routine ALLOCATES its own WORK
* internally (no caller WORK argument), so no Step-4c workspace step applies.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsytrd from './../lib/ndarray.js';

var sc = S.real; // d-routine
var RE = S.real; // d, e are ALWAYS real
var LogicalMatrix = logical.LogicalMatrix;
var NB = 32; // hardcoded block size in lib/base.js

var UPLO = [ 'upper', 'lower' ];
var SWEEP = SIZES_SMALL.concat( [ 100 ] ); // 33/64/100 exercise the blocked path
var ALL_LAYOUTS = schemes.dense.layouts();
var VEC_LAYOUTS = schemes.vectorLayouts();


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
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

function readVecs( Ard, N, uplo ) {
	var vs = [];
	var v;
	var t;
	var r;
	for ( t = 0; t < N - 1; t++ ) {
		v = new Array( N );
		if ( uplo === 'lower' ) {
			for ( r = 0; r < N; r++ ) {
				if ( r <= t ) {
					v[ r ] = sc.zero;
				} else if ( r === t + 1 ) {
					v[ r ] = sc.one;
				} else {
					v[ r ] = Ard.read( r, t );
				}
			}
		} else {
			for ( r = 0; r < N; r++ ) {
				if ( r > t ) {
					v[ r ] = sc.zero;
				} else if ( r === t ) {
					v[ r ] = sc.one;
				} else {
					v[ r ] = Ard.read( r, t + 1 );
				}
			}
		}
		vs.push( v );
	}
	return vs;
}

function applyH( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
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

function formQ( Ard, taus, N, uplo ) {
	var Q = new LogicalMatrix( sc, N, N );
	var vs = readVecs( Ard, N, uplo );
	var t;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	if ( uplo === 'lower' ) {
		for ( t = N - 2; t >= 0; t-- ) {
			applyH( Q, vs[ t ], taus[ t ] );
		}
	} else {
		for ( t = 0; t <= N - 2; t++ ) {
			applyH( Q, vs[ t ], taus[ t ] );
		}
	}
	return Q;
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

function flattenAll( Ard, dvals, evals, taus, N, uplo ) {
	var out = [];
	var i;
	var j;
	var c;
	var k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( uplo === 'upper' ? i <= j : i >= j ) {
				c = sc.components( Ard.read( i, j ) );
			} else {
				c = sc.components( sc.zero );
			}
			for ( k = 0; k < c.length; k++ ) {
				out.push( c[ k ] );
			}
		}
	}
	for ( i = 0; i < N; i++ ) {
		out.push( dvals[ i ] );
	}
	for ( i = 0; i < N - 1; i++ ) {
		out.push( evals[ i ] );
	}
	for ( i = 0; i < N - 1; i++ ) {
		c = sc.components( taus[ i ] );
		for ( k = 0; k < c.length; k++ ) {
			out.push( c[ k ] );
		}
	}
	return out;
}

function drive( uplo, N, Ar, dR, eR, tauR ) {
	dsytrd(
		uplo, N,
		Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
		dR.data, dR.args[ 0 ], dR.args[ 1 ],
		eR.data, eR.args[ 0 ], eR.args[ 1 ],
		tauR.data, tauR.args[ 0 ], tauR.args[ 1 ]
	);
	var dvals = [];
	var evals = [];
	var taus = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		dvals.push( dR.read( i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		evals.push( eR.read( i ) );
		taus.push( tauR.read( i ) );
	}
	return { 'dvals': dvals, 'evals': evals, 'taus': taus };
}


// Steps 2/3/5: reconstruction (A0 = Q·T·Qᴴ) AND orthonormality (QᴴQ = I) across
// uplo x N (SIZES_SMALL + 100, straddling NB=32) x every dense storage layout, at
// backward-error tolerance. d/e/TAU vector layouts are fuzzed in parallel.
test( 'dsytrd: A0 = Q·T·Qᴴ and QᴴQ = I (uplo x N x all layouts, blocked+unblocked)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SWEEP.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				var A0 = logical.symmetric( sc, rng, N );
				var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				var eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				var tauR = schemes.realizeVector( sc, poison( N - 1 ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				var out = drive( uplo, N, Ar, dR, eR, tauR );
				var label = 'dsytrd ' + uplo + ' N=' + N + ' layout=' + li;

				var Q = formQ( Ar, out.taus, N, uplo );
				checked( 'dsytrd', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				var T = buildT( out.dvals, out.evals, N );
				var recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 'c' } );
				checked( 'dsytrd', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz on the BLOCKED path (N=64 > NB=32, reaching
// dlatrd + dsyr2k). The Level-2/3 kernels (dsymv/dgemv/dsyr2k) reorder across
// storage order, and TAU doubles as scratch in the unblocked tail, so assert
// bit-exactness only across a PURE-ADDRESSING family (tight col-major, g=1,
// positive unit strides, varying ONLY base offset and leading-dim padding) with
// TAU at unit positive stride. Cross-order/sign/gap correctness is certified by
// the property sweep over all 7 layouts above. Records L3 honestly.
var PURE_LAYOUTS = schemes.dense.pureAddrLayouts();
var TAU_LAYOUTS = VEC_LAYOUTS.filter( function unit( L ) {
	return L.stride === 1;
} );

test( 'dsytrd: factor bit-exact across pure-addressing layouts (blocked N=64)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	} );
} );

function runInvariance( uplo ) {
	var N = 64; // > NB=32 -> BLOCKED path
	var SEED = 0xF00D;
	checked( 'dsytrd', 'layout-invariance', function run() {
		layoutInvariant( PURE_LAYOUTS, function build( layout, i ) {
			var rng = new RNG( SEED );
			var A0 = logical.symmetric( sc, rng, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			var dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			var eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( i + 1 ) % VEC_LAYOUTS.length ] );
			var tauR = schemes.realizeVector( sc, poison( N - 1 ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var out = drive( uplo, N, Ar, dR, eR, tauR );
			return flattenAll( Ar, out.dvals, out.evals, out.taus, N, uplo );
		}, { 'label': 'dsytrd ' + uplo + ' pure-addressing layout invariance (blocked N=' + N + ')' } );
	} );
}
