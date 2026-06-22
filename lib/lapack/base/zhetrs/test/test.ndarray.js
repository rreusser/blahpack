import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrs from '../lib/ndarray.js';

// FIXTURES //

import upper4x4_1rhs from './fixtures/upper_4x4_1rhs.json' with { type: 'json' };
import lower4x4_2rhs from './fixtures/lower_4x4_2rhs.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import lower6x6 from './fixtures/lower_6x6.json' with { type: 'json' };
import upper6x6 from './fixtures/upper_6x6.json' with { type: 'json' };

var fixtures = {
	'upper_4x4_1rhs': upper4x4_1rhs,
	'lower_4x4_2rhs': lower4x4_2rhs,
	'n1': n1,
	'lower_6x6': lower6x6,
	'upper_6x6': upper6x6
};

function assertClose( a, e, tol, msg ) {
	var i;
	for ( i = 0; i < e.length; i++ ) {
		if ( Math.abs( a[ i ] - e[ i ] ) > tol * ( 1 + Math.abs( e[ i ] ) ) ) {
			assert.fail( ( msg || '' ) + ' at ' + i + ': ' + a[ i ] + ' vs ' + e[ i ] );
		}
	}
}

/**
* Pack a flat double-precision array from a Fortran column-major fixture (with LDA padding)
* into a packed N*N complex array suitable for our JS routines (strideA1=1, strideA2=N).
*
* The fixture has LDA=NMAX=6 rows, but only the first N rows matter.
*/
function packComplex( flatDoubles, N, LDA ) {
	var out = new Complex128Array( N * N );
	var ov = reinterpret( out, 0 );
	var j;
	var i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ov[ 2 * ( i + j * N ) ] = flatDoubles[ 2 * ( i + j * LDA ) ];
			ov[ 2 * ( i + j * N ) + 1 ] = flatDoubles[ 2 * ( i + j * LDA ) + 1 ];
		}
	}
	return out;
}

/**
* Pack a flat double-precision B array from Fortran (LDB=NMAX) into packed N*nrhs.
*/
function packB( flatDoubles, N, nrhs, LDB ) {
	var out = new Complex128Array( N * nrhs );
	var ov = reinterpret( out, 0 );
	var j;
	var i;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ov[ 2 * ( i + j * N ) ] = flatDoubles[ 2 * ( i + j * LDB ) ];
			ov[ 2 * ( i + j * N ) + 1 ] = flatDoubles[ 2 * ( i + j * LDB ) + 1 ];
		}
	}
	return out;
}

/**
* Convert Fortran 1-based IPIV to 0-based with bitwise-NOT convention for 2x2 pivots.
*/
function convertIPIV( ipivFortran, N ) {
	var out = new Int32Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		if ( ipivFortran[ i ] > 0 ) {
			out[ i ] = ipivFortran[ i ] - 1; // 1-based to 0-based
		} else {
			out[ i ] = ~( -ipivFortran[ i ] - 1 ); // negative 1-based to ~(0-based)
		}
	}
	return out;
}

/**
* Hermitian matrix-vector multiply y = A*x for verification.
* A stored as upper or lower triangle only.
*/
function zhemv( uplo, n, LDA, A, x, y ) {
	var Av = reinterpret( A, 0 );
	var xv = reinterpret( x, 0 );
	var yv = reinterpret( y, 0 );
	var sa = 2 * LDA;
	var rr;
	var ri;
	var ar;
	var ai;
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		rr = 0;
		ri = 0;
		for ( j = 0; j < n; j++ ) {
			if ( uplo === 'upper' ) {
				if ( i <= j ) {
					ar = Av[ 2 * i + sa * j ];
					ai = Av[ 2 * i + sa * j + 1 ];
				} else {
					// Hermitian: A(i,j) = conj(A(j,i))
					ar = Av[ 2 * j + sa * i ];
					ai = -Av[ 2 * j + sa * i + 1 ];
				}
			} else {
				if ( i >= j ) {
					ar = Av[ 2 * i + sa * j ];
					ai = Av[ 2 * i + sa * j + 1 ];
				} else {
					ar = Av[ 2 * j + sa * i ];
					ai = -Av[ 2 * j + sa * i + 1 ];
				}
			}
			// complex multiply: (ar+ai*i)*(xr+xi*i)
			rr += ar * xv[ 2 * j ] - ai * xv[ 2 * j + 1 ];
			ri += ar * xv[ 2 * j + 1 ] + ai * xv[ 2 * j ];
		}
		yv[ 2 * i ] = rr;
		yv[ 2 * i + 1 ] = ri;
	}
}

