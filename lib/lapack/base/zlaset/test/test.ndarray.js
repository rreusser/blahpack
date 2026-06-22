import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaset from './../lib/index.js';
import base from './../lib/ndarray.js';

// FIXTURES //

import zlaset_full from './fixtures/zlaset_full.json' with { type: 'json' };
import zlaset_upper from './fixtures/zlaset_upper.json' with { type: 'json' };
import zlaset_lower from './fixtures/zlaset_lower.json' with { type: 'json' };
import zlaset_1x1 from './fixtures/zlaset_1x1.json' with { type: 'json' };
import zlaset_0x0 from './fixtures/zlaset_0x0.json' with { type: 'json' };
import zlaset_2x3 from './fixtures/zlaset_2x3.json' with { type: 'json' };
import zlaset_3x2 from './fixtures/zlaset_3x2.json' with { type: 'json' };
import zlaset_upper_identity from './fixtures/zlaset_upper_identity.json' with { type: 'json' };
// HELPERS //

function assertArrayClose( actual, expected, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
			assert.ok( relErr <= 1e-14, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

// Extract column from interleaved Float64 view of a complex array
// LDA = number of rows allocated, M = number of rows to extract
// Column j starts at offset j * 2 * LDA in the flat array
function extractCol( Av, j, M, LDA ) {
	var result = [];
	var start = j * 2 * LDA;
	var i;
	for ( i = 0; i < M; i++ ) {
		result.push( Av[ start + i * 2 ] );     // re
		result.push( Av[ start + i * 2 + 1 ] ); // im
	}
	return result;
}

// TESTS //

test( 'zlaset: main export is a function', function t() {
	assert.strictEqual( typeof zlaset, 'function' );
});

test( 'zlaset: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlaset.ndarray, 'function' );
});

test( 'zlaset: full 3x3 matrix', function t() {
	var tc = zlaset_full;
	var LDA = 4;
	var A = new Complex128Array( LDA * 3 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 1.0, 2.0 );
	var beta = new Complex128( 3.0, 4.0 );
	base( 'all', 3, 3, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 3, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 3, LDA ), tc.a_col2, 'col2' );
	assertArrayClose( extractCol( Av, 2, 3, LDA ), tc.a_col3, 'col3' );
});

test( 'zlaset: upper triangular 3x3', function t() {
	var tc = zlaset_upper;
	var LDA = 4;
	var A = new Complex128Array( LDA * 3 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 5.0, 0.0 );
	base( 'upper', 3, 3, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 3, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 3, LDA ), tc.a_col2, 'col2' );
	assertArrayClose( extractCol( Av, 2, 3, LDA ), tc.a_col3, 'col3' );
});

test( 'zlaset: lower triangular 3x3', function t() {
	var tc = zlaset_lower;
	var LDA = 4;
	var A = new Complex128Array( LDA * 3 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 2.0, 1.0 );
	var beta = new Complex128( 7.0, 3.0 );
	base( 'lower', 3, 3, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 3, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 3, LDA ), tc.a_col2, 'col2' );
	assertArrayClose( extractCol( Av, 2, 3, LDA ), tc.a_col3, 'col3' );
});

test( 'zlaset: 1x1 matrix (diagonal only)', function t() {
	var tc = zlaset_1x1;
	var LDA = 4;
	var A = new Complex128Array( LDA );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 10.0, 20.0 );
	var beta = new Complex128( 30.0, 40.0 );
	base( 'all', 1, 1, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( [ Av[ 0 ], Av[ 1 ] ], tc.a, '1x1' );
});

test( 'zlaset: 0x0 matrix (no-op)', function t() {
	var tc = zlaset_0x0;
	var LDA = 4;
	var A = new Complex128Array( LDA );
	var Av = reinterpret( A, 0 );
	Av[ 0 ] = 99.0;
	Av[ 1 ] = 99.0;
	var alpha = new Complex128( 1.0, 2.0 );
	var beta = new Complex128( 3.0, 4.0 );
	base( 'all', 0, 0, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( [ Av[ 0 ], Av[ 1 ] ], tc.a, '0x0' );
});

test( 'zlaset: rectangular 2x3', function t() {
	var tc = zlaset_2x3;
	var LDA = 4;
	var A = new Complex128Array( LDA * 3 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 1.0, -1.0 );
	var beta = new Complex128( 5.0, -5.0 );
	base( 'all', 2, 3, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 2, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 2, LDA ), tc.a_col2, 'col2' );
	assertArrayClose( extractCol( Av, 2, 2, LDA ), tc.a_col3, 'col3' );
});

test( 'zlaset: rectangular 3x2', function t() {
	var tc = zlaset_3x2;
	var LDA = 4;
	var A = new Complex128Array( LDA * 2 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 2.0, 3.0 );
	var beta = new Complex128( 8.0, 9.0 );
	base( 'all', 3, 2, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 3, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 3, LDA ), tc.a_col2, 'col2' );
});

test( 'zlaset: upper 4x4 identity', function t() {
	var tc = zlaset_upper_identity;
	var LDA = 4;
	var A = new Complex128Array( LDA * 4 );
	var Av = reinterpret( A, 0 );
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 1.0, 0.0 );
	base( 'upper', 4, 4, alpha, beta, A, 1, LDA, 0 );
	assertArrayClose( extractCol( Av, 0, 4, LDA ), tc.a_col1, 'col1' );
	assertArrayClose( extractCol( Av, 1, 4, LDA ), tc.a_col2, 'col2' );
	assertArrayClose( extractCol( Av, 2, 4, LDA ), tc.a_col3, 'col3' );
	assertArrayClose( extractCol( Av, 3, 4, LDA ), tc.a_col4, 'col4' );
});
