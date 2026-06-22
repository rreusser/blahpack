// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqr1 from './../lib/ndarray.js';

// FIXTURES //

import _2x2_real_shifts from './fixtures/2x2_real_shifts.json' with { type: 'json' };
import _2x2_complex_shifts from './fixtures/2x2_complex_shifts.json' with { type: 'json' };
import _3x3_real_shifts from './fixtures/3x3_real_shifts.json' with { type: 'json' };
import _3x3_complex_shifts from './fixtures/3x3_complex_shifts.json' with { type: 'json' };
import _3x3_conjugate_shifts from './fixtures/3x3_conjugate_shifts.json' with { type: 'json' };
import _2x2_identical_shifts from './fixtures/2x2_identical_shifts.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build an NxN complex column-major matrix.
*/
function makeMatrix( N ) {
	return {
		data: new Complex128Array( N * N ),
		s1: 1,
		s2: N,
		offset: 0
	};
}

/**
* Set complex element (i, j) in a matrix (0-based).
*/
function mset( m, N, i, j, re, im ) {
	var mv = reinterpret( m.data, 0 );
	var idx = ( m.offset + i * m.s1 + j * m.s2 ) * 2;
	mv[ idx ] = re;
	mv[ idx + 1 ] = im;
}

// TESTS //

test( 'zlaqr1: main export is a function', function t() {
	assert.strictEqual( typeof zlaqr1, 'function' );
});

test( 'zlaqr1: 2x2 with real shifts', function t() {
	var tc = _2x2_real_shifts;
	var n = 2;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 4.0, 0.0 );
	mset( Hm, n, 0, 1, 2.0, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 3.0, 0.0 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 5.0, 0.0 ), new Complex128( 2.0, 0.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: 2x2 with complex shifts', function t() {
	var tc = _2x2_complex_shifts;
	var n = 2;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 4.0, 1.0 );
	mset( Hm, n, 0, 1, 2.0, -1.0 );
	mset( Hm, n, 1, 0, 1.0, 0.5 );
	mset( Hm, n, 1, 1, 3.0, -0.5 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 3.0, 2.0 ), new Complex128( 1.0, -1.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: 3x3 with real shifts', function t() {
	var tc = _3x3_real_shifts;
	var n = 3;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 5.0, 0.0 );
	mset( Hm, n, 0, 1, 2.0, 0.0 );
	mset( Hm, n, 0, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 4.0, 0.0 );
	mset( Hm, n, 1, 2, 3.0, 0.0 );
	mset( Hm, n, 2, 0, 0.0, 0.0 );
	mset( Hm, n, 2, 1, 2.0, 0.0 );
	mset( Hm, n, 2, 2, 3.0, 0.0 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 6.0, 0.0 ), new Complex128( 2.0, 0.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: 3x3 with complex shifts', function t() {
	var tc = _3x3_complex_shifts;
	var n = 3;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 3.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.5 );
	mset( Hm, n, 0, 2, 0.5, -0.5 );
	mset( Hm, n, 1, 0, 2.0, -1.0 );
	mset( Hm, n, 1, 1, 4.0, 0.0 );
	mset( Hm, n, 1, 2, 1.0, 1.0 );
	mset( Hm, n, 2, 0, 0.0, 0.0 );
	mset( Hm, n, 2, 1, 1.5, 0.5 );
	mset( Hm, n, 2, 2, 2.0, -1.0 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 2.0, 3.0 ), new Complex128( 1.0, -2.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: 3x3 with conjugate pair shifts', function t() {
	var tc = _3x3_conjugate_shifts;
	var n = 3;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 6.0, 0.5 );
	mset( Hm, n, 0, 1, 3.0, -1.0 );
	mset( Hm, n, 0, 2, 1.0, 0.0 );
	mset( Hm, n, 1, 0, 1.0, 0.0 );
	mset( Hm, n, 1, 1, 5.0, -0.5 );
	mset( Hm, n, 1, 2, 2.0, 1.0 );
	mset( Hm, n, 2, 0, 0.0, 0.0 );
	mset( Hm, n, 2, 1, 0.5, 0.25 );
	mset( Hm, n, 2, 2, 4.0, 0.0 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 3.0, 1.5 ), new Complex128( 3.0, -1.5 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: 2x2 with identical shifts', function t() {
	var tc = _2x2_identical_shifts;
	var n = 2;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	mset( Hm, n, 0, 0, 3.0, 1.0 );
	mset( Hm, n, 0, 1, 1.0, 0.0 );
	mset( Hm, n, 1, 0, 0.5, -0.5 );
	mset( Hm, n, 1, 1, 2.0, -1.0 );

	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 3.0, 1.0 ), new Complex128( 3.0, 1.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assertArrayClose( vv, tc.v, 1e-13, 'v' );
});

