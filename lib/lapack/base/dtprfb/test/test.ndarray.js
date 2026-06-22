/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, max-lines-per-function, vars-on-top */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtprfb from './../lib/ndarray.js';


// FUNCTIONS //

function assertClose( got, expected, tol, msg ) {
	var bound = tol * Math.max( Math.abs( expected ), 1.0 );
	if ( !( Math.abs( got - expected ) <= bound ) ) {
		throw new Error( msg + ': expected ' + expected + ', got ' + got );
	}
}

function extract( buf, M, N, lda ) {
	var out = [];
	var j;
	var i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( buf[ i + ( j * lda ) ] );
		}
	}
	return out;
}

function assertExtractClose( buf, M, N, lda, expected, tol, msg ) {
	var arr = extract( buf, M, N, lda );
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( arr[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function setMatrix( V, entries, lda ) {
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		V[ ( entries[ i ][ 0 ] - 1 ) + ( ( entries[ i ][ 1 ] - 1 ) * lda ) ] = entries[ i ][ 2 ];
	}
}

function setupT( T ) {
	T[ 0 ] = 1.2;
	T[ 3 ] = -0.3;
	T[ 4 ] = 0.8;
}

function setupTBwd( T ) {
	T[ 0 ] = 1.2;
	T[ 1 ] = -0.3;
	T[ 4 ] = 0.8;
}

function setupAleft( A ) {
	A[ 0 ] = 1; A[ 1 ] = 4;
	A[ 4 ] = 2; A[ 5 ] = 5;
	A[ 8 ] = 3; A[ 9 ] = 6;
}

function setupBleft( B ) {
	B[ 0 ] = 7; B[ 1 ] = 10; B[ 2 ] = 13; B[ 3 ] = 16;
	B[ 5 ] = 8; B[ 6 ] = 11; B[ 7 ] = 14; B[ 8 ] = 17;
	B[ 10 ] = 9; B[ 11 ] = 12; B[ 12 ] = 15; B[ 13 ] = 18;
}

function setupAright( A ) {
	A[ 0 ] = 1; A[ 1 ] = 3; A[ 2 ] = 5;
	A[ 4 ] = 2; A[ 5 ] = 4; A[ 6 ] = 6;
}

function setupBright( B ) {
	B[ 0 ] = 7; B[ 1 ] = 11; B[ 2 ] = 15;
	B[ 5 ] = 8; B[ 6 ] = 12; B[ 7 ] = 16;
	B[ 10 ] = 9; B[ 11 ] = 13; B[ 12 ] = 17;
	B[ 15 ] = 10; B[ 16 ] = 14; B[ 17 ] = 18;
}


// CONSTANTS //

var COARSE_TOL = 5e-3;


// FIXTURES //

var EXP = {
	'col_fwd_left_notrans': {
		'A': [ -2.81, -21.68, -3.46, -23.32, -4.11, -24.96 ],
		'B': [ -4.514, -15.68, 13, -10.442, -5.956, -17.32, 14, -12.412, -7.398, -18.96, 15, -14.382 ]
	},
	'col_fwd_left_trans': {
		'A': [ -12.44, -18.32, -14.08, -19.30, -15.72, -20.28 ],
		'B': [ -13.136, -12.32, 13, -9.008, -15.37, -13.30, 14, -10.516, -17.604, -14.28, 15, -12.024 ]
	},
	'col_fwd_right_notrans': {
		'A': [ -11, -17.16, -23.32, -12.68, -17.6, -22.52 ],
		'B': [ -9.404, -15.64, -21.876, -6.68, -9.6, -12.52, 9, 13, 17, -7.08, -11.632, -16.184 ]
	},
	'col_fwd_right_trans': {
		'A': [ -4.37, -7.17, -9.97, -15.68, -22.64, -29.6 ],
		'B': [ -3.674, -7.162, -10.65, -9.68, -14.64, -19.6, 9, 13, 17, -8.754, -14.674, -20.594 ]
	},
	'col_bwd_left_notrans': {
		'A': [ -25.16, -7.14, -27.28, -7.20, -29.40, -7.26 ],
		'B': [ -1.574, 10, -13.16, -5.604, -1.516, 11, -15.28, -6.912, -1.458, 12, -17.4, -8.22 ]
	},
	'col_bwd_right_trans': {
		'A': [ -17.48, -25.56, -33.64, -4.66, -5.9, -7.14 ],
		'B': [ 1.306, 2.318, 3.33, 8, 12, 16, -9.48, -15.56, -21.64, -4.052, -7.324, -10.596 ]
	},
	'row_fwd_left_notrans': {
		'A': [ -5.21, -15.28, -6.01, -16.52, -6.81, -17.76 ],
		'B': [ -4.994, -9.28, 13, 5.118, -6.466, -10.52, 14, 4.638, -7.938, -11.76, 15, 4.158 ]
	},
	'row_fwd_right_notrans': {
		'A': [ -11, -17.16, -23.32, -8.68, -12, -15.32 ],
		'B': [ -8.204, -13.96, -19.716, -2.68, -4, -5.32, 9, 13, 17, 2.26, 1.968, 1.676 ]
	},
	'row_bwd_left_trans': {
		'A': [ -16.19, -14.8, -17.44, -15.8, -18.69, -16.8 ],
		'B': [ -5.838, 10, -4.19, -7.957, -6.288, 11, -5.44, -9.632, -6.738, 12, -6.69, -11.307 ]
	},
	'row_bwd_right_notrans': {
		'A': [ -11.63, -16.83, -22.03, -10.4, -14.8, -19.2 ],
		'B': [ -1.726, -2.366, -3.006, 8, 12, 16, -3.63, -6.83, -10.03, -6.189, -10.749, -15.309 ]
	},
	'col_fwd_left_notrans_l0': {
		'A': [ -16.22, -23.04, -17.77, -24.84, -19.32, -26.64 ],
		'B': [ -18.332, -17.04, -7.408, -13.26, -20.722, -18.84, -8.828, -15.75, -23.112, -20.64, -10.248, -18.24 ]
	}
};


// TESTS //

test( 'dtprfb is a function', function t() {
	assert.strictEqual( typeof dtprfb, 'function', 'is a function' );
});

test( 'dtprfb: col_fwd_left_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 1, 2, 0.3 ], [ 2, 2, 1.0 ], [ 4, 1, 0.2 ], [ 4, 2, 1.0 ] ], 8 );
	setupT( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.col_fwd_left_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.col_fwd_left_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_fwd_left_trans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 1, 2, 0.3 ], [ 2, 2, 1.0 ], [ 4, 1, 0.2 ], [ 4, 2, 1.0 ] ], 8 );
	setupT( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'transpose', 'forward', 'columnwise', 4, 3, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.col_fwd_left_trans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.col_fwd_left_trans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_fwd_right_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 1, 2, 0.3 ], [ 2, 2, 1.0 ], [ 4, 1, 0.2 ], [ 4, 2, 1.0 ] ], 8 );
	setupT( T );
	setupAright( A );
	setupBright( B );
	dtprfb( 'right', 'no-transpose', 'forward', 'columnwise', 3, 4, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 3, 2, 4, EXP.col_fwd_right_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 3, 4, 5, EXP.col_fwd_right_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_fwd_right_trans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 1, 2, 0.3 ], [ 2, 2, 1.0 ], [ 4, 1, 0.2 ], [ 4, 2, 1.0 ] ], 8 );
	setupT( T );
	setupAright( A );
	setupBright( B );
	dtprfb( 'right', 'transpose', 'forward', 'columnwise', 3, 4, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 3, 2, 4, EXP.col_fwd_right_trans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 3, 4, 5, EXP.col_fwd_right_trans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_bwd_left_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 0.2 ], [ 1, 2, 0.3 ], [ 3, 1, 1.0 ], [ 4, 1, 0.4 ], [ 4, 2, 1.0 ] ], 8 );
	setupTBwd( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'no-transpose', 'backward', 'columnwise', 4, 3, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.col_bwd_left_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.col_bwd_left_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_bwd_right_trans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 0.2 ], [ 1, 2, 0.3 ], [ 3, 1, 1.0 ], [ 4, 1, 0.4 ], [ 4, 2, 1.0 ] ], 8 );
	setupTBwd( T );
	setupAright( A );
	setupBright( B );
	dtprfb( 'right', 'transpose', 'backward', 'columnwise', 3, 4, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 3, 2, 4, EXP.col_bwd_right_trans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 3, 4, 5, EXP.col_bwd_right_trans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: row_fwd_left_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 2, 1, 0.3 ], [ 2, 2, 1.0 ], [ 1, 4, 0.2 ], [ 2, 4, 0.5 ] ], 8 );
	setupT( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'no-transpose', 'forward', 'rowwise', 4, 3, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.row_fwd_left_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.row_fwd_left_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: row_fwd_right_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 2, 1, 0.3 ], [ 2, 2, 1.0 ], [ 1, 4, 0.2 ], [ 2, 4, 0.5 ] ], 8 );
	setupT( T );
	setupAright( A );
	setupBright( B );
	dtprfb( 'right', 'no-transpose', 'forward', 'rowwise', 3, 4, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 3, 2, 4, EXP.row_fwd_right_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 3, 4, 5, EXP.row_fwd_right_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: row_bwd_left_trans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 0.2 ], [ 2, 1, 0.5 ], [ 1, 3, 1.0 ], [ 1, 4, 0.3 ], [ 2, 4, 1.0 ] ], 8 );
	setupTBwd( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'transpose', 'backward', 'rowwise', 4, 3, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.row_bwd_left_trans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.row_bwd_left_trans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: row_bwd_right_notrans', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 0.2 ], [ 2, 1, 0.5 ], [ 1, 3, 1.0 ], [ 1, 4, 0.3 ], [ 2, 4, 1.0 ] ], 8 );
	setupTBwd( T );
	setupAright( A );
	setupBright( B );
	dtprfb( 'right', 'no-transpose', 'backward', 'rowwise', 3, 4, 2, 1, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 3, 2, 4, EXP.row_bwd_right_notrans.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 3, 4, 5, EXP.row_bwd_right_notrans.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: col_fwd_left_notrans_l0', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	setMatrix( V, [ [ 1, 1, 1.0 ], [ 1, 2, 0.3 ], [ 2, 2, 1.0 ], [ 3, 1, 0.4 ], [ 3, 2, 0.5 ], [ 4, 1, 0.6 ], [ 4, 2, 0.7 ] ], 8 );
	setupT( T );
	setupAleft( A );
	setupBleft( B );
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 0, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assertExtractClose( A, 2, 3, 4, EXP.col_fwd_left_notrans_l0.A, COARSE_TOL, 'A' );
	assertExtractClose( B, 4, 3, 5, EXP.col_fwd_left_notrans_l0.B, COARSE_TOL, 'B' );
});

