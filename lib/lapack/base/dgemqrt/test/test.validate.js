/**
* Property-based validation for dgemqrt, following the /blahpack-validate process.
*
* Step 0 classification: `d` -> real scalar; general dense (schemes.dense,
* logical.general); `gemqrt` applies the compact-WY orthogonal factor Q produced
* by `dgeqrt` (COLUMN reflectors + block T) to a matrix C, overwriting C with
* `op(Q)*C` (side='left') or `C*op(Q)` (side='right'), op in {no-transpose,
* transpose}.
*
* Validation strategy (CROSS-VALIDATION against an explicitly-formed Q):
*   1. Factor a random L-by-K matrix (L >= K) with dgeqrt to populate the
*      reflector columns V (unit-lower trapezoid of the factored array) and the
*      separate nb-by-K block-T array.
*   2. Form the FULL square L-by-L orthogonal Q by applying Q = H_1 H_2 ... H_B
*      (H_b = I - V_b T_b V_bᵀ) to the L-by-L identity, using the SAME template
*      helpers (blocks/readV/applyQ) validated in dgeqrt's test.
*   3. For each (side, trans): drive dgemqrt on a fresh C and compare (backward
*      error) against the explicit matrix product op(Q)*C or C*op(Q).
*      - side='left' : Q is L-by-L, C is L-by-Ncols, reflectors length L = M.
*      - side='right': Q is L-by-L, C is Mrows-by-L, reflectors length L = N.
*   4. Layout-invariance (L3): bit-exact WITHIN a storage-order family (col/row)
*      of V/T/C across offset/lead-pad/stride-sign; cross-order correctness is
*      certified by the property in step 3 (dgeqrt + dlarfb legitimately reorder
*      arithmetic across the col<->row flip).
*   4c. WORK conformance: probe the wrapper's advertised WORK minimum with a
*      POISONED buffer and require finite + correct output at exactly that length.
*/

import test from 'node:test';

import { RNG, scalar as S, logical, schemes, ref, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgeqrt from './../../dgeqrt/lib/ndarray.js';
import dgemqrt from './../lib/ndarray.js';

var sc = S.real; // d-routine
var LogicalMatrix = logical.LogicalMatrix;
var TIGHT_VEC = { 'stride': 1, 'lead': 0, 'tail': 0 };
var ALL_LAYOUTS = schemes.dense.layouts();

var SIDES = [ 'left', 'right' ];
var TRANS = [ 'no-transpose', 'transpose' ];

// (L,K) sweep with L >= K (dgeqrt requires M >= N; here we factor an L-by-K
// matrix): squares and rectangles straddling common block thresholds.
var PAIRS = [ [ 1, 1 ], [ 2, 2 ], [ 3, 2 ], [ 4, 4 ], [ 5, 3 ], [ 8, 3 ], [ 8, 5 ], [ 16, 5 ], [ 17, 8 ] ];

// Free (other-than-L) dimension of C: number of columns (side='left') or rows
// (side='right').
var FREE = [ 1, 4 ];


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

// V (L x K): unit-lower-trapezoidal Householder columns from the factored A.
function readV( Ard, L, K ) {
	var V = new LogicalMatrix( sc, L, K );
	var i;
	var j;
	for ( j = 0; j < K; j++ ) {
		for ( i = 0; i < L; i++ ) {
			V.set( i, j, ( i < j ) ? sc.zero : ( i === j ? sc.one : Ard.read( i, j ) ) );
		}
	}
	return V;
}

// X := Q * X in place, Q = H_1 H_2 ... H_B, H_b = I - V_b T_b V_bᴴ. `Tread(i,j)`
// reads physical T; block b uses V columns g0..g0+ib-1 and T(0:ib, g0:g0+ib)
// (upper triangular). Apply blocks last-to-first so H_B is innermost.
function applyQ( X, V, Tread, K, nb ) {
	var L = X.rows;
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
				for ( r = g0; r < L; r++ ) {
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
			for ( r = g0; r < L; r++ ) {
				s = X.get( r, c );
				for ( a = 0; a < ib; a++ ) {
					s = sc.sub( s, sc.mul( V.get( r, g0 + a ), TW[ a ] ) );
				}
				X.set( r, c, s );
			}
		}
	}
}

// Full square Q (L x L) = Q applied to the L-by-L identity.
function fullQ( Ard, Tread, L, K, nb ) {
	var Q = new LogicalMatrix( sc, L, L );
	var V = readV( Ard, L, K );
	var i;
	var j;
	for ( j = 0; j < L; j++ ) {
		for ( i = 0; i < L; i++ ) {
			Q.set( i, j, ( i === j ) ? sc.one : sc.zero );
		}
	}
	applyQ( Q, V, Tread, K, nb );
	return Q;
}

