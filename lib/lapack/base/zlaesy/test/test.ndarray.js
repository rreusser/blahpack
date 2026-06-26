// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zlaesy from './../lib/index.js';


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'zlaesy: main export is a function', function t() {
	assert.strictEqual( typeof zlaesy, 'function' );
});

test( 'zlaesy: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlaesy.ndarray, 'function' );
});

test( 'zlaesy: diagonal matrix (B=0), |A| >= |C|', function t() {
	// A = 2+1i, B = 0, C = 1-1i
	var result = zlaesy.ndarray(
		new Complex128( 2.0, 1.0 ),
		new Complex128( 0.0, 0.0 ),
		new Complex128( 1.0, -1.0 )
	);

	// RT1 = A = 2+1i (larger magnitude)
	assertClose( result.rt1r, 2.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 1.0, 1e-14, 'rt1i' );

	// RT2 = C = 1-1i
	assertClose( result.rt2r, 1.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, -1.0, 1e-14, 'rt2i' );

	// CS1 = 1, SN1 = 0 (no swap needed)
	assertClose( result.cs1r, 1.0, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.0, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );

	// EVSCAL = 0 (diagonal branch)
	assertClose( result.evscalr, 0.0, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
});

test( 'zlaesy: diagonal matrix (B=0), |A| < |C| (swap)', function t() {
	// A = 0.5+0i, B = 0, C = 3+2i
	var result = zlaesy.ndarray(
		new Complex128( 0.5, 0.0 ),
		new Complex128( 0.0, 0.0 ),
		new Complex128( 3.0, 2.0 )
	);

	// RT1 = C = 3+2i (larger magnitude, swapped)
	assertClose( result.rt1r, 3.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 2.0, 1e-14, 'rt1i' );

	// RT2 = A = 0.5
	assertClose( result.rt2r, 0.5, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	// CS1 = 0, SN1 = 1 (swapped)
	assertClose( result.cs1r, 0.0, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 1.0, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: real symmetric matrix', function t() {
	// A = 4, B = 1, C = 2
	// Eigenvalues: 3 +/- sqrt(2) = 4.414.., 1.586..
	var result = zlaesy.ndarray(
		new Complex128( 4.0, 0.0 ),
		new Complex128( 1.0, 0.0 ),
		new Complex128( 2.0, 0.0 )
	);

	assertClose( result.rt1r, 4.41421356237309492, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 1.58578643762690485, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.923879532511286850, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.923879532511286850, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.382683432365089671, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: complex symmetric matrix', function t() {
	// A = 1+2i, B = 3+i, C = 2-i
	var result = zlaesy.ndarray(
		new Complex128( 1.0, 2.0 ),
		new Complex128( 3.0, 1.0 ),
		new Complex128( 2.0, -1.0 )
	);

	assertClose( result.rt1r, 4.09807621135331601, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 1.36602540378443860, 1e-14, 'rt1i' );
	assertClose( result.rt2r, -1.09807621135331601, 1e-14, 'rt2r' );
	assertClose( result.rt2i, -0.366025403784438597, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.733944912506935387, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.196659946595164364, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.733944912506935387, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.196659946595164364, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.733944912506935387, 1e-14, 'sn1r' );
	assertClose( result.sn1i, -0.196659946595164337, 1e-14, 'sn1i' );
});

test( 'zlaesy: identity matrix', function t() {
	// A = 1, B = 0, C = 1
	var result = zlaesy.ndarray(
		new Complex128( 1.0, 0.0 ),
		new Complex128( 0.0, 0.0 ),
		new Complex128( 1.0, 0.0 )
	);

	// Both eigenvalues = 1
	assertClose( result.rt1r, 1.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 1.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	// CS1 = 1, SN1 = 0 (no swap)
	assertClose( result.cs1r, 1.0, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.0, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: zero matrix', function t() {
	// A = 0, B = 0, C = 0
	var result = zlaesy.ndarray(
		new Complex128( 0.0, 0.0 ),
		new Complex128( 0.0, 0.0 ),
		new Complex128( 0.0, 0.0 )
	);

	// Both eigenvalues = 0
	assertClose( result.rt1r, 0.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 0.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	// CS1 = 1, SN1 = 0
	assertClose( result.cs1r, 1.0, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.0, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: purely imaginary B', function t() {
	// A = 1, B = 2i, C = 3
	var result = zlaesy.ndarray(
		new Complex128( 1.0, 0.0 ),
		new Complex128( 0.0, 2.0 ),
		new Complex128( 3.0, 0.0 )
	);

	assertClose( result.rt1r, 2.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 1.73205080756887719, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 2.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, -1.73205080756887719, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.733944912506935387, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.196659946595164364, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.733944912506935387, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.196659946595164364, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.733944912506935387, 1e-14, 'sn1r' );
	assertClose( result.sn1i, -0.196659946595164337, 1e-14, 'sn1i' );
});

test( 'zlaesy: equal diagonal elements with non-zero B', function t() {
	// A = 2+i, B = 1+i, C = 2+i (A === C)
	var result = zlaesy.ndarray(
		new Complex128( 2.0, 1.0 ),
		new Complex128( 1.0, 1.0 ),
		new Complex128( 2.0, 1.0 )
	);

	assertClose( result.rt1r, 3.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 2.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 1.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.707106781186547462, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.707106781186547462, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.707106781186547462, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: large values (overflow-safe sqrt)', function t() {
	// A = 1e100, B = 1e100, C = -1e100
	var result = zlaesy.ndarray(
		new Complex128( 1e100, 0.0 ),
		new Complex128( 1e100, 0.0 ),
		new Complex128( -1e100, 0.0 )
	);

	assertClose( result.rt1r, 1.41421356237309522e100, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, -1.41421356237309522e100, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.923879532511286738, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.923879532511286738, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.382683432365089893, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: eigenvalue swap (|RT1| < |RT2| initially)', function t() {
	// A = 0.1, B = 5, C = 0.2
	var result = zlaesy.ndarray(
		new Complex128( 0.1, 0.0 ),
		new Complex128( 5.0, 0.0 ),
		new Complex128( 0.2, 0.0 )
	);

	assertClose( result.rt1r, 5.15024999375031278, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, -4.85024999375031207, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.703562541627431703, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.703562541627431703, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.710633344291378255, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: large SN1 (TABS > 1 branch)', function t() {
	// A = 0, B = 0.01, C = 100
	var result = zlaesy.ndarray(
		new Complex128( 0.0, 0.0 ),
		new Complex128( 0.01, 0.0 ),
		new Complex128( 100.0, 0.0 )
	);

	assertClose( result.rt1r, 100.00000099999999, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, -9.99999997475242708e-7, 1e-10, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 9.99999985000000379e-5, 1e-10, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 9.99999985000000379e-5, 1e-10, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.999999995000000141, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: eigenvalue swap in non-diagonal case', function t() {
	// A = -10, B = 0.1, C = -8: |S+T| < |S-T| so eigenvalues swap
	var result = zlaesy.ndarray(
		new Complex128( -10.0, 0.0 ),
		new Complex128( 0.1, 0.0 ),
		new Complex128( -8.0, 0.0 )
	);

	assertClose( result.rt1r, -10.0049875621120883, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, -7.99501243788791083, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.998758526924799384, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.998758526924799384, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, -0.0498137018801523557, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: csqrt with negative real part (re<0, im!=0)', function t() {
	// A = 1+4i, B = 1+i, C = 1; hits csqrt with negative real part
	var result = zlaesy.ndarray(
		new Complex128( 1.0, 4.0 ),
		new Complex128( 1.0, 1.0 ),
		new Complex128( 1.0, 0.0 )
	);

	assertClose( result.rt1r, 1.48586827175664560, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 4.05817102727149237, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 0.514131728243354402, 1e-14, 'rt2r' );
	assertClose( result.rt2i, -0.0581710272714923704, 1e-14, 'rt2i' );

	assertClose( result.evscalr, 0.981470506015181710, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0553472813039068146, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.981470506015181710, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0553472813039068146, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.278815202906358472, 1e-14, 'sn1r' );
	assertClose( result.sn1i, -0.194830567421225814, 1e-14, 'sn1i' );
});

test( 'zlaesy: evnorm < THRESH (eigenvectors not computed)', function t() {
	// A = i, B = 1, C = -i: eigenvalues are both 0
	// SN1 = -i, TABS = 1, sqrt(1 + (-i)^2) = sqrt(0) = 0
	// Evnorm = 0 < THRESH, so evscal = 0
	var result = zlaesy.ndarray(
		new Complex128( 0.0, 1.0 ),
		new Complex128( 1.0, 0.0 ),
		new Complex128( 0.0, -1.0 )
	);

	// Both eigenvalues = 0
	assertClose( result.rt1r, 0.0, 1e-14, 'rt1r' );
	assertClose( result.rt1i, 0.0, 1e-14, 'rt1i' );
	assertClose( result.rt2r, 0.0, 1e-14, 'rt2r' );
	assertClose( result.rt2i, 0.0, 1e-14, 'rt2i' );

	// Eigenvectors not computed
	assertClose( result.evscalr, 0.0, 1e-14, 'evscalr' );
	assertClose( result.evscali, 0.0, 1e-14, 'evscali' );
	assertClose( result.cs1r, 0.0, 1e-14, 'cs1r' );
	assertClose( result.cs1i, 0.0, 1e-14, 'cs1i' );
	assertClose( result.sn1r, 0.0, 1e-14, 'sn1r' );
	assertClose( result.sn1i, 0.0, 1e-14, 'sn1i' );
});

test( 'zlaesy: mathematical property - trace and determinant preserved', function t() {
	// For A = 1+2i, B = 3+i, C = 2-i
	var result = zlaesy.ndarray(
		new Complex128( 1.0, 2.0 ),
		new Complex128( 3.0, 1.0 ),
		new Complex128( 2.0, -1.0 )
	);

	// Verify RT1 + RT2 = A + C (trace preserved)
	var traceR = result.rt1r + result.rt2r;
	var traceI = result.rt1i + result.rt2i;
	assertClose( traceR, 3.0, 1e-14, 'trace real' );
	assertClose( traceI, 1.0, 1e-14, 'trace imag' );

	// Verify RT1 * RT2 = A*C - B*B (determinant preserved)

	// A*C = (1+2i)(2-i) = 2-i+4i-2i^2 = 4+3i

	// B*B = (3+i)^2 = 9+6i-1 = 8+6i

	// Det = AC - BB = (4+3i) - (8+6i) = -4-3i
	var detR = result.rt1r * result.rt2r - result.rt1i * result.rt2i;
	var detI = result.rt1r * result.rt2i + result.rt1i * result.rt2r;
	assertClose( detR, -4.0, 1e-13, 'det real' );
	assertClose( detI, -3.0, 1e-13, 'det imag' );
});
