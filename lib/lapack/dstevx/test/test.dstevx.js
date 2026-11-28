/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstevx from './../lib/dstevx.js';


// TESTS //

test( 'dstevx is a function', function t() {
	assert.strictEqual( typeof dstevx, 'function', 'is a function' );
});

test( 'dstevx has expected arity', function t() {
	assert.strictEqual( dstevx.length, 22, 'has expected arity' );
});

test( 'dstevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstevx( 'column-major', 'no-vectors', 'all', -1, 2, 1, 2, 1, 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstevx: row-major Z must have room for N eigenvector columns (range = all)', function t() {
	// Regression (tickets/0001): the row-major bound was `max( 1, M )` with M
	// the Int32Array output, i.e. NaN, so an undersized LDZ was never rejected.
	function run( LDZ ) {
		const d = new Float64Array( [ 2.0, 2.0, 2.0 ] );
		const e = new Float64Array( [ 1.0, 1.0 ] );
		return dstevx( 'row-major', 'compute-vectors', 'all', 3, d, 1, e, 1, 0.0, 0.0, 1, 3, 0.0, new Int32Array( 1 ), new Float64Array( 3 ), 1, new Float64Array( 9 ), LDZ, new Float64Array( 15 ), new Int32Array( 15 ), new Int32Array( 3 ), 1 );
	}
	assert.throws( function bad() {
		run( 1 );
	}, RangeError );
	assert.strictEqual( run( 3 ), 0, 'LDZ = N is accepted' );
});

test( 'dstevx allocates WORK and IWORK when they are null', function t() {
	// T = tridiag(1, 2, 1) of order 3: eigenvalues 2 - sqrt(2), 2, 2 + sqrt(2).
	const dv = [ 2.0, 2.0, 2.0 ];
	const ev = [ 1.0, 1.0 ];
	const expected = [ 2.0 - Math.SQRT2, 2.0, 2.0 + Math.SQRT2 ];
	const M = new Int32Array( 1 );
	const w = new Float64Array( 3 );
	const Z = new Float64Array( 9 );
	const IFAIL = new Int32Array( 3 );
	let ranges;
	let info;
	let s;
	let i;
	let j;
	let k;
	ranges = [ 'all', 'index' ];
	for ( k = 0; k < ranges.length; k++ ) {
		// 'index' with abstol > 0 takes the dstebz/dstein path.
		info = dstevx( 'column-major', 'compute-vectors', ranges[ k ], 3, new Float64Array( dv ), 1, new Float64Array( ev ), 1, 0.0, 0.0, 1, 3, ( k === 0 ) ? 0.0 : 1e-14, M, w, 1, Z, 3, null, null, IFAIL, 1 );
		assert.strictEqual( info, 0 );
		assert.strictEqual( M[ 0 ], 3 );
		for ( j = 0; j < 3; j++ ) {
			assert.ok( Math.abs( w[ j ] - expected[ j ] ) <= 1e-14, 'w[' + j + ']' );
			for ( i = 0; i < 3; i++ ) {
				s = ( dv[ i ] - w[ j ] ) * Z[ ( j * 3 ) + i ];
				if ( i > 0 ) {
					s += ev[ i - 1 ] * Z[ ( j * 3 ) + i - 1 ];
				}
				if ( i < 2 ) {
					s += ev[ i ] * Z[ ( j * 3 ) + i + 1 ];
				}
				assert.ok( Math.abs( s ) <= 1e-14, 'residual (' + i + ',' + j + ')' );
			}
		}
	}
});
