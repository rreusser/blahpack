
import test from 'node:test';
import assert from 'node:assert/strict';
import dlas2 from './../lib/index.js';

// Helper: compute singular values of [F G; 0 H] via the quadratic formula

// For sigma^2 values. Returns [ssmin, ssmax].
function referenceSV( f, g, h ) {
	const s = f * f + g * g + h * h;
	const p = Math.abs( f * h );
	const d = Math.sqrt( Math.max( 0.0, s * s - 4.0 * p * p ) );
	const ssmax = Math.sqrt( ( s + d ) / 2.0 );
	const ssmin = ( ssmax > 0.0 ) ? ( p / ssmax ) : 0.0;
	return [ ssmin, ssmax ];
}

// Tolerance for floating-point comparison
const EPS = 1.0e-14;

function assertClose( actual, expected, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) < EPS, msg + ': got ' + actual + ', expected ' + expected );
	} else {
		const rel = Math.abs( ( actual - expected ) / expected );
		assert.ok( rel < EPS, msg + ': got ' + actual + ', expected ' + expected + ', relative error ' + rel );
	}
}

test( 'dlas2: main export is a function', function t() {
	assert.strictEqual( typeof dlas2, 'function' );
});

test( 'dlas2: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof dlas2.ndarray, 'function' );
});

test( 'dlas2: identity matrix [1 0; 0 1]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 1.0, 0.0, 1.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 1.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 1.0, 'ssmax' );
});

test( 'dlas2: diagonal matrix [3 0; 0 4]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 3.0, 0.0, 4.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 3.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 4.0, 'ssmax' );
});

test( 'dlas2: diagonal matrix [4 0; 0 3] (F > H)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 4.0, 0.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 3.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 4.0, 'ssmax' );
});

test( 'dlas2: upper triangular [3 4; 0 0]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 3.0, 4.0, 0.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: upper triangular [0 4; 0 3]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 0.0, 4.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: all zeros [0 0; 0 0]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 0.0, 0.0, 0.0, ssminOut, ssmaxOut );
	assert.strictEqual( ssminOut[ 0 ], 0.0 );
	assert.strictEqual( ssmaxOut[ 0 ], 0.0 );
});

test( 'dlas2: F=0, G=0, H nonzero', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 0.0, 0.0, 5.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: F nonzero, G=0, H=0', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 5.0, 0.0, 0.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: only G nonzero [0 5; 0 0]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 0.0, 5.0, 0.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: F=H (equal diagonal)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 3.0, 4.0, 3.0 );
	dlas2( 3.0, 4.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: general case [3 1; 0 4]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 3.0, 1.0, 4.0 );
	dlas2( 3.0, 1.0, 4.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: general case [1 2; 0 3]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 1.0, 2.0, 3.0 );
	dlas2( 1.0, 2.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: negative values [-3 -4; 0 -5]', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( -3.0, -4.0, -5.0 );
	dlas2( -3.0, -4.0, -5.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G much larger than F and H (ga >= fhmx branch, au != 0)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 1.0, 1000.0, 2.0 );
	dlas2( 1.0, 1000.0, 2.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G larger than F and H but not extreme', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 2.0, 10.0, 3.0 );
	dlas2( 2.0, 10.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G equal to fhmx (boundary of ga < fhmx)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 5.0, 5.0, 3.0 );
	dlas2( 5.0, 5.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: F=0, H nonzero, G nonzero (fhmn=0, fhmx!=0 branch)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 0.0, 3.0, 4.0 );
	dlas2( 0.0, 3.0, 4.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: H=0, F nonzero, G nonzero (fhmn=0, fhmx!=0 branch)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 4.0, 3.0, 0.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 5.0, 'ssmax' );
});

test( 'dlas2: large values (near overflow)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ssminOut2 = new Float64Array( 1 );
	const ssmaxOut2 = new Float64Array( 1 );
	const big = 1.0e150;
	dlas2( big, big, big, ssminOut, ssmaxOut );

	// For [c c; 0 c], the singular values are c*(phi) and c*(1/phi) where

	dlas2( 1.0, 1.0, 1.0, ssminOut2, ssmaxOut2 );
	assertClose( ssminOut[ 0 ] / big, ssminOut2[ 0 ], 'ssmin ratio' );
	assertClose( ssmaxOut[ 0 ] / big, ssmaxOut2[ 0 ], 'ssmax ratio' );
	assert.ok( ssminOut[ 0 ] > 0.0, 'ssmin positive' );
	assert.ok( ssmaxOut[ 0 ] > ssminOut[ 0 ], 'ssmax > ssmin' );
});

