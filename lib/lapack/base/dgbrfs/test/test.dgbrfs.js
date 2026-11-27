/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbrfs from './../lib/dgbrfs.js';


// TESTS //

test( 'dgbrfs is a function', function t() {
	assert.strictEqual( typeof dgbrfs, 'function', 'is a function' );
});

test( 'dgbrfs has expected arity', function t() {
	assert.strictEqual( dgbrfs.length, 22, 'has expected arity' );
});

test( 'dgbrfs throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dgbrfs( 'column-major', 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dgbrfs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbrfs( 'column-major', 'no-transpose', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgbrfs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgbrfs( 'column-major', 'no-transpose', new Float64Array( 4 ), 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dgbrfs: column-major and row-major agree on a 1-by-1 system, with null or caller workspaces', function t() {
	const orders = [ 'column-major', 'row-major' ];
	let i;
	for ( i = 0; i < orders.length; i++ ) {
		const x = new Float64Array( [ 5.0 / 3.0 ] );
		const ferr = new Float64Array( 1 );
		const berr = new Float64Array( 1 );
		const info = dgbrfs( orders[ i ], 'no-transpose', 1, 0, 0, 1, new Float64Array( [ 3.0 ] ), 1, new Float64Array( [ 3.0 ] ), 1, new Int32Array( 1 ), 1, new Float64Array( [ 5.0 ] ), 1, x, 1, ferr, 1, berr, 1, null, null ); // eslint-disable-line max-len
		assert.equal( info, 0, orders[ i ] + ' info' );
		assert.ok( Math.abs( x[ 0 ] - ( 5.0 / 3.0 ) ) <= 1e-15, orders[ i ] + ' x' );
		assert.ok( ferr[ 0 ] >= 0.0 && ferr[ 0 ] < 1e-14, orders[ i ] + ' ferr' );
		assert.ok( berr[ 0 ] >= 0.0 && berr[ 0 ] < 1e-15, orders[ i ] + ' berr' );
	}
});

test( 'dgbrfs: a caller IWORK shorter than N throws RangeError through the wrapper (ticket 0107)', function t() {
	assert.throws( function throws() {
		dgbrfs( 'column-major', 'no-transpose', 2, 0, 0, 1, new Float64Array( [ 3.0, 2.0 ] ), 1, new Float64Array( [ 3.0, 2.0 ] ), 1, new Int32Array( [ 0, 1 ] ), 1, new Float64Array( [ 5.0, 4.0 ] ), 2, new Float64Array( 2 ), 2, new Float64Array( 1 ), 1, new Float64Array( 1 ), 1, new Float64Array( 6 ), new Int32Array( 1 ) ); // eslint-disable-line max-len
	}, /IWORK array must have at least 2 elements from offset 0/ );
});
