// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztgevc from './../lib/ndarray.js';

// FIXTURES //

import right_all from './fixtures/right_all.json' with { type: 'json' };
import left_all from './fixtures/left_all.json' with { type: 'json' };
import both_all from './fixtures/both_all.json' with { type: 'json' };
import right_selected from './fixtures/right_selected.json' with { type: 'json' };
import right_backtransform from './fixtures/right_backtransform.json' with { type: 'json' };
import both_2x2 from './fixtures/both_2x2.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function extractRaw( C, count ) {
	const Cv = reinterpret( C, 0 );
	const result = [];
	let i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

/**
* Set up the 3x3 upper triangular S and P matrices.
*/
function setup3x3() {
	const LDS = 4;
	const S = new Complex128Array( LDS * 4 );
	const P = new Complex128Array( LDS * 4 );
	const Sv = reinterpret( S, 0 );
	const Pv = reinterpret( P, 0 );
	// S(0,0)=(2,1), S(0,1)=(1,0.5), S(0,2)=(0.5,0)
	// S(1,1)=(3,-1), S(1,2)=(0,1)
	// S(2,2)=(1,2)
	Sv[ 2 * ( 0 + 0 * LDS ) ] = 2; Sv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 1;
	Sv[ 2 * ( 0 + 1 * LDS ) ] = 1; Sv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0.5;
	Sv[ 2 * ( 0 + 2 * LDS ) ] = 0.5; Sv[ 2 * ( 0 + 2 * LDS ) + 1 ] = 0;
	Sv[ 2 * ( 1 + 1 * LDS ) ] = 3; Sv[ 2 * ( 1 + 1 * LDS ) + 1 ] = -1;
	Sv[ 2 * ( 1 + 2 * LDS ) ] = 0; Sv[ 2 * ( 1 + 2 * LDS ) + 1 ] = 1;
	Sv[ 2 * ( 2 + 2 * LDS ) ] = 1; Sv[ 2 * ( 2 + 2 * LDS ) + 1 ] = 2;
	// P(0,0)=(1,0), P(0,1)=(0.5,0), P(0,2)=(0,0)
	// P(1,1)=(2,0), P(1,2)=(0.25,0)
	// P(2,2)=(1.5,0)
	Pv[ 2 * ( 0 + 0 * LDS ) ] = 1; Pv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 1 * LDS ) ] = 0.5; Pv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 2 * LDS ) ] = 0; Pv[ 2 * ( 0 + 2 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 1 * LDS ) ] = 2; Pv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 2 * LDS ) ] = 0.25; Pv[ 2 * ( 1 + 2 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 2 + 2 * LDS ) ] = 1.5; Pv[ 2 * ( 2 + 2 * LDS ) + 1 ] = 0;
	return { S: S, P: P, LDS: LDS };
}

function setup2x2() {
	const LDS = 4;
	const S = new Complex128Array( LDS * 4 );
	const P = new Complex128Array( LDS * 4 );
	const Sv = reinterpret( S, 0 );
	const Pv = reinterpret( P, 0 );
	Sv[ 2 * ( 0 + 0 * LDS ) ] = 1; Sv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Sv[ 2 * ( 0 + 1 * LDS ) ] = 0.5; Sv[ 2 * ( 0 + 1 * LDS ) + 1 ] = 0.5;
	Sv[ 2 * ( 1 + 1 * LDS ) ] = 2; Sv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 0 + 0 * LDS ) ] = 1; Pv[ 2 * ( 0 + 0 * LDS ) + 1 ] = 0;
	Pv[ 2 * ( 1 + 1 * LDS ) ] = 1; Pv[ 2 * ( 1 + 1 * LDS ) + 1 ] = 0;
	return { S: S, P: P, LDS: LDS };
}

// TESTS //

test( 'ztgevc: right eigenvectors, all (SIDE=R, HOWMNY=A)', function t() {
	const tc = right_all;
	const sp = setup3x3();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ false, false, false ];
	const M = [ 0 ];
	const info = ztgevc( 'right', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: left eigenvectors, all (SIDE=L, HOWMNY=A)', function t() {
	const tc = left_all;
	const sp = setup3x3();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ false, false, false ];
	const M = [ 0 ];
	const info = ztgevc( 'left', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
});