test( 'dlas2: small values (near underflow)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ssminOut2 = new Float64Array( 1 );
	const ssmaxOut2 = new Float64Array( 1 );
	const small = 1.0e-150;
	dlas2( small, small, small, ssminOut, ssmaxOut );

	dlas2( 1.0, 1.0, 1.0, ssminOut2, ssmaxOut2 );
	assertClose( ssminOut[ 0 ] / small, ssminOut2[ 0 ], 'ssmin ratio' );
	assertClose( ssmaxOut[ 0 ] / small, ssmaxOut2[ 0 ], 'ssmax ratio' );
	assert.ok( ssminOut[ 0 ] > 0.0, 'ssmin positive' );
	assert.ok( ssmaxOut[ 0 ] > ssminOut[ 0 ], 'ssmax > ssmin' );
});

test( 'dlas2: mixed large/small F and H with G=0', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 1.0e-100, 0.0, 1.0e100, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 1.0e-100, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 1.0e100, 'ssmax' );
});

test( 'dlas2: G very large, F and H very small (au underflow branch)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 1.0e-300, 1.0e300, 1.0e-300, ssminOut, ssmaxOut );

	// Ssmax should be approximately ga = 1e300

	// Ssmin should be approximately |F*H|/ssmax = 1e-600/1e300 ~ 0
	assert.ok( ssmaxOut[ 0 ] > 0.0, 'ssmax should be positive' );
	assert.ok( ssminOut[ 0 ] >= 0.0, 'ssmin should be non-negative' );
	assertClose( ssmaxOut[ 0 ], 1.0e300, 'ssmax' );
});

test( 'dlas2: returns the output array', function t() {
	const out = new Float64Array( 2 );
	dlas2( 3.0, 4.0, 5.0, out.subarray( 0, 1 ), out.subarray( 1, 2 ) );
	const ret = out;
	assert.strictEqual( ret, out );
});

test( 'dlas2: ndarray interface works', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2.ndarray( 3.0, 0.0, 4.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 3.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 4.0, 'ssmax' );
});

test( 'dlas2: ndarray returns the output array', function t() {
	const out = new Float64Array( 2 );
	dlas2.ndarray( 3.0, 4.0, 5.0, out.subarray( 0, 1 ), out.subarray( 1, 2 ) );
	const ret = out;
	assert.strictEqual( ret, out );
});

test( 'dlas2: [1 0; 0 0] singular', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	dlas2( 1.0, 0.0, 0.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], 1.0, 'ssmax' );
});

test( 'dlas2: fhmn = 0, fhmx != 0, ga > fhmx', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 0.0, 5.0, 3.0 );
	dlas2( 0.0, 5.0, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: fhmn = 0, fhmx != 0, ga < fhmx', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 0.0, 2.0, 5.0 );
	dlas2( 0.0, 2.0, 5.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], 0.0, 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: ga exactly equals fhmx (ga >= fhmx branch)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 3.0, 5.0, 5.0 );
	dlas2( 3.0, 5.0, 5.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: very small G with moderate F and H (ga < fhmx branch)', function t() {
	const ssminOut = new Float64Array( 1 );
	const ssmaxOut = new Float64Array( 1 );
	const ref = referenceSV( 5.0, 1.0e-10, 3.0 );
	dlas2( 5.0, 1.0e-10, 3.0, ssminOut, ssmaxOut );
	assertClose( ssminOut[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( ssmaxOut[ 0 ], ref[ 1 ], 'ssmax' );
});
