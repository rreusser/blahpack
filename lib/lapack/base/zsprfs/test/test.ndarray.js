/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsprfs from './../lib/ndarray.js';
import fixtureUpper3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import fixtureLower3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import fixtureUpper3x3_2rhs from './fixtures/upper_3x3_2rhs.json' with { type: 'json' };
import fixtureN1 from './fixtures/n1.json' with { type: 'json' };


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	const abs = Math.abs( actual - expected );
	const ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}

// Build a Complex128Array from a flat float array of interleaved re/im pairs.
function cArr( pairs ) {
	const f = new Float64Array( pairs.length );
	let i;
	for ( i = 0; i < pairs.length; i++ ) {
		f[ i ] = pairs[ i ];
	}
	return new Complex128Array( f.buffer );
}

// Run zsprfs against a fixture providing AP, AFP, ipiv, B, Xinit, ferr, berr.
function runFixture( uplo, fixture, N, nrhs, tol ) {
	let i;

	const AP = cArr( fixture.AP );
	const AFP = cArr( fixture.AFP );
	const IPIV = new Int32Array( fixture.ipiv.length );
	const B = cArr( fixture.B );
	const X = cArr( fixture.Xinit );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * N );
	const RWORK = new Float64Array( N );

	// LAPACK ipiv is 1-based; the JS base operates on 0-based.
	for ( i = 0; i < fixture.ipiv.length; i++ ) {
		IPIV[ i ] = fixture.ipiv[ i ] - 1;
	}

	const info = zsprfs( uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );

	assert.equal( info, fixture.info );
	for ( i = 0; i < nrhs; i++ ) {
		approxEqual( FERR[ i ], fixture.ferr[ i ], tol, 'FERR[' + i + ']' );
		approxEqual( BERR[ i ], fixture.berr[ i ], tol, 'BERR[' + i + ']' );
	}
	return X;
}


// TESTS //

test( 'zsprfs: main export is a function', function t() {
	assert.strictEqual( typeof zsprfs, 'function', 'is a function' );
});

