/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaLinBerr from './../lib/zla_lin_berr.js';


// TESTS //

test( 'zlaLinBerr is a function', function t() {
	assert.strictEqual( typeof zlaLinBerr, 'function', 'is a function' );
});

test( 'zlaLinBerr has expected arity', function t() {
	assert.strictEqual( zlaLinBerr.length, 9, 'has expected arity' );
});

test( 'zlaLinBerr throws RangeError for negative N', function t() {
	var threw = false;
	try {
		zlaLinBerr( -1, 2, 2, new Complex128Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 2 ), 1 ); // eslint-disable-line max-len
	} catch ( err ) {
		// Use name-based check (instanceof crosses realms unreliably in some VMs):
		threw = ( err && err.name === 'RangeError' );
	}
	assert.ok( threw, 'threw a RangeError' );
});

test( 'zlaLinBerr returns berr via the wrapper', function t() {
	var berr = new Float64Array( 1 );
	var res = new Complex128Array([ 1.0, 2.0 ]);
	var ayb = new Float64Array([ 1.0 ]);

	zlaLinBerr( 1, 0, 1, res, 1, ayb, 1, berr, 1 );

	// CABS1(1+2i) = 3; berr[0] ~= 3.0 (safe1 negligible):
	assert.ok( Math.abs( berr[ 0 ] - 3.0 ) < 1e-12 );
});
