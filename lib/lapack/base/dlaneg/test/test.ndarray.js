/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaneg from './../lib/ndarray.js';


// VARIABLES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dlaneg.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const fixture = lines.map( parseLine );
const PIVMIN = 1.0e-30;


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed record
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @throws {Error} fixture not found
* @returns {Object} fixture record
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Builds the n=150 test inputs shared across several cases.
*
* @private
* @returns {Object} `{ d, LLD }` Float64Array pair
*/
function buildN150() {
	let i;
	const d = new Float64Array( 150 );
	const LLD = new Float64Array( 149 );
	for ( i = 0; i < 150; i++ ) {
		d[ i ] = i + 1;
	}
	for ( i = 0; i < 149; i++ ) {
		LLD[ i ] = 0.1;
	}
	return {
		'd': d,
		'LLD': LLD
	};
}


// TESTS //

test( 'dlaneg: n1_sigma_below', function t() {
	const tc = findCase( 'n1_sigma_below' );
	const d = new Float64Array( [ 2.0 ] );
	const LLD = new Float64Array( [ 0.0 ] );
	const out = dlaneg( 1, d, 1, 0, LLD, 1, 0, 0.0, PIVMIN, 1 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n1_sigma_above', function t() {
	const tc = findCase( 'n1_sigma_above' );
	const d = new Float64Array( [ 2.0 ] );
	const LLD = new Float64Array( [ 0.0 ] );
	const out = dlaneg( 1, d, 1, 0, LLD, 1, 0, 5.0, PIVMIN, 1 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n5_sigma_zero_r3', function t() {
	const tc = findCase( 'n5_sigma_zero_r3' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const out = dlaneg( 5, d, 1, 0, LLD, 1, 0, 0.0, PIVMIN, 3 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n5_sigma_zero_r5', function t() {
	const tc = findCase( 'n5_sigma_zero_r5' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const out = dlaneg( 5, d, 1, 0, LLD, 1, 0, 0.0, PIVMIN, 5 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n5_sigma_zero_r1', function t() {
	const tc = findCase( 'n5_sigma_zero_r1' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const out = dlaneg( 5, d, 1, 0, LLD, 1, 0, 0.0, PIVMIN, 1 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n5_sigma_large_r3', function t() {
	const tc = findCase( 'n5_sigma_large_r3' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const LLD = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const out = dlaneg( 5, d, 1, 0, LLD, 1, 0, 10.0, PIVMIN, 3 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n4_mixed_r2', function t() {
	const tc = findCase( 'n4_mixed_r2' );
	const d = new Float64Array( [ -1.0, 2.0, -3.0, 4.0 ] );
	const LLD = new Float64Array( [ 0.25, 0.25, 0.25 ] );
	const out = dlaneg( 4, d, 1, 0, LLD, 1, 0, 0.0, PIVMIN, 2 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n4_mixed_neg_sigma', function t() {
	const tc = findCase( 'n4_mixed_neg_sigma' );
	const d = new Float64Array( [ -1.0, 2.0, -3.0, 4.0 ] );
	const LLD = new Float64Array( [ 0.25, 0.25, 0.25 ] );
	const out = dlaneg( 4, d, 1, 0, LLD, 1, 0, -1.0, PIVMIN, 2 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n150_sigma_zero', function t() {
	const tc = findCase( 'n150_sigma_zero' );
	const inputs = buildN150();
	const out = dlaneg( 150, inputs.d, 1, 0, inputs.LLD, 1, 0, 0.0, PIVMIN, 75 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n150_sigma_50', function t() {
	const tc = findCase( 'n150_sigma_50' );
	const inputs = buildN150();
	const out = dlaneg( 150, inputs.d, 1, 0, inputs.LLD, 1, 0, 50.5, PIVMIN, 75 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n150_r_n', function t() {
	const tc = findCase( 'n150_r_n' );
	const inputs = buildN150();
	const out = dlaneg( 150, inputs.d, 1, 0, inputs.LLD, 1, 0, 0.0, PIVMIN, 150 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n150_r_1', function t() {
	const tc = findCase( 'n150_r_1' );
	const inputs = buildN150();
	const out = dlaneg( 150, inputs.d, 1, 0, inputs.LLD, 1, 0, 0.0, PIVMIN, 1 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n2_r1', function t() {
	const tc = findCase( 'n2_r1' );
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const LLD = new Float64Array( [ 1.0 ] );
	const out = dlaneg( 2, d, 1, 0, LLD, 1, 0, 0.5, PIVMIN, 1 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: n2_r2', function t() {
	const tc = findCase( 'n2_r2' );
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const LLD = new Float64Array( [ 1.0 ] );
	const out = dlaneg( 2, d, 1, 0, LLD, 1, 0, 0.5, PIVMIN, 2 );
	assert.strictEqual( out, tc.negcnt, 'negcnt' );
});

test( 'dlaneg: supports non-unit strides on d and LLD', function t() {

	// Interleave with padding to exercise `strideD=2` and `strideLLD=2`:
	const d = new Float64Array( [ 4.0, 99.0, 3.0, 99.0, 2.0, 99.0, 1.0, 99.0, 5.0, 99.0 ] ); // eslint-disable-line max-len
	const LLD = new Float64Array( [ 0.5, 77.0, 0.5, 77.0, 0.5, 77.0, 0.5, 77.0 ] );
	const out = dlaneg( 5, d, 2, 0, LLD, 2, 0, 0.0, PIVMIN, 3 );
	assert.strictEqual( out, 0, 'matches n5_sigma_zero_r3 with strided layout' );
});

test( 'dlaneg: supports non-zero offsets on d and LLD', function t() {
	const d = new Float64Array( [ 99.0, 99.0, 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const LLD = new Float64Array( [ 77.0, 77.0, 77.0, 0.5, 0.5, 0.5, 0.5 ] );
	const out = dlaneg( 5, d, 1, 2, LLD, 1, 3, 10.0, PIVMIN, 3 );
	assert.strictEqual( out, 5, 'matches n5_sigma_large_r3 with offsets' );
});
