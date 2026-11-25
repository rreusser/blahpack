
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj0 from './../lib/ndarray.js';
const ndarrayFn = dgsvj0;


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dgsvj0.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

const EPS = 2.220446049250313e-16;
const SFMIN = 2.2250738585072014e-308;
const TOL = 1.0e-10;


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts relative closeness.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const err = Math.abs( actual - expected ) / denom;
	assert.ok( err <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + err + ')' );
}

/**
* Asserts element-wise array closeness.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Computes initial column norms of an M x N column-major matrix.
*
* @private
* @param {Float64Array} a - input matrix
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @returns {Float64Array} column norms
*/
function initialSva( a, M, N ) {
	let s, j, i;
	const out = new Float64Array( N );
	for ( j = 0; j < N; j++ ) {
		s = 0;
		for ( i = 0; i < M; i++ ) {
			s += a[ (j*M) + i ] * a[ (j*M) + i ];
		}
		out[ j ] = Math.sqrt( s );
	}
	return out;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dgsvj0, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'ndarray: matches fixture novec_4x3 on unit stride', function t() {
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
});

test( 'ndarray: honors offsetA into a larger A buffer (apply_4x3)', function t() {
	let i;
	const tc = findCase( 'apply_4x3' );
	const M = 4;
	const N = 3;
	const padA = 7;
	const a = new Float64Array( padA + ( M * N ) );
	const src = [ 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 1 ];
	for ( i = 0; i < src.length; i++ ) {
		a[ padA + i ] = src[ i ];
	}
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = new Float64Array( [ Math.sqrt( 5 ), Math.sqrt( 6 ), Math.sqrt( 6 ) ] );
	const V = new Float64Array( 9 );
	V[ 0 ] = 1;
	V[ 4 ] = 1;
	V[ 8 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'apply-v', M, N, a, 1, M, padA, d, 1, 0, sva, 1, 0, 3, V, 1, 3, 0, EPS, SFMIN, TOL, 3, work, 1, 0 );
	const aView = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		aView[ i ] = a[ padA + i ];
	}
	assertArrayClose( aView, tc.a, 1e-12, 'a' );
	assertArrayClose( V, tc.v, 1e-12, 'v' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	for ( i = 0; i < padA; i++ ) {
		assert.equal( a[ i ], 0, 'pad[' + i + '] untouched' );
	}
});

test( 'ndarray: non-unit strideD and strideSVA with offsets (novec_n1)', function t() {
	const tc = findCase( 'novec_n1' );
	const M = 3;
	const N = 1;
	const a = new Float64Array( [ 3, 4, 0 ] );
	const d = new Float64Array( [ -9, 1, -9 ] );
	const sva = new Float64Array( [ -9, -9, 5 ] );
	const V = new Float64Array( 1 );
	const work = new Float64Array( M );
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 2, 1, sva, 3, 2, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 2, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assertClose( d[ 1 ], tc.d[ 0 ], 1e-13, 'd[1]' );
	assert.equal( d[ 0 ], -9, 'd[0] untouched' );
	assert.equal( d[ 2 ], -9, 'd[2] untouched' );
	assertClose( sva[ 2 ], tc.sva[ 0 ], 1e-13, 'sva[2]' );
	assert.equal( sva[ 0 ], -9, 'sva[0] untouched' );
	assert.equal( sva[ 1 ], -9, 'sva[1] untouched' );
});

