

import test from 'node:test';
import assert from 'node:assert/strict';
import dlas2 from './../lib/index.js';

// Helper: compute singular values of [F G; 0 H] via the quadratic formula
// for sigma^2 values. Returns [ssmin, ssmax].
function referenceSV( f, g, h ) {
	var s = f * f + g * g + h * h;
	var p = Math.abs( f * h );
	var d = Math.sqrt( Math.max( 0.0, s * s - 4.0 * p * p ) );
	var ssmax = Math.sqrt( ( s + d ) / 2.0 );
	var ssmin = ( ssmax > 0.0 ) ? ( p / ssmax ) : 0.0;
	return [ ssmin, ssmax ];
}

// Tolerance for floating-point comparison
var EPS = 1.0e-14;

function assertClose( actual, expected, msg ) {
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) < EPS, msg + ': got ' + actual + ', expected ' + expected );
	} else {
		var rel = Math.abs( ( actual - expected ) / expected );
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
	var out = new Float64Array( 2 );
	dlas2( 1.0, 0.0, 1.0, out );
	assertClose( out[ 0 ], 1.0, 'ssmin' );
	assertClose( out[ 1 ], 1.0, 'ssmax' );
});

test( 'dlas2: diagonal matrix [3 0; 0 4]', function t() {
	var out = new Float64Array( 2 );
	dlas2( 3.0, 0.0, 4.0, out );
	assertClose( out[ 0 ], 3.0, 'ssmin' );
	assertClose( out[ 1 ], 4.0, 'ssmax' );
});

test( 'dlas2: diagonal matrix [4 0; 0 3] (F > H)', function t() {
	var out = new Float64Array( 2 );
	dlas2( 4.0, 0.0, 3.0, out );
	assertClose( out[ 0 ], 3.0, 'ssmin' );
	assertClose( out[ 1 ], 4.0, 'ssmax' );
});

test( 'dlas2: upper triangular [3 4; 0 0]', function t() {
	// Singular values of [3 4; 0 0]: ssmax = sqrt(9+16) = 5, ssmin = 0
	var out = new Float64Array( 2 );
	dlas2( 3.0, 4.0, 0.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: upper triangular [0 4; 0 3]', function t() {
	// Singular values of [0 4; 0 3]: ssmax = sqrt(9+16) = 5, ssmin = 0
	var out = new Float64Array( 2 );
	dlas2( 0.0, 4.0, 3.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: all zeros [0 0; 0 0]', function t() {
	var out = new Float64Array( 2 );
	dlas2( 0.0, 0.0, 0.0, out );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], 0.0 );
});

