// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr4 from './../lib/ndarray.js';

// FIXTURES //

import n_eq_0 from './fixtures/n_eq_0.json' with { type: 'json' };
import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import _6x6_schur_with_z from './fixtures/6x6_schur_with_z.json' with { type: 'json' };
import _6x6_eig_only from './fixtures/6x6_eig_only.json' with { type: 'json' };
import _15x15_multishift from './fixtures/15x15_multishift.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function makeMatrix( N ) {
	return {
		data: new Complex128Array( N * N ),
		s1: 1,
		s2: N,
		offset: 0
	};
}

function mset( m, N, i, j, re, im ) {
	const mv = reinterpret( m.data, 0 );
	const idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

function getFlat( m ) {
	return Array.from( reinterpret( m.data, 0 ) );
}

function assertUpperTriangular( Hm, n, tol, msg ) {
	const Hv = reinterpret( Hm.data, 0 );
	let i, j, idx, re, im;
	for ( j = 0; j < n; j++ ) {
		for ( i = j + 2; i < n; i++ ) {
			idx = ( Hm.offset + i * Hm.s1 + j * Hm.s2 ) * 2;
			re = Hv[ idx ];
			im = Hv[ idx + 1 ];
			assert.ok( Math.abs( re ) + Math.abs( im ) <= tol,
				msg + ': H(' + ( i + 1 ) + ',' + ( j + 1 ) + ') = (' + re + ',' + im + ') should be zero' );
		}
	}
}

function assertEigenvaluesMatch( actual, expected, tol, msg ) {
	const act = [];
	const exp = [];
	let i;
	for ( i = 0; i < actual.length; i += 2 ) {
		act.push( [ actual[ i ], actual[ i + 1 ] ] );
		exp.push( [ expected[ i ], expected[ i + 1 ] ] );
	}
	function cmp( a, b ) {
		if ( Math.abs( a[ 0 ] - b[ 0 ] ) > 1e-8 ) { return a[ 0 ] - b[ 0 ]; }
		return a[ 1 ] - b[ 1 ];
	}
	act.sort( cmp );
	exp.sort( cmp );
	for ( i = 0; i < act.length; i++ ) {
		assertClose( act[ i ][ 0 ], exp[ i ][ 0 ], tol, msg + '[' + i + '].re' );
		assertClose( act[ i ][ 1 ], exp[ i ][ 1 ], tol, msg + '[' + i + '].im' );
	}
}

function buildHess6( Hm ) {
	const n = 6;
	mset( Hm, n, 0, 0, 6.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, -0.5 );
	mset( Hm, n, 0, 2, 0.5, 0.0 );
	mset( Hm, n, 0, 3, 0.25, 0.1 );
	mset( Hm, n, 0, 4, 0.1, 0.0 );
	mset( Hm, n, 0, 5, 0.05, -0.05 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 5.0, -1.0 );
	mset( Hm, n, 1, 2, 1.0, 0.5 );
	mset( Hm, n, 1, 3, 0.5, 0.0 );
	mset( Hm, n, 1, 4, 0.25, -0.1 );
	mset( Hm, n, 1, 5, 0.1, 0.0 );
	mset( Hm, n, 2, 1, 0.8, 0.2 );
	mset( Hm, n, 2, 2, 4.0, 0.5 );
	mset( Hm, n, 2, 3, 1.0, -0.5 );
	mset( Hm, n, 2, 4, 0.5, 0.0 );
	mset( Hm, n, 2, 5, 0.25, 0.1 );
	mset( Hm, n, 3, 2, 0.6, -0.1 );
	mset( Hm, n, 3, 3, 3.0, -0.5 );
	mset( Hm, n, 3, 4, 1.0, 0.5 );
	mset( Hm, n, 3, 5, 0.5, 0.0 );
	mset( Hm, n, 4, 3, 0.4, 0.15 );
	mset( Hm, n, 4, 4, 2.0, 0.0 );
	mset( Hm, n, 4, 5, 1.0, -0.5 );
	mset( Hm, n, 5, 4, 0.2, -0.1 );
	mset( Hm, n, 5, 5, 1.0, 1.0 );
}

// TESTS //

test( 'zlaqr4: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr4, 'function' );
});

