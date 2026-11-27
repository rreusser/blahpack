/**
* Property-based validation for zhetd2, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense
* (schemes.dense, logical.hermitian); `td2` (UNBLOCKED reduction of a complex
* Hermitian matrix to real symmetric tridiagonal form by a unitary similarity
* `Qᴴ·A·Q = T`).
*
* Outputs: `d` (diagonal of T, length N, REAL), `e` (off-diagonal, length N-1,
* REAL), the Householder reflectors packed into A + the complex scalar factors TAU
* (length N-1). Storage (from data/lapack-3.12.0/SRC/zhetd2.f Further Details):
*
*   uplo='lower':  Q = H(1)·H(2)···H(n-1); H(i)=I−tau·v·vᴴ with v(1:i)=0, v(i+1)=1,
*                  v(i+2:n) stored in A(i+2:n,i), E(i)=Re(A(i+1,i)) (subdiagonal).
*   uplo='upper':  Q = H(n-1)···H(2)·H(1); H(i)=I−tau·v·vᴴ with v(i+1:n)=0, v(i)=1,
*                  v(1:i-1) stored in A(1:i-1,i+1), E(i)=Re(A(i,i+1)) (superdiag).
*
* Validation (kinds reconstruct + orthonormal): build a Hermitian A0, realize its
* referenced triangle, run zhetd2, read d/e and the reflectors, form the unitary Q
* by applying the reflectors to I, then assert (a) QᴴQ = I (assertOrthonormal) and
* (b) A0 = Q·T·Qᴴ where T is the REAL symmetric tridiagonal from d/e
* (assertReconstruct). The passing reconstruction proves the reflectors were read
* with the exact convention above. No caller WORK argument (unblocked).
*/

import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import zhetd2 from './../lib/ndarray.js';

const sc = S.complex; // z-routine
const RE = S.real; // d, e are ALWAYS real
const LogicalMatrix = logical.LogicalMatrix;

const UPLO = [ 'upper', 'lower' ];
const ALL_LAYOUTS = schemes.dense.layouts();
const VEC_LAYOUTS = schemes.vectorLayouts();


// HELPERS //

function poisonReal( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( NaN );
	}
	return a;
}

function poison( k ) {
	const a = [];
	let i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

function readVecs( Ard, N, uplo ) {
	const vs = [];
	let v, t, r;
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

// Mtx := H·Mtx where H = I − tau·v·vᴴ.
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

function formQ( Ard, taus, N, uplo ) {
	const Q = new LogicalMatrix( sc, N, N );
	const vs = readVecs( Ard, N, uplo );
	let t, i, j;
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

// Real symmetric tridiagonal T from real d/e.
function buildT( dvals, evals, N ) {
	const T = new LogicalMatrix( sc, N, N );
	let i;
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
	const out = [];
	let i, j, c, k;
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
	zhetd2(
		uplo, N,
		Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
		dR.data, dR.args[ 0 ], dR.args[ 1 ],
		eR.data, eR.args[ 0 ], eR.args[ 1 ],
		tauR.data, tauR.args[ 0 ], tauR.args[ 1 ]
	);
	const dvals = [];
	const evals = [];
	const taus = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		dvals.push( dR.read( i ) );
	}
	for ( i = 0; i < N - 1; i++ ) {
		evals.push( eR.read( i ) );
		taus.push( tauR.read( i ) );
	}
	return { 'dvals': dvals, 'evals': evals, 'taus': taus };
}


// Steps 2/3/5: reconstruction (A0 = Q·T·Qᴴ) AND orthonormality (unitarity QᴴQ = I)
// across uplo x N (SIZES_SMALL) x every dense storage layout, at backward-error
// tolerance. d/e/TAU vector layouts are fuzzed in parallel.
test( 'zhetd2: A0 = Q·T·Qᴴ and QᴴQ = I (uplo x N x all layouts)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SIZES_SMALL.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				const rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				const A0 = logical.hermitian( sc, rng, N );
				const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				const dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				const eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				const tauR = schemes.realizeVector( sc, poison( N - 1 ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				const out = drive( uplo, N, Ar, dR, eR, tauR );
				const label = 'zhetd2 ' + uplo + ' N=' + N + ' layout=' + li;

				const Q = formQ( Ar, out.taus, N, uplo );
				checked( 'zhetd2', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				const T = buildT( out.dvals, out.evals, N );
				const recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 'c' } );
				checked( 'zhetd2', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. zhetd2 bottoms out in zhemv/zher2, and TAU is
// reused AS their scratch vector, so a non-unit TAU stride reorders the kernels.
// Assert bit-exactness only across a PURE-ADDRESSING family (tight col-major, g=1,
// positive unit strides, varying ONLY base offset and leading-dim padding) with
// TAU held at unit positive stride. Cross-order/sign/gap correctness is certified
// by the property sweep over all 7 layouts above. Records L3 honestly.
const PURE_LAYOUTS = schemes.dense.pureAddrLayouts();
const TAU_LAYOUTS = VEC_LAYOUTS.filter( function unit( L ) {
	return L.stride === 1;
} );

test( 'zhetd2: factor bit-exact across pure-addressing layouts', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	} );
} );

function runInvariance( uplo ) {
	const N = 13;
	const SEED = 0xF00D;
	checked( 'zhetd2', 'layout-invariance', function run() {
		layoutInvariant( PURE_LAYOUTS, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.hermitian( sc, rng, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			const eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( i + 1 ) % VEC_LAYOUTS.length ] );
			const tauR = schemes.realizeVector( sc, poison( N - 1 ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			const out = drive( uplo, N, Ar, dR, eR, tauR );
			return flattenAll( Ar, out.dvals, out.evals, out.taus, N, uplo );
		}, { 'label': 'zhetd2 ' + uplo + ' pure-addressing layout invariance (N=' + N + ')' } );
	} );
}
