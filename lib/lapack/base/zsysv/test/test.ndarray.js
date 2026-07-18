

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsysv from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import pivot_2x2_lower from './fixtures/pivot_2x2_lower.json' with { type: 'json' };

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

/**
* Creates a Complex128Array from interleaved re/im Float64 values.
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

/**
* Convert Fortran 1-based IPIV to 0-based JS convention.
* Positive values: subtract 1 (1-based to 0-based).
* Negative values: stay the same (Fortran -k maps to JS ~(k-1) = -k).
*/
function ipivTo0Based( ipiv ) {
	let i;
	const out = [];
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] > 0 ) {
			out.push( ipiv[ i ] - 1 );
		} else {
			out.push( ipiv[ i ] );
		}
	}
	return out;
}

// TESTS //

test( 'zsysv: upper_4x4 - solves complex symmetric system with upper storage', function t() {

	const tc = upper_4x4;
	const expectedIPIV = ipivTo0Based( tc.ipiv );

	// A (symmetric, upper triangle, column-major, LDA=4):
	// [ (2,1)   (1,2)   (3,-1)  (0.5,0.5) ]
	// [ *       (5,-1)  (2,1)   (1,-2)     ]
	// [ *       *       (4,2)   (3,0)      ]
	// [ *       *       *       (6,-3)     ]
	const A = c128([
		2, 1, 0, 0, 0, 0, 0, 0,
		1, 2, 5, -1, 0, 0, 0, 0,
		3, -1, 2, 1, 4, 2, 0, 0,
		0.5, 0.5, 1, -2, 3, 0, 6, -3
	]);
	// b = A * [1; 2; 3; 4]
	const B = c128([ 15, 4, 21, -5, 31, 7, 35.5, -15.5 ]);
	const IPIV = new Int32Array( 4 );

	const info = zsysv( 'upper', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Complex128Array( 4 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-12, 'x' );
	assert.deepStrictEqual( Array.from( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'zsysv: lower_4x4 - solves complex symmetric system with lower storage', function t() {

	const tc = lower_4x4;
	const expectedIPIV = ipivTo0Based( tc.ipiv );

	// A (symmetric, lower triangle, column-major, LDA=4):
	const A = c128([
		2, 1, 1, 2, 3, -1, 0.5, 0.5,
		0, 0, 5, -1, 2, 1, 1, -2,
		0, 0, 0, 0, 4, 2, 3, 0,
		0, 0, 0, 0, 0, 0, 6, -3
	]);
	const B = c128([ 15, 4, 21, -5, 31, 7, 35.5, -15.5 ]);
	const IPIV = new Int32Array( 4 );

	const info = zsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Complex128Array( 4 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-12, 'x' );
	assert.deepStrictEqual( Array.from( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'zsysv: multi_rhs - multiple right-hand sides', function t() {

	const tc = multi_rhs;
	const expectedIPIV = ipivTo0Based( tc.ipiv );

	// A = [(2,1) (1,0); (1,0) (3,-1)], upper, LDA=2
	const A = c128([
		2, 1, 0, 0,
		1, 0, 3, -1
	]);
	// B = [(4,1) (7,3); (7,-1) (6,-1)], LDB=2, NRHS=2
	// Column-major: col1=[(4,1),(7,-1)], col2=[(7,3),(6,-1)]
	const B = c128([
		4, 1, 7, -1,
		7, 3, 6, -1
	]);
	const IPIV = new Int32Array( 2 );

	const info = zsysv( 'upper', 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0, new Complex128Array( 2 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	// Fixture x has NMAX=6 padding for multi_rhs; extract only the solution values.
	// col1: first 2 complex = indices 0..3, col2: at NMAX*2 offset = 12..15
	assertArrayClose( Array.from( Bv ).slice( 0, 4 ), tc.x.slice( 0, 4 ), 1e-12, 'x col1' );
	assertArrayClose( Array.from( Bv ).slice( 4, 8 ), tc.x.slice( 12, 16 ), 1e-12, 'x col2' );
	assert.deepStrictEqual( Array.from( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'zsysv: singular - returns info > 0 for singular matrix', function t() {

	// A = [(1,0) (1,0); (1,0) (1,0)] singular
	const A = c128([
		1, 0, 0, 0,
		1, 0, 1, 0
	]);
	const B = c128([ 1, 0, 2, 0 ]);
	const IPIV = new Int32Array( 2 );

	const info = zsysv( 'upper', 2, 1, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0, new Complex128Array( 2 ), 1, 0 );

	assert.ok( info > 0, 'info should be > 0 for singular matrix' );
});

test( 'zsysv: n1 - N=1 edge case', function t() {

	const tc = n1;
	const expectedIPIV = ipivTo0Based( tc.ipiv );

	// A = [(3,1)], b = [(9,3)] => x = (9,3)/(3,1) = (3,0)
	const A = c128([ 3, 1 ]);
	const B = c128([ 9, 3 ]);
	const IPIV = new Int32Array( 1 );

	const info = zsysv( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Complex128Array( 1 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-12, 'x' );
	assert.deepStrictEqual( Array.from( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'zsysv: pivot_2x2_lower - matrix triggering 2x2 pivots (lower)', function t() {

	const tc = pivot_2x2_lower;
	const expectedIPIV = ipivTo0Based( tc.ipiv );

	// Lower triangle, column-major, LDA=4:
	// [ (0,0) *     *     *     ]
	// [ (1,1) (0,0) *     *     ]
	// [ (0,0) (0,0) (4,1) *     ]
	// [ (0,0) (0,0) (1,0) (4,-1)]
	const A = c128([
		0, 0, 1, 1, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 4, 1, 1, 0,
		0, 0, 0, 0, 0, 0, 4, -1
	]);
	const B = c128([ 2, 2, 1, 1, 16, 3, 19, -4 ]);
	const IPIV = new Int32Array( 4 );

	const info = zsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Complex128Array( 4 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( Bv ), tc.x, 1e-12, 'x' );
	assert.deepStrictEqual( Array.from( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'zsysv: n_zero - N=0 quick return', function t() {

	const A = c128([ 1, 0 ]);
	const B = c128([ 1, 0 ]);
	const IPIV = new Int32Array( 1 );

	const info = zsysv( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsysv: nrhs_zero - NRHS=0 quick return', function t() {

	const A = c128([ 3, 1 ]);
	const B = c128([ 9, 3 ]);
	const IPIV = new Int32Array( 1 );

	const info = zsysv( 'upper', 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Complex128Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsysv: n1_lower - N=1 with lower storage', function t() {

	// A = [(4,2)], b = [(12,6)] => x = (12,6)/(4,2) = (3,0)
	const A = c128([ 4, 2 ]);
	const B = c128([ 12, 6 ]);
	const IPIV = new Int32Array( 1 );

	const info = zsysv( 'lower', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Complex128Array( 1 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( Bv ), [ 3, 0 ], 1e-12, 'x' );
});

test( 'zsysv: 3x3_upper - 3x3 complex symmetric upper', function t() {

	// A = [(3,0) (1,1) (0,0); * (4,0) (2,-1); * * (5,0)]
	// x = [1; 1; 1], b = A*x:
	// row 0: (3,0) + (1,1) + (0,0) = (4,1)
	// row 1: (1,1) + (4,0) + (2,-1) = (7,0)
	// row 2: (0,0) + (2,-1) + (5,0) = (7,-1)
	const A = c128([
		3, 0, 0, 0, 0, 0,
		1, 1, 4, 0, 0, 0,
		0, 0, 2, -1, 5, 0
	]);
	const B = c128([ 4, 1, 7, 0, 7, -1 ]);
	const IPIV = new Int32Array( 3 );

	const info = zsysv( 'upper', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, new Complex128Array( 3 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( Bv ), [ 1, 0, 1, 0, 1, 0 ], 1e-12, 'x' );
});

test( 'zsysv: 3x3_lower - 3x3 complex symmetric lower', function t() {

	// Same matrix as above, lower triangle
	// A = [(3,0) * *; (1,1) (4,0) *; (0,0) (2,-1) (5,0)]
	const A = c128([
		3, 0, 1, 1, 0, 0,
		0, 0, 4, 0, 2, -1,
		0, 0, 0, 0, 5, 0
	]);
	const B = c128([ 4, 1, 7, 0, 7, -1 ]);
	const IPIV = new Int32Array( 3 );

	const info = zsysv( 'lower', 3, 1, A, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, new Complex128Array( 3 ), 1, 0 );

	const Bv = reinterpret( B, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( Array.from( Bv ), [ 1, 0, 1, 0, 1, 0 ], 1e-12, 'x' );
});
