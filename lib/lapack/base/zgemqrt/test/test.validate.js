/**
* Property-based validation for zgemqrt, following the /blahpack-validate process.
*
* Step 0 classification: `z` -> complex scalar; `ge` -> general dense
* (schemes.dense, logical.general); applies a compact-WY UNITARY Q (built by
* `zgeqrt`, column reflectors + block T) to a matrix C.
*
* zgemqrt overwrites a complex M-by-N matrix C with `op(Q)*C` (side='left') or
* `C*op(Q)` (side='right'), where `op(Q) = Q` (trans='no-transpose') or `Qᴴ`
* (trans='conjugate-transpose'), and `Q = H_1 H_2 ... H_B`, `H_b = I - V_b T_b V_bᴴ`.
* Q is unitary of order M (side='left') or N (side='right').
*
* We CROSS-VALIDATE zgemqrt against an INDEPENDENTLY, EXPLICITLY formed Q: factor
* a QN-by-K matrix with `zgeqrt` (V in the strict lower trapezoid, block T in the
* separate nb-by-K array), form the FULL QN-by-QN unitary Q by applying the
* reflectors (from V and the compact block T — NOT the tau diagonal alone) to the
* identity, and compare zgemqrt's output against the naive matrix product
* op(Q)*C / C*op(Q) with a backward-error tolerance. Because the applied operator
* is unitary/conjugate-transpose, this exercises the COMPLEX conjugation path in
* zlarfb (the applied trans for complex is 'conjugate-transpose', not plain
* transpose).
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, check, ref, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgeqrt from '../../zgeqrt/lib/ndarray.js';
import zgemqrt from './../lib/ndarray.js';

var sc = S.complex; // z-routine
var LogicalMatrix = logical.LogicalMatrix;
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var ALL_LAYOUTS = schemes.dense.layouts();


// HELPERS //

// Poisoned (NaN) array of `k` scalar values.
function poison( k ) {
	var a = [];
	var i;
	for ( i = 0; i < k; i++ ) {
		a.push( ( sc.name === 'complex' ) ? { 're': NaN, 'im': NaN } : NaN );
	}
	return a;
}

// Allocate a POISONED dense (output-only) T buffer of `rows` x `cols` with the
// given physical layout.
function allocT( rows, cols, layout ) {
	var A = schemes.denseAlloc( sc, rows, cols, layout );
	return {
		'data': A.data,
		'args': [ A.s1, A.s2, A.offset ],
		'read': function read( i, j ) {
			return sc.read( A.data, A.addr( i, j ) );
		}
	};
}

// blocks(K,nb) -> [ [g0, ib], ... ] the compact-WY block partition.
function blocks( K, nb ) {
	var out = [];
	var g0;
	for ( g0 = 0; g0 < K; g0 += nb ) {
		out.push( [ g0, Math.min( nb, K - g0 ) ] );
	}
	return out;
}

// V (QN x K): unit-lower-trapezoidal Householder columns from the factored A.
function readV( Ard, QN, K ) {
	var V = new LogicalMatrix( sc, QN, K );
	var i;
	var j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < QN; i++ ) {
			V.set( i, j, ( i < j ) ? sc.zero : ( i === j ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// X := Q * X in place, Q = H_1 H_2 ... H_B, H_b = I - V_b T_b V_bᴴ. `Tread(i,j)`
// reads physical T; block b uses V columns g0..g0+ib-1 and T(0:ib, g0:g0+ib)
// (upper triangular). Apply blocks last-to-first so H_B is innermost.
function applyQ( X, V, Tread, K, nb ) {
	var M = X.rows;
	var p = X.cols;
	var bl = blocks( K, nb );
	var g0;
	var ib;
	var W;
	var TW;
	var s;
	var bi;
	var a;
	var b;
	var c;
	var r;
	for ( bi = bl.length - 1; bi >= 0; bi-- ) {
		g0 = bl[ bi ][ 0 ];
		ib = bl[ bi ][ 1 ];
		for ( c = 0; c < p; c++ ) {
			// W[a] = sum_r conj(V[r][g0+a]) X[r][c]
			W = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( r = g0; r < M; r++ ) {
					s = sc.add( s, sc.mul( sc.conj( V.get( r, g0 + a ) ), X.get( r, c ) ) );
				}
				W[ a ] = s;
			}
			// TW[a] = sum_{b=a..ib-1} T_b(a,b) W[b]  (T_b upper triangular)
			TW = new Array( ib );
			for ( a = 0; a < ib; a++ ) {
				s = sc.zero;
				for ( b = a; b < ib; b++ ) {
					s = sc.add( s, sc.mul( Tread( a, g0 + b ), W[ b ] ) );
				}
				TW[ a ] = s;
			}
			// X[r][c] -= sum_a V[r][g0+a] TW[a]
			for ( r = g0; r < M; r++ ) {
				s = X.get( r, c );
				for ( a = 0; a < ib; a++ ) {
					s = sc.sub( s, sc.mul( V.get( r, g0 + a ), TW[ a ] ) );
				}
				X.set( r, c, s );
			}
		}
	}
}

// FULL QN x QN unitary Q = Q applied to I_QN.
function formFullQ( Ard, Tread, QN, K, nb ) {
	var Q = new LogicalMatrix( sc, QN, QN );
	var V = readV( Ard, QN, K );
	var i;
	var j;
	for ( j = 0; j < QN; j++ ) {
		for ( i = 0; i < QN; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	applyQ( Q, V, Tread, K, nb );
	return Q;
}

// Read a factored/overwritten buffer (rows x cols) into a LogicalMatrix.
function readFull( Ard, rows, cols ) {
	var F = new LogicalMatrix( sc, rows, cols );
	var i;
	var j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			F.set( i, j, Ard.read( i, j ) );
		}
	}
	return F;
}

// nb sweep for K reflectors: {1, 2, ~K/2, K} clamped to [1,K].
function nbsFor( K ) {
	var set = {};
	[ 1, 2, Math.max( 1, Math.floor( K / 2 ) ), K ].forEach( function add( nb ) {
		if ( nb >= 1 && nb <= K ) {
			set[ nb ] = true;
		}
	} );
	return Object.keys( set ).map( Number );
}

// The explicit reference product op(Q)*C / C*op(Q).
function refProduct( side, trans, Q, C0 ) {
	var opc = ( trans === 'conjugate-transpose' ) ? 'c' : 'n';
	if ( side === 'left' ) {
		return ref.matmul( sc, Q, C0, { 'transa': opc } );
	}
	return ref.matmul( sc, C0, Q, { 'transb': opc } );
}

// Factor a QN x K matrix with zgeqrt into (V in Ar, block T in Tr) using `layout`.
function factorize( QN, K, nb, layout, seed ) {
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, QN, K );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var Tr = allocT( nb, K, layout );
	var Wr = schemes.realizeVector( sc, poison( nb * K ), TIGHT_VEC );
	zgeqrt( QN, K, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	return { 'Ar': Ar, 'Tr': Tr };
}


// CASES: {side, qdim (order of Q), k (reflectors, k<=qdim), other (the free C
// dimension)}. side='left' => C is qdim-by-other; side='right' => C is
// other-by-qdim. Covers square/rectangular, K<QN and K=QN, and K=1.
var CASES = [
	{ 'side': 'left', 'qdim': 4, 'k': 4, 'other': 3 },
	{ 'side': 'left', 'qdim': 8, 'k': 5, 'other': 4 },
	{ 'side': 'left', 'qdim': 8, 'k': 5, 'other': 1 },
	{ 'side': 'left', 'qdim': 16, 'k': 8, 'other': 5 },
	{ 'side': 'left', 'qdim': 17, 'k': 8, 'other': 6 },
	{ 'side': 'left', 'qdim': 33, 'k': 16, 'other': 7 },
	{ 'side': 'right', 'qdim': 4, 'k': 4, 'other': 3 },
	{ 'side': 'right', 'qdim': 8, 'k': 5, 'other': 4 },
	{ 'side': 'right', 'qdim': 8, 'k': 5, 'other': 1 },
	{ 'side': 'right', 'qdim': 16, 'k': 8, 'other': 5 },
	{ 'side': 'right', 'qdim': 17, 'k': 8, 'other': 6 },
	{ 'side': 'right', 'qdim': 33, 'k': 16, 'other': 7 }
];
var TRANS = [ 'no-transpose', 'conjugate-transpose' ];


// Steps 2/3: cross-validate zgemqrt vs the explicitly-formed unitary Q across the
// case sweep, nb sweep, both trans, and every dense storage layout
// (backward-error tolerance; bit-exactness is deferred to layout invariance).
test( 'zgemqrt: op(Q)*C / C*op(Q) matches explicit unitary Q (side x trans x sizes x nb x layouts)', function t() {
	CASES.forEach( function eachCase( cfg, ci ) {
		var side = cfg.side;
		var QN = cfg.qdim;
		var K = cfg.k;
		var other = cfg.other;
		var M = ( side === 'left' ) ? QN : other;
		var N = ( side === 'left' ) ? other : QN;
		nbsFor( K ).forEach( function eachNb( nb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var f = factorize( QN, K, nb, layout, 0x2000 + ( ci * 131 ) + ( nb * 7 ) + li );
				var Q = formFullQ( f.Ar, f.Tr.read, QN, K, nb );
				TRANS.forEach( function eachTrans( trans, ti ) {
					var crng = new RNG( 0x3000 + ( ci * 131 ) + ( nb * 7 ) + ( li * 3 ) + ti );
					var C0 = logical.general( sc, crng, M, N );
					var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );
					var ldwork = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
					var Wr = schemes.realizeVector( sc, poison( ldwork * nb ), TIGHT_VEC );

					zgemqrt( side, trans, M, N, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

					var label = 'zgemqrt side=' + side + ' trans=' + trans + ' M=' + M + ' N=' + N + ' K=' + K + ' nb=' + nb + ' layout=' + li;
					var got = readFull( Cr, M, N );
					var expct = refProduct( side, trans, Q, C0 );
					checked( 'zgemqrt', 'apply-Q', function run() {
						check.assertReconstruct( sc, got, expct, { 'label': label, 'factor': 200 } );
					} );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. zgemqrt -> zlarfb (zgemm/ztrmm), whose kernels
// pick their summation form from operand strides, so the col<->row storage flip
// legitimately reorders the arithmetic (~1 ULP) while the property above proves
// the flipped result is still correct. Therefore assert BIT-EXACTNESS only WITHIN
// a storage-order family (col vs row); this still fuzzes offset, leading-dim
// padding, and stride sign for A, T, and C together. WORK stays positive-stride
// (the ndarray guard measures `length - offset`).
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );
var WORK_LAYOUTS = schemes.vectorLayouts().filter( function pos( L ) {
	return L.stride > 0;
} );

var INV_CASES = [
	{ 'side': 'left', 'trans': 'conjugate-transpose', 'qdim': 33, 'k': 20, 'nb': 8, 'other': 11, 'seed': 0xF00D },
	{ 'side': 'right', 'trans': 'no-transpose', 'qdim': 33, 'k': 20, 'nb': 8, 'other': 11, 'seed': 0xBEEF }
];

test( 'zgemqrt: bit-exact within storage-order family (col / row), blocked', function t() {
	INV_CASES.forEach( function eachCase( cfg ) {
		runInvariance( colLayouts, 'col', cfg );
		runInvariance( rowLayouts, 'row', cfg );
	} );
} );

function runInvariance( variants, fam, cfg ) {
	var side = cfg.side;
	var QN = cfg.qdim;
	var K = cfg.k;
	var nb = cfg.nb;
	var other = cfg.other;
	var trans = cfg.trans;
	var M = ( side === 'left' ) ? QN : other;
	var N = ( side === 'left' ) ? other : QN;
	var SEED = cfg.seed;
	checked( 'zgemqrt', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			// Factor A/T within the SAME family so V,T are bit-identical across
			// variants (zgeqrt is bit-exact within a storage-order family); only C
			// addressing changes across variants (still same family).
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, QN, K );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
			var Tr = allocT( nb, K, variants[ ( i + 1 ) % variants.length ] );
			var Wq = schemes.realizeVector( sc, poison( nb * K ), WORK_LAYOUTS[ i % WORK_LAYOUTS.length ] );
			zgeqrt( QN, K, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wq.data, Wq.args[ 0 ], Wq.args[ 1 ] );

			var crng = new RNG( SEED ^ 0x55 );
			var C0 = logical.general( sc, crng, M, N );
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, variants[ ( i + 2 ) % variants.length ] );
			var ldwork = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
			var Wr = schemes.realizeVector( sc, poison( ldwork * nb ), WORK_LAYOUTS[ ( i + 1 ) % WORK_LAYOUTS.length ] );

			zgemqrt( side, trans, M, N, K, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );

			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}, { 'label': 'zgemqrt layout invariance ' + fam + '-major side=' + side + ' trans=' + trans + ' (QN=' + QN + ' K=' + K + ' nb=' + nb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. zgemqrt needs WORK >= ldwork*nb, where
// ldwork = max(1,N) (side='left') or max(1,M) (side='right'). Derive the wrapper's
// advertised minimum from its own throw boundary, run at exactly that length with
// a POISONED WORK on a multi-block case, and require finite output AND a correct
// product against the explicit Q.
test( 'zgemqrt: advertised WORK minimum suffices (Step 4c)', function t() {
	[
		{ 'side': 'left', 'qdim': 40, 'k': 20, 'nb': 8, 'other': 12, 'trans': 'conjugate-transpose' },
		{ 'side': 'right', 'qdim': 40, 'k': 16, 'nb': 8, 'other': 22, 'trans': 'no-transpose' }
	].forEach( function eachCase( cfg ) {
		var side = cfg.side;
		var QN = cfg.qdim;
		var K = cfg.k;
		var nb = cfg.nb;
		var other = cfg.other;
		var trans = cfg.trans;
		var M = ( side === 'left' ) ? QN : other;
		var N = ( side === 'left' ) ? other : QN;
		var SEED = 0xC0DE + ( QN * 7 ) + K;
		var label = 'zgemqrt WORK-min side=' + side + ' M=' + M + ' N=' + N + ' K=' + K + ' nb=' + nb;

		function makeC() {
			return logical.general( sc, new RNG( SEED ^ 0x99 ), M, N );
		}

		function run( len ) {
			var f = factorizeTight();
			var C0 = makeC();
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			var Wr = poisonedWork( sc, len );
			zgemqrt( side, trans, M, N, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, M, N ) );
		}

		function factorizeTight() {
			var rng = new RNG( SEED );
			var A0 = logical.general( sc, rng, QN, K );
			var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, null );
			var Tr = allocT( nb, K, null );
			var Wq = poisonedWork( sc, nb * K );
			zgeqrt( QN, K, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wq, 1, 0 );
			return { 'Ar': Ar, 'Tr': Tr };
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// Verify correctness at exactly the advertised minimum WORK length.
		var f = factorizeTight();
		var C0 = makeC();
		var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
		var Wr = poisonedWork( sc, minLen );
		zgemqrt( side, trans, M, N, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );
		var got = readFull( Cr, M, N );
		var Q = formFullQ( f.Ar, f.Tr.read, QN, K, nb );
		var expct = refProduct( side, trans, Q, C0 );
		check.assertReconstruct( sc, got, expct, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 200 } );
	} );
} );
