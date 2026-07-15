/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth */

/**
* Property-based validation for dgels (real least-squares / minimum-norm driver).
*
* dgels solves four problems selected by (trans, shape of the effective operator
* C), where C = A for trans='no-transpose' and C = Aᵀ for trans='transpose':
*
*   - C tall  (rows(C) >= cols(C)): least squares  min ‖C x - b‖.
*       Defining property: the residual is orthogonal to range(C), i.e. the
*       normal-equation gradient  Cᵀ(C x - b) = 0.  (independent oracle: ref)
*   - C wide  (rows(C) <  cols(C)): minimum-norm solution of  C x = b.
*       Properties: feasibility  C x = b  AND  x is the minimum-norm solution.
*       Both are certified by the cross-validation against the closed-form
*       min-norm oracle  x = Cᵀ (C Cᵀ)⁻¹ b.
*
* Validation layers (recorded honestly via the ledger):
*   - residual          (L2): optimality / feasibility property vs `ref`.
*   - cross-validation  (L4): match an INDEPENDENT normal-equations solver
*                             (Gaussian elimination written here, never the lib).
*   - layout-invariance (L3): bit-exact output across storage layouts of A and B,
*                             including the blocked path (min(M,N) > NB).
*/

// MODULES //

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, ref, norms, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { realizeLD, requiredLD, assertLeadingDimGuard } from '../../../../../test/harness/leadingdim.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import dgels from './../lib/ndarray.js';
import dgelsWrap from './../lib/dgels.js';

var NB = 32;
var norm2 = norms.norm2;
var frob = norms.frobenius;


// HELPERS //

/**
* WORK length matching dgels' contract (blocked path needs the extra (NB+1)*NB).
*/
function workLen( M, N, nrhs ) {
	var MN = Math.min( M, N );
	return Math.max( 1, MN + ( Math.max( MN, nrhs ) * NB ) + ( ( MN > NB ) ? ( ( NB + 1 ) * NB ) : 0 ) );
}

/**
* Effective-operator descriptor for a (trans, M, N) triple. `cApply`/`ctApply`
* are the ref.matvec trans codes that apply C and Cᵀ through the stored A.
*/
function opDesc( trans, M, N ) {
	var no = ( trans === 'no-transpose' );
	return {
		'cApply': no ? 'n' : 't',      // C x
		'ctApply': no ? 't' : 'n',     // Cᵀ y
		'p': no ? M : N,               // rows(C) = length(b)
		'q': no ? N : M,               // cols(C) = length(x)
		'tall': ( no ? M : N ) >= ( no ? N : M )
	};
}

/**
* Independent dense solver (Gaussian elimination, partial pivoting). `Amat` is an
* n-by-n LogicalMatrix; `bvec` an array of length n. Returns array length n. Never
* calls the routine under test.
*/
function solveDense( Amat, bvec ) {
	var n = Amat.rows;
	var a = [];
	var tmp;
	var piv;
	var f;
	var s;
	var i;
	var j;
	var k;
	for ( i = 0; i < n; i++ ) {
		a.push( [] );
		for ( j = 0; j < n; j++ ) {
			a[ i ].push( Amat.get( i, j ) );
		}
		a[ i ].push( bvec[ i ] );
	}
	for ( k = 0; k < n; k++ ) {
		piv = k;
		for ( i = k + 1; i < n; i++ ) {
			if ( Math.abs( a[ i ][ k ] ) > Math.abs( a[ piv ][ k ] ) ) {
				piv = i;
			}
		}
		tmp = a[ k ];
		a[ k ] = a[ piv ];
		a[ piv ] = tmp;
		for ( i = k + 1; i < n; i++ ) {
			f = a[ i ][ k ] / a[ k ][ k ];
			for ( j = k; j <= n; j++ ) {
				a[ i ][ j ] -= f * a[ k ][ j ];
			}
		}
	}
	var x = new Array( n ).fill( 0.0 );
	for ( i = n - 1; i >= 0; i-- ) {
		s = a[ i ][ n ];
		for ( j = i + 1; j < n; j++ ) {
			s -= a[ i ][ j ] * x[ j ];
		}
		x[ i ] = s / a[ i ][ i ];
	}
	return x;
}

