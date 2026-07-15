/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, id-length, max-depth, max-params */

/**
* Property-based validation for zgelss (complex minimum-norm least-squares via SVD).
*
* zgelss always solves min ‖Ax-b‖ for the M-by-N A (no trans): overdetermined LS
* when M>=N, minimum-norm when M<N. For full-rank well-conditioned inputs the
* solution is unique and satisfies the same properties as zgels no-transpose:
*   - M>=N (tall): Aᴴ(Ax-b)=0 (LS optimality).
*   - M<N  (wide): Ax=b feasibility AND minimum norm (certified by the oracle).
* Also asserts the numerical rank equals min(M,N).
*
* Layers: residual (L2), cross-validation (L4), plus leading-dimension (LDB) and
* workspace conformance guards (plain assertions).
*/

// MODULES //

import test from 'node:test';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import { RNG, scalar as S, logical, schemes, ref, norms, check } from '../../../../../test/harness/index.js';
import { checked } from '../../../../../test/harness/ledger.js';
import { realizeLD, requiredLD, assertLeadingDimGuard } from '../../../../../test/harness/leadingdim.js';
import zgelss from './../lib/ndarray.js';
import { computeWorkSize } from './../lib/base.js';
import zgelssWrap from './../lib/zgelss.js';

var norm2 = norms.norm2;
var frob = norms.frobenius;
var sc = S.complex;


// HELPERS //

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

function fillZeros( n ) {
	var a = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		a.push( sc.zero );
	}
	return a;
}

// C = A. tall -> (AᴴA)x = Aᴴb ; wide -> x = Aᴴz with (AAᴴ)z = b.
function oracleSolve( A, b, M, N ) {
	var e;
	var i;
	var j;
	var k;
	var s;
	if ( M >= N ) {
		var cols = [];
		for ( j = 0; j < N; j++ ) {
			e = fillZeros( N );
			e[ j ] = sc.one;
			cols.push( ref.matvec( sc, A, e, { 'trans': 'n' } ) );
		}
		var AtA = new logical.LogicalMatrix( sc, N, N );
		for ( i = 0; i < N; i++ ) {
			for ( j = 0; j < N; j++ ) {
				s = sc.zero;
				for ( k = 0; k < cols[ i ].length; k++ ) {
					s = sc.add( s, sc.mul( sc.conj( cols[ i ][ k ] ), cols[ j ][ k ] ) );
				}
				AtA.set( i, j, s );
			}
		}
		return solveDense( AtA, ref.matvec( sc, A, b, { 'trans': 'c' } ) );
	}
	var rows = [];
	for ( i = 0; i < M; i++ ) {
		e = fillZeros( M );
		e[ i ] = sc.one;
		rows.push( ref.matvec( sc, A, e, { 'trans': 'c' } ) );
	}
	var AAt = new logical.LogicalMatrix( sc, M, M );
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < M; j++ ) {
			s = sc.zero;
			for ( k = 0; k < rows[ i ].length; k++ ) {
				s = sc.add( s, sc.mul( sc.conj( rows[ i ][ k ] ), rows[ j ][ k ] ) );
			}
			AAt.set( i, j, s );
		}
	}
	var z = solveDense( AAt, b );
	return ref.matvec( sc, A, z, { 'trans': 'c' } );
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

var PAIRS = [ [ 1, 1 ], [ 2, 3 ], [ 3, 2 ], [ 5, 3 ], [ 3, 5 ], [ 8, 5 ], [ 16, 7 ], [ 7, 16 ], [ 17, 17 ], [ 33, 20 ], [ 20, 33 ], [ 40, 33 ], [ 33, 40 ] ];
var NRHS = [ 1, 2 ];

test( 'zgelss: LS optimality / min-norm feasibility + cross-validation + full rank', function t() {
	var pi;
	var ri;
	for ( pi = 0; pi < PAIRS.length; pi++ ) {
		for ( ri = 0; ri < NRHS.length; ri++ ) {
			runProperty( PAIRS[ pi ][ 0 ], PAIRS[ pi ][ 1 ], NRHS[ ri ] );
		}
	}
});

function runProperty( M, N, nrhs ) {
	var minmn = Math.min( M, N );
	var ldb = Math.max( M, N );
	var rng = new RNG( 0x9000 + ( M * 131 ) + ( N * 7 ) + nrhs );
	var A = logical.general( sc, rng, M, N );
	var B = makeB( rng, ldb, M, nrhs );
	var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var Sv = new Float64Array( minmn );
	var rank = [ 0 ];
	var WORK = new Complex128Array( computeWorkSize( M, N, nrhs ) );
	var RWORK = new Float64Array( Math.max( 1, 5 * minmn ) );
	var info = zgelss( M, N, nrhs, RA.data, RA.args[ 0 ], RA.args[ 1 ], RA.args[ 2 ], RB.data, RB.args[ 0 ], RB.args[ 1 ], RB.args[ 2 ], Sv, 1, 0, -1.0, rank, WORK, 1, 0, RWORK, 1, 0 );
	if ( info !== 0 ) {
		throw new Error( 'zgelss info=' + info + ' for full-rank ' + M + 'x' + N );
	}
	checked( 'zgelss', 'structural', function fullRank() {
		if ( rank[ 0 ] !== minmn ) {
			throw new Error( 'zgelss ' + M + 'x' + N + ': numerical rank ' + rank[ 0 ] + ' != full rank ' + minmn + ' for a random (full-rank) matrix' );
		}
	} );
	var c;
	var i;
	for ( c = 0; c < nrhs; c++ ) {
		var x = [];
		for ( i = 0; i < N; i++ ) {
			x.push( RB.read( i, c ) );
		}
		var b = [];
		for ( i = 0; i < M; i++ ) {
			b.push( B.get( i, c ) );
		}
		validateColumn( A, b, x, M, N, M + 'x' + N + ' col' + c );
	}
}

