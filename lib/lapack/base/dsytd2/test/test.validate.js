/**
* Property-based validation for dsytd2, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; `sy` -> symmetric dense
* (schemes.dense, logical.symmetric — dsytd2 reduces a REAL SYMMETRIC matrix, so
* the analogue is a plain symmetric matrix); `td2` (UNBLOCKED reduction to real
* symmetric tridiagonal form by an orthogonal similarity `Qᵀ·A·Q = T`).
*
* Outputs: `d` (diagonal of T, length N, REAL), `e` (off-diagonal, length N-1,
* REAL), and the Householder reflectors packed into A + the scalar factors TAU
* (length N-1). Storage (from data/lapack-3.12.0/SRC/dsytd2.f Further Details):
*
*   uplo='lower':  Q = H(1)·H(2)···H(n-1); H(i)=I−tau·v·vᵀ with v(1:i)=0, v(i+1)=1,
*                  v(i+2:n) stored in A(i+2:n,i), E(i)=A(i+1,i) (the subdiagonal).
*   uplo='upper':  Q = H(n-1)···H(2)·H(1); H(i)=I−tau·v·vᵀ with v(i+1:n)=0, v(i)=1,
*                  v(1:i-1) stored in A(1:i-1,i+1), E(i)=A(i,i+1) (superdiagonal).
*
* Validation (kinds reconstruct + orthonormal): build a symmetric A0, realize its
* referenced triangle, run dsytd2, read d/e and the reflectors, form Q by applying
* the reflectors to I, then assert (a) QᴴQ = I (assertOrthonormal) and (b)
* A0 = Q·T·Qᴴ where T is the real symmetric tridiagonal from d/e (assertReconstruct).
* The passing reconstruction proves the reflectors were read with the exact
* convention above. There is NO caller WORK argument (unblocked), so no workspace
* conformance step applies.
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import dsytd2 from './../lib/ndarray.js';

var sc = S.real; // d-routine
var RE = S.real; // d, e are ALWAYS real (even for the z sibling)
var LogicalMatrix = logical.LogicalMatrix;

var UPLO = [ 'upper', 'lower' ];
var ALL_LAYOUTS = schemes.dense.layouts();
var VEC_LAYOUTS = schemes.vectorLayouts();
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };


// HELPERS //

// Poisoned (NaN) array of `k` REAL values.
function poisonReal( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

// Poisoned (NaN) array of `k` scalar values (real number or {re,im}).
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Extract the N-1 Householder vectors (each length N) from the factored A per the
// dsytd2 storage convention (see file header).
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
					v[ r ] = Ard.read( r, t ); // essential v in A(t+2:N-1, t)
				}
			}
		} else { // upper
			for ( r = 0; r < N; r++ ) {
				if ( r > t ) {
					v[ r ] = sc.zero;
				} else if ( r === t ) {
					v[ r ] = sc.one;
				} else {
					v[ r ] = Ard.read( r, t + 1 ); // essential v in A(0:t-1, t+1)
				}
			}
		}
		vs.push( v );
	}
	return vs;
}

// Mtx := H·Mtx where H = I − tau·v·vᴴ, i.e. Mtx -= tau·v·(vᴴ·Mtx).
function applyH( Mtx, v, tau ) {
	var rows = Mtx.rows;
	var cols = Mtx.cols;
	var w;
	var tw;
	var c;
	var r;
	for ( c = 0; c < cols; c++ ) {
		w = sc.zero; // w = vᴴ·Mtx[:,c]
		for ( r = 0; r < rows; r++ ) {
			w = sc.add( w, sc.mul( sc.conj( v[ r ] ), Mtx.get( r, c ) ) );
		}
		tw = sc.mul( tau, w );
		for ( r = 0; r < rows; r++ ) {
			Mtx.set( r, c, sc.sub( Mtx.get( r, c ), sc.mul( v[ r ], tw ) ) );
		}
	}
}

// Form Q (N x N) from the reflectors. lower: Q = H(0)·H(1)···H(N-2) (fold high→low);
// upper: Q = H(N-2)···H(1)·H(0) (fold low→high).
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

// Build the full N x N (real symmetric) tridiagonal T from d (diag) and e
// (off-diag). e is real, so T is real symmetric for both d and z.
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

// Flatten the stored triangle of the factored A (opposite triangle zeroed) plus
// d, e, TAU into one flat component array for bit-exact layout comparison.
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

// Drive dsytd2 for a realized A + realized d/e/TAU vectors; returns
// { dvals, evals, taus } read back out of storage.
function drive( uplo, N, Ar, dR, eR, tauR ) {
	dsytd2(
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
// uplo x N (SIZES_SMALL) x every dense storage layout, at backward-error
// tolerance. The inner dsymv/dsyr2 reorder across storage order (and TAU doubles
// as their scratch vector), so bit-exactness is deferred to the pure-addressing
// invariance test below. d/e/TAU vector layouts are fuzzed in parallel to exercise
// their strides/offsets.
test( 'dsytd2: A0 = Q·T·Qᴴ and QᴴQ = I (uplo x N x all layouts)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				var A0 = logical.symmetric( sc, rng, N );
				var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				var dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				var eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				var tauR = schemes.realizeVector( sc, poison( N - 1 ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				var out = drive( uplo, N, Ar, dR, eR, tauR );
				var label = 'dsytd2 ' + uplo + ' N=' + N + ' layout=' + li;

				var Q = formQ( Ar, out.taus, N, uplo );
				checked( 'dsytd2', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				var T = buildT( out.dvals, out.evals, N );
				var recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 'c' } );
				checked( 'dsytd2', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. dsytd2 bottoms out in the real dsymv/dsyr2
// Level-2 kernels, which special-case incx==1 (and TAU is reused AS their scratch
// vector), so summation reorders on any stride-sign / gap / order / non-unit TAU
// stride change — bit-exactness would break by ~1 ULP across the col/row families
// (the dpotri/dsytrf-family LEARNINGS). Therefore assert bit-exactness only across
// a PURE-ADDRESSING family (tight col-major, g=1, positive unit strides, varying
// ONLY base offset and leading-dim padding) with TAU held at unit positive stride;
// that cannot reorder arithmetic, so any residual diff is a real offset/leading-dim
// bug. Cross-order/sign/gap correctness is certified by the property sweep over all
// 7 layouts above. Records L3 honestly.
var PURE_LAYOUTS = schemes.dense.pureAddrLayouts();
var TAU_LAYOUTS = VEC_LAYOUTS.filter( function unit( L ) {
	return L.stride === 1; // TAU is scratch: non-unit stride reorders the kernels
} );

test( 'dsytd2: factor bit-exact across pure-addressing layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	} );
} );

function runInvariance( uplo ) {
	var N = 13;
	var SEED = 0xF00D;
	checked( 'dsytd2', 'layout-invariance', function run() {
		layoutInvariant( PURE_LAYOUTS, function build( layout, i ) {
			var rng = new RNG( SEED ); // identical values every variant
			var A0 = logical.symmetric( sc, rng, N );
			var Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			var dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			var eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( i + 1 ) % VEC_LAYOUTS.length ] );
			var tauR = schemes.realizeVector( sc, poison( N - 1 ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			var out = drive( uplo, N, Ar, dR, eR, tauR );
			return flattenAll( Ar, out.dvals, out.evals, out.taus, N, uplo );
		}, { 'label': 'dsytd2 ' + uplo + ' pure-addressing layout invariance (N=' + N + ')' } );
	} );
}
