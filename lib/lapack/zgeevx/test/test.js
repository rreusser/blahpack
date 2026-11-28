/* eslint-disable no-restricted-syntax */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zgeevx from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgeevx, 'function', 'main export is a function' );
});

test( 'main export has an strided method', function t() {
	assert.strictEqual( typeof zgeevx.strided, 'function', 'has strided method' );
});

test( 'main export validates order', function t() {
	assert.throws( function throws() {
		zgeevx( 'invalid', 'none', 'no-vectors', 'no-vectors', 'none', 0 );
	}, TypeError );
});

test( 'main export validates N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		ilo[ 0 ] = 0;
		ihi[ 0 ] = 0;
		abnrm[ 0 ] = 0;
		zgeevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, null, 1, null, 1, null, 1, null, 1, ilo, ihi, null, 1, abnrm, null, 1, null, 1, null, null ); // eslint-disable-line max-len
	}, RangeError );
});
