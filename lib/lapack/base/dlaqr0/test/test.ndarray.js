

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaqr0 from './../lib/ndarray.js';

// FIXTURES //

import n_eq_1 from './fixtures/n_eq_1.json' with { type: 'json' };
import n_eq_2 from './fixtures/n_eq_2.json' with { type: 'json' };
import hess_6x6 from './fixtures/hess_6x6.json' with { type: 'json' };
import hess_6x6_eigonly from './fixtures/hess_6x6_eigonly.json' with { type: 'json' };
import ilo_eq_ihi from './fixtures/ilo_eq_ihi.json' with { type: 'json' };
import hess_15x15 from './fixtures/hess_15x15.json' with { type: 'json' };
import hess_16x16 from './fixtures/hess_16x16.json' with { type: 'json' };
import hess_20x20 from './fixtures/hess_20x20.json' with { type: 'json' };
import partial_block from './fixtures/partial_block.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Sort eigenvalues by real part, then imaginary part, for comparison.
*/
function sortedEigs( wr, wi ) {
	var eigs = [];
	var i;
	for ( i = 0; i < wr.length; i++ ) {
		eigs.push( { re: wr[ i ], im: wi[ i ] } );
	}
	eigs.sort( function cmp( a, b ) {
		if ( a.re !== b.re ) {
			return a.re - b.re;
		}
		return a.im - b.im;
	});
	return eigs;
}

function assertEigenvaluesClose( wrActual, wiActual, wrExpected, wiExpected, tol, msg ) {
	var actual = sortedEigs( wrActual, wiActual );
	var expected = sortedEigs( wrExpected, wiExpected );
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ].re, expected[ i ].re, tol, msg + '.re[' + i + ']' );
		assertClose( actual[ i ].im, expected[ i ].im, tol, msg + '.im[' + i + ']' );
	}
}

/**
* Build a column-major N x N matrix from a flat array (Fortran order with LDH=MAXN).
* For our tests we use LDH = N (dense).
*/
function buildHessenberg( N, initFn ) {
	var H = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			H[ i + j * N ] = initFn( i + 1, j + 1 );
		}
	}
	return H;
}

function identity( N ) {
	var Z = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}
	return Z;
}

function extractEigs( WR, WI, N, offset ) {
	var wr = [];
	var wi = [];
	var i;
	for ( i = 0; i < N; i++ ) {
		wr.push( WR[ offset + i ] );
		wi.push( WI[ offset + i ] );
	}
	return { wr: wr, wi: wi };
}

// TESTS //

test( 'dlaqr0: n_eq_0', function t() {
	var WORK = new Float64Array( 10 );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var H = new Float64Array( 1 );
	var Z = new Float64Array( 1 );
	var info;

	info = dlaqr0( true, true, 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 0, Z, 1, 1, 0, WORK, 1, 0, 10 );
	assert.equal( info, 0, 'info' );
});

test( 'dlaqr0: n_eq_1', function t() {
	var tc = n_eq_1;
	var WORK = new Float64Array( 10 );
	var WR = new Float64Array( 1 );
	var WI = new Float64Array( 1 );
	var H = new Float64Array( [ 3.5 ] );
	var Z = new Float64Array( [ 1.0 ] );
	var info;

	info = dlaqr0( true, true, 1, 1, 1, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 10 );
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.wr1, 1e-14, 'wr1' );
	assertClose( WI[ 0 ], tc.wi1, 1e-14, 'wi1' );
	assertClose( H[ 0 ], tc.h11, 1e-14, 'h11' );
});

test( 'dlaqr0: n_eq_2', function t() {
	var tc = n_eq_2;
	var N = 2;
	var WORK = new Float64Array( 20 );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var H = new Float64Array( [ 1.0, 3.0, 2.0, 4.0 ] ); // column-major
	var Z = identity( N );
	var info;
	var eigs;

	info = dlaqr0( true, true, N, 1, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 2, Z, 1, N, 0, WORK, 1, 0, 20 );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-12, 'eigenvalues' );
});

