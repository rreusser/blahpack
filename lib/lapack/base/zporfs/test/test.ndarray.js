
// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf from '../../zpotrf/lib/base.js';
import zpotrs from '../../zpotrs/lib/base.js';
import zporfs from './../lib/ndarray.js';

// FIXTURES //

import basic_upper_3x3 from './fixtures/basic_upper_3x3.json' with { type: 'json' };
import basic_lower_3x3 from './fixtures/basic_lower_3x3.json' with { type: 'json' };
import multi_rhs_3x3 from './fixtures/multi_rhs_3x3.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr;
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ~0, got ' + actual );
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Set up a system: factorize A with zpotrf, solve with zpotrs, returns all arrays.
*/
function setupSystem( uplo, aVals, bVals, N, nrhs ) {
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var A = new Complex128Array( aVals );
	var AF = new Complex128Array( aVals );
	var B = new Complex128Array( bVals );
	var X = new Complex128Array( bVals );
	var info;

	// Factorize AF
	info = zpotrf( uplo, N, AF, 1, N, 0 );
	assert.equal( info, 0, 'zpotrf should succeed' );

	// Initial solve: A * X = B
	info = zpotrs( uplo, N, nrhs, AF, 1, N, 0, X, 1, N, 0 );
	assert.equal( info, 0, 'zpotrs should succeed' );

	return {
		A: A,
		AF: AF,
		B: B,
		X: X,
		FERR: FERR,
		BERR: BERR
	};
}

/**
* Call zporfs with standard workspace allocation.
*/
function callZporfs( uplo, N, nrhs, sys ) {
	var WORK = new Complex128Array( 2 * N );
	var RWORK = new Float64Array( N );
	return zporfs( uplo, N, nrhs,
		sys.A, 1, N, 0,
		sys.AF, 1, N, 0,
		sys.B, 1, N, 0,
		sys.X, 1, N, 0,
		sys.FERR, 1, 0,
		sys.BERR, 1, 0,
		WORK, 1, 0,
		RWORK, 1, 0
	);
}

// TESTS //

test( 'zporfs: basic_upper_3x3', function t() {
	var tc = basic_upper_3x3;
	var aVals = [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ];
	var bVals = [ 1, 0, 1, 0, 1, 0 ];
	var sys = setupSystem( 'upper', aVals, bVals, 3, 1 );
	var info = callZporfs( 'upper', 3, 1, sys );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( sys.X, 0 ) ), tc.x, 1e-12, 'x' );
	assertArrayClose( Array.from( sys.FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( sys.BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zporfs: basic_lower_3x3', function t() {
	var tc = basic_lower_3x3;
	var aVals = [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ];
	var bVals = [ 1, 0, 1, 0, 1, 0 ];
	var sys = setupSystem( 'lower', aVals, bVals, 3, 1 );
	var info = callZporfs( 'lower', 3, 1, sys );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( sys.X, 0 ) ), tc.x, 1e-12, 'x' );
	assertArrayClose( Array.from( sys.FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( sys.BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zporfs: multi_rhs_3x3', function t() {
	var tc = multi_rhs_3x3;
	var aVals = [ 4, 0, 1, -1, 0, 0, 1, 1, 3, 0, 1, 0, 0, 0, 1, 0, 2, 0 ];
	var bVals = [ 1, 0, 2, 1, 3, 0, 4, 0, 5, -1, 6, 0 ];
	var sys = setupSystem( 'upper', aVals, bVals, 3, 2 );
	var info = callZporfs( 'upper', 3, 2, sys );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( sys.X, 0 ) ), tc.x, 1e-12, 'x' );
	assertArrayClose( Array.from( sys.FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( Array.from( sys.BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'zporfs: n_zero', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 1 );
	var AF = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var X = new Complex128Array( 1 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = zporfs( 'upper', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( FERR ), tc.ferr, 1e-14, 'ferr' );
	assertArrayClose( Array.from( BERR ), tc.berr, 1e-14, 'berr' );
});

test( 'zporfs: nrhs_zero', function t() {
	var tc = nrhs_zero;
	var A = new Complex128Array( 9 );
	var AF = new Complex128Array( 9 );
	var B = new Complex128Array( 3 );
	var X = new Complex128Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var WORK = new Complex128Array( 6 );
	var RWORK = new Float64Array( 3 );
	var info = zporfs( 'upper', 3, 0, A, 1, 3, 0, AF, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});