/**
* Independent least-squares / minimum-norm oracle for the effective problem, per
* RHS column `b`. Tall: solve (CᵀC) x = Cᵀ b. Wide: x = Cᵀ z with (C Cᵀ) z = b.
* Uses only `ref` + the independent dense solver above.
*/
function oracleSolve( sc, A, b, d ) {
	var e;
	var i;
	var j;
	var s;
	var k;
	var cols;
	if ( d.tall ) {
		// Build C's columns via ref, form CᵀC (q-by-q), solve (CᵀC) x = Cᵀ b:
		cols = [];
		for ( j = 0; j < d.q; j++ ) {
			e = new Array( d.q ).fill( 0.0 );
			e[ j ] = 1.0;
			cols.push( ref.matvec( sc, A, e, { 'trans': d.cApply } ) ); // C e_j
		}
		var CtC = new logical.LogicalMatrix( sc, d.q, d.q );
		for ( i = 0; i < d.q; i++ ) {
			for ( j = 0; j < d.q; j++ ) {
				s = 0.0;
				for ( k = 0; k < cols[ i ].length; k++ ) {
					s += cols[ i ][ k ] * cols[ j ][ k ];
				}
				CtC.set( i, j, s );
			}
		}
		return solveDense( CtC, ref.matvec( sc, A, b, { 'trans': d.ctApply } ) );
	}
	// Wide: form C Cᵀ (p-by-p) from rows of C (= Cᵀ e_i), solve, then x = Cᵀ z:
	var rows = [];
	for ( i = 0; i < d.p; i++ ) {
		e = new Array( d.p ).fill( 0.0 );
		e[ i ] = 1.0;
		rows.push( ref.matvec( sc, A, e, { 'trans': d.ctApply } ) ); // Cᵀ e_i
	}
	var CCt = new logical.LogicalMatrix( sc, d.p, d.p );
	for ( i = 0; i < d.p; i++ ) {
		for ( j = 0; j < d.p; j++ ) {
			s = 0.0;
			for ( k = 0; k < rows[ i ].length; k++ ) {
				s += rows[ i ][ k ] * rows[ j ][ k ];
			}
			CCt.set( i, j, s );
		}
	}
	var z = solveDense( CCt, b );
	return ref.matvec( sc, A, z, { 'trans': d.ctApply } );
}

/**
* Build a logical RHS matrix B (ldb-by-nrhs): random in the referenced top `p`
* rows, zero below (those rows are workspace the routine overwrites).
*/
function makeB( sc, rng, ldb, p, nrhs ) {
	var B = new logical.LogicalMatrix( sc, ldb, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < ldb; i++ ) {
			B.set( i, j, ( i < p ) ? sc.random( rng ) : 0.0 );
		}
	}
	return B;
}


// TESTS //

var TRANS = [ 'no-transpose', 'transpose' ];

// (M,N) pairs spanning square/tall/wide and unblocked/blocked (NB=32) paths:
var PAIRS = [ [ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 5, 3 ], [ 3, 5 ], [ 8, 5 ], [ 16, 7 ], [ 7, 16 ], [ 17, 17 ], [ 32, 32 ], [ 33, 20 ], [ 20, 33 ], [ 40, 33 ], [ 33, 40 ], [ 64, 33 ], [ 33, 64 ], [ 64, 64 ], [ 65, 40 ] ];
var NRHS = [ 1, 3 ];

test( 'dgels: least-squares optimality / min-norm feasibility (property vs independent oracle)', function t() {
	var sc = S.real;

	// Cover both a column-major (index 0) and a ROW-major (index 2) layout: this
	// verifies correctness under row-major addressing on the blocked path, where
	// bit-exactness is not attainable (optimized dgemm reorders) but the LS/min-
	// norm property must still hold. See test.validate LEARNINGS entry.
	var lays = [ schemes.dense.layouts()[ 0 ], schemes.dense.layouts()[ 2 ] ];
	var ti;
	var pi;
	var ri;
	var li;
	for ( li = 0; li < lays.length; li++ ) {
		for ( ti = 0; ti < TRANS.length; ti++ ) {
			for ( pi = 0; pi < PAIRS.length; pi++ ) {
				for ( ri = 0; ri < NRHS.length; ri++ ) {
					runProperty( sc, TRANS[ ti ], PAIRS[ pi ][ 0 ], PAIRS[ pi ][ 1 ], NRHS[ ri ], lays[ li ] );
				}
			}
		}
	}
});