test( 'ndarray: work at a nonzero offset (novec_4x3)', function t() {
	let i;
	const tc = findCase( 'novec_4x3' );
	const M = 4;
	const N = 3;
	const a = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
	const d = new Float64Array( [ 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const V = new Float64Array( 1 );
	const work = new Float64Array( 3 + ( M * 2 ) );
	for ( i = 0; i < work.length; i++ ) {
		work[ i ] = -7;
	}
	const info = ndarrayFn( 'no-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, 1, 0, EPS, SFMIN, TOL, 5, work, 1, 3 );
	assertArrayClose( a, tc.a, 1e-12, 'a' );
	assertArrayClose( d, tc.d, 1e-12, 'd' );
	assertArrayClose( sva, tc.sva, 1e-12, 'sva' );
	assert.equal( info, tc.info, 'info' );
	assert.equal( work[ 0 ], -7, 'work[0] untouched' );
	assert.equal( work[ 1 ], -7, 'work[1] untouched' );
	assert.equal( work[ 2 ], -7, 'work[2] untouched' );
});

test( 'ndarray: offsetV into a larger V buffer (vec_5x4)', function t() {
	let i;
	const tc = findCase( 'vec_5x4' );
	const M = 5;
	const N = 4;
	const a = new Float64Array( 20 );
	for ( i = 1; i <= 20; i++ ) {
		a[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	const d = new Float64Array( [ 1, 1, 1, 1 ] );
	const sva = initialSva( a, M, N );
	const padV = 5;
	const V = new Float64Array( padV + ( N * N ) );
	V[ padV + 0 ] = 1;
	V[ padV + 5 ] = 1;
	V[ padV + 10 ] = 1;
	V[ padV + 15 ] = 1;
	const work = new Float64Array( M );
	const info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, padV, EPS, SFMIN, TOL, 5, work, 1, 0 );
	assertArrayClose( a, tc.a, 1e-11, 'a' );
	assertArrayClose( d, tc.d, 1e-11, 'd' );
	assertArrayClose( sva, tc.sva, 1e-11, 'sva' );
	assert.equal( info, tc.info, 'info' );
	const vView = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		vView[ i ] = V[ padV + i ];
	}
	assertArrayClose( vView, tc.v, 1e-11, 'v' );
	for ( i = 0; i < padV; i++ ) {
		assert.equal( V[ i ], 0, 'V pad[' + i + '] untouched' );
	}
});

test( 'ndarray: matches base identically (vec_5x4)', function t() {
	let i;
	const M = 5;
	const N = 4;
	const aB = new Float64Array( 20 );
	const aN = new Float64Array( 20 );
	for ( i = 1; i <= 20; i++ ) {
		aB[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
		aN[ i - 1 ] = ( ( i * 7 ) % 11 ) - 5.0;
	}
	const dB = new Float64Array( [ 1, 1, 1, 1 ] );
	const dN = new Float64Array( [ 1, 1, 1, 1 ] );
	const svaB = initialSva( aB, M, N );
	const svaN = initialSva( aN, M, N );
	const VB = new Float64Array( 16 );
	const VN = new Float64Array( 16 );
	VB[ 0 ] = 1;
	VB[ 5 ] = 1;
	VB[ 10 ] = 1;
	VB[ 15 ] = 1;
	VN[ 0 ] = 1;
	VN[ 5 ] = 1;
	VN[ 10 ] = 1;
	VN[ 15 ] = 1;
	const workB = new Float64Array( M );
	const workN = new Float64Array( M );
	const baseInfo = dgsvj0( 'compute-v', M, N, aB, 1, M, 0, dB, 1, 0, svaB, 1, 0, 0, VB, 1, 4, 0, EPS, SFMIN, TOL, 5, workB, 1, 0 );
	const ndInfo = ndarrayFn( 'compute-v', M, N, aN, 1, M, 0, dN, 1, 0, svaN, 1, 0, 0, VN, 1, 4, 0, EPS, SFMIN, TOL, 5, workN, 1, 0 );
	assert.equal( ndInfo, baseInfo, 'info' );
	for ( i = 0; i < aB.length; i++ ) {
		assertClose( aN[ i ], aB[ i ], 1e-14, 'a[' + i + ']' );
	}
	for ( i = 0; i < dB.length; i++ ) {
		assertClose( dN[ i ], dB[ i ], 1e-14, 'd[' + i + ']' );
	}
	for ( i = 0; i < svaB.length; i++ ) {
		assertClose( svaN[ i ], svaB[ i ], 1e-14, 'sva[' + i + ']' );
	}
	for ( i = 0; i < VB.length; i++ ) {
		assertClose( VN[ i ], VB[ i ], 1e-14, 'V[' + i + ']' );
	}
});

test( 'ndarray: N=20 (three column blocks) orthogonalizes every block pair, incl. (1,3)', function t() { // eslint-disable-line max-len
	let maxcos;
	let info;
	let nrm;
	let dot;
	let av;
	let s;
	let i;
	let j;
	let k;
	const M = 20;
	const N = 20;
	const a0 = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		a0[ i ] = ( ( ( i * 37 ) + 11 ) % 23 ) - 11.0 + ( 0.1 * ( i % 7 ) );
	}
	const a = new Float64Array( a0 );
	const d = new Float64Array( N );
	for ( i = 0; i < N; i++ ) {
		d[ i ] = 1.0;
	}
	const sva = initialSva( a, M, N );
	const V = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		V[ ( i * N ) + i ] = 1.0;
	}
	const work = new Float64Array( M );
	info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, 1.0e-13, 30, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info (converged)' );

	// The same transformations are applied to A and V, so A_out == A_in * V:
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			av = 0.0;
			for ( k = 0; k < N; k++ ) {
				av += a0[ ( k * M ) + i ] * V[ ( j * N ) + k ];
			}
			assertClose( a[ ( j * M ) + i ], av, 1e-10, 'A vs A0*V (' + i + ',' + j + ')' );
		}
	}

	// SVA(p) is the 2-norm of column p of A*diag(D):
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < M; i++ ) {
			s += a[ ( j * M ) + i ] * a[ ( j * M ) + i ];
		}
		nrm = Math.sqrt( s ) * Math.abs( d[ j ] );
		assertClose( sva[ j ], nrm, 1e-10, 'sva[' + j + ']' );
	}

	// Columns are mutually orthogonal (every block pair was rotated):
	maxcos = 0.0;
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			dot = 0.0;
			for ( i = 0; i < M; i++ ) {
				dot += a[ ( j * M ) + i ] * d[ j ] * a[ ( k * M ) + i ] * d[ k ];
			}
			maxcos = Math.max( maxcos, Math.abs( dot ) / ( sva[ j ] * sva[ k ] ) );
		}
	}
	assert.ok( maxcos < 1e-10, 'columns orthogonal: max |cos| = ' + maxcos );
});