test( 'ztgevc: both eigenvectors, all (SIDE=B, HOWMNY=A)', function t() {
	const tc = both_all;
	const sp = setup3x3();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ false, false, false ];
	const M = [ 0 ];
	const info = ztgevc( 'both', 'all', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: selected right eigenvectors (HOWMNY=S)', function t() {
	const tc = right_selected;
	const sp = setup3x3();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ true, false, true ];
	const M = [ 0 ];
	const info = ztgevc( 'right', 'selected', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 2, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: right backtransform (HOWMNY=B)', function t() {
	const tc = right_backtransform;
	const sp = setup3x3();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const VRv = reinterpret( VR, 0 );
	let i;
	// Set VR = identity
	for ( i = 0; i < 3; i++ ) {
		VRv[ 2 * ( i + i * sp.LDS ) ] = 1.0;
	}
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ false, false, false ];
	const M = [ 0 ];
	const info = ztgevc( 'right', 'backtransform', SELECT, 1, 0, 3, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 3, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});

test( 'ztgevc: N=0 quick return', function t() {
	const S = new Complex128Array( 1 );
	const P = new Complex128Array( 1 );
	const VL = new Complex128Array( 1 );
	const VR = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const SELECT = [];
	const M = [ 0 ];
	const info = ztgevc( 'right', 'all', SELECT, 1, 0, 0, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assert.equal( M[ 0 ], 0 );
});

test( 'ztgevc: 2x2 system, both', function t() {
	const tc = both_2x2;
	const sp = setup2x2();
	const VL = new Complex128Array( sp.LDS * 4 );
	const VR = new Complex128Array( sp.LDS * 4 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const SELECT = [ false, false ];
	const M = [ 0 ];
	const info = ztgevc( 'both', 'all', SELECT, 1, 0, 2, sp.S, 1, sp.LDS, 0, sp.P, 1, sp.LDS, 0, VL, 1, sp.LDS, 0, VR, 1, sp.LDS, 0, 2, M, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.m );
	assertArrayClose( extractRaw( VL, tc.vl.length ), tc.vl, 1e-12, 'vl' );
	assertArrayClose( extractRaw( VR, tc.vr.length ), tc.vr, 1e-12, 'vr' );
});


// PROPERTY-BASED TESTS //

/**
* Builds column-major N-by-N complex matrices from a function returning `[re, im]` for each upper-triangular entry (i <= j).
*/
function buildPair( N, sfcn, pfcn ) {
	const S = new Complex128Array( N * N );
	const P = new Complex128Array( N * N );
	const Sv = reinterpret( S, 0 );
	const Pv = reinterpret( P, 0 );
	let v;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			v = sfcn( i, j );
			Sv[ 2 * ( i + ( j * N ) ) ] = v[ 0 ];
			Sv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = v[ 1 ];
			v = pfcn( i, j );
			Pv[ 2 * ( i + ( j * N ) ) ] = v[ 0 ];
			Pv[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = v[ 1 ];
		}
	}
	return { 'S': S, 'P': P, 'N': N };
}

function get( Av, N, i, j ) {
	return [ Av[ 2 * ( i + ( j * N ) ) ], Av[ ( 2 * ( i + ( j * N ) ) ) + 1 ] ];
}

function cmul( a, b ) {
	return [ ( a[ 0 ] * b[ 0 ] ) - ( a[ 1 ] * b[ 1 ] ), ( a[ 0 ] * b[ 1 ] ) + ( a[ 1 ] * b[ 0 ] ) ];
}

function conj( a ) {
	return [ a[ 0 ], -a[ 1 ] ];
}

function cabs1( a ) {
	return Math.abs( a[ 0 ] ) + Math.abs( a[ 1 ] );
}

function norm1( Av, N ) {
	let best = 0.0;
	let s;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			s += cabs1( get( Av, N, i, j ) );
		}
		best = Math.max( best, s );
	}
	return best;
}

