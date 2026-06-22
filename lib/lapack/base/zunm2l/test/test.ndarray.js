

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunm2l from './../lib/ndarray.js';


// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok(
			Math.abs( actual[ i ] - expected[ i ] ) <= tol,
			msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]
		);
	}
}


// TESTS //

test( 'zunm2l: main export is a function', function t() {
	assert.strictEqual( typeof zunm2l, 'function' );
});

test( 'zunm2l: M=0 quick return', function t() {
	var C = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunm2l( 'left', 'no-transpose', 0, 1, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zunm2l: N=0 quick return', function t() {
	var C = new Complex128Array( 1 );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunm2l( 'left', 'no-transpose', 1, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zunm2l: K=0 quick return', function t() {
	var C = new Complex128Array( [ 1, 2, 3, 4 ] );
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 0 );
	var WORK = new Complex128Array( 1 );
	var Cv = reinterpret( C, 0 );
	var info = zunm2l( 'left', 'no-transpose', 2, 1, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	// C unchanged
	assert.strictEqual( Cv[ 0 ], 1 );
	assert.strictEqual( Cv[ 1 ], 2 );
});

test( 'zunm2l: left, no-transpose, real tau=0 (identity reflector)', function t() {
	// H = I - 0 * v * v^H = I, so C should be unchanged
	// M=2, N=1, K=1
	// A is 2x1, reflector stored in column 0
	var A = new Complex128Array( [ 1, 0, 1, 0 ] ); // v = [1; 1], but tau=0 so irrelevant
	var TAU = new Complex128Array( [ 0, 0 ] );
	var C = new Complex128Array( [ 3, 1, 7, 2 ] ); // C = [3+i; 7+2i]
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunm2l( 'left', 'no-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 3, 1, 7, 2 ], 1e-14, 'C' );
});

test( 'zunm2l: left, no-transpose, 2x1 with K=1, real reflector', function t() {
	// QL reflector: M=2, K=1. Reflector vector is column 0 of A.
	// The pivot element is at row nq-K+i = 2-1+0 = 1 (set to 1 internally).
	// So v = [A(0,0); 1] for the reflector.
	// Let A(0,0) = 0 (so v = [0; 1]), tau = 2.
	// H = I - 2 * [0; 1] * [0, 1] = [1 0; 0 -1]
	// C = [5+0i; 3+0i], Q*C = H*C = [5; -3]
	var A = new Complex128Array( [ 0, 0, 99, 0 ] ); // A(0,0)=0, A(1,0) will be overwritten with 1
	var TAU = new Complex128Array( [ 2, 0 ] );
	var C = new Complex128Array( [ 5, 0, 3, 0 ] );
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunm2l( 'left', 'no-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	// H = [1 0; 0 -1], C = [5; 3] => H*C = [5; -3]
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunm2l: left, conjugate-transpose, 2x1 with K=1', function t() {
	// H = I - 2 * [0; 1] * [0, 1] = [1 0; 0 -1], H^H = H (since real and symmetric)
	// C = [5+0i; 3+0i], Q^H * C = H^H * C = H * C = [5; -3]
	var A = new Complex128Array( [ 0, 0, 99, 0 ] );
	var TAU = new Complex128Array( [ 2, 0 ] );
	var C = new Complex128Array( [ 5, 0, 3, 0 ] );
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunm2l( 'left', 'conjugate-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunm2l: right, no-transpose, 1x2 with K=1', function t() {
	// side='right': C := C*Q = C*H
	// nq = N = 2, K = 1. Reflector v = [0; 1], tau = 2 => H = [1 0; 0 -1]
	// C is 1x2: [5+0i, 3+0i]
	// C * H = [5, 3] * [1 0; 0 -1] = [5, -3]
	var A = new Complex128Array( [ 0, 0, 99, 0 ] );
	var TAU = new Complex128Array( [ 2, 0 ] );
	var C = new Complex128Array( [ 5, 0, 3, 0 ] ); // 1x2, column-major: C(0,0)=5, C(0,1)=3
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	// C is 1x2, strideC1=1, strideC2=1
	info = zunm2l( 'right', 'no-transpose', 1, 2, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunm2l: right, conjugate-transpose, 1x2 with K=1', function t() {
	// C * Q^H = C * H^H = C * H = [5, -3] (H is real symmetric)
	var A = new Complex128Array( [ 0, 0, 99, 0 ] );
	var TAU = new Complex128Array( [ 2, 0 ] );
	var C = new Complex128Array( [ 5, 0, 3, 0 ] );
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunm2l( 'right', 'conjugate-transpose', 1, 2, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 5, 0, -3, 0 ], 1e-14, 'C' );
});

test( 'zunm2l: left, no-transpose, 3x2, K=2, complex reflectors', function t() {
	// M=3, N=2, K=2. Two reflectors applied as Q = H(2)*H(1).
	// QL stores reflectors bottom-up. Column i of A has reflector i.
	// Reflector 0: pivot at row nq-K+0 = 3-2+0 = 1. v0 = [A(0,0); 1; 0]
	// Reflector 1: pivot at row nq-K+1 = 3-2+1 = 2. v1 = [A(0,1); A(1,1); 1]
	//
	// Let v0 = [0; 1; 0], tau0 = 0 => H(0) = I (identity)
	// Let v1 = [0; 0; 1], tau1 = 2 => H(1) = I - 2*[0;0;1]*[0,0,1] = diag(1,1,-1)
	// Q = H(2)*H(1) = H(1)*H(0) = diag(1,1,-1)*I = diag(1,1,-1)
	// Apply: C_left = Q*C = diag(1,1,-1)*C
	var A = new Complex128Array( 3 * 2 ); // 3x2 column-major
	var Av = reinterpret( A, 0 );
	var TAU = new Complex128Array( 2 );
	var TAUv = reinterpret( TAU, 0 );
	var C = new Complex128Array( [ 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0 ] ); // 3x2 col-major
	var WORK = new Complex128Array( 8 );
	var Cv = reinterpret( C, 0 );
	var info;

	// A column 0: [0, pivot, *]
	Av[ 0 ] = 0; Av[ 1 ] = 0; // A(0,0) = 0
	Av[ 2 ] = 99; Av[ 3 ] = 0; // A(1,0) pivot — overwritten
	Av[ 4 ] = 0; Av[ 5 ] = 0; // A(2,0) = 0
	// A column 1: [0, 0, pivot]
	Av[ 6 ] = 0; Av[ 7 ] = 0;   // A(0,1) = 0
	Av[ 8 ] = 0; Av[ 9 ] = 0;   // A(1,1) = 0
	Av[ 10 ] = 99; Av[ 11 ] = 0; // A(2,1) pivot — overwritten

	TAUv[ 0 ] = 0; TAUv[ 1 ] = 0; // tau0 = 0 (identity)
	TAUv[ 2 ] = 2; TAUv[ 3 ] = 0; // tau1 = 2

	// C = [[1,4],[2,5],[3,6]] column-major
	info = zunm2l( 'left', 'no-transpose', 3, 2, 2, A, 1, 3, 0, TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	// Q*C = diag(1,1,-1)*C = [[1,4],[2,5],[-3,-6]]
	assertArrayClose( Array.from( Cv ), [ 1, 0, 2, 0, -3, 0, 4, 0, 5, 0, -6, 0 ], 1e-14, 'C' );
});

test( 'zunm2l: left, no-transpose, complex tau', function t() {
	// M=2, N=1, K=1. v = [1; 1] (A(0,0)=1, pivot at row 1 set to 1).
	// tau = 1+0i. H = I - (1+0i)*[1;1]*[1,1] = [1 0;0 1] - [1 1;1 1] = [0 -1;-1 0]
	// C = [2+0i; 3+0i]. H*C = [0*2+(-1)*3; (-1)*2+0*3] = [-3; -2]
	var A = new Complex128Array( [ 1, 0, 99, 0 ] );
	var TAU = new Complex128Array( [ 1, 0 ] );
	var C = new Complex128Array( [ 2, 0, 3, 0 ] );
	var WORK = new Complex128Array( 4 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunm2l( 'left', 'no-transpose', 2, 1, 1, A, 1, 2, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ -3, 0, -2, 0 ], 1e-14, 'C' );
});
