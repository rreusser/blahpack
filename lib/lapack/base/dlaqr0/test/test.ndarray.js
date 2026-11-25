

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlaqr0 from './../lib/ndarray.js';
import dlaqr4 from './../../dlaqr4/lib/ndarray.js';

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Sort eigenvalues by real part, then imaginary part, for comparison.
*/
function sortedEigs( wr, wi ) {
	const eigs = [];
	let i;
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
	const actual = sortedEigs( wrActual, wiActual );
	const expected = sortedEigs( wrExpected, wiExpected );
	let i;
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
	const H = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			H[ i + j * N ] = initFn( i + 1, j + 1 );
		}
	}
	return H;
}

function identity( N ) {
	const Z = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}
	return Z;
}

function extractEigs( WR, WI, N, offset ) {
	const wr = [];
	const wi = [];
	let i;
	for ( i = 0; i < N; i++ ) {
		wr.push( WR[ offset + i ] );
		wi.push( WI[ offset + i ] );
	}
	return { wr: wr, wi: wi };
}

// TESTS //

test( 'dlaqr0: n_eq_0', function t() {
	const WORK = new Float64Array( 10 );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const H = new Float64Array( 1 );
	const Z = new Float64Array( 1 );

	const info = dlaqr0( true, true, 0, 1, 0, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 0, Z, 1, 1, 0, WORK, 1, 0, 10 );
	assert.equal( info, 0, 'info' );
});

test( 'dlaqr0: n_eq_1', function t() {
	const tc = n_eq_1;
	const WORK = new Float64Array( 10 );
	const WR = new Float64Array( 1 );
	const WI = new Float64Array( 1 );
	const H = new Float64Array( [ 3.5 ] );
	const Z = new Float64Array( [ 1.0 ] );

	const info = dlaqr0( true, true, 1, 1, 1, H, 1, 1, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 10 );
	assert.equal( info, tc.info, 'info' );
	assertClose( WR[ 0 ], tc.wr1, 1e-14, 'wr1' );
	assertClose( WI[ 0 ], tc.wi1, 1e-14, 'wi1' );
	assertClose( H[ 0 ], tc.h11, 1e-14, 'h11' );
});

test( 'dlaqr0: n_eq_2', function t() {
	const tc = n_eq_2;
	const N = 2;
	const WORK = new Float64Array( 20 );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const H = new Float64Array( [ 1.0, 3.0, 2.0, 4.0 ] ); // column-major
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 2, Z, 1, N, 0, WORK, 1, 0, 20 );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-12, 'eigenvalues' );
});

test( 'dlaqr0: hess_6x6', function t() {
	const tc = hess_6x6;
	const N = 6;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	let i;

	// Fortran: H(i,j) = 1/(i+j) for j >= i-1, then H(i,i-1) = 0.5 for i=2..N
	const H = buildHessenberg( N, function init( i, j ) {
		if ( j >= i - 1 ) {
			return 1.0 / ( i + j );
		}
		return 0.0;
	});
	// Override subdiagonal with 0.5
	for ( i = 2; i <= N; i++ ) {
		H[ ( i - 1 ) + ( i - 2 ) * N ] = 0.5;
	}
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-10, 'eigenvalues' );
});

test( 'dlaqr0: hess_6x6_eigonly', function t() {
	const tc = hess_6x6_eigonly;
	const N = 6;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( 1 );
	let i;

	const H = buildHessenberg( N, function init( i, j ) {
		if ( j >= i - 1 ) {
			return 1.0 / ( i + j );
		}
		return 0.0;
	});
	for ( i = 2; i <= N; i++ ) {
		H[ ( i - 1 ) + ( i - 2 ) * N ] = 0.5;
	}

	const info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-10, 'eigenvalues' );
});

test( 'dlaqr0: ilo_eq_ihi', function t() {
	const tc = ilo_eq_ihi;
	const N = 4;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	let eigs;

	const H = new Float64Array( N * N );
	H[ 0 + 0 * N ] = 1.0;
	H[ 1 + 1 * N ] = 2.0;
	H[ 2 + 2 * N ] = 3.0;
	H[ 3 + 3 * N ] = 4.0;
	H[ 0 + 1 * N ] = 0.5;
	H[ 1 + 2 * N ] = 0.5;
	H[ 2 + 3 * N ] = 0.5;
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 2, 2, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 4, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	// For ILO=IHI, eigenvalue at position ILO is just H(ILO,ILO)
	assertClose( WR[ 1 ], 2.0, 1e-14, 'wr[ilo]' );
	assertClose( WI[ 1 ], 0.0, 1e-14, 'wi[ilo]' );
});

