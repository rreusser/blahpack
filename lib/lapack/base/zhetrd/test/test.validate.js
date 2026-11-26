/**
* Property-based validation for zhetrd, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `he` -> Hermitian dense
* (schemes.dense, logical.hermitian); `trd` (BLOCKED reduction of a complex
* Hermitian matrix to real symmetric tridiagonal form `Qᴴ·A·Q = T`).
*
* The BLOCKED algorithm (zlatrd panel + zher2k trailing update, then an unblocked
* zhetd2 tail; NB=32 from ilaenv) stores EXACTLY the same result as the unblocked
* zhetd2: d (diagonal, REAL), e (off-diagonal, REAL), the Householder reflectors
* packed into A, and the complex TAU. Storage (data/lapack-3.12.0/SRC/zhetd2.f):
*
*   uplo='lower':  Q = H(1)·H(2)···H(n-1); H(i)=I−tau·v·vᴴ with v(1:i)=0, v(i+1)=1,
*                  v(i+2:n) stored in A(i+2:n,i), E(i)=Re(A(i+1,i)) (subdiagonal).
*   uplo='upper':  Q = H(n-1)···H(2)·H(1); H(i)=I−tau·v·vᴴ with v(i+1:n)=0, v(i)=1,
*                  v(1:i-1) stored in A(1:i-1,i+1), E(i)=Re(A(i,i+1)) (superdiag).
*
* Validation (kinds reconstruct + orthonormal): build a Hermitian A0, realize its
* referenced triangle, run zhetrd, read d/e and the reflectors, form the unitary Q
* by applying the reflectors to I, then assert (a) QᴴQ = I and (b) A0 = Q·T·Qᴴ with
* T the REAL symmetric tridiagonal from d/e. The N sweep straddles NB=32
* (…,33,64,100) to exercise both paths. The blocked routine uses the CALLER's WORK (an
* N-by-NB matrix); like the reference it shrinks NB to fit a short WORK and falls
* back to unblocked code below NBMIN=2 — Step 4c sweeps those branches.
*/

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import test from 'node:test';

// from lib/<pkg>/base/<routine>/test/ the repo root is five levels up:
import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant, SIZES_SMALL } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zhetrd from './../lib/ndarray.js';
import ilaenv from '../../ilaenv/lib/base.js';

const sc = S.complex; // z-routine
const RE = S.real; // d, e are ALWAYS real
const LogicalMatrix = logical.LogicalMatrix;
const NB = ilaenv( 1, 'ZHETRD', 'U', 64, -1, -1, -1 ); // block size (32), from ilaenv as in lib/base.js

const UPLO = [ 'upper', 'lower' ];
const SWEEP = SIZES_SMALL.concat( [ 100 ] ); // 33/64/100 exercise the blocked path
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

