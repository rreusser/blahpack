/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dtgsna from './../lib/dtgsna.js';


// FIXTURES //

const FIXTURES = readFileSync( path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures', 'dtgsna.jsonl' ), 'utf8' ).trim().split( '\n' ).map( ( line ) => JSON.parse( line ) ); // eslint-disable-line max-len


// TESTS //

test( 'dtgsna is a function', function t() {
	assert.strictEqual( typeof dtgsna, 'function', 'is a function' );
});

test( 'dtgsna has expected arity', function t() {
	assert.strictEqual( dtgsna.length, 22, 'has expected arity' );
});

test( 'dtgsna throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgsna( 'invalid', 'no-transpose', 'no-transpose', new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dtgsna throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsna( 'row-major', 'eigenvalues', 'all', new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dtgsna: row-major VL/VR must have room for mm columns', function t() {
	// Regression (tickets/0001): the row-major bound was `max( 1, M )` with M
	// the Int32Array output, i.e. NaN, so an undersized LDVL/LDVR was never rejected.
	function run( LDV ) {
		const A = new Float64Array( [ 1.0, 0.0, 0.0, 2.0 ] );
		const B = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		const VL = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		const VR = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
		return dtgsna( 'row-major', 'eigenvalues', 'all', new Uint8Array( 2 ), 1, 2, A, 2, B, 2, VL, LDV, VR, LDV, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, 2, new Int32Array( 1 ), new Float64Array( 64 ), new Int32Array( 8 ) );
	}
	assert.throws( function bad() {
		run( 1 );
	}, RangeError );
	assert.doesNotThrow( function good() {
		run( 2 );
	});
});

test( 'dtgsna: WORK = null and IWORK = null allocate enough for job = both (matches the reference)', function t() {
	// The wrapper allocated max(1, N) for WORK whatever the job; job =
	// 'eigenvectors'/'both' needs 2*N*(N+2)+16, and typed arrays drop the
	// overflow, so s and DIF came back 0 (ticket 0072).
	const A = new Float64Array( [ 1, 0, 0, 0.5, 2, 0, 0.3, 0.4, 3 ] );
	const B = new Float64Array( [ 1, 0, 0, 0.2, 1.5, 0, 0.1, 0.3, 2 ] );
	const V = new Float64Array( [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] );
	const s = new Float64Array( 3 );
	const DIF = new Float64Array( 3 );
	const M = new Int32Array( 1 );
	const info = dtgsna( 'column-major', 'both', 'all', new Uint8Array( 3 ), 1, 3, A, 3, B, 3, V, 3, new Float64Array( V ), 3, s, 1, DIF, 1, 3, M, null, null );
	const tc = FIXTURES.find( ( x ) => x.name === 'n3_both_all' );
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
	for ( let i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( s[ i ] - tc.S[ i ] ) <= 1e-10 * Math.max( 1, Math.abs( tc.S[ i ] ) ), 's[' + i + ']: ' + s[ i ] + ' vs ' + tc.S[ i ] );
		assert.ok( Math.abs( DIF[ i ] - tc.DIF[ i ] ) <= 1e-10 * Math.max( 1, Math.abs( tc.DIF[ i ] ) ), 'DIF[' + i + ']: ' + DIF[ i ] + ' vs ' + tc.DIF[ i ] );
	}
});
