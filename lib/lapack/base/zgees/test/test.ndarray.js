// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zgees from './../lib/ndarray.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';

// FIXTURES //

import n1 from './fixtures/n1.json' with { type: 'json' };
import n3_nosort from './fixtures/n3_nosort.json' with { type: 'json' };
import n3_sort from './fixtures/n3_sort.json' with { type: 'json' };
import n4_noschur from './fixtures/n4_noschur.json' with { type: 'json' };
import n4_schur from './fixtures/n4_schur.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
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
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let i;
	for ( i = 0; i < data.length; i++ ) {
		v[ i ] = data[ i ];
	}
	return A;
}

function callZgees( jobvs, sort, selectFn, N, Adata ) {
	const A = makeMatrix( N, Adata );
	const W = new Complex128Array( Math.max( 1, N ) );
	const VS = new Complex128Array( Math.max( 1, N * N ) );
	const WORK = new Complex128Array( Math.max( 1, 3 * N ) );
	const RWORK = new Float64Array( Math.max( 1, N ) );
	const BWORK = new Uint8Array( Math.max( 1, N ) );
	const sdim = new Float64Array( 1 );

	const info = zgees( jobvs, sort, selectFn, N, A, 1, N, 0, sdim, W, 1, 0, VS, 1, N, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 );

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
	const result = callZgees( 'compute-vectors', 'none', selectNone, 0, [] );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );
});

test( 'zgees: n1', function t() {
	const tc = n1;
	// A = (3+2i)
	const result = callZgees( 'compute-vectors', 'none', selectNone, 1, [ 3.0, 2.0 ] );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );
	assertArrayClose( Array.from( result.w ).slice( 0, 2 ), tc.w, 1e-14, 'w' );
	assertArrayClose( Array.from( result.vs ).slice( 0, 2 ), tc.vs, 1e-14, 'vs' );
});

