/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgels (complex least-squares / minimum-norm driver).
*
* Mirrors the dgels validation, generic over the complex scalar trait. The
* effective operator is C = A (trans='no-transpose') or C = Aᴴ (trans=
* 'conjugate-transpose'):
*   - C tall  : least squares  min ‖Cx-b‖ ; property Cᴴ(Cx-b)=0 (residual ⟂ range C).
*   - C wide  : minimum-norm solution of Cx=b ; feasibility Cx=b AND min-norm, both
*               certified by the independent normal-equations oracle.
*
* Layers: residual (L2), cross-validation (L4), layout-invariance (L3), plus the
* leading-dimension (LDB) and workspace conformance guards (plain assertions).
*/

// MODULES //

import test from 'node:test';
import { RNG, scalar as S, logical, schemes, ref, norms, check, layoutInvariant } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { realizeLD, requiredLD, assertLeadingDimGuard } from '../../../../../test/harness/leadingdim.js';
import { assertWorkspaceSufficient, poisonedWork } from '../../../../../test/harness/workspace.js';
import zgels from './../lib/ndarray.js';
import zgelsWrap from './../lib/zgels.js';

var NB = 32;
var norm2 = norms.norm2;
var frob = norms.frobenius;
var sc = S.complex;


// HELPERS //

function bigLwork( M, N, nrhs ) {
	var MN = Math.min( M, N );
	return Math.max( 1, MN + ( ( Math.max( MN, nrhs ) + NB + 1 ) * NB ) ) + 64;
}

function opDesc( trans, M, N ) {
	var no = ( trans === 'no-transpose' );
	return {
		'cApply': no ? 'n' : 'c',
		'ctApply': no ? 'c' : 'n',
		'p': no ? M : N,
		'q': no ? N : M,
		'tall': ( no ? M : N ) >= ( no ? N : M )
	};
}

// Scalar-generic dense solver (Gaussian elimination, partial pivoting) over the
// trait's arithmetic — never the library under test. Amat n-by-n LogicalMatrix.
function inv( b ) {
	var s = sc.abs( b );
	return sc.scale( sc.conj( b ), 1.0 / ( s * s ) );
}

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
			if ( sc.abs( a[ i ][ k ] ) > sc.abs( a[ piv ][ k ] ) ) {
				piv = i;
			}
		}
		tmp = a[ k ];
		a[ k ] = a[ piv ];
		a[ piv ] = tmp;
		for ( i = k + 1; i < n; i++ ) {
			f = sc.mul( a[ i ][ k ], inv( a[ k ][ k ] ) );
			for ( j = k; j <= n; j++ ) {
				a[ i ][ j ] = sc.sub( a[ i ][ j ], sc.mul( f, a[ k ][ j ] ) );
			}
		}
	}
	var x = new Array( n );
	for ( i = n - 1; i >= 0; i-- ) {
		s = a[ i ][ n ];
		for ( j = i + 1; j < n; j++ ) {
			s = sc.sub( s, sc.mul( a[ i ][ j ], x[ j ] ) );
		}
		x[ i ] = sc.mul( s, inv( a[ i ][ i ] ) );
	}
	return x;
}

// Independent LS / min-norm oracle: tall -> (CᴴC)x = Cᴴb ; wide -> x = Cᴴz with
// (CCᴴ)z = b. Uses only ref + the solver above.
function oracleSolve( A, b, d ) {
	var e;
	var i;
	var j;
	var k;
	var s;
	if ( d.tall ) {
		var cols = [];
		for ( j = 0; j < d.q; j++ ) {
			e = fillZeros( d.q );
			e[ j ] = sc.one;
			cols.push( ref.matvec( sc, A, e, { 'trans': d.cApply } ) );
		}
		var CtC = new logical.LogicalMatrix( sc, d.q, d.q );
		for ( i = 0; i < d.q; i++ ) {
			for ( j = 0; j < d.q; j++ ) {
				s = sc.zero;
				for ( k = 0; k < cols[ i ].length; k++ ) {
					s = sc.add( s, sc.mul( sc.conj( cols[ i ][ k ] ), cols[ j ][ k ] ) );
				}
				CtC.set( i, j, s );
			}
		}
		return solveDense( CtC, ref.matvec( sc, A, b, { 'trans': d.ctApply } ) );
	}
	var rows = [];
	for ( i = 0; i < d.p; i++ ) {
		e = fillZeros( d.p );
		e[ i ] = sc.one;
		rows.push( ref.matvec( sc, A, e, { 'trans': d.ctApply } ) );
	}
	var CCt = new logical.LogicalMatrix( sc, d.p, d.p );
	for ( i = 0; i < d.p; i++ ) {
		for ( j = 0; j < d.p; j++ ) {
			s = sc.zero;
			for ( k = 0; k < rows[ i ].length; k++ ) {
				s = sc.add( s, sc.mul( sc.conj( rows[ i ][ k ] ), rows[ j ][ k ] ) );
			}
			CCt.set( i, j, s );
		}
	}
	var z = solveDense( CCt, b );
	return ref.matvec( sc, A, z, { 'trans': d.ctApply } );
}

