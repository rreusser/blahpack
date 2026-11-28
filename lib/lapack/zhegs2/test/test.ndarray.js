

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zhegs2 from './../lib/ndarray.js';

// FIXTURES //

import itype1_upper from './fixtures/itype1_upper.json' with { type: 'json' };
import itype1_lower from './fixtures/itype1_lower.json' with { type: 'json' };
import itype2_upper from './fixtures/itype2_upper.json' with { type: 'json' };
import itype2_lower from './fixtures/itype2_lower.json' with { type: 'json' };
import itype3_upper from './fixtures/itype3_upper.json' with { type: 'json' };
import itype3_lower from './fixtures/itype3_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };

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

// B matrix (Hermitian positive definite):
// B = [4 1+i 0; 1-i 5 2-i; 0 2+i 6]
// Col-major interleaved re/im for 3x3:
const B_UPPER_DATA = [
	4, 0, 1, -1, 0, 0,   // col 1: B(1,1)=4, B(2,1)=1-i, B(3,1)=0
	1, 1, 5, 0, 2, 1,    // col 2: B(1,2)=1+i, B(2,2)=5, B(3,2)=2+i
	0, 0, 2, -1, 6, 0    // col 3: B(1,3)=0, B(2,3)=2-i, B(3,3)=6
];

// A matrix (Hermitian), upper stored:
// A = [10 2+i 1-2i; 2-i 8 3+i; 1+2i 3-i 7]
const A_UPPER_DATA = [
	10, 0, 0, 0, 0, 0,     // col 1
	2, 1, 8, 0, 0, 0,      // col 2
	1, -2, 3, 1, 7, 0      // col 3
];

// A matrix (Hermitian), lower stored:
const A_LOWER_DATA = [
	10, 0, 2, -1, 1, 2,    // col 1
	0, 0, 8, 0, 3, -1,     // col 2
	0, 0, 0, 0, 7, 0       // col 3
];

function makeB( uplo ) {
	const B = new Complex128Array( B_UPPER_DATA );
	zpotrf( uplo, 3, B, 1, 3, 0 );
	return B;
}

// TESTS //

test( 'zhegs2: itype1_upper', function t() {
	const tc = itype1_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegs2( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: itype1_lower', function t() {
	const tc = itype1_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegs2( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: itype2_upper', function t() {
	const tc = itype2_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegs2( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: itype2_lower', function t() {
	const tc = itype2_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegs2( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: itype3_upper', function t() {
	const tc = itype3_upper;
	const B = makeB( 'upper' );
	const A = new Complex128Array( A_UPPER_DATA );
	const info = zhegs2( 3, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: itype3_lower', function t() {
	const tc = itype3_lower;
	const B = makeB( 'lower' );
	const A = new Complex128Array( A_LOWER_DATA );
	const info = zhegs2( 3, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});

test( 'zhegs2: n_zero', function t() {
	const A = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const info = zhegs2( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhegs2: n_one', function t() {
	const tc = n_one;
	const A = new Complex128Array( [ 9, 0 ] );
	const B = new Complex128Array( [ 3, 0 ] );
	const info = zhegs2( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-13, 'A' );
});