function runProperty( sc, trans, M, N, nrhs, lay ) {
	var d = opDesc( trans, M, N );
	var ldb = Math.max( M, N );
	var rng = new RNG( 0x5000 + ( M * 131 ) + ( N * 7 ) + ( ( trans === 'transpose' ) ? 3 : 0 ) + nrhs );
	var A = logical.general( sc, rng, M, N );
	var B = makeB( sc, rng, ldb, d.p, nrhs );
	var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, lay );
	var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, lay );
	var work = new Float64Array( workLen( M, N, nrhs ) );
	var info = dgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], work, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'dgels reported rank deficiency (info=' + info + ') for random full-rank input: ' + trans + ' ' + M + 'x' + N );
	}
	var c;
	var i;
	for ( c = 0; c < nrhs; c++ ) {
		var x = [];
		for ( i = 0; i < d.q; i++ ) {
			x.push( RB.read( i, c ) );
		}
		var b = [];
		for ( i = 0; i < d.p; i++ ) {
			b.push( B.get( i, c ) );
		}
		validateColumn( sc, A, b, x, d, trans + ' ' + M + 'x' + N + ' col' + c );
	}
}

function validateColumn( sc, A, b, x, d, label ) {
	// L2 property: tall -> Cᵀ(Cx-b)=0 optimality; wide -> feasibility Cx=b.
	checked( 'dgels', 'residual', function property() {
		var Cx = ref.matvec( sc, A, x, { 'trans': d.cApply } );
		var r = [];
		var i;
		for ( i = 0; i < Cx.length; i++ ) {
			r.push( Cx[ i ] - b[ i ] );
		}
		check.assertFinite( sc, r, label + ' residual' );
		var nA = frob( sc, A );
		if ( d.tall ) {
			var g = ref.matvec( sc, A, r, { 'trans': d.ctApply } );
			check.assertFinite( sc, g, label + ' gradient' );
			check.assertScaled( norm2( sc, g ), nA * ( ( nA * norm2( sc, x ) ) + norm2( sc, b ) ), check.tol( Math.max( A.rows, A.cols ), 100 ), label + ' LS optimality' );
		} else {
			check.assertScaled( norm2( sc, r ), ( nA * norm2( sc, x ) ) + norm2( sc, b ), check.tol( Math.max( A.rows, A.cols ), 100 ), label + ' feasibility' );
		}
	}, { 'trans': d.tall ? 'tall/LS' : 'wide/min-norm' } );

	// L4 cross-validation: match the independent oracle (certifies min-norm too).
	checked( 'dgels', 'cross-validation', function xval() {
		var xo = oracleSolve( sc, A, b, d );
		var diff = [];
		var i;
		for ( i = 0; i < x.length; i++ ) {
			diff.push( x[ i ] - xo[ i ] );
		}
		check.assertFinite( sc, diff, label + ' oracle diff' );
		check.assertScaled( norm2( sc, diff ), norm2( sc, xo ), 1e-7, label + ' vs normal-equations oracle' );
	} );
}

// Layout invariance (L3): identical values, re-run under storage layouts of A and
// B, assert bit-exact output — WITHIN a single storage-order family. Fuzzing
// offset, leading-dim padding, and stride SIGN (all present in each family)
// leaves the arithmetic order intact, so a correct routine reproduces its output
// bit-for-bit and any addressing bug shows up. A col<->row storage-order FLIP,
// by contrast, legitimately reorders the optimized inner dgemv/dger/dgemm (~1e-16
// rounding, not a defect), so cross-order agreement is verified by the property
// sweep (correctness), not by bit-equality. See the dgels LEARNINGS entry.
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'dgels: layout invariance (bit-exact within storage-order family; unblocked + blocked)', function t() {
	var sc = S.real;
	var sizes = [ [ 5, 3 ], [ 3, 5 ], [ 4, 4 ], [ 8, 5 ], [ 5, 8 ], [ 40, 33 ], [ 33, 40 ], [ 64, 64 ] ];
	var ti;
	var si;
	for ( ti = 0; ti < TRANS.length; ti++ ) {
		for ( si = 0; si < sizes.length; si++ ) {
			runInvariance( sc, TRANS[ ti ], sizes[ si ][ 0 ], sizes[ si ][ 1 ], 2, colLayouts, 'col' );
			runInvariance( sc, TRANS[ ti ], sizes[ si ][ 0 ], sizes[ si ][ 1 ], 2, rowLayouts, 'row' );
		}
	}
});