// Property checks for the scaled, zero-column, near-parallel and extreme-range branches. //

/**
* Generates a deterministic M-by-N column-major test matrix.
*
* @private
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {integer} seed - seed
* @returns {Float64Array} matrix
*/
function genMatrix( M, N, seed ) {
	let i;
	const a = new Float64Array( M * N );
	for ( i = 0; i < M * N; i++ ) {
		a[ i ] = ( ( ( ( i * 37 ) + 11 + seed ) % 23 ) - 11.0 ) + ( 0.1 * ( i % 7 ) );
	}
	return a;
}

/**
* Scales column `j` of an M-by-N column-major matrix in place.
*
* @private
* @param {Float64Array} a - matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @param {number} s - scale factor
*/
function scaleColumn( a, M, j, s ) {
	let i;
	for ( i = 0; i < M; i++ ) {
		a[ ( j * M ) + i ] *= s;
	}
}

/**
* Returns the largest absolute entry of column `j`.
*
* @private
* @param {Float64Array} a - matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @returns {number} max absolute entry
*/
function colMax( a, M, j ) {
	let m;
	let i;
	m = 0.0;
	for ( i = 0; i < M; i++ ) {
		m = Math.max( m, Math.abs( a[ ( j * M ) + i ] ) );
	}
	return m;
}

/**
* Returns the 2-norm of column `j`, computed in units of `s` to avoid over/underflow.
*
* @private
* @param {Float64Array} a - matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @param {number} s - scale
* @returns {number} scaled column norm (norm / s)
*/
function scaledColNorm( a, M, j, s ) {
	let v;
	let t;
	let i;
	t = 0.0;
	for ( i = 0; i < M; i++ ) {
		v = a[ ( j * M ) + i ] / s;
		t += v * v;
	}
	return Math.sqrt( t );
}

/**
* Returns the 2-norm of column `j`, scaled by its own largest entry.
*
* @private
* @param {Float64Array} a - matrix
* @param {integer} M - number of rows
* @param {integer} j - column index
* @returns {number} column norm
*/
function colNorm( a, M, j ) {
	const m = colMax( a, M, j );
	if ( m === 0.0 ) {
		return 0.0;
	}
	return scaledColNorm( a, M, j, m ) * m;
}

