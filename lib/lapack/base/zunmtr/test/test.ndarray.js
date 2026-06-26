

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zunmtr from './../lib/ndarray.js';


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

test( 'zunmtr: main export is a function', function t() {
	assert.strictEqual( typeof zunmtr, 'function' );
});

test( 'zunmtr: M=0 quick return', function t() {
	var info = zunmtr( 'left', 'upper', 'no-transpose', 0, 1,
		new Complex128Array( 1 ), 1, 1, 0,
		new Complex128Array( 1 ), 1, 0,
		new Complex128Array( 1 ), 1, 1, 0,
		new Complex128Array( 128 ), 1, 0, 128
	);
	assert.strictEqual( info, 0 );
});

test( 'zunmtr: N=0 quick return', function t() {
	var info = zunmtr( 'left', 'upper', 'no-transpose', 1, 0,
		new Complex128Array( 1 ), 1, 1, 0,
		new Complex128Array( 1 ), 1, 0,
		new Complex128Array( 1 ), 1, 1, 0,
		new Complex128Array( 128 ), 1, 0, 128
	);
	assert.strictEqual( info, 0 );
});

test( 'zunmtr: nq=1 quick return', function t() {
	// side=left => nq=M=1, triggers quick return
	var C = new Complex128Array( [ 5, 3 ] );
	var Cv = reinterpret( C, 0 );
	var info = zunmtr( 'left', 'upper', 'no-transpose', 1, 1,
		new Complex128Array( 1 ), 1, 1, 0,
		new Complex128Array( 1 ), 1, 0,
		C, 1, 1, 0,
		new Complex128Array( 128 ), 1, 0, 128
	);
	assert.strictEqual( info, 0 );
	assert.strictEqual( Cv[ 0 ], 5 );
	assert.strictEqual( Cv[ 1 ], 3 );
});

test( 'zunmtr: left, upper, no-transpose, 3x1', function t() {
	// UPLO='upper': calls zunmql with reflectors from columns 1..NQ-1 of A
	// side='left' => nq=M=3, so we use NQ-1=2 reflectors from A(:,1:2)
	// Mi = M-1 = 2, ni = N = 1

	// A is 3x3. Reflectors in A(:, 1) and A(:, 2):
	// Column 1 of A (reflector 0): A(0,1) is the reflector vector element, pivot at row nq-K+0 = 3-2+0 = 1
	// Column 2 of A (reflector 1): A(0:1, 2) are reflector elements, pivot at row nq-K+1 = 3-2+1 = 2

	// Zunmql sees: A passed with offsetA + strideA2 (column 1 offset), K = NQ-1 = 2
	// Applied to C(0:mi-1, 0:ni-1) = C(0:1, 0:0)

	// For simple test: all tau=0 => Q=I, C unchanged
	var A = new Complex128Array( 3 * 3 ); // 3x3
	var TAU = new Complex128Array( [ 0, 0, 0, 0 ] ); // 2 taus (NQ-1=2)
	var C = new Complex128Array( [ 10, 1, 20, 2, 30, 3 ] ); // 3x1: [10+i, 20+2i, 30+3i]
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunmtr( 'left', 'upper', 'no-transpose', 3, 1,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );

	// With tau=0, Q=I, C is unchanged
	assertArrayClose( Array.from( Cv ), [ 10, 1, 20, 2, 30, 3 ], 1e-14, 'C' );
});

