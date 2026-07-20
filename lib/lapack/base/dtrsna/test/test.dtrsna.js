/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsna from './../lib/dtrsna.js';


// FUNCTIONS //

function buf( n ) {
	return new Float64Array( n );
}

function ibuf( n ) {
	return new Int32Array( n );
}

function sbuf( n ) {
	return new Uint8Array( n );
}


// TESTS //

test( 'dtrsna is a function', function t() {
	assert.strictEqual( typeof dtrsna, 'function', 'is a function' );
} );

test( 'dtrsna has expected arity', function t() {
	assert.strictEqual( dtrsna.length, 22, 'has expected arity' );
} );

test( 'dtrsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtrsna( 'invalid', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, TypeError );
} );

test( 'dtrsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, -1, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );


test( 'dtrsna throws RangeError for LDT < N (row-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDT < N (column-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVL < N (row-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVL < N (column-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVR < N (row-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDVR < N (column-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 0, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 2, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDWORK < N (row-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'row-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 0, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna throws RangeError for LDWORK < N (column-major)', function t() {
	assert.throws( function throws() {
		dtrsna( 'column-major', 'both', 'all', sbuf( 4 ), 1, 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 2, buf( 4 ), 1, buf( 4 ), 1, 2, buf( 16 ), 0, ibuf( 4 ), 1, 0 );
	}, RangeError );
} );

test( 'dtrsna: column-major path runs without throwing on a 2x2 diagonal matrix (job=eigenvalues)', function t() {
	const T = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
	const VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const SELECT = new Uint8Array( [ 1, 1 ] );
	const s = new Float64Array( 2 );
	const SEP = new Float64Array( 2 );
	const WORK = new Float64Array( 2 * 8 );
	const IWORK = new Int32Array( 4 );
	const info = dtrsna( 'column-major', 'eigenvalues', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, s, 1, SEP, 1, 2, 2, WORK, 2, IWORK, 1, 0 );
	assert.equal( typeof info, 'object', 'returns object' );
	assert.equal( info.info, 0, 'info=0' );
} );

test( 'dtrsna: row-major path runs without throwing on a 2x2 diagonal matrix', function t() {
	const T = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
	const VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	const SELECT = new Uint8Array( [ 1, 1 ] );
	const s = new Float64Array( 2 );
	const SEP = new Float64Array( 2 );
	const WORK = new Float64Array( 2 * 8 );
	const IWORK = new Int32Array( 4 );
	const info = dtrsna( 'row-major', 'eigenvalues', 'all', SELECT, 1, 2, T, 2, VL, 2, VR, 2, s, 1, SEP, 1, 2, 2, WORK, 2, IWORK, 1, 0 );
	assert.equal( typeof info, 'object', 'returns object' );
	assert.equal( info.info, 0, 'info=0' );
} );

// Regression: the eigenvector-condition path ('both'/'eigenvectors') via the
// full documented layout signature. A vestigial `M` param once shifted the
// workspace args and crashed here; fixture helpers hid it by omitting `M`.
// See test/harness/LEARNINGS.md (2026-07-19 dtrsna).
test( 'dtrsna: documented signature, job=both, SEP path (regression)', function t() {
	const N = 3;
	const T = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0, 3.0 ]); // diag(1,2,3)
	const VL = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
	const VR = new Float64Array([ 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0 ]);
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const WORK = new Float64Array( N * ( N + 6 ) );
	const IWORK = new Int32Array( 2 * N );

	const out = dtrsna( 'column-major', 'both', 'all', SELECT, 1, N, T, N, VL, N, VR, N, s, 1, SEP, 1, N, WORK, N, IWORK, 1, 0 );

	assert.strictEqual( out.info, 0, 'info' );
	assert.strictEqual( out.m, N, 'm' );
	// Normal (diagonal) matrix: eigenvalue condition numbers are 1; the
	// eigenvalue separations equal the minimum gap (all 1 for diag(1,2,3)).
	for ( let i = 0; i < N; i++ ) {
		assert.ok( Math.abs( s[ i ] - 1.0 ) < 1e-12, 's['+i+']' );
		assert.ok( Math.abs( SEP[ i ] - 1.0 ) < 1e-12, 'SEP['+i+']' );
	}
});
