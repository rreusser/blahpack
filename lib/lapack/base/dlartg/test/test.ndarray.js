
import test from 'node:test';
import assert from 'node:assert/strict';
import dlartg from './../lib/index.js';

const EPS = 2.220446049250313e-16;

/**
* Verify the Givens rotation properties:.
*   c^2 + s^2 = 1
*   c_f + s_g = r
*   -s_f + c_g = 0  (approximately)
*   c >= 0
*/
function verifyRotation( f, g, result, tol ) {
	const c = result.c;
	const s = result.s;
	const r = result.r;
	if ( typeof tol === 'undefined' ) {
		tol = 16.0 * EPS;
	}

	// c^2 + s^2 = 1
	assert.ok( Math.abs( c * c + s * s - 1.0 ) < tol, 'c^2 + s^2 = 1, got ' + ( c * c + s * s ) );

	// c >= 0
	assert.ok( c >= 0.0, 'c >= 0, got ' + c );

	// c*f + s*g = r
	const computed_r = c * f + s * g;
	if ( r !== 0.0 ) {
		assert.ok( Math.abs( computed_r - r ) / Math.abs( r ) < tol, 'c*f + s*g = r: expected ' + r + ', got ' + computed_r );
	} else {
		assert.ok( Math.abs( computed_r ) < tol, 'c*f + s*g = r = 0' );
	}

	// -s*f + c*g = 0
	const residual = -s * f + c * g;
	if ( Math.abs( f ) + Math.abs( g ) > 0.0 ) {
		const scale = Math.max( Math.abs( f ), Math.abs( g ) );
		assert.ok( Math.abs( residual ) / scale < tol, '-s*f + c*g = 0, got ' + residual + ' (relative: ' + ( residual / scale ) + ')' );
	}
}

test( 'dlartg: main export is a function', function t() {
	assert.strictEqual( typeof dlartg, 'function' );
});

test( 'dlartg: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof dlartg.ndarray, 'function' );
});

test( 'dlartg: classic 3-4-5 triangle (f=3, g=4)', function t() {
	const result = dlartg( 3.0, 4.0 );
	assert.ok( Math.abs( result.c - 0.6 ) < EPS, 'c = 0.6' );
	assert.ok( Math.abs( result.s - 0.8 ) < EPS, 's = 0.8' );
	assert.ok( Math.abs( result.r - 5.0 ) < EPS, 'r = 5' );
	verifyRotation( 3.0, 4.0, result );
});

test( 'dlartg: g = 0 (identity rotation)', function t() {
	const result = dlartg( 7.0, 0.0 );
	assert.strictEqual( result.c, 1.0 );
	assert.strictEqual( result.s, 0.0 );
	assert.strictEqual( result.r, 7.0 );
});

test( 'dlartg: g = 0, negative f', function t() {
	const result = dlartg( -5.0, 0.0 );
	assert.strictEqual( result.c, 1.0 );
	assert.strictEqual( result.s, 0.0 );
	assert.strictEqual( result.r, -5.0 );
});

test( 'dlartg: f = 0 (g positive)', function t() {
	const result = dlartg( 0.0, 4.0 );
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.s, 1.0 );
	assert.strictEqual( result.r, 4.0 );
});

test( 'dlartg: f = 0 (g negative)', function t() {
	const result = dlartg( 0.0, -4.0 );
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.s, -1.0 );
	assert.strictEqual( result.r, 4.0 );
});

test( 'dlartg: both zero', function t() {
	const result = dlartg( 0.0, 0.0 );
	assert.strictEqual( result.c, 1.0 );
	assert.strictEqual( result.s, 0.0 );
	assert.strictEqual( result.r, 0.0 );
});

test( 'dlartg: f = g (equal values)', function t() {
	const result = dlartg( 1.0, 1.0 );
	const expected_r = Math.sqrt( 2.0 );
	const expected_c = 1.0 / expected_r;
	const expected_s = 1.0 / expected_r;
	assert.ok( Math.abs( result.c - expected_c ) < EPS );
	assert.ok( Math.abs( result.s - expected_s ) < EPS );
	assert.ok( Math.abs( result.r - expected_r ) < EPS );
	verifyRotation( 1.0, 1.0, result );
});

test( 'dlartg: f negative, g positive (unscaled)', function t() {
	const result = dlartg( -3.0, 4.0 );
	assert.ok( Math.abs( result.c - 0.6 ) < EPS, 'c = 0.6' );
	assert.ok( Math.abs( result.s - ( -0.8 ) ) < EPS, 's = -0.8' );
	assert.ok( Math.abs( result.r - ( -5.0 ) ) < EPS, 'r = -5' );
	verifyRotation( -3.0, 4.0, result );
});

test( 'dlartg: f positive, g negative (unscaled)', function t() {
	const result = dlartg( 3.0, -4.0 );
	assert.ok( Math.abs( result.c - 0.6 ) < EPS );
	assert.ok( Math.abs( result.s - ( -0.8 ) ) < EPS );
	assert.ok( Math.abs( result.r - 5.0 ) < EPS );
	verifyRotation( 3.0, -4.0, result );
});

test( 'dlartg: both negative (unscaled)', function t() {
	const result = dlartg( -3.0, -4.0 );
	assert.ok( Math.abs( result.c - 0.6 ) < EPS );
	assert.ok( Math.abs( result.s - 0.8 ) < EPS );
	assert.ok( Math.abs( result.r - ( -5.0 ) ) < EPS );
	verifyRotation( -3.0, -4.0, result );
});