function runInvariance( sc, trans, M, N, nrhs, variants, fam ) {
	var d = opDesc( trans, M, N );
	var ldb = Math.max( M, N );
	var seed = 0x6000 + ( M * 17 ) + N;
	checked( 'dgels', 'layout-invariance', function fuzz() {
		layoutInvariant( variants, function run( layout, idx ) {
			var rng = new RNG( seed ); // identical values every variant
			var A = logical.general( sc, rng, M, N );
			var B = makeB( sc, rng, ldb, d.p, nrhs );
			var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
			var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, variants[ ( idx + 2 ) % variants.length ] );
			var work = new Float64Array( workLen( M, N, nrhs ) );
			dgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], work, 1, 0 );
			var out = new logical.LogicalMatrix( sc, ldb, nrhs );
			var i;
			var j;
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < ldb; i++ ) {
					out.set( i, j, RB.read( i, j ) );
				}
			}
			return check.flattenLogical( sc, out );
		}, { 'label': 'dgels layout invariance ' + fam + '-major ' + trans + ' ' + M + 'x' + N } );
	} );
}


// LEADING-DIMENSION CONFORMANCE (drives the LDA/LDB wrapper, not ndarray) //

// The property/layout layers above drive ndarray.js with correctly-sized buffers,
// so they never exercise the `order`+LDA+LDB validation in dgels.js, nor the
// output-growth case (M<N: B expands from M input rows to N output rows in place).
// A wrong LDB constraint there is a silent out-of-bounds write. These tests take
// the required leading dimension from the MATH — B's output-inclusive shape is
// max(M,N) x nrhs, A's is M x N — and assert the wrapper enforces exactly that.

var ORDERS = [ 'column-major', 'row-major' ];
var LDPAIRS = [ [ 3, 5 ], [ 5, 3 ], [ 4, 4 ], [ 2, 6 ], [ 7, 2 ] ]; // include M<N (output grows)

function dVal( tag ) {
	return function val( i, j ) {
		return Math.sin( ( ( i + 1 ) * 2.3 ) + ( ( j + 1 ) * 0.7 ) + tag );
	};
}

test( 'dgels: leading-dimension wrapper enforces LDB >= output shape (drives dgels.js)', function t() {
	var oi;
	var pi;
	var ti;
	for ( oi = 0; oi < ORDERS.length; oi++ ) {
		for ( pi = 0; pi < LDPAIRS.length; pi++ ) {
			for ( ti = 0; ti < TRANS.length; ti++ ) {
				runLDGuard( ORDERS[ oi ], TRANS[ ti ], LDPAIRS[ pi ][ 0 ], LDPAIRS[ pi ][ 1 ], 2 );
			}
		}
	}
});

function runLDGuard( order, trans, M, N, nrhs ) {
	var p = ( trans === 'no-transpose' ) ? M : N; // referenced input rows of B
	var bRows = Math.max( M, N );                  // B's full (output) row extent
	var ldaReq = requiredLD( order, M, N );
	var ldbReq = requiredLD( order, bRows, nrhs );
	var lbl = order + ' ' + trans + ' ' + M + 'x' + N;

	// LDB guard: vary LDB, keep LDA valid. Catches under-constrained (accepts
	// LDB < max(M,N) col-major -> OOB) AND over-constrained (rejects LDB == nrhs
	// row-major) validation.
	assertLeadingDimGuard( function callLDB( ldb ) {
		var A = realizeLD( order, M, N, M, N, ldaReq, dVal( 0.0 ) );
		var B = realizeLD( order, p, nrhs, bRows, nrhs, ldb, dVal( 9.0 ) );
		dgelsWrap( order, trans, M, N, nrhs, A.data, ldaReq, B.data, ldb, null, 1 );
	}, ldbReq, 'dgels LDB guard ' + lbl );

	// LDA guard: vary LDA, keep LDB valid.
	assertLeadingDimGuard( function callLDA( lda ) {
		var A = realizeLD( order, M, N, M, N, lda, dVal( 0.0 ) );
		var B = realizeLD( order, p, nrhs, bRows, nrhs, ldbReq, dVal( 9.0 ) );
		dgelsWrap( order, trans, M, N, nrhs, A.data, lda, B.data, ldbReq, null, 1 );
	}, ldaReq, 'dgels LDA guard ' + lbl );
}

// Correctness THROUGH the wrapper at the minimal valid LDB, for the output-growth
// path (M<N, column-major): the full N-row solution must be finite and correct in
// a buffer sized to exactly max(M,N) rows. Reads the full output via the LD read.
test( 'dgels: wrapper correctness at minimal LDB on the output-growth path (M<N)', function t() {
	var sc = S.real;
	var pairs = [ [ 3, 5 ], [ 2, 6 ], [ 5, 8 ] ];
	var pi;
	for ( pi = 0; pi < pairs.length; pi++ ) {
		runWrapperMinLDB( sc, pairs[ pi ][ 0 ], pairs[ pi ][ 1 ], 2 );
	}
});