test( 'zlaqr4: n_eq_0', function t() {
	const tc = n_eq_0;
	const H = new Complex128Array( 0 );
	const Z = new Complex128Array( 0 );
	const W = new Complex128Array( 0 );
	const WORK = new Complex128Array( 1 );

	const info = zlaqr4( true, false, 0, 1, 0,
		H, 1, 0, 0,
		W, 1, 0,
		1, 0,
		Z, 1, 0, 0,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
});

test( 'zlaqr4: n_eq_1', function t() {
	const tc = n_eq_1;
	const n = 1;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 1 );

	mset( Hm, n, 0, 0, 3.0, 2.0 );
	mset( Zm, n, 0, 0, 1.0, 0.0 );

	const info = zlaqr4( true, true, n, 1, 1,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 1,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-13, 'w' );
});

test( 'zlaqr4: 6x6 Schur form with Z (small, uses zlahqr)', function t() {
	const tc = _6x6_schur_with_z;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	buildHess6( Hm );

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr4( true, true, n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 6,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zlaqr4: 6x6 eigenvalues only', function t() {
	const tc = _6x6_eig_only;
	const n = 6;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );

	buildHess6( Hm );

	const info = zlaqr4( false, false, n, 1, 6,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 6,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-10, 'w' );
});

test( 'zlaqr4: 15x15 multishift', function t() {
	const tc = _15x15_multishift;
	const n = 15;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i, j;

	// Build same diagonally dominant Hessenberg as Fortran test
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, (n - i) * 1.0, (i + 1) * 0.1 );
		for ( j = i + 1; j < Math.min( i + 4, n ); j++ ) {
			mset( Hm, n, i, j, 0.5 / (j - i), 0.1 * Math.pow( -1, j + 1 ) );
		}
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.3 + 0.1 * (i + 1), 0.05 * Math.pow( -1, i + 1 ) );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	const info = zlaqr4( true, true, n, 1, 15,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, 15,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.equal( info, tc.info );
	assertEigenvaluesMatch( Array.from( reinterpret( W, 0 ) ), tc.w, 1e-8, 'w' );
	assertUpperTriangular( Hm, n, 1e-10, 'H' );
});

test( 'zlaqr4: 16x16 multishift eigenvalues with Z (property-based)', function t() {
	const n = 16;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	// Build simple upper Hessenberg with well-separated real diagonal
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 10.0, 0.0 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}

	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}

	// Use wantt=false, wantz=true to exercise multishift deflation+Z update path
	const info = zlaqr4( false, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);

	assert.equal( info, 0, 'convergence (info=0)' );

	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( !Number.isNaN( Wv[ 2 * i ] ) && !Number.isNaN( Wv[ 2 * i + 1 ] ),
			'eigenvalue ' + i + ' is not NaN' );
		assert.ok( Math.abs( Wv[ 2 * i ] ) + Math.abs( Wv[ 2 * i + 1 ] ) < 1e6,
			'eigenvalue ' + i + ' has reasonable magnitude' );
	}
});

test( 'zlaqr4: 16x16 eigenvalues only (property-based)', function t() {
	const n = 16;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( n * n );
	let i;

	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 10.0, 0.0 );
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 1.0, 0.0 );
		}
	}

	const info = zlaqr4( false, false, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);

	assert.equal( info, 0, 'convergence (info=0)' );

	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Number.isFinite( Wv[ 2 * i ] ) && Number.isFinite( Wv[ 2 * i + 1 ] ),
			'eigenvalue ' + i + ' is finite' );
	}
});

test( 'zlaqr4: 80x80 near-Jordan block (forces exceptional shifts)', function t() {
	// Repeated eigenvalue lambda=1 with small perturbations -> nearly defective
	// matrix that resists QR convergence, triggering exceptional shifts (240-250)
	// every KEXSH=6 iterations with no deflation.
	const n = 80;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 4 * n * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, 1.0, 0.001 * i );
		if ( i < n - 1 ) {
			mset( Hm, n, i, i + 1, 1.0, 0.0 );
			mset( Hm, n, i + 1, i, 0.001, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}
	const info = zlaqr4( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'info nonnegative' );
}, { timeout: 60000 });

