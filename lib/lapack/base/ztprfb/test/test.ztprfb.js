/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztprfb from './../lib/ztprfb.js';
import ztprfbNdarray from './../lib/ndarray.js';
import main from './../lib/index.js';


// TESTS //

test( 'ztprfb is a function', function t() {
	assert.strictEqual( typeof ztprfb, 'function', 'is a function' );
});

test( 'ztprfb has expected arity', function t() {
	assert.strictEqual( ztprfb.length, 19, 'has expected arity' );
});

test( 'ztprfb throws TypeError for invalid order', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'invalid', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid side', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'invalid', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws TypeError for invalid trans', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'invalid', 'forward', 'columnwise', 5, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, TypeError );
});

test( 'ztprfb throws RangeError for negative M', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', -1, 4, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative N', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, -1, 3, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for negative K', function t() {
	const V = new Complex128Array( 15 );
	const T = new Complex128Array( 9 );
	const A = new Complex128Array( 12 );
	const B = new Complex128Array( 20 );
	const W = new Complex128Array( 12 );
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, -1, 2, V, 5, T, 3, A, 3, B, 5, W, 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDT (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDT (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 1, new Complex128Array( 12 ), 3, new Complex128Array( 20 ), 5, new Complex128Array( 12 ), 3 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDB (row-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 1, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb throws RangeError for invalid LDB (column-major)', function t() {
	assert.throws( function throws() {
		ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 3, 2, new Complex128Array( 15 ), 5, new Complex128Array( 9 ), 5, new Complex128Array( 12 ), 5, new Complex128Array( 20 ), 1, new Complex128Array( 12 ), 5 );
	}, RangeError );
});

test( 'ztprfb column-major path executes (K=0 quick exit)', function t() {
	const out = ztprfb( 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 5, 4, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb row-major path executes (K=0 quick exit)', function t() {
	const out = ztprfb( 'row-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 5, 0, 0, new Complex128Array( 64 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 16 ), 5, new Complex128Array( 64 ), 5, new Complex128Array( 64 ), 5 );
	assert.ok( out );
});

test( 'ztprfb exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});

test( 'ztprfb: leading-dimension bounds follow the array extents (ticket 0087)', function t() {
	// T is K by K (ZTPRFB: LDT >= K).
	function F() {
		return new Float64Array( 1024 );
	}
	function Z() {
		return new Complex128Array( 1024 );
	}
	function call( order, ld ) {
		const L = { 'LDV': 16, 'LDT': 16, 'LDA': 16, 'LDB': 16, 'LDWORK': 16 };
		Object.assign( L, ld );
		return ztprfb( order, 'left', 'no-transpose', 'forward', 'columnwise', 6, 5, 2, 0, Z(), L.LDV, Z(), L.LDT, Z(), L.LDA, Z(), L.LDB, Z(), L.LDWORK );
	}
	assert.doesNotThrow( function ok() {
		call( 'column-major', { 'LDT': 2 } );
	}, 'column-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'column-major', { 'LDT': 1 } );
	}, RangeError, 'column-major LDT = 1 is rejected' );
	assert.doesNotThrow( function ok() {
		call( 'row-major', { 'LDT': 2 } );
	}, 'row-major LDT = 2 is accepted' );
	assert.throws( function bad() {
		call( 'row-major', { 'LDT': 1 } );
	}, RangeError, 'row-major LDT = 1 is rejected' );
});

test( 'ztprfb: WORK=null allocates workspace and matches ndarray (both layouts, both sides)', function t() {
	const LD = 8;
	const cases = [
		[ 'column-major', 'left', 'no-transpose', 5, 4 ],
		[ 'column-major', 'right', 'conjugate-transpose', 4, 5 ],
		[ 'row-major', 'left', 'conjugate-transpose', 5, 4 ],
		[ 'row-major', 'right', 'no-transpose', 4, 5 ]
	];
	let s1;
	let s2;
	let i;
	let j;
	let c;
	function fill( seed ) {
		const out = new Complex128Array( LD * LD );
		const v = reinterpret( out, 0 );
		let k;
		for ( k = 0; k < v.length; k++ ) {
			v[ k ] = Math.sin( ( seed * 31.0 ) + ( k * 1.7 ) );
		}
		return out;
	}
	for ( i = 0; i < cases.length; i++ ) {
		c = cases[ i ];
		const V = fill( 1 );
		const T = fill( 2 );
		const A1 = fill( 3 );
		const B1 = fill( 4 );
		const A2 = new Complex128Array( A1 );
		const B2 = new Complex128Array( B1 );
		const B0 = new Float64Array( reinterpret( B1, 0 ) );
		const out = ztprfb( c[ 0 ], c[ 1 ], c[ 2 ], 'forward', 'columnwise', c[ 3 ], c[ 4 ], 3, 2, V, LD, T, LD, A1, LD, B1, LD, null, LD );
		if ( c[ 0 ] === 'column-major' ) {
			s1 = 1;
			s2 = LD;
		} else {
			s1 = LD;
			s2 = 1;
		}
		ztprfbNdarray( c[ 1 ], c[ 2 ], 'forward', 'columnwise', c[ 3 ], c[ 4 ], 3, 2, V, s1, s2, 0, T, s1, s2, 0, A2, s1, s2, 0, B2, s1, s2, 0, new Complex128Array( LD * LD ), s1, s2, 0 );
		assert.strictEqual( out, B1, 'returns B' );
		const a1 = reinterpret( A1, 0 );
		const a2 = reinterpret( A2, 0 );
		const b1 = reinterpret( B1, 0 );
		const b2 = reinterpret( B2, 0 );
		for ( j = 0; j < a1.length; j++ ) {
			assert.strictEqual( a1[ j ], a2[ j ], c.join( ',' ) + ': A[' + j + ']' );
			assert.strictEqual( b1[ j ], b2[ j ], c.join( ',' ) + ': B[' + j + ']' );
		}
		assert.notDeepStrictEqual( Array.from( b1 ), Array.from( B0 ), c.join( ',' ) + ': B was updated' );
	}
});