test( 'dlartg: very large values (triggers scaled branch)', function t() {
	const f = 3.0e200;
	const g = 4.0e200;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );

	// R should have the sign of f (positive)
	assert.ok( result.r > 0.0, 'r > 0 when f > 0' );

	// C and s should be close to 0.6 and 0.8
	assert.ok( Math.abs( result.c - 0.6 ) < 1e-10 );
	assert.ok( Math.abs( result.s - 0.8 ) < 1e-10 );
});

test( 'dlartg: very small values (triggers scaled branch)', function t() {
	const f = 3.0e-200;
	const g = 4.0e-200;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
	assert.ok( result.r > 0.0, 'r > 0 when f > 0' );
	assert.ok( Math.abs( result.c - 0.6 ) < 1e-10 );
	assert.ok( Math.abs( result.s - 0.8 ) < 1e-10 );
});

test( 'dlartg: f very large, g very small (scaled branch)', function t() {
	const f = 1.0e250;
	const g = 1.0e-250;
	const result = dlartg( f, g );

	// f dominates, so c should be very close to 1, s close to 0
	assert.ok( Math.abs( result.c - 1.0 ) < 1e-6 );
	assert.ok( Math.abs( result.s ) < 1e-6 );
	assert.ok( result.r > 0.0 );
});

test( 'dlartg: f very small, g very large (scaled branch)', function t() {
	const f = 1.0e-250;
	const g = 1.0e250;
	const result = dlartg( f, g );

	// g dominates, so c should be very close to 0, s close to 1
	assert.ok( result.c < 1e-6 );
	assert.ok( Math.abs( result.s - 1.0 ) < 1e-6 );
	assert.ok( result.r > 0.0 );
});

test( 'dlartg: negative f, large values (scaled branch sign test)', function t() {
	const f = -3.0e200;
	const g = 4.0e200;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );

	// R should be negative (sign of f)
	assert.ok( result.r < 0.0, 'r < 0 when f < 0' );
});

test( 'dlartg: f = 1, g = 0 (identity)', function t() {
	const result = dlartg( 1.0, 0.0 );
	assert.strictEqual( result.c, 1.0 );
	assert.strictEqual( result.s, 0.0 );
	assert.strictEqual( result.r, 1.0 );
});

test( 'dlartg: f = 0, g = 1', function t() {
	const result = dlartg( 0.0, 1.0 );
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.s, 1.0 );
	assert.strictEqual( result.r, 1.0 );
});

test( 'dlartg: values near rtmin boundary (f1 just below rtmin)', function t() {
	// rtmin = sqrt(SAFMIN) ~ 1.49e-154
	// f1 at rtmin boundary and g in safe range triggers scaled path
	const rtmin = Math.sqrt( 2.2250738585072014e-308 );
	const f = rtmin * 0.5;  // just below rtmin
	const g = 1.0;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
});

test( 'dlartg: values near rtmax boundary (f1 just above rtmax)', function t() {
	// rtmax = sqrt(SAFMAX/2) ~ 1.34e153
	const rtmax = Math.sqrt( 4.49423283715579e+307 / 2.0 );
	const f = rtmax * 2.0;  // above rtmax
	const g = 1.0;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
	assert.ok( result.r > 0.0 );
});

test( 'dlartg: values near rtmin boundary (g1 just below rtmin)', function t() {
	const rtmin = Math.sqrt( 2.2250738585072014e-308 );
	const f = 1.0;
	const g = rtmin * 0.5;  // just below rtmin
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
});

test( 'dlartg: values near rtmax boundary (g1 just above rtmax)', function t() {
	const rtmax = Math.sqrt( 4.49423283715579e+307 / 2.0 );
	const f = 1.0;
	const g = rtmax * 2.0;  // above rtmax
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
});

test( 'dlartg: ndarray method returns same result', function t() {
	const result1 = dlartg( 3.0, 4.0 );
	const out = new Float64Array( 3 );
	const result2 = dlartg.ndarray( 3.0, 4.0, out );
	assert.strictEqual( result2, out );
	assert.ok( Math.abs( result1.c - out[ 0 ] ) < EPS );
	assert.ok( Math.abs( result1.s - out[ 1 ] ) < EPS );
	assert.ok( Math.abs( result1.r - out[ 2 ] ) < EPS );
});

test( 'dlartg: small f and g both below rtmin (scaled branch)', function t() {
	const f = 1.0e-170;
	const g = 1.0e-170;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
});

test( 'dlartg: large f and g both above rtmax (scaled branch)', function t() {
	const f = 1.0e155;
	const g = 1.0e155;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
});

test( 'dlartg: negative g, f = 0', function t() {
	const result = dlartg( 0.0, -7.5 );
	assert.strictEqual( result.c, 0.0 );
	assert.strictEqual( result.s, -1.0 );
	assert.strictEqual( result.r, 7.5 );
});

test( 'dlartg: assorted typical values (5, 12)', function t() {
	const result = dlartg( 5.0, 12.0 );
	assert.ok( Math.abs( result.r - 13.0 ) < EPS * 13.0 );
	assert.ok( Math.abs( result.c - 5.0 / 13.0 ) < EPS );
	assert.ok( Math.abs( result.s - 12.0 / 13.0 ) < EPS );
	verifyRotation( 5.0, 12.0, result );
});

test( 'dlartg: negative f very small, g very small (scaled, negative sign)', function t() {
	const f = -3.0e-200;
	const g = 4.0e-200;
	const result = dlartg( f, g );
	verifyRotation( f, g, result, 64.0 * EPS );
	assert.ok( result.r < 0.0, 'r < 0 when f < 0' );
});