test( 'zgees: n3_nosort', function t() {
	const tc = n3_nosort;
	// Upper triangular 3x3 matrix, column-major interleaved:
	// A = [ (1,0) (2,1) (3,-1)
	//       (0,1) (4,0) (5,2)
	//       (0,0) (0,-1)(6,0) ]
	const Adata = [
		1, 0,  0, 1,  0, 0,   // col 0: A(0,0), A(1,0), A(2,0)
		2, 1,  4, 0,  0, -1,  // col 1: A(0,1), A(1,1), A(2,1)
		3, -1, 5, 2,  6, 0    // col 2: A(0,2), A(1,2), A(2,2)
	];
	const result = callZgees( 'compute-vectors', 'none', selectNone, 3, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	// Sort eigenvalues by real part for comparison (since ordering may differ)
	const wActual = sortEigs( result.w, 3 );
	const wExpect = sortEigs( new Float64Array( tc.w ), 3 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );
});

test( 'zgees: n3_sort (select real>3)', function t() {
	const tc = n3_sort;
	const Adata = [
		1, 0,  0, 1,  0, 0,
		2, 1,  4, 0,  0, -1,
		3, -1, 5, 2,  6, 0
	];
	const result = callZgees( 'compute-vectors', 'sort', selectGt3, 3, Adata );
	assert.equal( result.info, 0, 'info' );
	// SDIM should be the number of eigenvalues with real > 3
	// From fixture: eigenvalues are ~(7.16, ...), ~(1.00, ...), ~(2.84, ...)
	// So only 1 eigenvalue (the one with real ~7.16) has real > 3
	assert.equal( result.sdim, tc.sdim, 'sdim' );
});

test( 'zgees: n4_noschur (JOBVS=N)', function t() {
	const tc = n4_noschur;
	const Adata = [
		2, 1,   1, -0.5, 0, 0,    0, 0,    // col 0
		1, 0.5, 3, 0,    1, -1,   0, 0,    // col 1
		0, 0,   1, 1,    4, 0.5,  1, 0,    // col 2
		0, 0,   0, 0,    2, 0,    5, -1    // col 3
	];
	const result = callZgees( 'no-vectors', 'none', selectNone, 4, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	const wActual = sortEigs( result.w, 4 );
	const wExpect = sortEigs( new Float64Array( tc.w ), 4 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );
});

test( 'zgees: n4_schur (JOBVS=V)', function t() {
	const tc = n4_schur;
	const Adata = [
		2, 1,   1, -0.5, 0, 0,    0, 0,
		1, 0.5, 3, 0,    1, -1,   0, 0,
		0, 0,   1, 1,    4, 0.5,  1, 0,
		0, 0,   0, 0,    2, 0,    5, -1
	];
	const result = callZgees( 'compute-vectors', 'none', selectNone, 4, Adata );
	assert.equal( result.info, 0, 'info' );
	assert.equal( result.sdim, 0, 'sdim' );

	// Compare eigenvalues (sorted)
	const wActual = sortEigs( result.w, 4 );
	const wExpect = sortEigs( new Float64Array( tc.w ), 4 );
	assertArrayClose( wActual, wExpect, 1e-12, 'w' );

	// Verify T is upper triangular: subdiagonal elements should be zero
	const T = result.T;
	const N = 4;
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			// T[i,j] should be zero (stored column-major)
			const idx = ( i + j * N ) * 2;
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
	const eigs = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		eigs.push( [ wv[ i * 2 ], wv[ i * 2 + 1 ] ] );
	}
	eigs.sort( function cmp( a, b ) {
		if ( a[ 0 ] !== b[ 0 ] ) return a[ 0 ] - b[ 0 ];
		return a[ 1 ] - b[ 1 ];
	});
	const out = [];
	for ( i = 0; i < n; i++ ) {
		out.push( eigs[ i ][ 0 ] );
		out.push( eigs[ i ][ 1 ] );
	}
	return out;
}


// PROPERTY TESTS //

/**
* Returns a deterministic pseudo-random generator on [-0.5, 0.5).
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function generator( seed ) {
	let s = seed;
	return function next() {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		return ( s / 2147483648 ) - 0.5;
	};
}

/**
* Checks a complex Schur factorization `A = Z*T*Z^H` (interleaved column-major data): Z unitary, T upper triangular, W = diag(T), and the `sdim` leading eigenvalues selected.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {Float64Array} A0 - original matrix
* @param {Object} r - result of callZgees
* @param {Function} selectFn - selection function (or null)
* @param {string} msg - message
*/
function assertSchur( N, A0, r, selectFn, msg ) {
	const T = r.T;
	const Z = r.vs;
	let anrm = 0.0;
	let tr, ti, zr, zi, sr, si, i, j, k, l, p;
	for ( i = 0; i < N * N; i++ ) {
		anrm = Math.max( anrm, Math.abs( A0[ 2 * i ] ) + Math.abs( A0[ ( 2 * i ) + 1 ] ) ); // eslint-disable-line max-len
	}
	for ( i = 0; i < 2 * N * N; i++ ) {
		assert.ok( Number.isFinite( T[ i ] ), msg + ': T finite [' + i + ']' );
		assert.ok( Number.isFinite( Z[ i ] ), msg + ': Z finite [' + i + ']' );
	}

	// T upper triangular and W = diag(T):
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			assert.strictEqual( T[ 2 * ( i + ( j * N ) ) ], 0.0, msg + ': T(' + i + ',' + j + ') re' ); // eslint-disable-line max-len
			assert.strictEqual( T[ ( 2 * ( i + ( j * N ) ) ) + 1 ], 0.0, msg + ': T(' + i + ',' + j + ') im' ); // eslint-disable-line max-len
		}
		assert.strictEqual( r.w[ 2 * j ], T[ 2 * ( j + ( j * N ) ) ], msg + ': W re ' + j ); // eslint-disable-line max-len
		assert.strictEqual( r.w[ ( 2 * j ) + 1 ], T[ ( 2 * ( j + ( j * N ) ) ) + 1 ], msg + ': W im ' + j ); // eslint-disable-line max-len
	}

	// Z^H Z = I:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				zr = Z[ 2 * ( k + ( i * N ) ) ];
				zi = -Z[ ( 2 * ( k + ( i * N ) ) ) + 1 ];
				tr = Z[ 2 * ( k + ( j * N ) ) ];
				ti = Z[ ( 2 * ( k + ( j * N ) ) ) + 1 ];
				sr += ( zr * tr ) - ( zi * ti );
				si += ( zr * ti ) + ( zi * tr );
			}
			assert.ok( Math.abs( sr - ( ( i === j ) ? 1.0 : 0.0 ) ) + Math.abs( si ) <= 1e-13 * N, msg + ': Z^H*Z(' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}

	// A = Z*T*Z^H, entry by entry, relative to ||A||:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				for ( l = k; l < N; l++ ) {
					// Z(i,k) * T(k,l) * conj(Z(j,l))
					p = 2 * ( i + ( k * N ) );
					zr = Z[ p ];
					zi = Z[ p + 1 ];
					p = 2 * ( k + ( l * N ) );
					tr = ( zr * T[ p ] ) - ( zi * T[ p + 1 ] );
					ti = ( zr * T[ p + 1 ] ) + ( zi * T[ p ] );
					p = 2 * ( j + ( l * N ) );
					sr += ( tr * Z[ p ] ) + ( ti * Z[ p + 1 ] );
					si += ( ti * Z[ p ] ) - ( tr * Z[ p + 1 ] );
				}
			}
			p = 2 * ( i + ( j * N ) );
			assert.ok( Math.abs( sr - A0[ p ] ) + Math.abs( si - A0[ p + 1 ] ) <= 1e-13 * N * anrm, msg + ': (Z*T*Z^H - A)(' + i + ',' + j + ')' ); // eslint-disable-line max-len
		}
	}

	// Selected eigenvalues lead:
	if ( selectFn ) {
		for ( i = 0; i < N; i++ ) {
			assert.strictEqual( selectFn( new Complex128( r.w[ 2 * i ], r.w[ ( 2 * i ) + 1 ] ) ), i < r.sdim, msg + ': eigenvalue ' + i + ' selected iff i < sdim' ); // eslint-disable-line max-len
		}
	}
}