function drive( uplo, N, Ar, dR, eR, tauR, ws ) {
	const w = ws || { 'W': new Complex128Array( Math.max( 1, N * NB ) ), 's': 1, 'o': 0 };
	zhetrd(
		uplo, N,
		Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ],
		dR.data, dR.args[ 0 ], dR.args[ 1 ],
		eR.data, eR.args[ 0 ], eR.args[ 1 ],
		tauR.data, tauR.args[ 0 ], tauR.args[ 1 ], w.W, w.s, w.o
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
// across uplo x N (SIZES_SMALL + 100, straddling NB=32) x every dense storage
// layout, at backward-error tolerance. d/e/TAU vector layouts are fuzzed in
// parallel.
test( 'zhetrd: A0 = Q·T·Qᴴ and QᴴQ = I (uplo x N x all layouts, blocked+unblocked)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		SWEEP.forEach( function eachN( N ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				const rng = new RNG( 0x100 + ( N * 10 ) + ( uplo === 'upper' ? 1 : 2 ) );
				const A0 = logical.hermitian( sc, rng, N );
				const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
				const dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ li % VEC_LAYOUTS.length ] );
				const eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( li + 1 ) % VEC_LAYOUTS.length ] );
				const tauR = schemes.realizeVector( sc, poison( N - 1 ), VEC_LAYOUTS[ ( li + 2 ) % VEC_LAYOUTS.length ] );

				const out = drive( uplo, N, Ar, dR, eR, tauR );
				const label = 'zhetrd ' + uplo + ' N=' + N + ' layout=' + li;

				const Q = formQ( Ar, out.taus, N, uplo );
				checked( 'zhetrd', 'orthonormal', function run() {
					check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				} );

				const T = buildT( out.dvals, out.evals, N );
				const recon = ref.matmul( sc, ref.matmul( sc, Q, T ), Q, { 'transb': 'c' } );
				checked( 'zhetrd', 'reconstruct', function run() {
					check.assertReconstruct( sc, recon, A0, { 'factor': 100, 'label': label } );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz on the BLOCKED path (N=64 > NB=32, reaching
// zlatrd + zher2k). Assert bit-exactness only across a PURE-ADDRESSING family
// (tight col-major, g=1, positive unit strides, varying ONLY base offset and
// leading-dim padding) with TAU at unit positive stride (it doubles as scratch in
// the unblocked tail). Cross-order/sign/gap correctness is certified by the
// property sweep over all 7 layouts above. Records L3 honestly.
const PURE_LAYOUTS = schemes.dense.pureAddrLayouts();
const TAU_LAYOUTS = VEC_LAYOUTS.filter( function unit( L ) {
	return L.stride === 1;
} );

test( 'zhetrd: factor bit-exact across pure-addressing layouts (blocked N=64)', function t() {
	UPLO.forEach( function eachUplo( uplo ) {
		runInvariance( uplo );
	} );
} );

function runInvariance( uplo ) {
	const N = 64; // > NB=32 -> BLOCKED path
	const SEED = 0xF00D;
	checked( 'zhetrd', 'layout-invariance', function run() {
		layoutInvariant( PURE_LAYOUTS, function build( layout, i ) {
			const rng = new RNG( SEED );
			const A0 = logical.hermitian( sc, rng, N );
			const Ar = schemes.dense.realize( sc, A0, { 'part': uplo }, layout );
			const dR = schemes.realizeVector( RE, poisonReal( N ), VEC_LAYOUTS[ i % VEC_LAYOUTS.length ] );
			const eR = schemes.realizeVector( RE, poisonReal( N - 1 ), VEC_LAYOUTS[ ( i + 1 ) % VEC_LAYOUTS.length ] );
			const tauR = schemes.realizeVector( sc, poison( N - 1 ), TAU_LAYOUTS[ i % TAU_LAYOUTS.length ] );
			const out = drive( uplo, N, Ar, dR, eR, tauR );
			return flattenAll( Ar, out.dvals, out.evals, out.taus, N, uplo );
		}, { 'label': 'zhetrd ' + uplo + ' pure-addressing layout invariance (blocked N=' + N + ')' } );
	} );
}


// Step 4c: CALLER-OWNED WORK. As in the reference, base.js shrinks NB to fit the
// caller's WORK (LDWORK = N) and uses unblocked code throughout once NB < NBMIN=2.
// On the blocked-size N=64, sweep WORK lengths that reach every branch — full NB,
// a reduced NB that does not divide N, NB = NBMIN, NB < NBMIN, and the advertised
// minimum of 1 — with a POISONED WORK at a nonzero offset.
// Reconstruction and orthonormality must hold for each, and the advertised
// minimum must suffice (no NaN leak from reading unwritten/past-the-end WORK).
const WORK_COLS = [ NB, 7, 2, 1, 0 ]; // W columns the WORK can hold (0 -> length 1)

test( 'zhetrd: caller WORK of any length >= 1 (reduced NB, NBMIN fallback), offset poisoned WORK (Step 4c)', function t() {
	const N = 64;
	const sw = 1; // WORK is opaque scratch: only its offset (sub-allocation) is meaningful
	const ow = 3;
	UPLO.forEach( function eachUplo( uplo ) {
		function setup() {
			const rng = new RNG( 0x4C00 + ( uplo === 'upper' ? 1 : 2 ) );
			const A0 = logical.hermitian( sc, rng, N );
			return {
				'A0': A0,
				'Ar': schemes.dense.realize( sc, A0, { 'part': uplo }, null ),
				'dR': schemes.realizeVector( RE, poisonReal( N ), null ),
				'eR': schemes.realizeVector( RE, poisonReal( N - 1 ), null ),
				'tauR': schemes.realizeVector( sc, poison( N - 1 ), null )
			};
		}
		WORK_COLS.forEach( function eachCols( cols ) {
			const len = Math.max( 1, cols * N );
			const label = 'zhetrd ' + uplo + ' N=' + N + ' WORK=' + len + ' (stride ' + sw + ', offset ' + ow + ')';
			const io = setup();
			const out = drive( uplo, N, io.Ar, io.dR, io.eR, io.tauR, { 'W': poisonedWork( sc, ow + ( len * sw ) ), 's': sw, 'o': ow } );
			const Q = formQ( io.Ar, out.taus, N, uplo );
			const recon = ref.matmul( sc, ref.matmul( sc, Q, buildT( out.dvals, out.evals, N ) ), Q, { 'transb': 'c' } );
			checked( 'zhetrd', 'workspace', function run() {
				check.assertOrthonormal( sc, Q, { 'label': label + ' Q' } );
				check.assertReconstruct( sc, recon, io.A0, { 'factor': 100, 'label': label } );
			} );
		} );
		checked( 'zhetrd', 'workspace', function run() {
			assertWorkspaceSufficient( function runLen( len ) {
				const io = setup();
				const out = drive( uplo, N, io.Ar, io.dR, io.eR, io.tauR, { 'W': poisonedWork( sc, len ), 's': 1, 'o': 0 } );
				return flattenAll( io.Ar, out.dvals, out.evals, out.taus, N, uplo );
			}, {}, 'zhetrd ' + uplo + ' WORK minimum N=' + N );
		} );
	} );
} );