test( 'zsprfs: throws TypeError for invalid uplo', function t() {
	assert.throws( function f() {
		zsprfs( 'invalid', 1, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'zsprfs: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zsprfs( 'upper', -1, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zsprfs: throws RangeError for negative nrhs', function t() {
	assert.throws( function f() {
		zsprfs( 'upper', 1, -1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zsprfs: N=0 quick return', function t() {

	const FERR = new Float64Array( [ 999.0 ] );
	const BERR = new Float64Array( [ 999.0 ] );
	const info = zsprfs( 'upper', 0, 1, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 1, 0, FERR, 1, 0, BERR, 1, 0, new Complex128Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.equal( info, 0 );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'zsprfs: nrhs=0 quick return', function t() {

	const FERR = new Float64Array( 0 );
	const BERR = new Float64Array( 0 );
	const info = zsprfs( 'upper', 3, 0, new Complex128Array( 12 ), 1, 0, new Complex128Array( 12 ), 1, 0, new Int32Array( 3 ), 1, 0, new Complex128Array( 0 ), 1, 3, 0, new Complex128Array( 0 ), 1, 3, 0, FERR, 1, 0, BERR, 1, 0, new Complex128Array( 6 ), 1, 0, new Float64Array( 3 ), 1, 0 );
	assert.equal( info, 0 );
});

test( 'zsprfs: upper 3x3 single RHS (fixture)', function t() {
	runFixture( 'upper', fixtureUpper3x3, 3, 1, 1e-9 );
});

test( 'zsprfs: lower 3x3 single RHS (fixture)', function t() {
	runFixture( 'lower', fixtureLower3x3, 3, 1, 1e-9 );
});

test( 'zsprfs: upper 3x3 with 2 RHS (fixture)', function t() {
	runFixture( 'upper', fixtureUpper3x3_2rhs, 3, 2, 1e-9 );
});

test( 'zsprfs: 1x1 (fixture)', function t() {
	runFixture( 'upper', fixtureN1, 1, 1, 1e-9 );
});

test( 'zsprfs: upper 3x3 perturbed X triggers refinement', function t() {
	// Use the upper_3x3 fixture but perturb X away from machine precision.
	// FERR/BERR should become noticeably worse than the unperturbed values.
	let i;

	const f = fixtureUpper3x3;
	const AP = cArr( f.AP );
	const AFP = cArr( f.AFP );
	const IPIV = new Int32Array( 3 );
	const B = cArr( f.B );
	const Xpairs = f.Xinit.slice();
	for ( i = 0; i < Xpairs.length; i++ ) {
		Xpairs[ i ] += 1e-3;
	}
	const X = cArr( Xpairs );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );

	for ( i = 0; i < 3; i++ ) {
		IPIV[ i ] = f.ipiv[ i ] - 1;
	}

	const info = zsprfs( 'upper', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );

	// After refinement BERR should still be small.
	assert.ok( BERR[ 0 ] < 1e-12, 'BERR should be small after refinement, got ' + BERR[ 0 ] );
	assert.ok( FERR[ 0 ] >= 0, 'FERR should be non-negative' );

	// Verify refined X is close to the reference X.
	const Xref = cArr( f.X );
	const Xrefv = new Float64Array( Xref.buffer );
	const Xv = new Float64Array( X.buffer );
	for ( i = 0; i < 6; i++ ) {
		approxEqual( Xv[ i ], Xrefv[ i ], 1e-9, 'X[' + i + ']' );
	}
});

test( 'zsprfs: lower 3x3 perturbed X triggers refinement', function t() {
	let i;

	const f = fixtureLower3x3;
	const AP = cArr( f.AP );
	const AFP = cArr( f.AFP );
	const IPIV = new Int32Array( 3 );
	const B = cArr( f.B );
	const Xpairs = f.Xinit.slice();
	for ( i = 0; i < Xpairs.length; i++ ) {
		Xpairs[ i ] += 1e-3;
	}
	const X = cArr( Xpairs );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );

	for ( i = 0; i < 3; i++ ) {
		IPIV[ i ] = f.ipiv[ i ] - 1;
	}

	const info = zsprfs( 'lower', 3, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( BERR[ 0 ] < 1e-12, 'BERR small after refinement: ' + BERR[ 0 ] );
});

test( 'zsprfs: 2x2 with explicit construction', function t() {
	// Build a 2x2 complex symmetric system A*X = B with known exact X.
	// Use a simple A = diag(2, 3), so AFP = AP, IPIV = [0, 1].
	// AP packed (upper) = [A(0,0), A(0,1), A(1,1)] = [(2+0i), (0+0i), (3+0i)]
	// X = [(1+0i), (1+0i)]; B = A*X = [(2+0i), (3+0i)].

	const AP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const AFP = cArr( [ 2, 0, 0, 0, 3, 0 ] );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const B = cArr( [ 2, 0, 3, 0 ] );
	const X = cArr( [ 1, 0, 1, 0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );

	const info = zsprfs( 'upper', 2, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 2, 0, X, 1, 2, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assert.ok( BERR[ 0 ] < 1e-12, 'BERR should be tiny: ' + BERR[ 0 ] );
});

test( 'zsprfs: 2x2 lower with complex entries', function t() {
	// Symmetric 2x2 with complex off-diagonal.
	// A = [[2+0i, 1+1i], [1+1i, 3+0i]]; choose X = [(1+0i), (0+0i)] so B = [(2+0i),(1+1i)].
	// Lower packed: [A(0,0), A(1,0), A(1,1)] = [2+0i, 1+1i, 3+0i].
	// We pass AFP = AP (no real factorization). Refinement loop still runs.

	const AP = cArr( [ 2, 0, 1, 1, 3, 0 ] );
	const AFP = cArr( [ 2, 0, 1, 1, 3, 0 ] );
	const IPIV = new Int32Array( [ 0, 1 ] );
	const B = cArr( [ 2, 0, 1, 1 ] );
	const X = cArr( [ 1, 0, 0, 0 ] );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 4 );
	const RWORK = new Float64Array( 2 );

	const info = zsprfs( 'lower', 2, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 2, 0, X, 1, 2, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
});