test( 'dlas2: F=0, G=0, H nonzero', function t() {
	var out = new Float64Array( 2 );
	dlas2( 0.0, 0.0, 5.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: F nonzero, G=0, H=0', function t() {
	var out = new Float64Array( 2 );
	dlas2( 5.0, 0.0, 0.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: only G nonzero [0 5; 0 0]', function t() {
	var out = new Float64Array( 2 );
	dlas2( 0.0, 5.0, 0.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: F=H (equal diagonal)', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 3.0, 4.0, 3.0 );
	dlas2( 3.0, 4.0, 3.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: general case [3 1; 0 4]', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 3.0, 1.0, 4.0 );
	dlas2( 3.0, 1.0, 4.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: general case [1 2; 0 3]', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 1.0, 2.0, 3.0 );
	dlas2( 1.0, 2.0, 3.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: negative values [-3 -4; 0 -5]', function t() {
	// SVs use absolute values, so same as [3 4; 0 5]
	var out = new Float64Array( 2 );
	var ref = referenceSV( -3.0, -4.0, -5.0 );
	dlas2( -3.0, -4.0, -5.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G much larger than F and H (ga >= fhmx branch, au != 0)', function t() {
	// G = 1000, F = 1, H = 2 => ga >> fhmx
	var out = new Float64Array( 2 );
	var ref = referenceSV( 1.0, 1000.0, 2.0 );
	dlas2( 1.0, 1000.0, 2.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G larger than F and H but not extreme', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 2.0, 10.0, 3.0 );
	dlas2( 2.0, 10.0, 3.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: G equal to fhmx (boundary of ga < fhmx)', function t() {
	// ga = fhmx = 5, fhmn = 3
	var out = new Float64Array( 2 );
	var ref = referenceSV( 5.0, 5.0, 3.0 );
	dlas2( 5.0, 5.0, 3.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: F=0, H nonzero, G nonzero (fhmn=0, fhmx!=0 branch)', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 0.0, 3.0, 4.0 );
	dlas2( 0.0, 3.0, 4.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: H=0, F nonzero, G nonzero (fhmn=0, fhmx!=0 branch)', function t() {
	var out = new Float64Array( 2 );
	dlas2( 4.0, 3.0, 0.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 5.0, 'ssmax' );
});

test( 'dlas2: large values (near overflow)', function t() {
	var big = 1.0e150;
	var out = new Float64Array( 2 );
	dlas2( big, big, big, out );
	// For [c c; 0 c], the singular values are c*(phi) and c*(1/phi) where
	// phi = (1+sqrt(5))/2 (golden ratio). Check proportions via unit-scale.
	var outUnit = new Float64Array( 2 );
	dlas2( 1.0, 1.0, 1.0, outUnit );
	assertClose( out[ 0 ] / big, outUnit[ 0 ], 'ssmin ratio' );
	assertClose( out[ 1 ] / big, outUnit[ 1 ], 'ssmax ratio' );
	assert.ok( out[ 0 ] > 0.0, 'ssmin positive' );
	assert.ok( out[ 1 ] > out[ 0 ], 'ssmax > ssmin' );
});

test( 'dlas2: small values (near underflow)', function t() {
	var small = 1.0e-150;
	var out = new Float64Array( 2 );
	dlas2( small, small, small, out );
	// Same proportional check as large values test
	var outUnit = new Float64Array( 2 );
	dlas2( 1.0, 1.0, 1.0, outUnit );
	assertClose( out[ 0 ] / small, outUnit[ 0 ], 'ssmin ratio' );
	assertClose( out[ 1 ] / small, outUnit[ 1 ], 'ssmax ratio' );
	assert.ok( out[ 0 ] > 0.0, 'ssmin positive' );
	assert.ok( out[ 1 ] > out[ 0 ], 'ssmax > ssmin' );
});

test( 'dlas2: mixed large/small F and H with G=0', function t() {
	var out = new Float64Array( 2 );
	dlas2( 1.0e-100, 0.0, 1.0e100, out );
	assertClose( out[ 0 ], 1.0e-100, 'ssmin' );
	assertClose( out[ 1 ], 1.0e100, 'ssmax' );
});

test( 'dlas2: G very large, F and H very small (au underflow branch)', function t() {
	// G is huge, F and H are tiny => au = fhmx/ga may underflow to 0
	var out = new Float64Array( 2 );
	dlas2( 1.0e-300, 1.0e300, 1.0e-300, out );
	// ssmax should be approximately ga = 1e300
	// ssmin should be approximately |F*H|/ssmax = 1e-600/1e300 ~ 0
	assert.ok( out[ 1 ] > 0.0, 'ssmax should be positive' );
	assert.ok( out[ 0 ] >= 0.0, 'ssmin should be non-negative' );
	assertClose( out[ 1 ], 1.0e300, 'ssmax' );
});

test( 'dlas2: returns the output array', function t() {
	var out = new Float64Array( 2 );
	var ret = dlas2( 3.0, 4.0, 5.0, out );
	assert.strictEqual( ret, out );
});

test( 'dlas2: ndarray interface works', function t() {
	var out = new Float64Array( 2 );
	dlas2.ndarray( 3.0, 0.0, 4.0, out );
	assertClose( out[ 0 ], 3.0, 'ssmin' );
	assertClose( out[ 1 ], 4.0, 'ssmax' );
});

test( 'dlas2: ndarray returns the output array', function t() {
	var out = new Float64Array( 2 );
	var ret = dlas2.ndarray( 3.0, 4.0, 5.0, out );
	assert.strictEqual( ret, out );
});

test( 'dlas2: [1 0; 0 0] singular', function t() {
	var out = new Float64Array( 2 );
	dlas2( 1.0, 0.0, 0.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], 1.0, 'ssmax' );
});

test( 'dlas2: fhmn = 0, fhmx != 0, ga > fhmx', function t() {
	// F=0, G=5, H=3 => fhmn=0, fhmx=3, ga=5 > fhmx
	// ssmin=0, ssmax = max(3,5)*sqrt(1+(3/5)^2) = 5*sqrt(1.36)
	var out = new Float64Array( 2 );
	var ref = referenceSV( 0.0, 5.0, 3.0 );
	dlas2( 0.0, 5.0, 3.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: fhmn = 0, fhmx != 0, ga < fhmx', function t() {
	// F=0, G=2, H=5 => fhmn=0, fhmx=5, ga=2 < fhmx
	// ssmin=0, ssmax = max(5,2)*sqrt(1+(2/5)^2) = 5*sqrt(1.16)
	var out = new Float64Array( 2 );
	var ref = referenceSV( 0.0, 2.0, 5.0 );
	dlas2( 0.0, 2.0, 5.0, out );
	assertClose( out[ 0 ], 0.0, 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: ga exactly equals fhmx (ga >= fhmx branch)', function t() {
	// F=3, G=5, H=5 => fhmn=3, fhmx=5, ga=5 = fhmx
	var out = new Float64Array( 2 );
	var ref = referenceSV( 3.0, 5.0, 5.0 );
	dlas2( 3.0, 5.0, 5.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});

test( 'dlas2: very small G with moderate F and H (ga < fhmx branch)', function t() {
	var out = new Float64Array( 2 );
	var ref = referenceSV( 5.0, 1.0e-10, 3.0 );
	dlas2( 5.0, 1.0e-10, 3.0, out );
	assertClose( out[ 0 ], ref[ 0 ], 'ssmin' );
	assertClose( out[ 1 ], ref[ 1 ], 'ssmax' );
});