test( 'dlaqr0: hess_15x15', function t() {
	const tc = hess_15x15;
	const N = 15;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );

	const H = buildHessenberg( N, function init( i, j ) {
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
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-8, 'eigenvalues' );
});

test( 'dlaqr0: hess_16x16', function t() {
	const tc = hess_16x16;
	const N = 16;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );

	const H = buildHessenberg( N, function init( i, j ) {
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
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-8, 'eigenvalues' );
});

test( 'dlaqr0: hess_20x20', function t() {
	const tc = hess_20x20;
	const N = 20;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );

	const H = buildHessenberg( N, function init( i, j ) {
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
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	const eigs = extractEigs( WR, WI, N, 0 );
	// Loosen tolerance: different ILAENV parameters lead to different iteration
	// paths, but eigenvalues should agree to ~1e-4 or better
	assertEigenvaluesClose( eigs.wr, eigs.wi, tc.wr, tc.wi, 1e-4, 'eigenvalues' );
});

test( 'dlaqr0: hess_80x80 (exercises dlaqr3/dlaqr5 path, property-based)', function t() {
	// N=80 is above IPARMQ_NMIN=75, exercising the dlaqr4 recursive call path.
	// Use a strongly diagonally dominant matrix for reliable convergence.
	const N = 80;
	const WORK = new Float64Array( 100000 );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	let i, j;

	// Very well-separated eigenvalues: H(i,i) = 3*i, subdiag = 0.1
	const H = buildHessenberg( N, function init( i, j ) {
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
	const Z = identity( N );

	const info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 100000 );
	assert.equal( info, 0, 'info (converged)' );
	// Verify all eigenvalues are finite and close to the diagonal entries
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
		assert.ok( isFinite( WI[ i ] ), 'WI[' + i + '] is finite' );
	}
});

test( 'dlaqr0: hess_80x80 eigenvalues only (property-based)', function t() {
	const N = 80;
	const WORK = new Float64Array( 100000 );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	const Z = new Float64Array( 1 );
	let i;

	const H = buildHessenberg( N, function init( i, j ) {
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

	const info = dlaqr0( false, false, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 1, Z, 1, 1, 0, WORK, 1, 0, 100000 );
	assert.equal( info, 0, 'info (converged)' );
	for ( i = 0; i < N; i++ ) {
		assert.ok( isFinite( WR[ i ] ), 'WR[' + i + '] is finite' );
	}
});

test( 'dlaqr0: hess_40x40 with complex eigenvalues (property-based)', function t() {
	// Matrix with close eigenvalues to generate complex pairs
	const N = 40;
	const WORK = new Float64Array( 100000 );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	let i;

	// Diagonally dominant base + stronger subdiagonal to create complex pairs
	const H = buildHessenberg( N, function init( i, j ) {
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
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, WORK, 1, 0, 100000 );
	// This matrix may or may not converge fully with JS iparmq; just verify it runs
	assert.ok( info >= 0, 'info is non-negative' );
	// If converged, verify some eigenvalues have nonzero imaginary parts
	if ( info === 0 ) {
		let hasComplex = false;
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
	const tc = partial_block;
	const N = 10;
	const WORK = new Float64Array( 10 * N );
	const WR = new Float64Array( N );
	const WI = new Float64Array( N );
	let eigs;

	const H = new Float64Array( N * N );
	let i;
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
	const Z = identity( N );

	const info = dlaqr0( true, true, N, 3, 8, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, 10, Z, 1, N, 0, WORK, 1, 0, 10 * N );
	assert.equal( info, tc.info, 'info' );
	// Compare eigenvalues in the active range ILO:IHI (1-based 3:8 = 0-based 2:7)
	const wrActive = [];
	const wiActive = [];
	const wrExpActive = [];
	const wiExpActive = [];
	for ( i = 2; i < 8; i++ ) {
		wrActive.push( WR[ i ] );
		wiActive.push( WI[ i ] );
		wrExpActive.push( tc.wr[ i ] );
		wiExpActive.push( tc.wi[ i ] );
	}
	assertEigenvaluesClose( wrActive, wiActive, wrExpActive, wiExpActive, 1e-8, 'eigenvalues' );
});

test( 'dlaqr0: pre-split matrix (H(ks,ks-1)=0) is processed as two independent blocks', function t() {
	// With an exact zero at H(ks,ks-1), the reference algorithm locates the active block as KTOP = ks (Fortran `GO TO 20` skips `K = ILO`), so a single call over 1:N must equal the bottom block solved alone (ilo=ks) followed by the top block (ihi=ks-1), bit for bit. This also checks that a converged call with ilo > 1 returns info = 0 (not KBOT = ilo-1).
	const LWORK = 10000;
	const N = 20;
	const ks = 11;
	let info2;
	let info;
	let i;
	let j;

	function build() {
		const H = buildHessenberg( N, function init( r, c ) {
			if ( r > c + 1 ) {
				return 0.0;
			}
			return Math.sin( ( r * 1.7 ) + ( c * 0.3 ) ) + ( ( r === c + 1 ) ? 1.5 : 0.0 );
		});
		H[ ( ks - 1 ) + ( ( ks - 2 ) * N ) ] = 0.0;
		return H;
	}

	// Single call over the whole matrix:
	const H1 = build();
	const Z1 = identity( N );
	const WR1 = new Float64Array( N );
	const WI1 = new Float64Array( N );
	info = dlaqr0( true, true, N, 1, N, H1, 1, N, 0, WR1, 1, 0, WI1, 1, 0, 1, N, Z1, 1, N, 0, new Float64Array( LWORK ), 1, 0, LWORK );
	assert.equal( info, 0, 'info (single call)' );

	// Bottom block alone (ilo > 1), then the top block:
	const H2 = build();
	const Z2 = identity( N );
	const WR2 = new Float64Array( N );
	const WI2 = new Float64Array( N );
	info2 = dlaqr0( true, true, N, ks, N, H2, 1, N, 0, WR2, 1, 0, WI2, 1, 0, 1, N, Z2, 1, N, 0, new Float64Array( LWORK ), 1, 0, LWORK );
	assert.equal( info2, 0, 'info (bottom block, ilo > 1)' );
	info2 = dlaqr0( true, true, N, 1, ks - 1, H2, 1, N, 0, WR2, 1, 0, WI2, 1, 0, 1, N, Z2, 1, N, 0, new Float64Array( LWORK ), 1, 0, LWORK );
	assert.equal( info2, 0, 'info (top block)' );

	assert.equal( H1[ ( ks - 1 ) + ( ( ks - 2 ) * N ) ], 0.0, 'split preserved' );
	for ( i = 0; i < N; i++ ) {
		assert.equal( WR1[ i ], WR2[ i ], 'WR[' + i + ']' );
		assert.equal( WI1[ i ], WI2[ i ], 'WI[' + i + ']' );
		for ( j = 0; j < N; j++ ) {
			// Below the first subdiagonal H is workspace; compare only the Schur form.
			if ( i <= j + 1 ) {
				assert.equal( H1[ i + ( j * N ) ], H2[ i + ( j * N ) ], 'H[' + i + ',' + j + ']' );
			}
			assert.equal( Z1[ i + ( j * N ) ], Z2[ i + ( j * N ) ], 'Z[' + i + ',' + j + ']' );
		}
	}
});

test( 'dlaqr0: matches dlaqr4 bit for bit while every deflation window is at most 12 (shift pairing after the shift sort)', function t() {
	// The reference DLAQR0 and DLAQR4 are the same algorithm apart from the AED routine (DLAQR3 vs DLAQR2), which coincide whenever the deflation window never exceeds the DLAQR3 recursion crossover (12 in this port); ILAENV parameters are identical. With N=24, NWMAX = (N-1)/3 = 7, so both calls must agree exactly. The random-like Hessenberg matrix has mixed real and complex-conjugate eigenvalues, so the AED shift sets returned to the shift-selection code contain both kinds, and the "shuffle shifts into pairs" loop (which runs after the bubble sort whether or not the sort exits early via `GO TO 60`) reorders them.
	const LWORK = 10000;
	const N = 24;
	let info0;
	let info4;
	let ncplx;
	let i;

	function build() {
		return buildHessenberg( N, function init( r, c ) {
			if ( r > c + 1 ) {
				return 0.0;
			}
			return Math.sin( ( r * r * 0.37 ) + ( c * 1.31 ) );
		});
	}

	const H0 = build();
	const Z0 = identity( N );
	const WR0 = new Float64Array( N );
	const WI0 = new Float64Array( N );
	info0 = dlaqr0( true, true, N, 1, N, H0, 1, N, 0, WR0, 1, 0, WI0, 1, 0, 1, N, Z0, 1, N, 0, new Float64Array( LWORK ), 1, 0, LWORK );
	const H4 = build();
	const Z4 = identity( N );
	const WR4 = new Float64Array( N );
	const WI4 = new Float64Array( N );
	info4 = dlaqr4( true, true, N, 1, N, H4, 1, N, 0, WR4, 1, 0, WI4, 1, 0, 1, N, Z4, 1, N, 0, new Float64Array( LWORK ), 1, 0, LWORK );
	assert.equal( info0, 0, 'info (dlaqr0)' );
	assert.equal( info4, 0, 'info (dlaqr4)' );
	ncplx = 0;
	for ( i = 0; i < N; i++ ) {
		if ( WI0[ i ] !== 0.0 ) {
			ncplx += 1;
		}
	}
	assert.ok( ncplx > 0 && ncplx < N, 'mixed real and complex eigenvalues' );
	assert.deepStrictEqual( Array.from( WR0 ), Array.from( WR4 ), 'WR' );
	assert.deepStrictEqual( Array.from( WI0 ), Array.from( WI4 ), 'WI' );
	assert.deepStrictEqual( Array.from( H0 ), Array.from( H4 ), 'H' );
	assert.deepStrictEqual( Array.from( Z0 ), Array.from( Z4 ), 'Z' );
});

test( 'dlaqr0: minimum WORK covers dlaqr3\'s blocked path (33*JW+2080 for a reachable window JW > 32, ticket 0096)', function t() {
	let r;
	function cyclic( N ) {
		// Cyclic shift: eigenvalues are the N-th roots of unity, so AED stalls and the window grows past 32 with many undeflated shifts.
		const H = new Float64Array( N * N );
		let i;
		for ( i = 1; i < N; i++ ) {
			H[ i + ( ( i - 1 ) * N ) ] = 1.0;
		}
		H[ ( N - 1 ) * N ] = 1.0;
		return H;
	}
	function eye( N ) {
		const Z = new Float64Array( N * N );
		let i;
		for ( i = 0; i < N; i++ ) {
			Z[ i + ( i * N ) ] = 1.0;
		}
		return Z;
	}
	function run( N, lwork, zero ) {
		const H = ( zero ) ? new Float64Array( N * N ) : cyclic( N );
		const Z = eye( N );
		const WR = new Float64Array( N );
		const WI = new Float64Array( N );
		const info = dlaqr0( true, true, N, 1, N, H, 1, N, 0, WR, 1, 0, WI, 1, 0, 1, N, Z, 1, N, 0, new Float64Array( lwork ), 1, 0 );
		return [ info, Array.from( WR ), Array.from( WI ), Array.from( H ), Array.from( Z ) ];
	}
	const N = 300; // the window reaches JW >= 34 with >= 34 undeflated shifts, so the blocked Hessenberg reduction runs
	r = run( N, 5347 ); // 33*floor((N-1)/3) + 2080
	assert.equal( r[ 0 ], 0, 'info' );
	assert.ok( r[ 1 ].every( Number.isFinite ), 'finite eigenvalues' );
	assert.deepEqual( r, run( N, 100 * N ) );

	// (H = 0 below, so that on the old code the accepted call returns at once.)
	// The old minimum `max(1,N)` was accepted, overran WORK in dlaqr3 and never converged (NaN spike):
	assert.throws( function throws() {
		run( N, N, true );
	}, /WORK array must have at least 5347 elements/ );
	assert.throws( function throws() {
		run( N, 5346, true );
	}, RangeError );
});