function runWrapperMinLDB( sc, M, N, nrhs ) {
	var order = 'column-major';
	var trans = 'no-transpose';
	var bRows = Math.max( M, N ); // = N here
	var ldbReq = requiredLD( order, bRows, nrhs );
	var ldaReq = requiredLD( order, M, N );
	var av = dVal( 1.5 );
	var bv = dVal( 4.2 );
	var A = realizeLD( order, M, N, M, N, ldaReq, av );
	var B = realizeLD( order, M, nrhs, bRows, nrhs, ldbReq, bv );

	// logical A and input b for the independent oracle/property:
	var Alog = new logical.LogicalMatrix( sc, M, N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			Alog.set( i, j, av( i, j ) );
		}
	}
	var info = dgelsWrap( order, trans, M, N, nrhs, A.data, ldaReq, B.data, ldbReq, null, 1 );
	if ( info !== 0 ) {
		throw new Error( 'dgels wrapper info=' + info + ' for full-rank ' + M + 'x' + N );
	}
	for ( j = 0; j < nrhs; j++ ) {
		var x = [];
		for ( i = 0; i < N; i++ ) {
			x.push( B.read( i, j ) ); // full N-row solution; OOB reads => undefined
		}
		var b = [];
		for ( i = 0; i < M; i++ ) {
			b.push( bv( i, j ) );
		}
		// min-norm underdetermined: feasibility A x = b, verified independently.
		checked( 'dgels', 'residual', function feasible() {
			check.assertFinite( sc, x, 'wrapper minLDB solution' ); // undefined tail => caught
			var nA = frob( sc, Alog );
			check.assertResidual( sc, Alog, x, b, { 'trans': 'n', 'label': 'wrapper minLDB A x = b ' + M + 'x' + N, 'factor': 100 } );
			return nA;
		} );
	}
}


// WORKSPACE CONFORMANCE (the WORK buffer we size ourselves must actually suffice) //

// The property/layout layers over-size WORK, so they never test the contract the
// wrapper advertises: whatever minimum WORK length it accepts must SUFFICE on the
// BLOCKED path (min(M,N) > NB). The reference negotiates LWORK at runtime and
// shrinks NB to fit; our JS hardcodes NB and stores the T factor separately, so a
// copied reference LWORK formula under-counts and the routine reads past its own
// buffer -> NaN. This probes the advertised minimum from the wrapper's own throw
// boundary (no formula duplicated) and asserts finite output at exactly that size.

function dgelsWorkRun( sc, trans, M, N, nrhs, seed ) {
	return function run( workLen ) {
		var rng = new RNG( seed );
		var d = opDesc( trans, M, N );
		var ldb = Math.max( M, N );
		var A = logical.general( sc, rng, M, N );
		var B = makeB( sc, rng, ldb, d.p, nrhs );
		var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		var work = poisonedWork( workLen ); // NaN-filled: over-read OR read-before-write => NaN
		dgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], work, 1, 0 );
		var out = [];
		var i;
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < ldb; i++ ) {
				out.push( RB.read( i, j ) );
			}
		}
		return out;
	};
}

test( 'dgels: advertised WORK minimum suffices on the blocked path (min(M,N) > NB)', function t() {
	var sc = S.real;
	// Blocked QR (M>=N) and LQ (M<N) paths; nrhs=1 and a large nrhs to stress the
	// dormqr/dormlq application-workspace branch separately from factorization.
	var cases = [
		[ 'no-transpose', 40, 33, 1 ], [ 'no-transpose', 40, 33, 64 ],
		[ 'transpose', 40, 33, 1 ], [ 'transpose', 40, 33, 64 ],
		[ 'no-transpose', 33, 40, 1 ], [ 'no-transpose', 33, 40, 64 ],
		[ 'transpose', 33, 40, 1 ], [ 'transpose', 33, 40, 64 ],
		[ 'no-transpose', 64, 64, 3 ], [ 'transpose', 64, 64, 3 ]
	];
	var k;
	for ( k = 0; k < cases.length; k++ ) {
		var c = cases[ k ];
		var lbl = 'dgels WORK sufficiency ' + c[ 0 ] + ' ' + c[ 1 ] + 'x' + c[ 2 ] + ' nrhs=' + c[ 3 ];
		assertWorkspaceSufficient( dgelsWorkRun( sc, c[ 0 ], c[ 1 ], c[ 2 ], c[ 3 ], 0x7000 + k ), {}, lbl );
	}
});
