

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './../lib/base.js';
import dseupd from './../lib/index.js';


// FIXTURES //

const fixtureURL = new URL( '../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Calls the `base.js` kernel directly on the `lm_rvec` reference fixture state (the strided and wrappers reject these string arguments before `base.js` runs).
*
* @private
* @param {boolean} rvec - compute Ritz vectors
* @param {string} howmny - howmny
* @param {string} bmat - bmat
* @param {string} which - which
* @returns {Object} info and Ritz values
*/
function callBase( rvec, howmny, bmat, which ) {
	const tc = cases[ 0 ];
	const d = new Float64Array( tc.nev ).fill( -999.0 );
	const info = base( rvec, howmny, new Uint8Array( tc.ncv ), 1, 0, d, 1, 0, new Float64Array( tc.n * tc.nev ), 1, tc.n, 0, tc.sigma, bmat, tc.n, which, tc.nev, tc.tol, Float64Array.from( tc.resid ), 1, 0, tc.ncv, Float64Array.from( tc.v ), 1, tc.n, 0, tc.iparam.slice(), 1, 0, tc.ipntr.slice(), 1, 0, Float64Array.from( tc.workd ), 1, 0, Float64Array.from( tc.workl ), 1, 0, tc.lworkl );
	return {
		'info': info,
		'd': d
	};
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dseupd, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof dseupd.strided, 'function', 'has strided method' );
});

test( 'base: an invalid which returns info = -5 and leaves d untouched', function t() {
	const out = callBase( true, 'all', 'standard', 'XX' );
	assert.strictEqual( out.info, -5, 'info is -5' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'base: an invalid bmat returns info = -6 and leaves d untouched', function t() {
	const out = callBase( true, 'all', 'X', 'LM' );
	assert.strictEqual( out.info, -6, 'info is -6' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'base: an invalid howmny with rvec = true returns info = -15 and leaves d untouched', function t() {
	const out = callBase( true, 'X', 'standard', 'LM' );
	assert.strictEqual( out.info, -15, 'info is -15' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'base: howmny is ignored when rvec = false (Ritz values match the norvec reference)', function t() {
	const ref = cases[ 3 ]; // 'lm_norvec_n10_nev3_ncv6': same problem, so same Ritz values
	const out = callBase( false, 'X', 'standard', 'LM' );
	assert.strictEqual( out.info, 0, 'info is 0' );
	for ( let i = 0; i < ref.nconv; i++ ) {
		assert.ok( Math.abs( out.d[ i ] - ref.d[ i ] ) <= 1e-10 * Math.max( 1.0, Math.abs( ref.d[ i ] ) ), 'd[' + i + '] matches the reference' );
	}
});
