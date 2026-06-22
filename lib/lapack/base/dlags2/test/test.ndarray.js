

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlags2 from './../lib/ndarray.js';


// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import upper_diagonal_b from './fixtures/upper_diagonal_b.json' with { type: 'json' };
import lower_diagonal_b from './fixtures/lower_diagonal_b.json' with { type: 'json' };
import upper_small_offdiag from './fixtures/upper_small_offdiag.json' with { type: 'json' };
import lower_negative from './fixtures/lower_negative.json' with { type: 'json' };
import upper_identity from './fixtures/upper_identity.json' with { type: 'json' };
import lower_large from './fixtures/lower_large.json' with { type: 'json' };

var fixtures = {
	'upper_basic': upper_basic,
	'lower_basic': lower_basic,
	'upper_diagonal_b': upper_diagonal_b,
	'lower_diagonal_b': lower_diagonal_b,
	'upper_small_offdiag': upper_small_offdiag,
	'lower_negative': lower_negative,
	'upper_identity': upper_identity,
	'lower_large': lower_large
};


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// DATA //

// Test parameter sets: [name, upper, a1, a2, a3, b1, b2, b3]
var cases = [
	[ 'upper_basic', true, 4.0, 2.0, 3.0, 1.0, 0.5, 2.0 ],
	[ 'lower_basic', false, 4.0, 2.0, 3.0, 1.0, 0.5, 2.0 ],
	[ 'upper_diagonal_b', true, 5.0, 3.0, 2.0, 1.0, 0.0, 1.0 ],
	[ 'lower_diagonal_b', false, 5.0, 3.0, 2.0, 1.0, 0.0, 1.0 ],
	[ 'upper_small_offdiag', true, 10.0, 1e-10, 5.0, 3.0, 1e-10, 2.0 ],
	[ 'lower_negative', false, -3.0, 4.0, -2.0, 1.0, -0.5, 3.0 ],
	[ 'upper_identity', true, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 ],
	[ 'lower_large', false, 1e10, 5e9, 2e10, 3e10, 1e10, 4e10 ]
];


// TESTS //

cases.forEach( function each( c ) {
	test( 'dlags2: ' + c[ 0 ], function t() {
		var tc = fixtures[ c[ 0 ] ];
		var out = dlags2( c[ 1 ], c[ 2 ], c[ 3 ], c[ 4 ], c[ 5 ], c[ 6 ], c[ 7 ] );
		assertClose( out.csu, tc.csu, 1e-14, 'csu' );
		assertClose( out.snu, tc.snu, 1e-14, 'snu' );
		assertClose( out.csv, tc.csv, 1e-14, 'csv' );
		assertClose( out.snv, tc.snv, 1e-14, 'snv' );
		assertClose( out.csq, tc.csq, 1e-14, 'csq' );
		assertClose( out.snq, tc.snq, 1e-14, 'snq' );
	});
});

/**
* Verify the mathematical property of dlags2: that U^T*A*Q and V^T*B*Q
* produce triangular matrices (upper: zero in (0,1); lower: zero in (1,0)).
*/
function verifyDlags2( upper, a1, a2, a3, b1, b2, b3, tol, msg ) {
	var out = dlags2( upper, a1, a2, a3, b1, b2, b3 );
	var csu = out.csu;
	var snu = out.snu;
	var csv = out.csv;
	var snv = out.snv;
	var csq = out.csq;
	var snq = out.snq;
	var ua00;
	var ua01;
	var ua10;
	var ua11;
	var vb00;
	var vb01;
	var vb10;
	var vb11;
	var r00;
	var r01;
	var r10;
	var r11;
	var s01;
	var s10;

	// Build A matrix
	if ( upper ) {
		ua00 = a1; ua01 = a2; ua10 = 0.0; ua11 = a3;
	} else {
		ua00 = a1; ua01 = 0.0; ua10 = a2; ua11 = a3;
	}

	// Build B matrix
	if ( upper ) {
		vb00 = b1; vb01 = b2; vb10 = 0.0; vb11 = b3;
	} else {
		vb00 = b1; vb01 = 0.0; vb10 = b2; vb11 = b3;
	}

	// Compute U^T * A * Q
	r00 = csu * ua00 + snu * ua10;
	r01 = csu * ua01 + snu * ua11;
	r10 = -snu * ua00 + csu * ua10;
	r11 = -snu * ua01 + csu * ua11;
	s01 = r00 * snq + r01 * csq;
	s10 = r10 * csq - r11 * snq;

	// Use relative check: |zero element| / max(|all elements|)
	var s00a = r00 * csq - r01 * snq;
	var s11a = r10 * snq + r11 * csq;
	var maxA = Math.max( Math.abs( s00a ), Math.abs( s01 ), Math.abs( s10 ), Math.abs( s11a ), 1e-300 );

	if ( upper ) {
		assert.ok( Math.abs( s01 ) / maxA < tol, msg + ': U^T*A*Q should have zero (0,1), rel=' + ( Math.abs( s01 ) / maxA ) );
	} else {
		assert.ok( Math.abs( s10 ) / maxA < tol, msg + ': U^T*A*Q should have zero (1,0), rel=' + ( Math.abs( s10 ) / maxA ) );
	}

	// Compute V^T * B * Q
	r00 = csv * vb00 + snv * vb10;
	r01 = csv * vb01 + snv * vb11;
	r10 = -snv * vb00 + csv * vb10;
	r11 = -snv * vb01 + csv * vb11;
	s01 = r00 * snq + r01 * csq;
	s10 = r10 * csq - r11 * snq;
	var s00b = r00 * csq - r01 * snq;
	var s11b = r10 * snq + r11 * csq;
	var maxB = Math.max( Math.abs( s00b ), Math.abs( s01 ), Math.abs( s10 ), Math.abs( s11b ), 1e-300 );

	if ( upper ) {
		assert.ok( Math.abs( s01 ) / maxB < tol, msg + ': V^T*B*Q should have zero (0,1), rel=' + ( Math.abs( s01 ) / maxB ) );
	} else {
		assert.ok( Math.abs( s10 ) / maxB < tol, msg + ': V^T*B*Q should have zero (1,0), rel=' + ( Math.abs( s10 ) / maxB ) );
	}
}