/**
* Runs `dgsvj0` with JOBV='compute-v' (V = I on entry) and checks the defining properties of the one-sided Jacobi sweep.
*
* -   `A_out = A_in * V_out`, unless `opts.prod` is `null` (A and V receive the same transformations, so `A_out*diag(D_out) = A_in*diag(D_in)*J` and `V_out*diag(D_out) = diag(D_in)*J`).
* -   `J = diag(D_in)^-1 * V_out * diag(D_out)` is orthogonal.
* -   `SVA(j) = ||A_out(:,j)|| * |D_out(j)|`, sorted non-increasingly.
* -   On convergence (INFO = 0), the columns of `A_out*diag(D_out)` are mutually orthogonal.
*
* @private
* @param {Float64Array} a0 - input matrix (not modified)
* @param {Array} d0 - input scaling D
* @param {integer} M - number of rows
* @param {integer} N - number of columns
* @param {Object} opts - tolerances `{ prod, orth, sva, cos }`
* @returns {Object} outputs
*/
function runAndCheck( a0, d0, M, N, opts ) {
	let maxcos;
	let info;
	let dot;
	let av;
	let s;
	let i;
	let j;
	let k;
	const a = new Float64Array( a0 );
	const d = new Float64Array( d0 );
	const sva = new Float64Array( N );
	const V = new Float64Array( N * N );
	const work = new Float64Array( M );

	s = 0.0;
	for ( i = 0; i < M * N; i++ ) {
		s = Math.max( s, Math.abs( a0[ i ] ) );
	}
	for ( j = 0; j < N; j++ ) {
		sva[ j ] = colNorm( a0, M, j ) * d0[ j ];
		V[ ( j * N ) + j ] = 1.0;
	}
	info = ndarrayFn( 'compute-v', M, N, a, 1, M, 0, d, 1, 0, sva, 1, 0, 0, V, 1, N, 0, EPS, SFMIN, 1.0e-13, 30, work, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info (converged)' );

	// A_out = A_in * V_out (in units of max|A_in|); skipped (`prod: null`) when the Gram-Schmidt branch, which does not update V, is exercised:
	for ( j = 0; j < N && opts.prod !== null; j++ ) {
		for ( i = 0; i < M; i++ ) {
			av = 0.0;
			for ( k = 0; k < N; k++ ) {
				av += ( a0[ ( k * M ) + i ] / s ) * V[ ( j * N ) + k ];
			}
			assert.ok( Math.abs( ( a[ ( j * M ) + i ] / s ) - av ) <= opts.prod, 'A_out = A_in*V_out at (' + i + ',' + j + ')' );
		}
	}

	// J = diag(D_in)^-1 * V_out * diag(D_out) is orthogonal:
	for ( j = 0; j < N; j++ ) {
		for ( k = 0; k < N; k++ ) {
			dot = 0.0;
			for ( i = 0; i < N; i++ ) {
				dot += ( V[ ( j * N ) + i ] * d[ j ] / d0[ i ] ) * ( V[ ( k * N ) + i ] * d[ k ] / d0[ i ] );
			}
			assert.ok( Math.abs( dot - ( ( j === k ) ? 1.0 : 0.0 ) ) <= opts.orth, 'J^T J = I at (' + j + ',' + k + ')' );
		}
	}

	// SVA(j) = ||A_out(:,j)|| * |D_out(j)|, sorted non-increasingly:
	for ( j = 0; j < N; j++ ) {
		av = colNorm( a, M, j ) * Math.abs( d[ j ] );
		assert.ok( Math.abs( sva[ j ] - av ) <= opts.sva * av, 'sva[' + j + ']: ' + sva[ j ] + ' vs ' + av );
		if ( j > 0 ) {
			assert.ok( sva[ j ] <= sva[ j - 1 ], 'sva sorted at ' + j );
		}
	}

	// Columns of A_out*diag(D_out) are mutually orthogonal:
	maxcos = 0.0;
	for ( j = 0; j < N; j++ ) {
		for ( k = j + 1; k < N; k++ ) {
			if ( sva[ j ] === 0.0 || sva[ k ] === 0.0 ) {
				continue;
			}
			dot = 0.0;
			for ( i = 0; i < M; i++ ) {
				dot += ( a[ ( j * M ) + i ] / colMax( a, M, j ) ) * ( a[ ( k * M ) + i ] / colMax( a, M, k ) );
			}
			maxcos = Math.max( maxcos, Math.abs( dot ) / ( scaledColNorm( a, M, j, colMax( a, M, j ) ) * scaledColNorm( a, M, k, colMax( a, M, k ) ) ) ); // eslint-disable-line max-len
		}
	}
	assert.ok( maxcos <= opts.cos, 'columns orthogonal: max |cos| = ' + maxcos );
	return {
		'a': a,
		'd': d,
		'sva': sva,
		'V': V
	};
}

test( 'ndarray: non-unit D in a single column block (fast-rotation D branches)', function t() {
	runAndCheck( genMatrix( 6, 5, 0 ), [ 2.0, 0.5, 3.0, 0.25, 1.5 ], 6, 5, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: non-unit D across two column blocks (off-diagonal D branches)', function t() {
	let j;
	const d = [];
	for ( j = 0; j < 10; j++ ) {
		d.push( [ 2.0, 0.5, 0.3, 4.0, 1.0, 0.7 ][ j % 6 ] );
	}
	runAndCheck( genMatrix( 12, 10, 3 ), d, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: huge columns (norms above sqrt(big)) use the scaled dot product and dlassq', function t() {
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 5, 4, 1 );
	const a2 = genMatrix( 12, 10, 1 );
	for ( i = 0; i < a1.length; i++ ) {
		a1[ i ] *= 1e160;
	}
	for ( i = 0; i < a2.length; i++ ) {
		a2[ i ] *= 1e160;
	}
	runAndCheck( a1, ones, 5, 4, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	runAndCheck( a2, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: tiny columns (norms below sqrt(sfmin)) use the scaled dot product and dlassq', function t() {
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 5, 4, 2 );
	const a2 = genMatrix( 12, 10, 2 );
	for ( i = 0; i < a1.length; i++ ) {
		a1[ i ] *= 1e-160;
	}
	for ( i = 0; i < a2.length; i++ ) {
		a2[ i ] *= 1e-160;
	}
	runAndCheck( a1, ones, 5, 4, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	runAndCheck( a2, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: nearly parallel columns trigger the SVA recomputation after cancellation', function t() {
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 6, 4, 6 );
	const a2 = genMatrix( 12, 10, 6 );
	for ( i = 0; i < 6; i++ ) {
		a1[ 6 + i ] = a1[ i ] * ( 1.0 + ( 1e-6 * ( i % 3 ) ) );
		a1[ 18 + i ] = a1[ 12 + i ] + ( 1e-6 * ( ( i * 5 ) % 7 ) );
	}
	for ( i = 0; i < 12; i++ ) {
		a2[ 108 + i ] = a2[ i ] * ( 1.0 + ( 1e-6 * ( i % 3 ) ) );
		a2[ 96 + i ] = a2[ 12 + i ] * ( 1.0 - ( 1e-6 * ( i % 4 ) ) );
	}
	runAndCheck( a1, ones, 6, 4, {
		'prod': 1e-12,
		'orth': 1e-9,
		'sva': 1e-9,
		'cos': 1e-9
	});
	runAndCheck( a2, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-9,
		'sva': 1e-9,
		'cos': 1e-9
	});
});

test( 'ndarray: zero columns are skipped and sorted last', function t() {
	let out;
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 6, 5, 7 );
	const a2 = genMatrix( 12, 10, 7 );
	scaleColumn( a1, 6, 2, 0.0 );
	scaleColumn( a2, 12, 3, 0.0 );
	scaleColumn( a2, 12, 9, 0.0 );
	out = runAndCheck( a1, ones, 6, 5, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	assert.equal( out.sva[ 4 ], 0.0, 'zero column sorted last' );
	for ( i = 0; i < 6; i++ ) {
		assert.ok( out.a[ 24 + i ] === 0.0, 'zero column stays zero' );
	}
	out = runAndCheck( a2, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	assert.equal( out.sva[ 8 ], 0.0, 'zero column sorted last (8)' );
	assert.equal( out.sva[ 9 ], 0.0, 'zero column sorted last (9)' );
});

test( 'ndarray: Gram-Schmidt step for columns with a norm ratio beyond 1/small (N=2 closed form)', function t() {
	let dot;
	let nrm;
	let out;
	let i;
	const a0 = genMatrix( 3, 2, 5 );
	scaleColumn( a0, 3, 0, 1e150 );
	scaleColumn( a0, 3, 1, 1e-150 );
	out = runAndCheck( a0, [ 1.0, 1.0 ], 3, 2, {
		'prod': null,
		'orth': 0.0,
		'sva': 1e-14,
		'cos': 1e-14
	});

	// The huge column is untouched and the tiny one becomes q - (q.p^)p^:
	nrm = 0.0;
	dot = 0.0;
	for ( i = 0; i < 3; i++ ) {
		nrm += ( a0[ i ] / 1e150 ) * ( a0[ i ] / 1e150 );
		dot += ( a0[ i ] / 1e150 ) * ( a0[ 3 + i ] * 1e150 );
	}
	for ( i = 0; i < 3; i++ ) {
		assert.equal( out.a[ i ], a0[ i ], 'p column unchanged' );
		assertClose( out.a[ 3 + i ] * 1e150, ( a0[ 3 + i ] * 1e150 ) - ( ( dot / nrm ) * ( a0[ i ] / 1e150 ) ), 1e-14, 'q column' );
	}
	assert.deepEqual( Array.from( out.V ), [ 1.0, 0.0, 0.0, 1.0 ], 'V unchanged by the Gram-Schmidt step' );
	assert.deepEqual( Array.from( out.d ), [ 1.0, 1.0 ], 'D unchanged by the Gram-Schmidt step' );
});

test( 'ndarray: Gram-Schmidt steps in the diagonal and off-diagonal blocks orthogonalize the columns', function t() {
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 4, 3, 5 );
	const a2 = genMatrix( 12, 10, 4 );
	scaleColumn( a1, 4, 0, 1e150 );
	scaleColumn( a1, 4, 1, 1e-150 );
	scaleColumn( a2, 12, 0, 1e-150 );
	scaleColumn( a2, 12, 1, 1e150 );
	scaleColumn( a2, 12, 8, 1e-150 );
	scaleColumn( a2, 12, 9, 1e150 );
	runAndCheck( a1, ones, 4, 3, {
		'prod': null,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	runAndCheck( a2, ones, 12, 10, {
		'prod': null,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
});

test( 'ndarray: nearly parallel huge columns recompute SVA with dlassq after cancellation', function t() {
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a1 = genMatrix( 6, 4, 6 );
	const a2 = genMatrix( 12, 10, 6 );
	for ( i = 0; i < 6; i++ ) {
		a1[ 6 + i ] = a1[ i ] * ( 1.0 + ( 1e-8 * ( i % 3 ) ) );
		a1[ 18 + i ] = a1[ 12 + i ] + ( 1e-8 * ( ( i * 5 ) % 7 ) );
	}
	for ( i = 0; i < 12; i++ ) {
		a2[ 108 + i ] = a2[ i ] * ( 1.0 + ( 1e-6 * ( i % 3 ) ) );
		a2[ 96 + i ] = a2[ 12 + i ] * ( 1.0 - ( 1e-6 * ( i % 4 ) ) );
	}
	for ( i = 0; i < a1.length; i++ ) {
		a1[ i ] *= 1e160;
	}
	for ( i = 0; i < a2.length; i++ ) {
		a2[ i ] *= 1e160;
	}
	runAndCheck( a1, ones, 6, 4, {
		'prod': 1e-12,
		'orth': 1e-9,
		'sva': 1e-9,
		'cos': 1e-6
	});
	runAndCheck( a2, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-9,
		'sva': 1e-9,
		'cos': 1e-9
	});
});

test( 'ndarray: a zero column inside the first block is skipped in the off-diagonal sweep', function t() {
	let out;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const a = genMatrix( 12, 10, 7 );
	scaleColumn( a, 12, 1, 0.0 );
	scaleColumn( a, 12, 4, 0.0 );
	scaleColumn( a, 12, 6, 0.0 );
	out = runAndCheck( a, ones, 12, 10, {
		'prod': 1e-12,
		'orth': 1e-12,
		'sva': 1e-12,
		'cos': 1e-12
	});
	assert.deepEqual( Array.from( out.sva.slice( 7 ) ), [ 0.0, 0.0, 0.0 ], 'zero columns sorted last' );
});

test( 'ndarray: small-norm columns (norms below one) across two blocks', function t() {
	let seed;
	let a;
	let i;
	const ones = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	for ( seed = 10; seed < 16; seed++ ) {
		a = genMatrix( 12, 10, seed );
		for ( i = 0; i < a.length; i++ ) {
			a[ i ] *= 1e-3;
		}
		runAndCheck( a, ones, 12, 10, {
			'prod': 1e-12,
			'orth': 1e-12,
			'sva': 1e-12,
			'cos': 1e-12
		});
	}
});