test( 'zunmtr: left, upper, no-transpose, 3x1, non-trivial reflector', function t() {
	// M=3, N=1. upper => zunmql with A(:,1:2), K=2
	// TAU[0] corresponds to reflector in col 1, TAU[1] in col 2

	// Zunmql applies to C(0:mi-1, ...) where mi = M-1 = 2
	// So only first 2 rows of C are affected.

	// Reflector 0 in A(:,1): v0 has pivot at row 0 of the zunmql (nq=2, K=2, nq-K+0=0)
	//   So v0 = [1] (just the pivot). With tau0=0, H0=I.
	// Reflector 1 in A(:,2): v1 has pivot at row 1 (nq-K+1=1)
	//   v1 = [A(0,2); 1]. Let A(0,2) = 0 => v1 = [0;1], tau1=2 => H1 = diag(1,-1)

	// Q = H(2)*H(1) = diag(1,-1) * I = diag(1,-1)
	// Applied to first 2 rows of C: C(0:1, 0) = Q * C(0:1, 0)
	// C = [10; 20; 30]. After: [10; -20; 30]
	var A = new Complex128Array( 3 * 3 ); // 3x3, column-major
	var Av = reinterpret( A, 0 );
	var TAU = new Complex128Array( [ 0, 0, 2, 0 ] ); // tau0=0, tau1=2
	var C = new Complex128Array( [ 10, 0, 20, 0, 30, 0 ] );
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	// A column 1 (offset 3 in complex elements): reflector 0

	// A column 2 (offset 6 in complex elements): reflector 1, A(0,2) = 0
	Av[ 12 ] = 0; Av[ 13 ] = 0; // A(0,2) = 0

	info = zunmtr( 'left', 'upper', 'no-transpose', 3, 1,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );

	// First 2 rows affected by diag(1,-1): [10; -20]. Row 2 unchanged: 30
	assertArrayClose( Array.from( Cv ), [ 10, 0, -20, 0, 30, 0 ], 1e-14, 'C' );
});

test( 'zunmtr: left, lower, no-transpose, 3x1', function t() {
	// UPLO='lower': calls zunmqr with reflectors from A(1:NQ-1, 0:NQ-2)
	// side='left' => nq=M=3, mi=M-1=2, ni=N=1
	// K = NQ-1 = 2, i1=1 (skip first row of C)
	// zunmqr: applied to C(1:2, 0:0)

	// With tau=0 => Q=I, C unchanged
	var A = new Complex128Array( 3 * 3 );
	var TAU = new Complex128Array( [ 0, 0, 0, 0 ] );
	var C = new Complex128Array( [ 10, 0, 20, 0, 30, 0 ] );
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunmtr( 'left', 'lower', 'no-transpose', 3, 1,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 10, 0, 20, 0, 30, 0 ], 1e-14, 'C' );
});

test( 'zunmtr: left, upper, conjugate-transpose, 3x1', function t() {
	// Same setup as non-trivial reflector test above, but Q^H
	// Since the reflector is real and symmetric, Q^H = Q
	var A = new Complex128Array( 3 * 3 );
	var Av = reinterpret( A, 0 );
	var TAU = new Complex128Array( [ 0, 0, 2, 0 ] );
	var C = new Complex128Array( [ 10, 0, 20, 0, 30, 0 ] );
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	Av[ 12 ] = 0; Av[ 13 ] = 0;

	info = zunmtr( 'left', 'upper', 'conjugate-transpose', 3, 1,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 10, 0, -20, 0, 30, 0 ], 1e-14, 'C' );
});

test( 'zunmtr: right, upper, no-transpose, 1x3', function t() {
	// side='right' => nq=N=3, mi=M=1, ni=N-1=2
	// C is 1x3. C * Q applied to C(:, 0:1)
	// With tau=0 => Q=I, C unchanged
	var A = new Complex128Array( 3 * 3 );
	var TAU = new Complex128Array( [ 0, 0, 0, 0 ] );
	var C = new Complex128Array( [ 10, 0, 20, 0, 30, 0 ] ); // 1x3 col-major
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunmtr( 'right', 'upper', 'no-transpose', 1, 3,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 10, 0, 20, 0, 30, 0 ], 1e-14, 'C' );
});

test( 'zunmtr: right, lower, no-transpose, 1x3', function t() {
	// side='right' => nq=N=3, mi=M=1, ni=N-1=2
	// Lower => zunmqr, i1=0, i2=1 (skip first column of C)
	// C is 1x3. With tau=0, C unchanged.
	var A = new Complex128Array( 3 * 3 );
	var TAU = new Complex128Array( [ 0, 0, 0, 0 ] );
	var C = new Complex128Array( [ 10, 0, 20, 0, 30, 0 ] );
	var WORK = new Complex128Array( 256 );
	var Cv = reinterpret( C, 0 );
	var info;

	info = zunmtr( 'right', 'lower', 'no-transpose', 1, 3,
		A, 1, 3, 0,
		TAU, 1, 0,
		C, 1, 1, 0,
		WORK, 1, 0, 256
	);
	assert.strictEqual( info, 0 );
	assertArrayClose( Array.from( Cv ), [ 10, 0, 20, 0, 30, 0 ], 1e-14, 'C' );
});