test( 'dtprfb: quick return M=0', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	A[ 0 ] = 99.0;
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 3, 2, 0, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assert.strictEqual( A[ 0 ], 99.0 );
});

test( 'dtprfb: quick return N=0', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	A[ 0 ] = 88.0;
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 0, 2, 0, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assert.strictEqual( A[ 0 ], 88.0 );
});

test( 'dtprfb: quick return K=0', function t() {
	var V = new Float64Array( 64 );
	var T = new Float64Array( 9 );
	var A = new Float64Array( 16 );
	var B = new Float64Array( 25 );
	var WORK = new Float64Array( 25 );
	A[ 0 ] = 77.0;
	dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 0, 0, V, 1, 8, 0, T, 1, 3, 0, A, 1, 4, 0, B, 1, 5, 0, WORK, 1, 5, 0 );
	assert.strictEqual( A[ 0 ], 77.0 );
});

test( 'dtprfb throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		dtprfb( 'invalid', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, TypeError );
});

test( 'dtprfb throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'invalid', 'forward', 'columnwise', 4, 3, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, TypeError );
});

test( 'dtprfb throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'invalid', 'columnwise', 4, 3, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, TypeError );
});

test( 'dtprfb throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'forward', 'invalid', 4, 3, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, TypeError );
});

test( 'dtprfb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', -1, 3, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, -1, 2, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, -1, 1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, RangeError );
});

test( 'dtprfb throws RangeError for negative l', function t() {
	assert.throws( function throws() {
		dtprfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, -1, new Float64Array( 64 ), 1, 8, 0, new Float64Array( 9 ), 1, 3, 0, new Float64Array( 16 ), 1, 4, 0, new Float64Array( 25 ), 1, 5, 0, new Float64Array( 25 ), 1, 5, 0 );
	}, RangeError );
});