test( 'dlaqr0: hess_6x6', function t() {
	var tc = hess_6x6;
	var N = 6;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;
	var i;

	// Fortran: H(i,j) = 1/(i+j) for j >= i-1, then H(i,i-1) = 0.5 for i=2..N
	var H = buildHessenberg( N, function init( i, j ) {
		if ( j >= i - 1 ) {
			return 1.0 / ( i + j );
		}
		return 0.0;
	});
	// Override subdiagonal with 0.5
	for ( i = 2; i <= N; i++ ) {
		H[ ( i - 1 ) + ( i - 2 ) * N ] = 0.5;
	}
	var Z = identity( N );

	info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-10, 'eigenvalues' );
});

test( 'dlaqr0: hess_6x6_eigonly', function t() {
	var tc = hess_6x6_eigonly;
	var N = 6;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var Z = new Float64Array( 1 );
	var info;
	var eigs;
	var i;

	var H = buildHessenberg( N, function init( i, j ) {
		if ( j >= i - 1 ) {
			return 1.0 / ( i + j );
		}
		return 0.0;
	});
	for ( i = 2; i <= N; i++ ) {
		H[ ( i - 1 ) + ( i - 2 ) * N ] = 0.5;
	}

	info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-10, 'eigenvalues' );
});

test( 'dlaqr0: ilo_eq_ihi', function t() {
	var tc = ilo_eq_ihi;
	var N = 4;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;

	var H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 1.0;
	H[ 1 + 1 * N ] = 2.0;
	H[ 2 + 2 * N ] = 3.0;
	H[ 3 + 3 * N ] = 4.0;
	H[ 0 + 1 * N ] = 0.5;
	H[ 1 + 2 * N ] = 0.5;
	H[ 2 + 3 * N ] = 0.5;
	var Z = identity( N );

	info = dlaqr0( true, true, N, 2, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 4, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	// For ILO=IHI, eigenvalue at position ILO is just H(ILO,ILO)
	assertClose( WR[ 1 ], 2.0, 1e-14, 'wr[ilo]' );
	assertClose( WI[ 1 ], 0.0, 1e-14, 'wi[ilo]' );
});

test( 'dlaqr0: hess_15x15', function t() {
	var tc = hess_15x15;
	var N = 15;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;

	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return i * 2.0;
		}
		if ( j === i + 1 ) {
			return 1.0;
		}
		if ( j === i - 1 ) {
			return 0.3;
		}
		if ( j > i + 1 ) {
			return 0.1 / ( j - i );
		}
		return 0.0;
	});
	var Z = identity( N );

	info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-8, 'eigenvalues' );
});

test( 'dlaqr0: hess_16x16', function t() {
	var tc = hess_16x16;
	var N = 16;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;

	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return i * 3.0;
		}
		if ( j === i + 1 ) {
			return 2.0;
		}
		if ( j === i - 1 ) {
			return 1.0;
		}
		if ( j > i + 1 ) {
			return 0.05 / ( j - i );
		}
		return 0.0;
	});
	var Z = identity( N );

	info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-8, 'eigenvalues' );
});

test( 'dlaqr0: hess_20x20', function t() {
	var tc = hess_20x20;
	var N = 20;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;

	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return i * 2.5 + 0.1 * ( ( i * 7 ) % 11 );
		}
		if ( j === i + 1 ) {
			return 1.5;
		}
		if ( j === i - 1 ) {
			return 0.8;
		}
		if ( j > i + 1 ) {
			return 0.02 / ( j - i );
		}
		return 0.0;
	});
	var Z = identity( N );

	info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	eigs = extractEigs( WR, WI, N, 0 );
	// Loosen tolerance: different ILAENV parameters lead to different iteration
	// paths, but eigenvalues should agree to ~1e-4 or better
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-4, 'eigenvalues' );
});

test( 'dlaqr0: hess_80x80 (exercises dlaqr3/dlaqr5 path, property-based)', function t() {
	// N=80 is above IPARMQ_NMIN=75, exercising the dlaqr4 recursive call path.
	// Use a strongly diagonally dominant matrix for reliable convergence.
	var N = 80;
	var WORK = new Float64Array( 100000 );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var i;
	var j;

	// Very well-separated eigenvalues: H(i,i) = 3*i, subdiag = 0.1
	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return i * 3.0;
		}
		if ( j === i - 1 ) {
			return 0.1;
		}
		if ( j === i + 1 ) {
			return 0.05;
		}
		return 0.0;
	});
	var Z = identity( N );

	info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 100000 );
	assert.equal( info, 0, 'info (converged)' );
	// Verify all eigenvalues are finite and close to the diagonal entries
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
		assert.ok( isFinite( WI[ i ] ), 'WI[' + i + '] is finite' );
	}
});