function fillZeros( n ) {
	var a = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		a.push( sc.zero );
	}
	return a;
}

function makeB( rng, ldb, p, nrhs ) {
	var B = new logical.LogicalMatrix( sc, ldb, nrhs );
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < ldb; i++ ) {
			B.set( i, j, ( i < p ) ? sc.random( rng ) : sc.zero );
		}
	}
	return B;
}


// TESTS //

var TRANS = [ 'no-transpose', 'conjugate-transpose' ];
var PAIRS = [ [ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 5, 3 ], [ 3, 5 ], [ 8, 5 ], [ 16, 7 ], [ 7, 16 ], [ 17, 17 ], [ 33, 20 ], [ 20, 33 ], [ 40, 33 ], [ 33, 40 ], [ 64, 64 ] ];
var NRHS = [ 1, 3 ];

test( 'zgels: LS optimality / min-norm feasibility + cross-validation (property vs independent oracle)', function t() {
	var ti;
	var pi;
	var ri;
	for ( ti = 0; ti < TRANS.length; ti++ ) {
		for ( pi = 0; pi < PAIRS.length; pi++ ) {
			for ( ri = 0; ri < NRHS.length; ri++ ) {
				runProperty( TRANS[ ti ], PAIRS[ pi ][ 0 ], PAIRS[ pi ][ 1 ], NRHS[ ri ] );
			}
		}
	}
});

function runProperty( trans, M, N, nrhs ) {
	var d = opDesc( trans, M, N );
	var ldb = Math.max( M, N );
	var rng = new RNG( 0x5000 + ( M * 131 ) + ( N * 7 ) + ( ( trans === 'no-transpose' ) ? 0 : 3 ) + nrhs );
	var A = logical.general( sc, rng, M, N );
	var B = makeB( rng, ldb, d.p, nrhs );
	var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var lwork = bigLwork( M, N, nrhs );
	var WORK = sc.alloc( lwork );
	var info = zgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], WORK, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'zgels info=' + info + ' for full-rank ' + trans + ' ' + M + 'x' + N );
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
		validateColumn( A, b, x, d, trans + ' ' + M + 'x' + N + ' col' + c );
	}
}

function validateColumn( A, b, x, d, label ) {
	checked( 'zgels', 'residual', function property() {
		var Cx = ref.matvec( sc, A, x, { 'trans': d.cApply } );
		var r = [];
		var i;
		for ( i = 0; i < Cx.length; i++ ) {
			r.push( sc.sub( Cx[ i ], b[ i ] ) );
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
	} );

	checked( 'zgels', 'cross-validation', function xval() {
		var xo = oracleSolve( A, b, d );
		var diff = [];
		var i;
		for ( i = 0; i < x.length; i++ ) {
			diff.push( sc.sub( x[ i ], xo[ i ] ) );
		}
		check.assertFinite( sc, diff, label + ' oracle diff' );
		check.assertScaled( norm2( sc, diff ), norm2( sc, xo ), 1e-6, label + ' vs normal-equations oracle' );
	} );
}

// Layout invariance (L3): bit-exact within a storage-order family (the col<->row
// flip reorders the optimized inner zgemv/zgerc/zgemm; see dgels LEARNINGS).
var allLayouts = schemes.dense.layouts();
var colLayouts = allLayouts.filter( function isCol( L ) {
	return L.order !== 'row';
});
var rowLayouts = allLayouts.filter( function isRow( L ) {
	return L.order === 'row';
});

test( 'zgels: layout invariance (bit-exact within storage-order family)', function t() {
	var sizes = [ [ 5, 3 ], [ 3, 5 ], [ 4, 4 ], [ 40, 33 ], [ 33, 40 ] ];
	var ti;
	var si;
	for ( ti = 0; ti < TRANS.length; ti++ ) {
		for ( si = 0; si < sizes.length; si++ ) {
			runInvariance( TRANS[ ti ], sizes[ si ][ 0 ], sizes[ si ][ 1 ], 2, colLayouts, 'col' );
			runInvariance( TRANS[ ti ], sizes[ si ][ 0 ], sizes[ si ][ 1 ], 2, rowLayouts, 'row' );
		}
	}
});

function runInvariance( trans, M, N, nrhs, variants, fam ) {
	var d = opDesc( trans, M, N );
	var ldb = Math.max( M, N );
	var seed = 0x6000 + ( M * 17 ) + N;
	checked( 'zgels', 'layout-invariance', function fuzz() {
		layoutInvariant( variants, function run( layout, idx ) {
			var rng = new RNG( seed );
			var A = logical.general( sc, rng, M, N );
			var B = makeB( rng, ldb, d.p, nrhs );
			var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, layout );
			var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, variants[ ( idx + 2 ) % variants.length ] );
			var lwork = bigLwork( M, N, nrhs );
			var WORK = sc.alloc( lwork );
			zgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], WORK, 1, 0 );
			var out = new logical.LogicalMatrix( sc, ldb, nrhs );
			var i;
			var j;
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < ldb; i++ ) {
					out.set( i, j, RB.read( i, j ) );
				}
			}
			return check.flattenLogical( sc, out );
		}, { 'label': 'zgels layout invariance ' + fam + '-major ' + trans + ' ' + M + 'x' + N } );
	} );
}