test( 'zlaqr1: quick return for invalid N (N=0)', function t() {
	var Hm = makeMatrix( 2 );
	var v = new Complex128Array( 2 );
	var vv;

	// Pre-fill v with sentinel values
	vv = reinterpret( v, 0 );
	vv[ 0 ] = 99.0;
	vv[ 1 ] = 99.0;
	vv[ 2 ] = 99.0;
	vv[ 3 ] = 99.0;

	zlaqr1( 0, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 1.0, 0.0 ), new Complex128( 1.0, 0.0 ),
		v, 1, 0
	);

	// v should be untouched
	vv = Array.from( reinterpret( v, 0 ) );
	assert.equal( vv[ 0 ], 99.0, 'v untouched for N=0' );
	assert.equal( vv[ 1 ], 99.0, 'v untouched for N=0' );
});

test( 'zlaqr1: quick return for invalid N (N=1)', function t() {
	var Hm = makeMatrix( 2 );
	var v = new Complex128Array( 2 );
	var vv;

	vv = reinterpret( v, 0 );
	vv[ 0 ] = 99.0;
	vv[ 1 ] = 99.0;

	zlaqr1( 1, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 1.0, 0.0 ), new Complex128( 1.0, 0.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assert.equal( vv[ 0 ], 99.0, 'v untouched for N=1' );
});

test( 'zlaqr1: 2x2 zero matrix produces zero output (s=0 branch)', function t() {
	var n = 2;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	// H is all zeros, shifts are zero => s = 0
	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 0.0, 0.0 ), new Complex128( 0.0, 0.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assert.equal( vv[ 0 ], 0.0, 'v[0].re = 0' );
	assert.equal( vv[ 1 ], 0.0, 'v[0].im = 0' );
	assert.equal( vv[ 2 ], 0.0, 'v[1].re = 0' );
	assert.equal( vv[ 3 ], 0.0, 'v[1].im = 0' );
});

test( 'zlaqr1: 3x3 zero matrix produces zero output (s=0 branch)', function t() {
	var n = 3;
	var Hm = makeMatrix( n );
	var v = new Complex128Array( n );
	var vv;

	// H is all zeros, shifts are zero => s = 0
	zlaqr1( n, Hm.data, Hm.s1, Hm.s2, Hm.offset,
		new Complex128( 0.0, 0.0 ), new Complex128( 0.0, 0.0 ),
		v, 1, 0
	);

	vv = Array.from( reinterpret( v, 0 ) );
	assert.equal( vv[ 0 ], 0.0, 'v[0].re = 0' );
	assert.equal( vv[ 1 ], 0.0, 'v[0].im = 0' );
	assert.equal( vv[ 2 ], 0.0, 'v[1].re = 0' );
	assert.equal( vv[ 3 ], 0.0, 'v[1].im = 0' );
	assert.equal( vv[ 4 ], 0.0, 'v[2].re = 0' );
	assert.equal( vv[ 5 ], 0.0, 'v[2].im = 0' );
});