/**
* Asserts that column `col` of `V` is a (left or right) eigenvector of the pencil for eigenvalue index `k`, normalized so its largest |re|+|im| is 1.
*
* Right: beta*S*x - alpha*P*x = 0. Left: conj(beta)*S^H*y - conj(alpha)*P^H*y = 0, with alpha = S(k,k), beta = P(k,k).
*/
function assertEigvec( pair, V, ldv, col, k, left, tol, msg ) {
	const N = pair.N;
	const Sv = reinterpret( pair.S, 0 );
	const Pv = reinterpret( pair.P, 0 );
	const Vv = reinterpret( V, 0 );
	const alpha = get( Sv, N, k, k );
	const beta = get( Pv, N, k, k );
	const x = [];
	let resid = 0.0;
	let xmax = 0.0;
	let sx;
	let px;
	let s;
	let p;
	let t;
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		x.push( [ Vv[ 2 * ( i + ( col * ldv ) ) ], Vv[ ( 2 * ( i + ( col * ldv ) ) ) + 1 ] ] );
		assert.ok( Number.isFinite( x[ i ][ 0 ] ) && Number.isFinite( x[ i ][ 1 ] ), msg + ': finite component ' + i );
		xmax = Math.max( xmax, cabs1( x[ i ] ) );
	}
	assert.ok( Math.abs( xmax - 1.0 ) <= 1e-14, msg + ': normalized (max |re|+|im| = 1), got ' + xmax );
	for ( i = 0; i < N; i++ ) {
		sx = [ 0.0, 0.0 ];
		px = [ 0.0, 0.0 ];
		for ( j = 0; j < N; j++ ) {
			if ( left ) {
				s = conj( get( Sv, N, j, i ) );
				p = conj( get( Pv, N, j, i ) );
			} else {
				s = get( Sv, N, i, j );
				p = get( Pv, N, i, j );
			}
			t = cmul( s, x[ j ] );
			sx[ 0 ] += t[ 0 ];
			sx[ 1 ] += t[ 1 ];
			t = cmul( p, x[ j ] );
			px[ 0 ] += t[ 0 ];
			px[ 1 ] += t[ 1 ];
		}
		if ( left ) {
			sx = cmul( conj( beta ), sx );
			px = cmul( conj( alpha ), px );
		} else {
			sx = cmul( beta, sx );
			px = cmul( alpha, px );
		}
		resid = Math.max( resid, cabs1( [ sx[ 0 ] - px[ 0 ], sx[ 1 ] - px[ 1 ] ] ) );
	}
	const scale = ( cabs1( beta ) * norm1( Sv, N ) ) + ( cabs1( alpha ) * norm1( Pv, N ) );
	assert.ok( resid <= tol * scale * N, msg + ': residual ' + resid + ' > ' + ( tol * scale * N ) );
}