/**
* Returns a random N-by-N complex matrix (interleaved), scaled by `scale`.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {number} scale - scale
* @param {integer} seed - seed
* @returns {Array} data
*/
function randomMatrix( N, scale, seed ) {
	const rnd = generator( seed );
	const out = [];
	let i;
	for ( i = 0; i < 2 * N * N; i++ ) {
		out.push( rnd() * scale );
	}
	return out;
}

test( 'zgees: huge-norm matrix is scaled down and back (A = Z*T*Z^H, sorted)', function t() {
	const N = 4;
	const Adata = randomMatrix( N, 1e150, 777 );
	function select( w ) {
		return real( w ) > 0.0;
	}
	const r = callZgees( 'compute-vectors', 'sort', select, N, Adata );
	assert.strictEqual( r.info, 0, 'info' );
	assert.ok( r.sdim > 0 && r.sdim < N, 'sdim strictly between 0 and N: ' + r.sdim );
	assertSchur( N, Float64Array.from( Adata ), r, select, 'huge' );
});

test( 'zgees: tiny-norm matrix is scaled up and back (A = Z*T*Z^H, sorted)', function t() {
	// The input is upper triangular, so the QR iteration has nothing to do and
	// the test exercises the scaling, the unscaling of W before `select`, and
	// the reordering. A general (non-triangular) tiny-norm matrix is not used:
	// the QR iteration on the scaled matrix loses accuracy (Z^H*Z - I is about
	// 1e-12 at N = 3) and returns NaN for N >= 5 (ticket 0026).
	const N = 3;
	const Adata = randomMatrix( N, 1e-150, 12345 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			Adata[ 2 * ( i + ( j * N ) ) ] = 0.0;
			Adata[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.0;
		}
	}
	function select( w ) {
		return real( w ) < 0.0;
	}
	const r = callZgees( 'compute-vectors', 'sort', select, N, Adata );
	assert.strictEqual( r.info, 0, 'info' );
	assert.ok( r.sdim > 0 && r.sdim < N, 'sdim strictly between 0 and N: ' + r.sdim );
	assertSchur( N, Float64Array.from( Adata ), r, select, 'tiny' );
});