/**
* Run a fixture-based test: load factored A and IPIV, run zhetrs, verify A_orig * x = b.
*/
function runFixtureTest( name, uplo ) {
	var LDA = 6; // NMAX in Fortran test
	var tc = fixtures[ name ];
	var N = tc.n;
	var nrhs = tc.nrhs;

	// Pack factored A (LDA -> N)
	var A = packComplex( tc.A_factored, N, LDA );
	var IPIV = convertIPIV( tc.ipiv, N );

	// Pack B
	var B = packB( tc.b, N, nrhs, LDA );

	// Pack original A for verification
	var Aorig = packComplex( tc.A_orig, N, LDA );

	var info = zhetrs( uplo, N, nrhs, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0 );
	assert.strictEqual( info, 0 );

	// Verify: A_orig * x should equal b for each RHS
	var Bv = reinterpret( B, 0 );
	var x1;
	var Ax;
	var x1v;
	var b_orig;
	var rr;
	for ( rr = 0; rr < nrhs; rr++ ) {
		x1 = new Complex128Array( N );
		Ax = new Complex128Array( N );
		x1v = reinterpret( x1, 0 );
		for ( var jj = 0; jj < 2 * N; jj++ ) {
			x1v[ jj ] = Bv[ jj + rr * 2 * N ];
		}
		zhemv( uplo, N, N, Aorig, x1, Ax );
		b_orig = packB( tc.b, N, 1, LDA );
		// Actually we need the right column of b
		if ( nrhs > 1 ) {
			b_orig = new Complex128Array( N );
			var bov = reinterpret( b_orig, 0 );
			for ( var kk = 0; kk < 2 * N; kk++ ) {
				bov[ kk ] = tc.b[ kk + rr * 2 * LDA ];
			}
		}
		assertClose( Array.from( reinterpret( Ax, 0 ) ), Array.from( reinterpret( b_orig, 0 ) ), 1e-10, name + ' rhs=' + rr );
	}
}

// TESTS //

test( 'zhetrs: main export is a function', function t() {
	assert.strictEqual( typeof zhetrs, 'function' );
});

test( 'zhetrs: upper 4x4, 1 RHS', function t() {
	runFixtureTest( 'upper_4x4_1rhs', 'upper' );
});

test( 'zhetrs: lower 4x4, 2 RHS', function t() {
	runFixtureTest( 'lower_4x4_2rhs', 'lower' );
});

test( 'zhetrs: N=0', function t() {
	var info = zhetrs( 'upper', 0, 1, new Complex128Array( 1 ), 1, 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zhetrs: N=1', function t() {
	var tc = fixtures[ 'n1' ];
	var A = new Complex128Array( 1 );
	var Av = reinterpret( A, 0 );
	Av[ 0 ] = tc.A_factored[ 0 ];
	Av[ 1 ] = tc.A_factored[ 1 ];
	var B = new Complex128Array( 1 );
	var Bv = reinterpret( B, 0 );
	Bv[ 0 ] = tc.b[ 0 ];
	Bv[ 1 ] = tc.b[ 1 ];
	var IPIV = convertIPIV( tc.ipiv, 1 );
	var info = zhetrs( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	assertClose( Array.from( Bv ), tc.x, 1e-14, 'n1' );
});

test( 'zhetrs: lower 6x6 (2x2 pivots)', function t() {
	runFixtureTest( 'lower_6x6', 'lower' );
});

test( 'zhetrs: upper 6x6 (2x2 pivots)', function t() {
	runFixtureTest( 'upper_6x6', 'upper' );
});

test( 'zhetrs: nrhs=0 returns 0', function t() {
	var info = zhetrs( 'upper', 3, 0, new Complex128Array( 9 ), 1, 3, 0, new Int32Array( 3 ), 1, 0, new Complex128Array( 3 ), 1, 3, 0 );
	assert.strictEqual( info, 0 );
});
