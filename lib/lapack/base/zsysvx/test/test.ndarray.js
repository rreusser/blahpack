// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsysvx from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_1rhs from './fixtures/upper_4x4_1rhs.json' with { type: 'json' };
import lower_4x4_2rhs from './fixtures/lower_4x4_2rhs.json' with { type: 'json' };

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

function toF64( cArr, n ) {
	return Array.prototype.slice.call( reinterpret( cArr, 0 ), 0, n );
}

// TESTS //

test( 'zsysvx: upper 4x4, 1 RHS, not-factored', function t() {
	const tc = upper_4x4_1rhs;
	const n = 4;
	const nrhs = 1;
	const A = new Complex128Array( new Float64Array( tc.A ) );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const B = new Complex128Array( new Float64Array( tc.B ) );
	const X = new Complex128Array( n * nrhs );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );

	const info = zsysvx(
		'not-factored', 'upper', n, nrhs,
		A, 1, n, 0,
		AF, 1, n, 0,
		IPIV, 1, 0,
		B, 1, n, 0,
		X, 1, n, 0,
		rcond,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( X, 2 * n ), tc.X, 1e-12, 'X' );
	assert.ok( rcond[ 0 ] > 0.0, 'rcond > 0' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zsysvx: lower 4x4, 2 RHS, not-factored', function t() {
	const tc = lower_4x4_2rhs;
	const n = 4;
	const nrhs = 2;
	const A = new Complex128Array( new Float64Array( tc.A ) );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const B = new Complex128Array( new Float64Array( tc.B ) );
	const X = new Complex128Array( n * nrhs );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );

	const info = zsysvx(
		'not-factored', 'lower', n, nrhs,
		A, 1, n, 0,
		AF, 1, n, 0,
		IPIV, 1, 0,
		B, 1, n, 0,
		X, 1, n, 0,
		rcond,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( X, 2 * n * nrhs ), tc.X, 1e-12, 'X' );
	assert.ok( rcond[ 0 ] > 0.0, 'rcond > 0' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-10, 'rcond' );
});

test( 'zsysvx: N=0 quick return', function t() {
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );

	const info = zsysvx(
		'not-factored', 'upper', 0, 1,
		A, 1, 1, 0,
		AF, 1, 1, 0,
		IPIV, 1, 0,
		B, 1, 1, 0,
		X, 1, 1, 0,
		rcond,
		FERR, 1, 0,
		BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
	assert.strictEqual( info, 0, 'info' );
});