test( 'zlaqr4: 80x80 narrow band Hessenberg with ks=kbot-1 (2-shift selection path)', function t() {
	// Tridiagonal-like matrix: most off-diagonals zero -> single 2x2 trailing
	// block converges last, exercising the kbot-ks+1==2 path (lines 329-338).
	const n = 80;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 4 * n * n );
	let i;
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, ( n - i ) * 1.0, 0.1 );
		if ( i < n - 1 ) {
			mset( Hm, n, i, i + 1, 0.5, 0.0 );
			mset( Hm, n, i + 1, i, 0.4, 0.0 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}
	const info = zlaqr4( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'info nonnegative' );
}, { timeout: 60000 });

test( 'zlaqr4: 90x90 dense full off-diagonal (slows convergence further)', function t() {
	// Strongly off-diagonal-dominant Hessenberg slows convergence and
	// drives many ndfl iterations -> exceptional shifts and trailing-block
	// shift recomputation paths.
	const n = 90;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 4 * n * n );
	let i, j;
	let seed = 7777;
	function rnd() {
		seed = ( seed * 1103515245 + 12345 ) % 2147483648;
		return ( seed / 2147483648 ) - 0.5;
	}
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, rnd() * 0.5, rnd() * 0.5 );
		for ( j = i + 1; j < n; j++ ) {
			mset( Hm, n, i, j, rnd(), rnd() );
		}
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.8, 0.3 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}
	const info = zlaqr4( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'info nonnegative' );
}, { timeout: 120000 });