// Read a factored/applied dense (rows x cols) into a LogicalMatrix.
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

// Factor a random L-by-K matrix with dgeqrt; return { Ar, Tr } (realize objects,
// Ar carries V + R, Tr carries block T). Uses `layout` for both A and T.
function factorize( L, K, nb, seed, layout ) {
	var rng = new RNG( seed );
	var A0 = logical.general( sc, rng, L, K );
	var Ar = schemes.dense.realize( sc, A0, { 'part': 'full' }, layout );
	var Tr = allocT( nb, K, layout );
	var Wr = schemes.realizeVector( sc, poison( nb * K ), TIGHT_VEC );
	dgeqrt( L, K, nb, Ar.data, Ar.args[ 0 ], Ar.args[ 1 ], Ar.args[ 2 ], Tr.data, Tr.args[ 0 ], Tr.args[ 1 ], Tr.args[ 2 ], Wr.data, Wr.args[ 0 ], Wr.args[ 1 ] );
	return { 'Ar': Ar, 'Tr': Tr };
}

// Expected op(Q)*C (side='left') or C*op(Q) (side='right').
function expected( side, trans, Q, C0 ) {
	var op = ( trans === 'transpose' ) ? 't' : 'n';
	if ( side === 'left' ) {
		return ref.matmul( sc, Q, C0, { 'transa': op } );
	}
	return ref.matmul( sc, C0, Q, { 'transb': op } );
}

// nb sweep for a given K: {1, 2, ~K/2, K}.
function nbsFor( K ) {
	var set = {};
	[ 1, 2, Math.max( 1, Math.floor( K / 2 ) ), K ].forEach( function add( nb ) {
		if ( nb >= 1 && nb <= K ) {
			set[ nb ] = true;
		}
	} );
	return Object.keys( set ).map( Number );
}


// Steps 2/3/5: cross-validate dgemqrt against an explicitly-formed Q across the
// (L,K) sweep, nb sweep, every (side, trans), free-dimension sizes, and every
// dense storage layout. WORK is sized to the advertised minimum and POISONED, so
// any over-read surfaces as a NaN in the applied output (assertFinite).
test( 'dgemqrt: op(Q)*C / C*op(Q) matches explicit product ((L,K) x nb x side x trans x free x layouts)', function t() {
	var counter = 0;
	PAIRS.forEach( function eachPair( pr ) {
		var L = pr[ 0 ];
		var K = pr[ 1 ];
		nbsFor( K ).forEach( function eachNb( nb ) {
			ALL_LAYOUTS.forEach( function eachLayout( layout, li ) {
				var f = factorize( L, K, nb, 0x2000 + ( L * 1000 ) + ( K * 10 ) + nb, layout );
				var Q = fullQ( f.Ar, f.Tr.read, L, K, nb );
				SIDES.forEach( function eachSide( side ) {
					TRANS.forEach( function eachTrans( trans ) {
						FREE.forEach( function eachFree( fr ) {
							var rows = ( side === 'left' ) ? L : fr;
							var cols = ( side === 'left' ) ? fr : L;
							var rngC = new RNG( 0x9000 + ( counter++ ) );
							var C0 = logical.general( sc, rngC, rows, cols );
							var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, layout );

							// Advertised minimum WORK: ldwork * nb, ldwork = max(1,N) (left) or max(1,M) (right).
							var ldwork = ( side === 'left' ) ? Math.max( 1, cols ) : Math.max( 1, rows );
							var Wr = poisonedWork( sc, ldwork * nb );

							dgemqrt( side, trans, rows, cols, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );

							var label = 'dgemqrt L=' + L + ' K=' + K + ' nb=' + nb + ' side=' + side + ' trans=' + trans + ' free=' + fr + ' layout=' + li;
							var got = readFull( Cr, rows, cols );
							var exp = expected( side, trans, Q, C0 );
							checked( 'dgemqrt', 'apply-Q', function run() {
								check.assertReconstruct( sc, got, exp, { 'label': label, 'factor': 100 } );
							} );
						} );
					} );
				} );
			} );
		} );
	} );
} );


// Step 4: layout-invariance fuzz. dgemqrt -> dlarfb (dgemm/dtrmm) whose optimized
// kernels pick their summation form from operand strides, so the col<->row flip
// legitimately reorders the arithmetic (~1 ULP) while the property above proves
// each flipped result is still correct. Assert BIT-EXACTNESS only WITHIN a
// storage-order family (col vs row); this still fuzzes offset, leading-dim
// padding, and stride sign. V/T and C layouts are fuzzed together; WORK stays a
// tight positive-stride poisoned buffer.
var colLayouts = ALL_LAYOUTS.filter( function isCol( L ) {
	return L.order !== 'row';
} );
var rowLayouts = ALL_LAYOUTS.filter( function isRow( L ) {
	return L.order === 'row';
} );

