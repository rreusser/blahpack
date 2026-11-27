/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import ilaenv from './../lib/ilaenv.js';


// TESTS //

test( 'ilaenv is a function', function t() {
	assert.strictEqual( typeof ilaenv, 'function', 'is a function' );
});

test( 'ilaenv has expected arity', function t() {
	assert.strictEqual( ilaenv.length, 7, 'has expected arity' );
});

test( 'ilaenv returns the reference block sizes and crossover points', function t() {
	assert.strictEqual( ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 ), 32, 'NB' );
	assert.strictEqual( ilaenv( 2, 'DGEQRF', ' ', 100, 100, -1, -1 ), 2, 'NBMIN' );
	assert.strictEqual( ilaenv( 3, 'DGEQRF', ' ', 100, 100, -1, -1 ), 128, 'NX' );
	assert.strictEqual( ilaenv( 12, 'DLAQR3', 'SV', 100, 1, 100, 1 ), 75, 'NMIN (IPARMQ)' );
	assert.strictEqual( ilaenv( 0, 'DGEQRF', ' ', 100, 100, -1, -1 ), -1, 'invalid ISPEC' );
});

test( 'ilaenv: throws a TypeError for a name or opts that is not a string', function t() {
	assert.throws( function throws() {
		ilaenv( 1, 5, ' ', 10, 10, 10, -1 );
	}, TypeError );
	assert.throws( function throws() {
		ilaenv( 1, 'DGEQRF', null, 10, 10, 10, -1 );
	}, TypeError );
});