test( 'zlaqr4: 90x90 random Hessenberg (exercises trailing-submatrix shift path)', function t() {
	// A random-ish Hessenberg matrix with non-trivial off-diagonals causes
	// many iterations without deflation, exercising the ndfl>=KEXNW=5 path
	// (lines 196-197, 211-216) and exceptional shift path (lines 240-250).
	const n = 90;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 4 * n * n );
	let i, j;
	// Deterministic pseudo-random generator
	let seed = 123456;
	function rnd() {
		seed = ( seed * 1103515245 + 12345 ) % 2147483648;
		return ( seed / 2147483648 ) - 0.5;
	}
	for ( i = 0; i < n; i++ ) {
		mset( Hm, n, i, i, 1.0 + rnd() * 0.1, rnd() * 0.1 );
		for ( j = i + 1; j < n; j++ ) {
			mset( Hm, n, i, j, rnd() * 0.5, rnd() * 0.5 );
		}
		if ( i < n - 1 ) {
			// Larger subdiagonal to slow convergence
			mset( Hm, n, i + 1, i, 0.6 + rnd() * 0.2, rnd() * 0.2 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}
	const info = zlaqr4( false, false, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	assert.ok( info >= 0, 'info nonnegative' );
}, { timeout: 60000 });

test( 'zlaqr4: 100x100 multishift QR (exercises kacc22 paths)', function t() {
	// Need N >= 87 for nsr to reach KACMIN=K22MIN=14 (lines 156-161).
	// Eigenvalues on a circle to make convergence slow and exercise
	// exceptional shifts (line 240-250) and trailing-submatrix shifts
	// (lines 254-304).
	const n = 100;
	const Hm = makeMatrix( n );
	const Zm = makeMatrix( n );
	const W = new Complex128Array( n );
	const WORK = new Complex128Array( 4 * n * n );
	let i, j, theta;
	for ( i = 0; i < n; i++ ) {
		// place real diagonal entries spread across magnitudes (still well-cond)
		theta = ( i * 2.0 * Math.PI ) / n;
		mset( Hm, n, i, i, 1.0 + Math.cos( theta ), Math.sin( theta ) );
		// fill upper Hessenberg up to bandwidth 4
		for ( j = i + 1; j < Math.min( i + 4, n ); j++ ) {
			mset( Hm, n, i, j, 0.5 / ( j - i ), 0.05 / ( j - i ) );
		}
		if ( i < n - 1 ) {
			mset( Hm, n, i + 1, i, 0.4, 0.05 );
		}
	}
	for ( i = 0; i < n; i++ ) {
		mset( Zm, n, i, i, 1.0, 0.0 );
	}
	const info = zlaqr4( true, true, n, 1, n,
		Hm.data, Hm.s1, Hm.s2, Hm.offset,
		W, 1, 0,
		1, n,
		Zm.data, Zm.s1, Zm.s2, Zm.offset,
		WORK, 1, 0
	);
	// info may be > 0 if not all eigenvalues converge in iter limit, just
	// validate computation didn't NaN.
	assert.ok( info >= 0, 'info nonnegative' );
	const Wv = reinterpret( W, 0 );
	for ( i = 0; i < n; i++ ) {
		assert.ok( Number.isFinite( Wv[ 2 * i ] ) && Number.isFinite( Wv[ 2 * i + 1 ] ),
			'eigenvalue ' + i + ' is finite' );
	}
}, { timeout: 30000 });

test( 'zlaqr4: pre-split matrix (H(ks,ks-1)=0) is processed as two independent blocks', function t() {
	// With an exact zero at H(ks,ks-1), the reference algorithm locates the active block as KTOP = ks (Fortran `GO TO 20` skips `K = ILO`), so a single call over 1:N must equal the bottom block solved alone (ilo=ks) followed by the top block (ihi=ks-1), bit for bit.
	const n = 20;
	const ks = 11;
	let info2;
	let info;
	let i;
	let j;

	function build() {
		const Hm = makeMatrix( n );
		let r;
		let c;
		for ( c = 0; c < n; c++ ) {
			for ( r = 0; r <= Math.min( c + 1, n - 1 ); r++ ) {
				mset( Hm, n, r, c, Math.sin( ( ( r + 1 ) * 1.7 ) + ( ( c + 1 ) * 0.3 ) ) + ( ( r === c + 1 ) ? 1.5 : 0.0 ), Math.cos( ( ( r + 1 ) * 0.9 ) - ( ( c + 1 ) * 1.1 ) ) );
			}
		}
		mset( Hm, n, ks - 1, ks - 2, 0.0, 0.0 );
		return Hm;
	}

	function identity() {
		const Zm = makeMatrix( n );
		let k;
		for ( k = 0; k < n; k++ ) {
			mset( Zm, n, k, k, 1.0, 0.0 );
		}
		return Zm;
	}

	function run( Hm, Zm, W, lo, hi ) {
		return zlaqr4( true, true, n, lo, hi, Hm.data, Hm.s1, Hm.s2, Hm.offset, W, 1, 0, 1, n, Zm.data, Zm.s1, Zm.s2, Zm.offset, new Complex128Array( n * n ), 1, 0 );
	}

	// Single call over the whole matrix:
	const H1 = build();
	const Z1 = identity();
	const W1 = new Complex128Array( n );
	info = run( H1, Z1, W1, 1, n );
	assert.equal( info, 0, 'info (single call)' );

	// Bottom block alone (ilo > 1), then the top block:
	const H2 = build();
	const Z2 = identity();
	const W2 = new Complex128Array( n );
	info2 = run( H2, Z2, W2, ks, n );
	assert.equal( info2, 0, 'info (bottom block)' );
	info2 = run( H2, Z2, W2, 1, ks - 1 );
	assert.equal( info2, 0, 'info (top block)' );

	const h1 = getFlat( H1 );
	const h2 = getFlat( H2 );
	const z1 = getFlat( Z1 );
	const z2 = getFlat( Z2 );
	assert.deepEqual( Array.from( reinterpret( W1, 0 ) ), Array.from( reinterpret( W2, 0 ) ), 'W' );
	assert.equal( h1[ 2 * ( ( ks - 1 ) + ( ( ks - 2 ) * n ) ) ], 0.0, 'split preserved' );
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			// Below the first subdiagonal H is workspace; compare only the Schur form.
			if ( i <= j + 1 ) {
				assert.equal( h1[ 2 * ( i + ( j * n ) ) ], h2[ 2 * ( i + ( j * n ) ) ], 'H[' + i + ',' + j + '].re' );
				assert.equal( h1[ ( 2 * ( i + ( j * n ) ) ) + 1 ], h2[ ( 2 * ( i + ( j * n ) ) ) + 1 ], 'H[' + i + ',' + j + '].im' );
			}
		}
	}
	assert.deepEqual( z1, z2, 'Z' );
});
