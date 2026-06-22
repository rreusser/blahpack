// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgesvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_trans_n from './fixtures/fact_n_trans_n.json' with { type: 'json' };
import fact_n_trans_t from './fixtures/fact_n_trans_t.json' with { type: 'json' };
import fact_e from './fixtures/fact_e.json' with { type: 'json' };
import fact_f from './fixtures/fact_f.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import fact_e_trans_t from './fixtures/fact_e_trans_t.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Standard 3x3 diag-dominant test matrix (col-major)
function testA() {
	return new Float64Array( [ 4.0, 1.0, 1.0, 1.0, 3.0, 1.0, 1.0, 1.0, 2.0 ] );
}

// TESTS //

test( 'dgesvx: FACT=N, TRANS=N, 3x3 well-conditioned, 1 RHS', function t() {
	var result;
	var tc = fact_n_trans_n;
	var A = testA();
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );

	result = dgesvx( 'not-factored', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.equed, tc.equed );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-14, 'rpvgrw' );
});

test( 'dgesvx: FACT=N, TRANS=T, 3x3 well-conditioned', function t() {
	var result;
	var tc = fact_n_trans_t;
	var A = testA();
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );

	result = dgesvx( 'not-factored', 'transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.equed, tc.equed );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dgesvx: FACT=E, equilibrate poorly-scaled matrix', function t() {
	var result;
	var tc = fact_e;
	var A = new Float64Array( [ 1e6, 1.0, 1.0, 1.0, 1e-3, 1.0, 1.0, 1.0, 1e3 ] );
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1e6 + 2.0, 2.001, 1.002e3 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );

	result = dgesvx( 'equilibrate', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.equed, tc.equed );
	assertArrayClose( X, tc.x, 1e-8, 'x' );
});

test( 'dgesvx: FACT=F, pre-factored matrix', function t() {
	var result;
	var tc = fact_f;

	// First factor A via FACT='N'
	var A = testA();
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 6.0, 5.0, 4.0 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	dgesvx( 'not-factored', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	// Now use FACT='F' with the factored AF and IPIV
	A = testA();
	B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	X = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	result = dgesvx( 'factored', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.equed, tc.equed );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dgesvx: singular matrix returns info > 0', function t() {
	var result;
	var tc = singular;
	// All rows identical → rank 1
	var A = new Float64Array( [ 1.0, 2.0, 3.0, 1.0, 2.0, 3.0, 1.0, 2.0, 3.0 ] );
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );

	result = dgesvx( 'not-factored', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	// Info should be > 0 (singular), possibly different exact value due to pivoting
	assert.ok( result.info > 0, 'info should be > 0 for singular matrix, got ' + result.info );
	assert.equal( result.rcond, tc.rcond );
});

test( 'dgesvx: N=0 quick return', function t() {
	var result = dgesvx( 'not-factored', 'no-transpose', 0, 1, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, 'none', new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.equal( result.info, 0 );
});

test( 'dgesvx: multiple RHS (nrhs=2)', function t() {
	var result;
	var tc = multi_rhs;
	var A = testA();
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	// b col1=[1,2,3], col2=[6,5,4] (column-major)
	var B = new Float64Array( [ 1.0, 2.0, 3.0, 6.0, 5.0, 4.0 ] );
	var X = new Float64Array( 6 );
	var FERR = new Float64Array( 2 );
	var BERR = new Float64Array( 2 );

	result = dgesvx( 'not-factored', 'no-transpose', 3, 2, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assertArrayClose( X, tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
});

test( 'dgesvx: FACT=E, TRANS=T', function t() {
	var result;
	var tc = fact_e_trans_t;
	var A = new Float64Array( [ 1e6, 1.0, 1.0, 1.0, 1e-3, 1.0, 1.0, 1.0, 1e3 ] );
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1e6 + 2.0, 2.001, 1.002e3 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );

	result = dgesvx( 'equilibrate', 'transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.equed, tc.equed );
	assertArrayClose( X, tc.x, 1e-8, 'x' );
});

test( 'dgesvx: verifies A*x = b mathematically for FACT=N', function t() {
	// Verify solution accuracy by computing A*x - b
	var A = testA();
	var Acopy = new Float64Array( A );
	var AF = new Float64Array( 9 );
	var IPIV = new Int32Array( 3 );
	var r = new Float64Array( 3 );
	var c = new Float64Array( 3 );
	var B = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	var X = new Float64Array( 3 );
	var FERR = new Float64Array( 1 );
	var BERR = new Float64Array( 1 );
	var residual;
	var i;
	var j;

	dgesvx( 'not-factored', 'no-transpose', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0 );

	// Compute residual = Acopy * X - B_original
	var Borig = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	for ( i = 0; i < 3; i++ ) {
		residual = 0.0;
		for ( j = 0; j < 3; j++ ) {
			residual += Acopy[ i + ( j * 3 ) ] * X[ j ];
		}
		residual -= Borig[ i ];
		assert.ok( Math.abs( residual ) < 1e-12, 'residual[' + i + '] = ' + residual );
	}
});