function run( pair, side, howmny, SELECT, VL, VR, mm ) {
	const N = pair.N;
	const M = [ -1 ];
	const info = ztgevc( side, howmny, SELECT, 1, 0, N, pair.S, 1, N, 0, pair.P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, mm, M, new Complex128Array( 2 * N ), 1, 0, new Float64Array( 2 * N ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return M[ 0 ];
}

function generic4() {
	return buildPair( 4, function s( i, j ) {
		if ( i === j ) {
			return [ i + 1, 0.5 - ( 0.3 * i ) ];
		}
		return [ 0.4 + ( 0.1 * i ) - ( 0.05 * j ), 0.2 * ( j - i ) ];
	}, function p( i, j ) {
		if ( i === j ) {
			return [ 1.0 + ( 0.5 * i ), 0.0 ];
		}
		return [ 0.1 * ( i + j ), -0.15 * i ];
	});
}

test( 'ztgevc: selected left eigenvectors satisfy y^H*(beta*S - alpha*P) = 0', function t() {
	const pair = generic4();
	const VL = new Complex128Array( 16 );
	const VR = new Complex128Array( 16 );
	const m = run( pair, 'left', 'selected', [ false, true, false, true ], VL, VR, 2 );
	assert.equal( m, 2 );
	assertEigvec( pair, VL, 4, 0, 1, true, 1e-14, 'left col 0 (eig 1)' );
	assertEigvec( pair, VL, 4, 1, 3, true, 1e-14, 'left col 1 (eig 3)' );
	// Left eigenvector for eigenvalue k is zero above row k:
	const VLv = reinterpret( VL, 0 );
	assert.equal( VLv[ 0 ], 0.0 );
	assert.equal( VLv[ 1 ], 0.0 );
});

test( 'ztgevc: both sides, all, generic 4x4 pencil satisfies the eigenvector property', function t() {
	const pair = generic4();
	const VL = new Complex128Array( 16 );
	const VR = new Complex128Array( 16 );
	let k;
	assert.equal( run( pair, 'both', 'all', [], VL, VR, 4 ), 4 );
	for ( k = 0; k < 4; k++ ) {
		assertEigvec( pair, VL, 4, k, k, true, 1e-14, 'left ' + k );
		assertEigvec( pair, VR, 4, k, k, false, 1e-14, 'right ' + k );
	}
});

/**
* Returns `V*x` normalized to max |re|+|im| = 1 where x is column `col` of `X` (all N rows).
*/
function backtransformed( V, X, N, col ) {
	const Vv = reinterpret( V, 0 );
	const Xv = reinterpret( X, 0 );
	const out = [];
	let xmax = 0.0;
	let s;
	let t;
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		s = [ 0.0, 0.0 ];
		for ( j = 0; j < N; j++ ) {
			t = cmul( get( Vv, N, i, j ), get( Xv, N, j, col ) );
			s[ 0 ] += t[ 0 ];
			s[ 1 ] += t[ 1 ];
		}
		out.push( s[ 0 ], s[ 1 ] );
		xmax = Math.max( xmax, cabs1( s ) );
	}
	for ( i = 0; i < out.length; i++ ) {
		out[ i ] /= xmax;
	}
	return out;
}

function dense4( seed ) {
	const V = new Complex128Array( 16 );
	const Vv = reinterpret( V, 0 );
	let i;
	for ( i = 0; i < 32; i++ ) {
		Vv[ i ] = Math.sin( ( seed * 7.3 ) + ( i * 1.7 ) );
	}
	for ( i = 0; i < 4; i++ ) {
		Vv[ 2 * ( i + ( 4 * i ) ) ] += 3.0;
	}
	return V;
}

test( 'ztgevc: both sides, backtransform equals V*(eigenvectors of the triangular pair)', function t() {
	const pair = generic4();
	const VLa = new Complex128Array( 16 );
	const VRa = new Complex128Array( 16 );
	const QL = dense4( 1 );
	const QR = dense4( 2 );
	const VL = new Complex128Array( reinterpret( QL, 0 ) );
	const VR = new Complex128Array( reinterpret( QR, 0 ) );
	let k;
	run( pair, 'both', 'all', [], VLa, VRa, 4 );
	assert.equal( run( pair, 'both', 'backtransform', [], VL, VR, 4 ), 4 );
	for ( k = 0; k < 4; k++ ) {
		assertArrayClose( extractRaw( VL, 32 ).slice( 8 * k, 8 * ( k + 1 ) ), backtransformed( QL, VLa, 4, k ), 1e-13, 'VL col ' + k );
		assertArrayClose( extractRaw( VR, 32 ).slice( 8 * k, 8 * ( k + 1 ) ), backtransformed( QR, VRa, 4, k ), 1e-13, 'VR col ' + k );
	}
});

test( 'ztgevc: zero eigenvalue pair (S(k,k) = P(k,k) = 0) yields the unit vector e_k on both sides', function t() {
	const pair = buildPair( 3, function s( i, j ) {
		if ( i === j ) {
			return ( i === 1 ) ? [ 0.0, 0.0 ] : [ i + 1, 0.5 ];
		}
		return [ 0.3, -0.2 ];
	}, function p( i, j ) {
		if ( i === j ) {
			return ( i === 1 ) ? [ 0.0, 0.0 ] : [ 1.0 + i, 0.0 ];
		}
		return [ 0.2, 0.1 ];
	});
	const VL = new Complex128Array( 9 );
	const VR = new Complex128Array( 9 );
	assert.equal( run( pair, 'both', 'all', [], VL, VR, 3 ), 3 );
	assert.deepEqual( extractRaw( VL, 18 ).slice( 6, 12 ), [ 0, 0, 1, 0, 0, 0 ] );
	assert.deepEqual( extractRaw( VR, 18 ).slice( 6, 12 ), [ 0, 0, 1, 0, 0, 0 ] );
	assertEigvec( pair, VL, 3, 0, 0, true, 1e-14, 'left 0' );
	assertEigvec( pair, VR, 3, 2, 2, false, 1e-14, 'right 2' );
});

test( 'ztgevc: infinite eigenvalue (P(k,k) = 0) and zero eigenvalue (S(k,k) = 0) satisfy the property', function t() {
	const pair = buildPair( 3, function s( i, j ) {
		if ( i === j ) {
			return ( i === 2 ) ? [ 0.0, 0.0 ] : [ 2.0 + i, -1.0 ];
		}
		return [ 0.5, 0.25 ];
	}, function p( i, j ) {
		if ( i === j ) {
			return ( i === 0 ) ? [ 0.0, 0.0 ] : [ 1.0, 0.0 ];
		}
		return [ -0.3, 0.4 ];
	});
	const VL = new Complex128Array( 9 );
	const VR = new Complex128Array( 9 );
	let k;
	run( pair, 'both', 'all', [], VL, VR, 3 );
	for ( k = 0; k < 3; k++ ) {
		assertEigvec( pair, VL, 3, k, k, true, 1e-14, 'left ' + k );
		assertEigvec( pair, VR, 3, k, k, false, 1e-14, 'right ' + k );
	}
});

test( 'ztgevc: tiny diagonal entries (|beta| or |alpha| ~ 1e-300) trigger rescaling and still satisfy the property', function t() {
	const pair = buildPair( 4, function s( i, j ) {
		if ( i === j ) {
			return ( i === 2 ) ? [ 1e-300, 2e-300 ] : [ i + 1, 0.5 ];
		}
		return [ 0.3 - ( 0.1 * i ), 0.2 ];
	}, function p( i, j ) {
		if ( i === j ) {
			return ( i === 1 ) ? [ 3e-300, 0.0 ] : [ 1.0 + ( 0.25 * i ), 0.0 ];
		}
		return [ 0.15, -0.1 * j ];
	});
	const VL = new Complex128Array( 16 );
	const VR = new Complex128Array( 16 );
	let k;
	assert.equal( run( pair, 'both', 'all', [], VL, VR, 4 ), 4 );
	for ( k = 0; k < 4; k++ ) {
		assertEigvec( pair, VL, 4, k, k, true, 1e-14, 'left ' + k );
		assertEigvec( pair, VR, 4, k, k, false, 1e-14, 'right ' + k );
	}
});

test( 'ztgevc: backtransform with a zero transformation matrix yields zero eigenvectors', function t() {
	const pair = generic4();
	const VL = new Complex128Array( 16 );
	const VR = new Complex128Array( 16 );
	const VLv = reinterpret( VL, 0 );
	const VRv = reinterpret( VR, 0 );
	let i;
	assert.equal( run( pair, 'both', 'backtransform', [], VL, VR, 4 ), 4 );
	for ( i = 0; i < 32; i++ ) {
		assert.equal( VLv[ i ], 0.0, 'VL[' + i + ']' );
		assert.equal( VRv[ i ], 0.0, 'VR[' + i + ']' );
	}
});

test( 'ztgevc: defective 24x24 Jordan pencil (repeated eigenvalue) exercises the overflow guards and returns +-e_1 / +-e_N', function t() {
	const N = 24;
	const pair = buildPair( N, function s( i, j ) {
		if ( i === j || i === j - 1 ) {
			return [ 1.0, 0.0 ];
		}
		return [ 0.0, 0.0 ];
	}, function p( i, j ) {
		return ( i === j ) ? [ 1.0, 0.0 ] : [ 0.0, 0.0 ];
	});
	const VL = new Complex128Array( N * N );
	const VR = new Complex128Array( N * N );
	const VLv = reinterpret( VL, 0 );
	const VRv = reinterpret( VR, 0 );
	let k;
	assert.equal( run( pair, 'both', 'all', [], VL, VR, N ), N );
	for ( k = 0; k < N; k++ ) {
		assertEigvec( pair, VL, N, k, k, true, 1e-14, 'left ' + k );
		assertEigvec( pair, VR, N, k, k, false, 1e-14, 'right ' + k );
	}
	// The true eigenvectors of a single Jordan block are e_N (left) and e_1 (right):
	assert.equal( Math.abs( VLv[ 2 * ( N - 1 ) ] ), 1.0, 'VL(N-1,0)' );
	assert.ok( Math.abs( VLv[ 2 * ( N - 2 ) ] ) <= 1e-15, 'VL(N-2,0) small' );
	assert.equal( Math.abs( VRv[ 2 * N * ( N - 1 ) ] ), 1.0, 'VR(0,N-1)' );
	assert.ok( Math.abs( VRv[ ( 2 * N * ( N - 1 ) ) + 2 ] ) <= 1e-15, 'VR(1,N-1) small' );
});