// Leading-dimension conformance (drives the LDB wrapper). zgels is column-major
// only; B's output-inclusive extent is max(M,N) rows.
test( 'zgels: LDB wrapper enforces LDB >= max(M,N) (output-growth on min-norm)', function t() {
	var pairs = [ [ 3, 5 ], [ 5, 3 ], [ 4, 4 ], [ 2, 6 ], [ 7, 2 ] ];
	var ti;
	var pi;
	for ( ti = 0; ti < TRANS.length; ti++ ) {
		for ( pi = 0; pi < pairs.length; pi++ ) {
			runLDGuard( TRANS[ ti ], pairs[ pi ][ 0 ], pairs[ pi ][ 1 ], 2 );
		}
	}
});

function cVal( tag ) {
	return function val( i, j ) {
		return { 're': Math.sin( ( ( i + 1 ) * 2.3 ) + ( ( j + 1 ) * 0.7 ) + tag ), 'im': Math.cos( ( ( i + 1 ) * 1.1 ) + ( ( j + 1 ) * 0.5 ) + tag ) };
	};
}

function runLDGuard( trans, M, N, nrhs ) {
	var d = opDesc( trans, M, N );
	var bRows = Math.max( M, N );
	var ldbReq = requiredLD( 'column-major', bRows, nrhs );
	var lwork = bigLwork( M, N, nrhs );
	var lbl = trans + ' ' + M + 'x' + N;
	assertLeadingDimGuard( function callLDB( ldb ) {
		var A = realizeLD( sc, 'column-major', M, N, M, N, M, cVal( 0.0 ) );
		var B = realizeLD( sc, 'column-major', d.p, nrhs, bRows, nrhs, ldb, cVal( 9.0 ) );
		zgelsWrap( trans, M, N, nrhs, A.data, M, B.data, ldb, null, 1 );
	}, ldbReq, 'zgels LDB guard ' + lbl );
}

// Workspace conformance (4c): the ndarray form's advertised WORK minimum (its
// throw boundary) must actually suffice on the blocked path, with a poisoned
// buffer sized to exactly that minimum.
function zgelsWorkRun( trans, M, N, nrhs, seed ) {
	return function run( workLen ) {
		var d = opDesc( trans, M, N );
		var ldb = Math.max( M, N );
		var rng = new RNG( seed );
		var A = logical.general( sc, rng, M, N );
		var B = makeB( rng, ldb, d.p, nrhs );
		var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
		var WORK = poisonedWork( sc, workLen );
		zgels( trans, M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], WORK, 1, 0 );
		var out = [];
		var v;
		var i;
		var j;
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < ldb; i++ ) {
				v = RB.read( i, j );
				out.push( v.re, v.im );
			}
		}
		return out;
	};
}

test( 'zgels: advertised WORK minimum suffices on the blocked path (min(M,N) > NB)', function t() {
	var cases = [
		[ 'no-transpose', 40, 33, 1 ], [ 'no-transpose', 40, 33, 64 ],
		[ 'conjugate-transpose', 40, 33, 1 ],
		[ 'no-transpose', 33, 40, 1 ], [ 'no-transpose', 33, 40, 64 ],
		[ 'conjugate-transpose', 33, 40, 1 ],
		[ 'no-transpose', 64, 64, 2 ]
	];
	var k;
	for ( k = 0; k < cases.length; k++ ) {
		var c = cases[ k ];
		assertWorkspaceSufficient( zgelsWorkRun( c[ 0 ], c[ 1 ], c[ 2 ], c[ 3 ], 0x8000 + k ), {}, 'zgels WORK sufficiency ' + c[ 0 ] + ' ' + c[ 1 ] + 'x' + c[ 2 ] + ' nrhs=' + c[ 3 ] );
	}
});
