// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zgees from './../lib/ndarray.js';

// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import n3_nosort from './fixtures/n3_nosort.json' with { type: 'json' };
import n3_sort from './fixtures/n3_sort.json' with { type: 'json' };
import n4_noschur from './fixtures/n4_noschur.json' with { type: 'json' };
import n4_schur from './fixtures/n4_schur.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function selectNone() {
	return false;
}

function selectGt3( w ) {
	return real( w ) > 3.0;
}

function makeMatrix( N, data ) {
	// data is interleaved re/im in column-major order
	var A = new Complex128Array( N * N );
	var v = reinterpret( A, 0 );
	var i;
	for ( i = 0; i < data.length; i++ ) {
		v[ i ] = data[ i ];
	}
	return A;
}

function callZgees( jobvs, sort, selectFn, N, Adata ) {
	var A = makeMatrix( N, Adata );
	var W = new Complex128Array( Math.max( 1, N ) );
	var VS = new Complex128Array( Math.max( 1, N * N ) );
	var WORK = new Complex128Array( Math.max( 1, 3 * N ) );
	var RWORK = new Float64Array( Math.max( 1, N ) );
	var BWORK = new Uint8Array( Math.max( 1, N ) );
	var sdim = new Float64Array( 1 );
	var info;

	info = zgees( jobvs, sort, selectFn, N, A, 1, N, 0, sdim, W, 1, 0, VS, 1, N, 0, WORK, 1, 0, WORK.length, RWORK, 1, 0, BWORK, 1, 0 );

	return {
		info: info,
		sdim: sdim[ 0 ],
		w: reinterpret( W, 0 ),
		T: reinterpret( A, 0 ),
		vs: reinterpret( VS, 0 )
	};
}

// TESTS //

test( 'zgees: n0', function t() {
	var result = callZgees( 'compute-vectors', 'none', selectNone, 0, [] );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );
});

test( 'zgees: n1', function t() {
	var tc = n1;
	// A = (3+2i)
	var result = callZgees( 'compute-vectors', 'none', selectNone, 1, [ 3.0, 2.0 ] );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );
	assertArrayClose( Array.from( result.w ).slice( 0, 2 ), tc.w, 1e-14, 'w' );
	assertArrayClose( Array.from( result.vs ).slice( 0, 2 ), tc.vs, 1e-14, 'vs' );
});

test( 'zgees: n3_nosort', function t() {
	var tc = n3_nosort;
	// Upper triangular 3x3 matrix, column-major interleaved:
	// A = [ (1,0) (2,1) (3,-1)
	//       (0,1) (4,0) (5,2)
	//       (0,0) (0,-1)(6,0) ]
	var Adata = [
		1, 0,  0, 1,  0, 0,   // col 0: A(0,0), A(1,0), A(2,0)
		2, 1,  4, 0,  0, -1,  // col 1: A(0,1), A(1,1), A(2,1)
		3, -1, 5, 2,  6, 0    // col 2: A(0,2), A(1,2), A(2,2)
	];
	var result = callZgees( 'compute-vectors', 'none', selectNone, 3, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	// Sort eigenvalues by real part for comparison (since ordering may differ)
	var wActual = sortEigs( result.w, 3 );
	var wExpect = sortEigs( new Float64Array( tc.w ), 3 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );
});

test( 'zgees: n3_sort (select real>3)', function t() {
	var tc = n3_sort;
	var Adata = [
		1, 0,  0, 1,  0, 0,
		2, 1,  4, 0,  0, -1,
		3, -1, 5, 2,  6, 0
	];
	var result = callZgees( 'compute-vectors', 'sort', selectGt3, 3, Adata );
	assert.equal( result.info, 0, 'info' );
	// SDIM should be the number of eigenvalues with real > 3
	// From fixture: eigenvalues are ~(7.16, ...), ~(1.00, ...), ~(2.84, ...)
	// So only 1 eigenvalue (the one with real ~7.16) has real > 3
	assert.equal( result.sdim, tc.sdim, 'sdim' );
});

test( 'zgees: n4_noschur (JOBVS=N)', function t() {
	var tc = n4_noschur;
	var Adata = [
		2, 1,   1, -0.5, 0, 0,    0, 0,    // col 0
		1, 0.5, 3, 0,    1, -1,   0, 0,    // col 1
		0, 0,   1, 1,    4, 0.5,  1, 0,    // col 2
		0, 0,   0, 0,    2, 0,    5, -1    // col 3
	];
	var result = callZgees( 'no-vectors', 'none', selectNone, 4, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	var wActual = sortEigs( result.w, 4 );
	var wExpect = sortEigs( new Float64Array( tc.w ), 4 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );
});

test( 'zgees: n4_schur (JOBVS=V)', function t() {
	var tc = n4_schur;
	var Adata = [
		2, 1,   1, -0.5, 0, 0,    0, 0,
		1, 0.5, 3, 0,    1, -1,   0, 0,
		0, 0,   1, 1,    4, 0.5,  1, 0,
		0, 0,   0, 0,    2, 0,    5, -1
	];
	var result = callZgees( 'compute-vectors', 'none', selectNone, 4, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	// Compare eigenvalues (sorted)
	var wActual = sortEigs( result.w, 4 );
	var wExpect = sortEigs( new Float64Array( tc.w ), 4 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );

	// Verify T is upper triangular: subdiagonal elements should be zero
	var T = result.T;
	var N = 4;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			// T[i,j] should be zero (stored column-major)
			var idx = ( i + j * N ) * 2;
			assertClose( T[ idx ], 0.0, 1e-12, 'T[' + i + ',' + j + '] re' );
			assertClose( T[ idx + 1 ], 0.0, 1e-12, 'T[' + i + ',' + j + '] im' );
		}
	}
});

/**
* Sort eigenvalues by real part, then imaginary part.
*
* @private
*/
function sortEigs( wv, n ) {
	var eigs = [];
	var i;
	for ( i = 0; i < n; i++ ) {
		eigs.push( [ wv[ i * 2 ], wv[ i * 2 + 1 ] ] );
	}
	eigs.sort( function cmp( a, b ) {
		if ( a[ 0 ] !== b[ 0 ] ) return a[ 0 ] - b[ 0 ];
		return a[ 1 ] - b[ 1 ];
	});
	var out = [];
	for ( i = 0; i < n; i++ ) {
		out.push( eigs[ i ][ 0 ] );
		out.push( eigs[ i ][ 1 ] );
	}
	return out;
}