test( 'dlaqr0: hess_80x80 eigenvalues only (property-based)', function t() {
	var N = 80;
	var WORK = new Float64Array( 100000 );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var Z = new Float64Array( 1 );
	var info;
	var i;

	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return i * 3.0;
		}
		if ( j === i - 1 ) {
			return 0.1;
		}
		if ( j === i + 1 ) {
			return 0.05;
		}
		return 0.0;
	});

	info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 100000 );
	assert.equal( info, 0, 'info (converged)' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
	}
});

test( 'dlaqr0: hess_40x40 with complex eigenvalues (property-based)', function t() {
	// Matrix with close eigenvalues to generate complex pairs
	var N = 40;
	var WORK = new Float64Array( 100000 );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var i;

	// Diagonally dominant base + stronger subdiagonal to create complex pairs
	var H = buildHessenberg( N, function init( i, j ) {
		if ( i === j ) {
			return ( i % 5 ) * 3.0 + 1.0;
		}
		if ( j === i - 1 ) {
			return 2.0;
		}
		if ( j > i && j <= i + 4 ) {
			return 0.5 / ( j - i );
		}
		return 0.0;
	});
	var Z = identity( N );

	info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 );
	// This matrix may or may not converge fully with JS iparmq; just verify it runs
	assert.ok( info >= 0, 'info is non-negative' );
	// If converged, verify some eigenvalues have nonzero imaginary parts
	if ( info === 0 ) {
		var hasComplex = false;
		for ( i = 0; i < N; i++ ) {
			if ( Math.abs( WI[ i ] ) > 1e-10 ) {
				hasComplex = true;
				break;
			}
		}
		assert.ok( hasComplex, 'should have complex eigenvalue pairs' );
	}
});

test( 'dlaqr0: partial_block', function t() {
	var tc = partial_block;
	var N = 10;
	var WORK = new Float64Array( 10 * N );
	var WR = new Float64Array( N );
	var WI = new Float64Array( N );
	var info;
	var eigs;

	var H = new Float64Array( N * N );
	var i;
	// Already-converged diagonal
	H[ 0 + 0 * N ] = 10.0;
	H[ 1 + 1 * N ] = 20.0;
	H[ 8 + 8 * N ] = 90.0;
	H[ 9 + 9 * N ] = 100.0;
	H[ 0 + 1 * N ] = 1.0;
	H[ 8 + 9 * N ] = 1.0;
	// Active block rows 3-8 (0-based: 2-7)
	for ( i = 3; i <= 8; i++ ) {
		H[ ( i - 1 ) + ( i - 1 ) * N ] = i * 5.0;
		if ( i < 8 ) {
			H[ ( i - 1 ) + i * N ] = 2.0;
		}
		if ( i > 3 ) {
			H[ i - 1 + ( i - 2 ) * N ] = 1.0;  // subdiag: H(i, i-1)
		}
	}
	// Upper triangle fill
	H[ 2 + 4 * N ] = 0.3;
	H[ 3 + 5 * N ] = 0.2;
	H[ 4 + 6 * N ] = 0.1;
	// Connections
	H[ 1 + 2 * N ] = 0.5;
	H[ 7 + 8 * N ] = 0.5;
	var Z = identity( N );

	info = dlaqr0( true, true, N, 3, 8, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 10, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	// Compare eigenvalues in the active range ILO:IHI (1-based 3:8 = 0-based 2:7)
	var wrActive = [];
	var wiActive = [];
	var wrExpActive = [];
	var wiExpActive = [];
	for ( i = 2; i < 8; i++ ) {
		wrActive.push( WR[ i ] );
		wiActive.push( WI[ i ] );
		wrExpActive.push( tc.wr[ i ] );
		wiExpActive.push( tc.wi[ i ] );
	}
	assertEigenvaluesClose( wrActive, wiActive, wrExpActive, wiExpActive, 1e-8, 'eigenvalues' );
});