// Upper: ratio comparison selects V^T*B path (line 132-134 else branch)
test( 'dlags2: upper_vb_driven - ratio comparison selects V^T*B path', function t() {
	verifyDlags2( true, 1.0, 100.0, 1.0, 10.0, 0.01, 10.0, 0.05, 'upper_vb_driven' );
});

// Upper: zero U^T*A elements triggers V^T*B fallback (line 136-137)
test( 'dlags2: upper_zero_ua - zero UA triggers VB fallback', function t() {
	verifyDlags2( true, 0.0, 0.0, 0.0, 1.0, 0.5, 2.0, 1e-12, 'upper_zero_ua' );
});

// Upper: else branch at line 145-174 where |snl|>|csl| and |snr|>|csr|
// Inputs chosen so that dlasv2(a1*b3, a2*b1-a1*b2, a3*b1) returns |csl|<|snl| AND |csr|<|snr|
test( 'dlags2: upper_else_branch - large rotation sines, vb-driven', function t() {
	var out = dlags2( true, 73.99, 90.035, 99.59, 1.0, 0.5, 1.0 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});

// Upper else branch: line 160 - aua22 ratio <= avb22 ratio (ua-driven dlartg)
test( 'dlags2: upper_else_ua_driven - else branch ua-driven dlartg', function t() {
	var out = dlags2( true, -54.5637, -12.628, 111.0266, 90.743, 83.6416, 48.053 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});

// Upper else branch: line 165-166 - ua21+ua22===0 (A is zero matrix)
test( 'dlags2: upper_else_zero_ua - else branch zero UA', function t() {
	// A=0 but we need the else branch, which requires |csl|<|snl| AND |csr|<|snr|
	// With A=0, dlasv2(0,0,0) gives csl=1,snl=0 which enters the first branch.
	// This sub-branch may be unreachable when A is truly zero in the upper case.
	// Instead, use tiny A values that produce near-zero ua21+ua22
	var out = dlags2( true, 1e-320, 1e-320, 1e-320, 73.99, 90.035, 99.59 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});

// Lower: ratio comparison selects V^T*B path (line 205 else branch)
test( 'dlags2: lower_vb_driven - lower ratio comparison selects VB path', function t() {
	verifyDlags2( false, 1.0, 100.0, 1.0, 10.0, 0.01, 10.0, 0.05, 'lower_vb_driven' );
});

// Lower: zero U^T*A elements triggers V^T*B fallback (lines 210-211)
test( 'dlags2: lower_zero_ua - lower zero UA triggers VB fallback', function t() {
	verifyDlags2( false, 0.0, 0.0, 0.0, 1.0, 0.5, 2.0, 1e-12, 'lower_zero_ua' );
});

// Lower: else branch at line 219-248 where |snr|>|csr| and |snl|>|csl|
test( 'dlags2: lower_else_branch - lower large rotation sines, vb-driven', function t() {
	var out = dlags2( false, 73.99, 102.835, 99.59, 1.0, 0.5, 1.0 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});

// Lower else branch: line 234 - aua11 ratio <= avb11 ratio (ua-driven dlartg)
test( 'dlags2: lower_else_ua_driven - else branch ua-driven dlartg', function t() {
	var out = dlags2( false, -19.992, -17.6713, -59.3108, 96.5235, -54.6987, 74.2924 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});

// Lower else branch: line 239-240 - ua11+ua12===0 (near-zero A)
test( 'dlags2: lower_else_zero_ua - else branch zero UA', function t() {
	var out = dlags2( false, 1e-320, 1e-320, 1e-320, 73.99, 102.835, 99.59 );
	assertClose( out.csu * out.csu + out.snu * out.snu, 1.0, 1e-14, 'U rotation norm' );
	assertClose( out.csv * out.csv + out.snv * out.snv, 1.0, 1e-14, 'V rotation norm' );
	assertClose( out.csq * out.csq + out.snq * out.snq, 1.0, 1e-14, 'Q rotation norm' );
});