test( 'dgemqrt: bit-exact within storage-order family (col / row)', function t() {
	SIDES.forEach( function eachSide( side ) {
		TRANS.forEach( function eachTrans( trans ) {
			runInvariance( colLayouts, 'col', side, trans );
			runInvariance( rowLayouts, 'row', side, trans );
		} );
	} );
} );

function runInvariance( variants, fam, side, trans ) {
	var L = 17;
	var K = 8;
	var nb = 3; // multiple blocks: ceil(8/3) = 3
	var fr = 5;
	var rows = ( side === 'left' ) ? L : fr;
	var cols = ( side === 'left' ) ? fr : L;
	var ldwork = ( side === 'left' ) ? Math.max( 1, cols ) : Math.max( 1, rows );
	var SEED = 0xF00D;
	checked( 'dgemqrt', 'layout-invariance', function run() {
		layoutInvariant( variants, function build( layout, i ) {
			// V/T from dgeqrt on this variant; C on a DIFFERENT (same-family) variant.
			var f = factorize( L, K, nb, SEED, layout );
			var cLayout = variants[ ( i + 1 ) % variants.length ];
			var rngC = new RNG( SEED ^ 0x555 );
			var C0 = logical.general( sc, rngC, rows, cols );
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, cLayout );
			var Wr = poisonedWork( sc, ldwork * nb );

			dgemqrt( side, trans, rows, cols, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );

			return check.flattenLogical( sc, readFull( Cr, rows, cols ) );
		}, { 'label': 'dgemqrt layout invariance ' + fam + '-major side=' + side + ' trans=' + trans + ' (L=' + L + ' K=' + K + ' nb=' + nb + ')' } );
	} );
}


// Step 4c: WORKSPACE CONFORMANCE. dgemqrt needs WORK >= max(1,N)*nb (left) or
// max(1,M)*nb (right). Derive the wrapper's advertised minimum from its own throw
// boundary, run at exactly that length with a POISONED WORK on a multi-block
// case, and require finite output AND a correct applied product.
test( 'dgemqrt: advertised WORK minimum suffices (Step 4c)', function t() {
	var CASES = [
		[ 'left', 'no-transpose', 20, 12, 5, 7 ],
		[ 'left', 'transpose', 20, 12, 5, 7 ],
		[ 'right', 'no-transpose', 20, 12, 5, 7 ],
		[ 'right', 'transpose', 20, 12, 5, 7 ]
	];
	CASES.forEach( function eachCase( c ) {
		var side = c[ 0 ];
		var trans = c[ 1 ];
		var L = c[ 2 ];
		var K = c[ 3 ];
		var nb = c[ 4 ];
		var fr = c[ 5 ];
		var rows = ( side === 'left' ) ? L : fr;
		var cols = ( side === 'left' ) ? fr : L;
		var SEED = 0xB10C + ( L * 7 ) + K;
		var label = 'dgemqrt WORK-min side=' + side + ' trans=' + trans + ' L=' + L + ' K=' + K + ' nb=' + nb + ' free=' + fr;

		function run( len ) {
			var f = factorize( L, K, nb, SEED, null );
			var rngC = new RNG( SEED ^ 0x555 );
			var C0 = logical.general( sc, rngC, rows, cols );
			var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
			var Wr = poisonedWork( sc, len );
			dgemqrt( side, trans, rows, cols, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );
			return check.flattenLogical( sc, readFull( Cr, rows, cols ) );
		}

		var minLen = assertWorkspaceSufficient( run, {}, label );

		// Confirm the output at exactly the advertised minimum is not just finite
		// but CORRECT against the explicit product.
		var f = factorize( L, K, nb, SEED, null );
		var Q = fullQ( f.Ar, f.Tr.read, L, K, nb );
		var rngC = new RNG( SEED ^ 0x555 );
		var C0 = logical.general( sc, rngC, rows, cols );
		var Cr = schemes.dense.realize( sc, C0, { 'part': 'full' }, null );
		var Wr = poisonedWork( sc, minLen );
		dgemqrt( side, trans, rows, cols, K, nb, f.Ar.data, f.Ar.args[ 0 ], f.Ar.args[ 1 ], f.Ar.args[ 2 ], f.Tr.data, f.Tr.args[ 0 ], f.Tr.args[ 1 ], f.Tr.args[ 2 ], Cr.data, Cr.args[ 0 ], Cr.args[ 1 ], Cr.args[ 2 ], Wr, 1, 0 );
		var exp = expected( side, trans, Q, C0 );
		check.assertReconstruct( sc, readFull( Cr, rows, cols ), exp, { 'label': label + ' (WORK=' + minLen + ')', 'factor': 100 } );
	} );
} );