function validateColumn( A, b, x, M, N, label ) {
	checked( 'zgelss', 'residual', function property() {
		var Ax = ref.matvec( sc, A, x, { 'trans': 'n' } );
		var r = [];
		var i;
		for ( i = 0; i < Ax.length; i++ ) {
			r.push( sc.sub( Ax[ i ], b[ i ] ) );
		}
		check.assertFinite( sc, r, label + ' residual' );
		var nA = frob( sc, A );
		if ( M >= N ) {
			var g = ref.matvec( sc, A, r, { 'trans': 'c' } );
			check.assertFinite( sc, g, label + ' gradient' );
			check.assertScaled( norm2( sc, g ), nA * ( ( nA * norm2( sc, x ) ) + norm2( sc, b ) ), check.tol( Math.max( M, N ), 100 ), label + ' LS optimality' );
		} else {
			check.assertScaled( norm2( sc, r ), ( nA * norm2( sc, x ) ) + norm2( sc, b ), check.tol( Math.max( M, N ), 100 ), label + ' feasibility' );
		}
	} );

	checked( 'zgelss', 'cross-validation', function xval() {
		var xo = oracleSolve( A, b, M, N );
		var diff = [];
		var i;
		for ( i = 0; i < x.length; i++ ) {
			diff.push( sc.sub( x[ i ], xo[ i ] ) );
		}
		check.assertFinite( sc, diff, label + ' oracle diff' );
		check.assertScaled( norm2( sc, diff ), norm2( sc, xo ), 1e-6, label + ' vs normal-equations oracle' );
	} );
}

// Leading-dimension conformance (drives the LDB wrapper). B output-inclusive
// extent is max(M,N) rows (column-major).
test( 'zgelss: LDB wrapper enforces LDB >= max(M,N)', function t() {
	var pairs = [ [ 3, 5 ], [ 5, 3 ], [ 4, 4 ], [ 2, 6 ], [ 7, 2 ] ];
	var pi;
	for ( pi = 0; pi < pairs.length; pi++ ) {
		runLDGuard( pairs[ pi ][ 0 ], pairs[ pi ][ 1 ], 2 );
	}
});

function cVal( tag ) {
	return function val( i, j ) {
		return { 're': Math.sin( ( ( i + 1 ) * 2.3 ) + ( ( j + 1 ) * 0.7 ) + tag ), 'im': Math.cos( ( ( i + 1 ) * 1.1 ) + ( ( j + 1 ) * 0.5 ) + tag ) };
	};
}

function runLDGuard( M, N, nrhs ) {
	var bRows = Math.max( M, N );
	var ldbReq = requiredLD( 'column-major', bRows, nrhs );
	var minmn = Math.min( M, N );
	assertLeadingDimGuard( function callLDB( ldb ) {
		var A = realizeLD( sc, 'column-major', M, N, M, N, M, cVal( 0.0 ) );
		var B = realizeLD( sc, 'column-major', M, nrhs, bRows, nrhs, ldb, cVal( 9.0 ) );
		zgelssWrap( M, N, nrhs, A.data, M, B.data, ldb, new Float64Array( minmn ), 1, -1.0, [ 0 ], null, 1, null, 1 );
	}, ldbReq, 'zgelss LDB guard ' + M + 'x' + N );
}

// Workspace conformance (4c): the wrapper's WORK=null / RWORK=null
// auto-allocation must suffice on the blocked path.
test( 'zgelss: wrapper WORK=null auto-allocation suffices on the blocked path', function t() {
	var cases = [ [ 40, 33, 1 ], [ 40, 33, 4 ], [ 33, 40, 1 ], [ 33, 40, 4 ], [ 48, 48, 2 ] ];
	var k;
	for ( k = 0; k < cases.length; k++ ) {
		runWorkNull( cases[ k ][ 0 ], cases[ k ][ 1 ], cases[ k ][ 2 ], 0xA000 + k );
	}
});

function runWorkNull( M, N, nrhs, seed ) {
	var minmn = Math.min( M, N );
	var ldb = Math.max( M, N );
	var rng = new RNG( seed );
	var A = logical.general( sc, rng, M, N );
	var B = makeB( rng, ldb, M, nrhs );

	// layouts()[ 0 ] is canonical column-major (strideA1=1, offset=0), so the
	// column stride is the leading dimension consumed by the wrapper.
	var RA = schemes.dense.realize( sc, A, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var RB = schemes.dense.realize( sc, B, { 'part': 'full' }, schemes.dense.layouts()[ 0 ] );
	var Sv = new Float64Array( minmn );
	zgelssWrap( M, N, nrhs, RA.data, RA.args[ 1 ], RB.data, RB.args[ 1 ], Sv, 1, -1.0, [ 0 ], null, 1, null, 1 );
	var out = [];
	var i;
	var j;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( RB.read( i, j ) );
		}
	}
	check.assertFinite( sc, out, 'zgelss WORK=null blocked ' + M + 'x' + N + ' nrhs=' + nrhs );
	check.assertFinite( sc, Array.prototype.slice.call( Sv ).map( function w( v ) { return { 're': v, 'im': 0.0 }; } ), 'zgelss WORK=null S ' + M + 'x' + N );
}