test( 'zgees: the reference minimum WORK (2*N) suffices past the blocking threshold (ticket 0100)', function t() {
	let seed = 7;
	let opt, err, sr, si, zr, zi, tr, ti, ur, ui, r, i, j, k, l;
	function rnd() {
		seed = ( seed * 16807 ) % 2147483647;
		return ( seed / 2147483647 ) - 0.5;
	}
	function selectFn( z ) {
		return z.re > 0.0;
	}
	function run( jobvs, sort, N, Av0, lwork ) {
		const A = new Complex128Array( Av0 );
		const W = new Complex128Array( N );
		const VS = new Complex128Array( N * N );
		const sdim = new Int32Array( 1 );
		const info = zgees( jobvs, sort, ( sort === 'sort' ) ? selectFn : null, N, A, 1, N, 0, sdim, W, 1, 0, VS, 1, N, 0, new Complex128Array( lwork ), 1, 0, new Float64Array( N ), 1, 0, new Uint8Array( N ), 1, 0 );
		return [ info, reinterpret( W, 0 ), reinterpret( VS, 0 ), reinterpret( A, 0 ), sdim[ 0 ] ];
	}
	const N = 40; // > NB+1 so the optimum blocks zgehrd; <= NMIN so zhseqr does not adapt to the length
	const Av0 = new Float64Array( 2 * N * N );
	for ( i = 0; i < Av0.length; i++ ) {
		Av0[ i ] = rnd();
	}
	opt = run( 'compute-vectors', 'sort', N, Av0, 200 * N );
	r = run( 'compute-vectors', 'sort', N, Av0, 2 * N );
	assert.equal( r[ 0 ], 0, 'info' );
	assert.equal( r[ 4 ], opt[ 4 ], 'sdim' );
	for ( i = 0; i < 2 * N; i++ ) {
		assert.ok( Math.abs( r[ 1 ][ i ] - opt[ 1 ][ i ] ) < 1e-12, 'w component ' + i );
	}
	// A = Z*T*Z^H:
	err = 0.0;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				for ( l = 0; l < N; l++ ) {
					zr = r[ 2 ][ 2 * ( i + ( k * N ) ) ];
					zi = r[ 2 ][ ( 2 * ( i + ( k * N ) ) ) + 1 ];
					tr = r[ 3 ][ 2 * ( k + ( l * N ) ) ];
					ti = r[ 3 ][ ( 2 * ( k + ( l * N ) ) ) + 1 ];
					ur = r[ 2 ][ 2 * ( j + ( l * N ) ) ];
					ui = -r[ 2 ][ ( 2 * ( j + ( l * N ) ) ) + 1 ];
					sr += ( ( ( zr * tr ) - ( zi * ti ) ) * ur ) - ( ( ( zr * ti ) + ( zi * tr ) ) * ui );
					si += ( ( ( zr * tr ) - ( zi * ti ) ) * ui ) + ( ( ( zr * ti ) + ( zi * tr ) ) * ur );
				}
			}
			err = Math.max( err, Math.abs( sr - Av0[ 2 * ( i + ( j * N ) ) ] ), Math.abs( si - Av0[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ) );
		}
	}
	assert.ok( err < 1e-12, 'A = Z*T*Z^H (' + err + ')' );
	r = run( 'no-vectors', 'none', N, Av0, 2 * N );
	opt = run( 'no-vectors', 'none', N, Av0, 200 * N );
	assert.equal( r[ 0 ], 0, 'info' );
	for ( i = 0; i < 2 * N; i++ ) {
		assert.ok( Math.abs( r[ 1 ][ i ] - opt[ 1 ][ i ] ) < 1e-12, 'w component ' + i );
	}

	// One below the reference minimum throws:
	assert.throws( function throws() {
		run( 'compute-vectors', 'none', N, Av0, ( 2 * N ) - 1 );
	}, /WORK array must have at least 80 elements/ );
});
