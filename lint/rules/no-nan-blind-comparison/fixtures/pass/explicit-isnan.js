// target: lib/lapack/zsyr/test/test.ndarray.js
// A comparison whose operand is also checked for NaN is accepted.
import assert from 'node:assert/strict';

function assertClose( actual, expected, tol ) {
	var d = Math.abs( actual - expected );
	if ( Number.isNaN( d ) || d > tol ) {
		assert.fail( 'expected ' + expected + ', got ' + actual );
	}
}

function assertFiniteClose( x, y, tol ) {
	if ( !isFinite( x ) ) {
		throw new Error( 'non-finite' );
	}
	if ( Math.abs( x - y ) > tol ) {
		throw new Error( 'mismatch' );
	}
}

export { assertClose, assertFiniteClose };
