import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlasr from './../lib/index.js';
import base from './../lib/ndarray.js';

// HELPERS //

var EPS = 1.0e-14;

function assertClose( actual, expected, msg ) {
	var relErr;
	var i;
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		if ( expected[ i ] === 0.0 ) {
			assert.ok( Math.abs( actual[ i ] ) <= EPS, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		} else {
			relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
			assert.ok( relErr <= EPS, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

/**
* Build a column-major interleaved complex matrix from an array of
* complex values given as [re, im] pairs in row-major order.
*
* @param {number} M - rows
* @param {number} N - cols
* @param {Array} vals - M*N pairs of [re, im]
* @returns {Complex128Array} interleaved column-major matrix
*/
function buildMatrix( M, N, vals ) {
	var A = new Complex128Array( M * N );
	var Av = reinterpret( A, 0 );
	var row;
	var col;
	var k;
	k = 0;
	for ( row = 0; row < M; row++ ) {
		for ( col = 0; col < N; col++ ) {
			Av[ col * 2 * M + row * 2 ] = vals[ k ][ 0 ];
			Av[ col * 2 * M + row * 2 + 1 ] = vals[ k ][ 1 ];
			k++;
		}
	}
	return A;
}

/**
* Extract all complex entries from the matrix in row-major order as a flat
* Float64Array [re00, im00, re01, im01, ...].
*/
function extractAll( A, M, N, LDA ) {
	var Av = ( A instanceof Complex128Array ) ? reinterpret( A, 0 ) : A;
	var result = [];
	var row;
	var col;
	for ( row = 0; row < M; row++ ) {
		for ( col = 0; col < N; col++ ) {
			result.push( Av[ col * 2 * LDA + row * 2 ] );
			result.push( Av[ col * 2 * LDA + row * 2 + 1 ] );
		}
	}
	return new Float64Array( result );
}

// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlasr, 'function' );
});

test( 'attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlasr.ndarray, 'function' );
});

// --- Quick returns ---

test( 'returns early when M=0', function t() {
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var c = new Float64Array( [ 0.5 ] );
	var s = new Float64Array( [ 0.5 ] );
	var expected = new Float64Array( reinterpret( A, 0 ) );
	base( 'left', 'variable', 'forward', 0, 2, c, 1, 0, s, 1, 0, A, 1, 2, 0 );
	assertClose( reinterpret( A, 0 ), expected, 'M=0' );
});

test( 'returns early when N=0', function t() {
	var A = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var c = new Float64Array( [ 0.5 ] );
	var s = new Float64Array( [ 0.5 ] );
	var expected = new Float64Array( reinterpret( A, 0 ) );
	base( 'left', 'variable', 'forward', 2, 0, c, 1, 0, s, 1, 0, A, 1, 2, 0 );
	assertClose( reinterpret( A, 0 ), expected, 'N=0' );
});

// --- Left side, Variable pivot ---

test( 'left, variable pivot, forward: 2x2 identity rotation', function t() {
	// c=1, s=0 should not change the matrix
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);
	var expected = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1.0 ] );
	var s = new Float64Array( [ 0.0 ] );
	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( extractAll( A, M, N, LDA ), extractAll( expected, M, N, LDA ), 'L-V-F identity' );
});

test( 'left, variable pivot, forward: 2x2 with 45-degree rotation', function t() {
	// Apply a single Givens rotation from the left to rows 0 and 1
	var M = 2;
	var N = 2;
	var LDA = M;
	var cos45 = Math.sqrt( 2 ) / 2;
	var sin45 = Math.sqrt( 2 ) / 2;

	// A = [ (1,0) (0,0) ; (0,0) (1,0) ] = identity
	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 0, 0 ],
		[ 0, 0 ], [ 1, 0 ]
	]);
	var c = new Float64Array( [ cos45 ] );
	var s = new Float64Array( [ sin45 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// After rotation, new A(1,0) = c*A(1,0) - s*A(0,0) = cos45*0 - sin45*1 = -sin45
	// new A(0,0) = s*A(1,0) + c*A(0,0) = sin45*0 + cos45*1 = cos45
	// new A(1,1) = c*A(1,1) - s*A(0,1) = cos45*1 - sin45*0 = cos45
	// new A(0,1) = s*A(1,1) + c*A(0,1) = sin45*1 + cos45*0 = sin45
	var expected = new Float64Array( [
		cos45, 0, sin45, 0,    // row-major: A(0,0), A(0,1)
		-sin45, 0, cos45, 0    // row-major: A(1,0), A(1,1)
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-V-F 45deg' );
});

test( 'left, variable pivot, backward: 2x2 with rotation', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var cos45 = Math.sqrt( 2 ) / 2;
	var sin45 = Math.sqrt( 2 ) / 2;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 0, 0 ],
		[ 0, 0 ], [ 1, 0 ]
	]);
	var c = new Float64Array( [ cos45 ] );
	var s = new Float64Array( [ sin45 ] );

	base( 'left', 'variable', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Same single rotation, backward on M-1=1 rotations gives same result
	var expected = new Float64Array( [
		cos45, 0, sin45, 0,
		-sin45, 0, cos45, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-V-B 45deg' );
});

test( 'left, variable pivot, forward: 3x2 with complex entries', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	// A = [ (1,1) (2,2) ; (3,3) (4,4) ; (5,5) (6,6) ]
	var A = buildMatrix( M, N, [
		[ 1, 1 ], [ 2, 2 ],
		[ 3, 3 ], [ 4, 4 ],
		[ 5, 5 ], [ 6, 6 ]
	]);

	// Two rotations (M-1=2): first between rows 0&1, then rows 1&2
	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Manual computation, rotation j=0: c=0.6, s=0.8, acts on rows 0 and 1
	// For each column i:
	//   temp = A(1,i)
	//   A(1,i) = 0.6*temp - 0.8*A(0,i)
	//   A(0,i) = 0.8*temp + 0.6*A(0,i)
	//
	// Col 0: A(0,0)=(1,1), A(1,0)=(3,3)
	//   newA(1,0) = 0.6*(3,3) - 0.8*(1,1) = (1.8,1.8) - (0.8,0.8) = (1.0,1.0)
	//   newA(0,0) = 0.8*(3,3) + 0.6*(1,1) = (2.4,2.4) + (0.6,0.6) = (3.0,3.0)
	// Col 1: A(0,1)=(2,2), A(1,1)=(4,4)
	//   newA(1,1) = 0.6*(4,4) - 0.8*(2,2) = (2.4,2.4) - (1.6,1.6) = (0.8,0.8)
	//   newA(0,1) = 0.8*(4,4) + 0.6*(2,2) = (3.2,3.2) + (1.2,1.2) = (4.4,4.4)
	//
	// After j=0: A = [ (3,3) (4.4,4.4) ; (1,1) (0.8,0.8) ; (5,5) (6,6) ]
	//
	// Rotation j=1: c=0.8, s=0.6, acts on rows 1 and 2
	// Col 0: A(1,0)=(1,1), A(2,0)=(5,5)
	//   newA(2,0) = 0.8*(5,5) - 0.6*(1,1) = (4,4) - (0.6,0.6) = (3.4,3.4)
	//   newA(1,0) = 0.6*(5,5) + 0.8*(1,1) = (3,3) + (0.8,0.8) = (3.8,3.8)
	// Col 1: A(1,1)=(0.8,0.8), A(2,1)=(6,6)
	//   newA(2,1) = 0.8*(6,6) - 0.6*(0.8,0.8) = (4.8,4.8) - (0.48,0.48) = (4.32,4.32)
	//   newA(1,1) = 0.6*(6,6) + 0.8*(0.8,0.8) = (3.6,3.6) + (0.64,0.64) = (4.24,4.24)
	//
	// Final: [ (3,3) (4.4,4.4) ; (3.8,3.8) (4.24,4.24) ; (3.4,3.4) (4.32,4.32) ]

	var expected = new Float64Array( [
		3, 3, 4.4, 4.4,
		3.8, 3.8, 4.24, 4.24,
		3.4, 3.4, 4.32, 4.32
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-V-F 3x2 complex' );
});

// --- Left side, Top pivot ---

test( 'left, top pivot, forward: 3x2', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ],
		[ 3, 0 ], [ 4, 0 ],
		[ 5, 0 ], [ 6, 0 ]
	]);

	// Two rotations (M-1=2): j=1 uses c[0],s[0]; j=2 uses c[1],s[1]
	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'left', 'top', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=1 (Fortran j=2, 0-based j=1): c=c[0]=0.6, s=s[0]=0.8
	//   Rotates row 1 against row 0 (top pivot = row 0)
	//   Col 0: temp=A(1,0)=3, A(1,0)=0.6*3-0.8*1=1.0, A(0,0)=0.8*3+0.6*1=3.0
	//   Col 1: temp=A(1,1)=4, A(1,1)=0.6*4-0.8*2=0.8, A(0,1)=0.8*4+0.6*2=4.4
	// After j=1: A = [ (3,0) (4.4,0) ; (1,0) (0.8,0) ; (5,0) (6,0) ]
	//
	// j=2 (0-based j=2): c=c[1]=0.8, s=s[1]=0.6
	//   Rotates row 2 against row 0
	//   Col 0: temp=A(2,0)=5, A(2,0)=0.8*5-0.6*3=2.2, A(0,0)=0.6*5+0.8*3=5.4
	//   Col 1: temp=A(2,1)=6, A(2,1)=0.8*6-0.6*4.4=2.16, A(0,1)=0.6*6+0.8*4.4=7.12

	var expected = new Float64Array( [
		5.4, 0, 7.12, 0,
		1, 0, 0.8, 0,
		2.2, 0, 2.16, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-T-F 3x2' );
});

test( 'left, top pivot, backward: 3x2', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ],
		[ 3, 0 ], [ 4, 0 ],
		[ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'left', 'top', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Backward: iterate j from M-1 down to 1
	// j=2 (0-based): c=c[1]=0.8, s=s[1]=0.6
	//   Col 0: temp=A(2,0)=5, A(2,0)=0.8*5-0.6*1=3.4, A(0,0)=0.6*5+0.8*1=3.8
	//   Col 1: temp=A(2,1)=6, A(2,1)=0.8*6-0.6*2=3.6, A(0,1)=0.6*6+0.8*2=5.2
	// After: A = [ (3.8,0) (5.2,0) ; (3,0) (4,0) ; (3.4,0) (3.6,0) ]
	//
	// j=1 (0-based): c=c[0]=0.6, s=s[0]=0.8
	//   Col 0: temp=A(1,0)=3, A(1,0)=0.6*3-0.8*3.8=-1.24, A(0,0)=0.8*3+0.6*3.8=4.68
	//   Col 1: temp=A(1,1)=4, A(1,1)=0.6*4-0.8*5.2=-1.76, A(0,1)=0.8*4+0.6*5.2=6.32

	var expected = new Float64Array( [
		4.68, 0, 6.32, 0,
		-1.24, 0, -1.76, 0,
		3.4, 0, 3.6, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-T-B 3x2' );
});

// --- Left side, Bottom pivot ---

test( 'left, bottom pivot, forward: 3x2', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ],
		[ 3, 0 ], [ 4, 0 ],
		[ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'left', 'bottom', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Forward: j=0 then j=1; rotates row j against bottom row (M-1=2)
	// j=0: c=0.6, s=0.8
	//   Col 0: temp=A(0,0)=1, A(0,0)=0.8*A(2,0)+0.6*temp=0.8*5+0.6*1=4.6
	//          A(2,0)=0.6*5-0.8*1=2.2
	//   Col 1: temp=A(0,1)=2, A(0,1)=0.8*6+0.6*2=6.0
	//          A(2,1)=0.6*6-0.8*2=2.0
	// After j=0: A = [ (4.6,0) (6,0) ; (3,0) (4,0) ; (2.2,0) (2,0) ]
	//
	// j=1: c=0.8, s=0.6
	//   Col 0: temp=A(1,0)=3, A(1,0)=0.6*A(2,0)+0.8*temp=0.6*2.2+0.8*3=3.72
	//          A(2,0)=0.8*2.2-0.6*3=1.76-1.8=-0.04
	//   Col 1: temp=A(1,1)=4, A(1,1)=0.6*2+0.8*4=4.4
	//          A(2,1)=0.8*2-0.6*4=-0.8

	var expected = new Float64Array( [
		4.6, 0, 6, 0,
		3.72, 0, 4.4, 0,
		-0.04, 0, -0.8, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-B-F 3x2' );
});

test( 'left, bottom pivot, backward: 3x2', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ],
		[ 3, 0 ], [ 4, 0 ],
		[ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'left', 'bottom', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Backward: j from M-2=1 down to 0
	// j=1: c=0.8, s=0.6
	//   Col 0: temp=A(1,0)=3, A(1,0)=0.6*A(2,0)+0.8*temp=0.6*5+0.8*3=5.4
	//          A(2,0)=0.8*5-0.6*3=2.2
	//   Col 1: temp=A(1,1)=4, A(1,1)=0.6*6+0.8*4=6.8
	//          A(2,1)=0.8*6-0.6*4=2.4
	// After j=1: A = [ (1,0) (2,0) ; (5.4,0) (6.8,0) ; (2.2,0) (2.4,0) ]
	//
	// j=0: c=0.6, s=0.8
	//   Col 0: temp=A(0,0)=1, A(0,0)=0.8*A(2,0)+0.6*temp=0.8*2.2+0.6*1=2.36
	//          A(2,0)=0.6*2.2-0.8*1=0.52
	//   Col 1: temp=A(0,1)=2, A(0,1)=0.8*2.4+0.6*2=3.12
	//          A(2,1)=0.6*2.4-0.8*2=-0.16

	var expected = new Float64Array( [
		2.36, 0, 3.12, 0,
		5.4, 0, 6.8, 0,
		0.52, 0, -0.16, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-B-B 3x2' );
});

// --- Right side, Variable pivot ---

test( 'right, variable pivot, forward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	// Two rotations (N-1=2)
	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=0: c=0.6, s=0.8, rotates cols 0 and 1
	//   Row 0: temp=A(0,1)=2, A(0,1)=0.6*2-0.8*1=0.4, A(0,0)=0.8*2+0.6*1=2.2
	//   Row 1: temp=A(1,1)=5, A(1,1)=0.6*5-0.8*4=−0.2, A(1,0)=0.8*5+0.6*4=6.4
	// After j=0: col0=(2.2,0,6.4,0), col1=(0.4,0,-0.2,0), col2=(3,0,6,0)
	//
	// j=1: c=0.8, s=0.6, rotates cols 1 and 2
	//   Row 0: temp=A(0,2)=3, A(0,2)=0.8*3-0.6*0.4=2.16, A(0,1)=0.6*3+0.8*0.4=2.12
	//   Row 1: temp=A(1,2)=6, A(1,2)=0.8*6-0.6*(-0.2)=4.92, A(1,1)=0.6*6+0.8*(-0.2)=3.44

	var expected = new Float64Array( [
		2.2, 0, 2.12, 0, 2.16, 0,
		6.4, 0, 3.44, 0, 4.92, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-V-F 2x3' );
});

test( 'right, variable pivot, backward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'variable', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Backward: j=1 then j=0
	// j=1: c=0.8, s=0.6, rotates cols 1 and 2
	//   Row 0: temp=A(0,2)=3, A(0,2)=0.8*3-0.6*2=1.2, A(0,1)=0.6*3+0.8*2=3.4
	//   Row 1: temp=A(1,2)=6, A(1,2)=0.8*6-0.6*5=1.8, A(1,1)=0.6*6+0.8*5=7.6
	// After j=1: col0=(1,0,4,0), col1=(3.4,0,7.6,0), col2=(1.2,0,1.8,0)
	//
	// j=0: c=0.6, s=0.8, rotates cols 0 and 1
	//   Row 0: temp=A(0,1)=3.4, A(0,1)=0.6*3.4-0.8*1=1.24, A(0,0)=0.8*3.4+0.6*1=3.32
	//   Row 1: temp=A(1,1)=7.6, A(1,1)=0.6*7.6-0.8*4=1.36, A(1,0)=0.8*7.6+0.6*4=8.48

	var expected = new Float64Array( [
		3.32, 0, 1.24, 0, 1.2, 0,
		8.48, 0, 1.36, 0, 1.8, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-V-B 2x3' );
});

// --- Right side, Top pivot ---

test( 'right, top pivot, forward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'top', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Forward: j=1 then j=2 (0-based); rotates col j against col 0
	// j=1 (0-based): c=c[0]=0.6, s=s[0]=0.8
	//   Row 0: temp=A(0,1)=2, A(0,1)=0.6*2-0.8*1=0.4, A(0,0)=0.8*2+0.6*1=2.2
	//   Row 1: temp=A(1,1)=5, A(1,1)=0.6*5-0.8*4=−0.2, A(1,0)=0.8*5+0.6*4=6.4
	// After j=1: col0=(2.2,0,6.4,0), col1=(0.4,0,-0.2,0), col2=(3,0,6,0)
	//
	// j=2 (0-based): c=c[1]=0.8, s=s[1]=0.6
	//   Row 0: temp=A(0,2)=3, A(0,2)=0.8*3-0.6*2.2=1.08, A(0,0)=0.6*3+0.8*2.2=3.56
	//   Row 1: temp=A(1,2)=6, A(1,2)=0.8*6-0.6*6.4=0.96, A(1,0)=0.6*6+0.8*6.4=8.72

	var expected = new Float64Array( [
		3.56, 0, 0.4, 0, 1.08, 0,
		8.72, 0, -0.2, 0, 0.96, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-T-F 2x3' );
});

test( 'right, top pivot, backward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'top', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Backward: j from N-1=2 down to 1
	// j=2 (0-based): c=c[1]=0.8, s=s[1]=0.6
	//   Row 0: temp=A(0,2)=3, A(0,2)=0.8*3-0.6*1=1.8, A(0,0)=0.6*3+0.8*1=2.6
	//   Row 1: temp=A(1,2)=6, A(1,2)=0.8*6-0.6*4=2.4, A(1,0)=0.6*6+0.8*4=6.8
	// After j=2: col0=(2.6,0,6.8,0), col1=(2,0,5,0), col2=(1.8,0,2.4,0)
	//
	// j=1 (0-based): c=c[0]=0.6, s=s[0]=0.8
	//   Row 0: temp=A(0,1)=2, A(0,1)=0.6*2-0.8*2.6=−0.88, A(0,0)=0.8*2+0.6*2.6=3.16
	//   Row 1: temp=A(1,1)=5, A(1,1)=0.6*5-0.8*6.8=−2.44, A(1,0)=0.8*5+0.6*6.8=8.08

	var expected = new Float64Array( [
		3.16, 0, -0.88, 0, 1.8, 0,
		8.08, 0, -2.44, 0, 2.4, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-T-B 2x3' );
});

// --- Right side, Bottom pivot ---

test( 'right, bottom pivot, forward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'bottom', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Forward: j=0 then j=1; rotates col j against last col (N-1=2)
	// j=0: c=0.6, s=0.8
	//   Row 0: temp=A(0,0)=1, A(0,0)=0.8*A(0,2)+0.6*temp=0.8*3+0.6*1=3.0
	//          A(0,2)=0.6*3-0.8*1=1.0
	//   Row 1: temp=A(1,0)=4, A(1,0)=0.8*A(1,2)+0.6*temp=0.8*6+0.6*4=7.2
	//          A(1,2)=0.6*6-0.8*4=0.4
	// After j=0: col0=(3,0,7.2,0), col1=(2,0,5,0), col2=(1,0,0.4,0)
	//
	// j=1: c=0.8, s=0.6
	//   Row 0: temp=A(0,1)=2, A(0,1)=0.6*A(0,2)+0.8*temp=0.6*1+0.8*2=2.2
	//          A(0,2)=0.8*1-0.6*2=−0.4
	//   Row 1: temp=A(1,1)=5, A(1,1)=0.6*A(1,2)+0.8*temp=0.6*0.4+0.8*5=4.24
	//          A(1,2)=0.8*0.4-0.6*5=−2.68

	var expected = new Float64Array( [
		3, 0, 2.2, 0, -0.4, 0,
		7.2, 0, 4.24, 0, -2.68, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-B-F 2x3' );
});

test( 'right, bottom pivot, backward: 2x3', function t() {
	var M = 2;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 2, 0 ], [ 3, 0 ],
		[ 4, 0 ], [ 5, 0 ], [ 6, 0 ]
	]);

	var c = new Float64Array( [ 0.6, 0.8 ] );
	var s = new Float64Array( [ 0.8, 0.6 ] );

	base( 'right', 'bottom', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Backward: j from N-2=1 down to 0
	// j=1: c=0.8, s=0.6
	//   Row 0: temp=A(0,1)=2, A(0,1)=0.6*A(0,2)+0.8*temp=0.6*3+0.8*2=3.4
	//          A(0,2)=0.8*3-0.6*2=1.2
	//   Row 1: temp=A(1,1)=5, A(1,1)=0.6*6+0.8*5=7.6
	//          A(1,2)=0.8*6-0.6*5=1.8
	// After j=1: col0=(1,0,4,0), col1=(3.4,0,7.6,0), col2=(1.2,0,1.8,0)
	//
	// j=0: c=0.6, s=0.8
	//   Row 0: temp=A(0,0)=1, A(0,0)=0.8*A(0,2)+0.6*temp=0.8*1.2+0.6*1=1.56
	//          A(0,2)=0.6*1.2-0.8*1=−0.08
	//   Row 1: temp=A(1,0)=4, A(1,0)=0.8*1.8+0.6*4=3.84
	//          A(1,2)=0.6*1.8-0.8*4=−2.12

	var expected = new Float64Array( [
		1.56, 0, 3.4, 0, -0.08, 0,
		3.84, 0, 7.6, 0, -2.12, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-B-B 2x3' );
});

// --- Complex entries ---

test( 'left, variable pivot, forward: 2x2 with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	// A = [ (1,2) (3,4) ; (5,6) (7,8) ]
	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=0: c=0.6, s=0.8, acts on rows 0,1
	// Col 0: temp=A(1,0)=(5,6)
	//   newA(1,0) = 0.6*(5,6) - 0.8*(1,2) = (3,3.6) - (0.8,1.6) = (2.2,2.0)
	//   newA(0,0) = 0.8*(5,6) + 0.6*(1,2) = (4,4.8) + (0.6,1.2) = (4.6,6.0)
	// Col 1: temp=A(1,1)=(7,8)
	//   newA(1,1) = 0.6*(7,8) - 0.8*(3,4) = (4.2,4.8) - (2.4,3.2) = (1.8,1.6)
	//   newA(0,1) = 0.8*(7,8) + 0.6*(3,4) = (5.6,6.4) + (1.8,2.4) = (7.4,8.8)

	var expected = new Float64Array( [
		4.6, 6.0, 7.4, 8.8,
		2.2, 2.0, 1.8, 1.6
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-V-F complex' );
});

test( 'right, variable pivot, forward: 2x2 with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	// A = [ (1,2) (3,4) ; (5,6) (7,8) ]
	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'right', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=0: c=0.6, s=0.8, rotates cols 0 and 1
	// Row 0: temp=A(0,1)=(3,4)
	//   newA(0,1) = 0.6*(3,4) - 0.8*(1,2) = (1.8,2.4) - (0.8,1.6) = (1.0,0.8)
	//   newA(0,0) = 0.8*(3,4) + 0.6*(1,2) = (2.4,3.2) + (0.6,1.2) = (3.0,4.4)
	// Row 1: temp=A(1,1)=(7,8)
	//   newA(1,1) = 0.6*(7,8) - 0.8*(5,6) = (4.2,4.8) - (4,4.8) = (0.2,0)
	//   newA(1,0) = 0.8*(7,8) + 0.6*(5,6) = (5.6,6.4) + (3,3.6) = (8.6,10.0)

	var expected = new Float64Array( [
		3.0, 4.4, 1.0, 0.8,
		8.6, 10.0, 0.2, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-V-F complex' );
});

// --- Stride and offset tests ---

test( 'works with non-unit stride for c and s', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 0, 0 ],
		[ 0, 0 ], [ 1, 0 ]
	]);

	// c and s stored at stride 2
	var c = new Float64Array( [ 0.6, 999, 0.8 ] );
	var s = new Float64Array( [ 0.8, 999, 0.6 ] );

	base( 'left', 'variable', 'forward', M, N, c, 2, 0, s, 2, 0, A, 1, LDA, 0 );

	// Should use c[0]=0.6, s[0]=0.8 (stride 2, offset 0 => index 0)
	// Same as the 2x2 45-deg test but with c=0.6, s=0.8
	// Col 0: temp=A(1,0)=(0,0), A(1,0)=0.6*0-0.8*1=-0.8, A(0,0)=0.8*0+0.6*1=0.6
	// Col 1: temp=A(1,1)=(1,0), A(1,1)=0.6*1-0.8*0=0.6, A(0,1)=0.8*1+0.6*0=0.8

	var expected = new Float64Array( [
		0.6, 0, 0.8, 0,
		-0.8, 0, 0.6, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'stride c,s' );
});

test( 'works with offset for c, s, and A', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	// Prepend 2 complex elements of junk before the matrix data
	var junk = 2; // in complex elements
	var A = new Complex128Array( junk + LDA * N );
	var Av = reinterpret( A, 0 );
	Av[ 0 ] = 999; Av[ 1 ] = 999; Av[ 2 ] = 999; Av[ 3 ] = 999;
	// Fill matrix at offset 2 complex elements (= 4 doubles):
	// col 0: (1,0),(0,0); col 1: (0,0),(1,0)
	Av[ 4 ] = 1; Av[ 5 ] = 0;  // A(0,0)
	Av[ 6 ] = 0; Av[ 7 ] = 0;  // A(1,0)
	Av[ 8 ] = 0; Av[ 9 ] = 0;  // A(0,1)
	Av[ 10 ] = 1; Av[ 11 ] = 0; // A(1,1)

	var c = new Float64Array( [ 999, 0.6 ] );
	var s = new Float64Array( [ 999, 0.8 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 1, s, 1, 1, A, 1, LDA, junk );

	// Extract from offset (using Float64 view starting at junk*2 doubles)
	Av = reinterpret( A, 0 );
	var result = extractAll( new Float64Array( Av.buffer, Av.byteOffset + junk * 2 * 8 ), M, N, LDA );
	var expected = new Float64Array( [
		0.6, 0, 0.8, 0,
		-0.8, 0, 0.6, 0
	]);
	assertClose( result, expected, 'offset c,s,A' );
});

// --- Skip optimization: c=1, s=0 ---

test( 'skips rotation when c=1 and s=0', function t() {
	var M = 3;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 1 ], [ 2, 2 ],
		[ 3, 3 ], [ 4, 4 ],
		[ 5, 5 ], [ 6, 6 ]
	]);
	var original = new Float64Array( reinterpret( A, 0 ) );

	// Both rotations are identity
	var c = new Float64Array( [ 1, 1 ] );
	var s = new Float64Array( [ 0, 0 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip c=1,s=0' );
});

// --- 1x1 matrix (edge case) ---

test( 'handles 1x1 matrix (no rotations to apply)', function t() {
	var A = new Complex128Array( [ 3, 4 ] ); // (3+4i)
	var c = new Float64Array( 0 );
	var s = new Float64Array( 0 );
	var expected = new Float64Array( [ 3, 4 ] );
	base( 'left', 'variable', 'forward', 1, 1, c, 1, 0, s, 1, 0, A, 1, 1, 0 );
	assertClose( reinterpret( A, 0 ), expected, '1x1 L-V-F' );

	A = new Complex128Array( [ 3, 4 ] );
	base( 'right', 'variable', 'forward', 1, 1, c, 1, 0, s, 1, 0, A, 1, 1, 0 );
	assertClose( reinterpret( A, 0 ), expected, '1x1 R-V-F' );
});

// --- Test that bottom pivot works with complex entries ---

test( 'left, bottom pivot, forward with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'left', 'bottom', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=0: c=0.6, s=0.8, rotates row 0 against bottom row (M-1=1)
	// Col 0: temp=A(0,0)=(1,2)
	//   A(0,0)=0.8*A(1,0)+0.6*temp = 0.8*(5,6)+0.6*(1,2) = (4,4.8)+(0.6,1.2) = (4.6,6.0)
	//   A(1,0)=0.6*A(1,0)-0.8*temp = 0.6*(5,6)-0.8*(1,2) = (3,3.6)-(0.8,1.6) = (2.2,2.0)
	// Col 1: temp=A(0,1)=(3,4)
	//   A(0,1)=0.8*(7,8)+0.6*(3,4) = (5.6,6.4)+(1.8,2.4) = (7.4,8.8)
	//   A(1,1)=0.6*(7,8)-0.8*(3,4) = (4.2,4.8)-(2.4,3.2) = (1.8,1.6)

	var expected = new Float64Array( [
		4.6, 6.0, 7.4, 8.8,
		2.2, 2.0, 1.8, 1.6
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-B-F complex' );
});

test( 'right, bottom pivot, backward with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'right', 'bottom', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=0 (backward from N-2=0 to 0): c=0.6, s=0.8, rotates col 0 against last col (N-1=1)
	// Row 0: temp=A(0,0)=(1,2)
	//   A(0,0)=0.8*A(0,1)+0.6*temp = 0.8*(3,4)+0.6*(1,2) = (2.4,3.2)+(0.6,1.2) = (3.0,4.4)
	//   A(0,1)=0.6*(3,4)-0.8*(1,2) = (1.8,2.4)-(0.8,1.6) = (1.0,0.8)
	// Row 1: temp=A(1,0)=(5,6)
	//   A(1,0)=0.8*(7,8)+0.6*(5,6) = (5.6,6.4)+(3,3.6) = (8.6,10.0)
	//   A(1,1)=0.6*(7,8)-0.8*(5,6) = (4.2,4.8)-(4,4.8) = (0.2,0)

	var expected = new Float64Array( [
		3.0, 4.4, 1.0, 0.8,
		8.6, 10.0, 0.2, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-B-B complex' );
});

// --- Test top pivot with complex entries ---

test( 'left, top pivot, forward with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'left', 'top', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=1 (0-based): c=c[0]=0.6, s=s[0]=0.8, rotates row 1 against row 0
	// Col 0: temp=A(1,0)=(5,6)
	//   A(1,0)=0.6*(5,6)-0.8*(1,2) = (3,3.6)-(0.8,1.6) = (2.2,2.0)
	//   A(0,0)=0.8*(5,6)+0.6*(1,2) = (4,4.8)+(0.6,1.2) = (4.6,6.0)
	// Col 1: temp=A(1,1)=(7,8)
	//   A(1,1)=0.6*(7,8)-0.8*(3,4) = (4.2,4.8)-(2.4,3.2) = (1.8,1.6)
	//   A(0,1)=0.8*(7,8)+0.6*(3,4) = (5.6,6.4)+(1.8,2.4) = (7.4,8.8)

	var expected = new Float64Array( [
		4.6, 6.0, 7.4, 8.8,
		2.2, 2.0, 1.8, 1.6
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-T-F complex' );
});

test( 'right, top pivot, backward with complex entries', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 2 ], [ 3, 4 ],
		[ 5, 6 ], [ 7, 8 ]
	]);

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'right', 'top', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// j=1 (backward from N-1=1 down to 1): c=c[0]=0.6, s=s[0]=0.8
	//   Rotates col 1 against col 0
	// Row 0: temp=A(0,1)=(3,4)
	//   A(0,1)=0.6*(3,4)-0.8*(1,2) = (1.8,2.4)-(0.8,1.6) = (1.0,0.8)
	//   A(0,0)=0.8*(3,4)+0.6*(1,2) = (2.4,3.2)+(0.6,1.2) = (3.0,4.4)
	// Row 1: temp=A(1,1)=(7,8)
	//   A(1,1)=0.6*(7,8)-0.8*(5,6) = (4.2,4.8)-(4,4.8) = (0.2,0)
	//   A(1,0)=0.8*(7,8)+0.6*(5,6) = (5.6,6.4)+(3,3.6) = (8.6,10.0)

	var expected = new Float64Array( [
		3.0, 4.4, 1.0, 0.8,
		8.6, 10.0, 0.2, 0
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'R-T-B complex' );
});

// --- Verify against Fortran: 3x3 complex, multiple rotations ---

test( 'left, variable pivot, forward: 3x3 complex, two rotations', function t() {
	var M = 3;
	var N = 3;
	var LDA = M;

	var A = buildMatrix( M, N, [
		[ 1, 0 ], [ 0, 1 ], [ 2, 0 ],
		[ 0, -1 ], [ 3, 0 ], [ 0, 2 ],
		[ -1, 0 ], [ 0, -2 ], [ 4, 0 ]
	]);

	var c = new Float64Array( [ 0.8, 0.5 ] );
	var s = new Float64Array( [ 0.6, Math.sqrt( 0.75 ) ] );
	var sq75 = Math.sqrt( 0.75 );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );

	// Rotation j=0: c=0.8, s=0.6 on rows 0,1
	// Col 0: temp=A(1,0)=(0,-1)
	//   newA(1,0) = 0.8*(0,-1) - 0.6*(1,0) = (0,-0.8) - (0.6,0) = (-0.6,-0.8)
	//   newA(0,0) = 0.6*(0,-1) + 0.8*(1,0) = (0,-0.6) + (0.8,0) = (0.8,-0.6)
	// Col 1: temp=A(1,1)=(3,0)
	//   newA(1,1) = 0.8*(3,0) - 0.6*(0,1) = (2.4,0) - (0,0.6) = (2.4,-0.6)
	//   newA(0,1) = 0.6*(3,0) + 0.8*(0,1) = (1.8,0) + (0,0.8) = (1.8,0.8)
	// Col 2: temp=A(1,2)=(0,2)
	//   newA(1,2) = 0.8*(0,2) - 0.6*(2,0) = (0,1.6) - (1.2,0) = (-1.2,1.6)
	//   newA(0,2) = 0.6*(0,2) + 0.8*(2,0) = (0,1.2) + (1.6,0) = (1.6,1.2)
	//
	// After j=0:
	//   Row 0: (0.8,-0.6), (1.8,0.8), (1.6,1.2)
	//   Row 1: (-0.6,-0.8), (2.4,-0.6), (-1.2,1.6)
	//   Row 2: (-1,0), (0,-2), (4,0)
	//
	// Rotation j=1: c=0.5, s=sqrt(0.75) on rows 1,2
	// Col 0: temp=A(2,0)=(-1,0)
	//   newA(2,0) = 0.5*(-1,0) - sq75*(-0.6,-0.8) = (-0.5,0) - (-0.6*sq75,-0.8*sq75)
	//            = (-0.5+0.6*sq75, 0.8*sq75)
	//   newA(1,0) = sq75*(-1,0) + 0.5*(-0.6,-0.8) = (-sq75,0) + (-0.3,-0.4)
	//            = (-sq75-0.3, -0.4)
	var r20re = -0.5 + 0.6 * sq75;
	var r20im = 0.8 * sq75;
	var r10re = -sq75 - 0.3;
	var r10im = -0.4;

	// Col 1: temp=A(2,1)=(0,-2)
	//   newA(2,1) = 0.5*(0,-2) - sq75*(2.4,-0.6) = (0,-1) - (2.4*sq75,-0.6*sq75)
	//            = (-2.4*sq75, -1+0.6*sq75)
	//   newA(1,1) = sq75*(0,-2) + 0.5*(2.4,-0.6) = (0,-2*sq75) + (1.2,-0.3)
	//            = (1.2, -2*sq75-0.3)
	var r21re = -2.4 * sq75;
	var r21im = -1 + 0.6 * sq75;
	var r11re = 1.2;
	var r11im = -2 * sq75 - 0.3;

	// Col 2: temp=A(2,2)=(4,0)
	//   newA(2,2) = 0.5*(4,0) - sq75*(-1.2,1.6) = (2,0) - (-1.2*sq75,1.6*sq75)
	//            = (2+1.2*sq75, -1.6*sq75)
	//   newA(1,2) = sq75*(4,0) + 0.5*(-1.2,1.6) = (4*sq75,0) + (-0.6,0.8)
	//            = (4*sq75-0.6, 0.8)
	var r22re = 2 + 1.2 * sq75;
	var r22im = -1.6 * sq75;
	var r12re = 4 * sq75 - 0.6;
	var r12im = 0.8;

	var expected = new Float64Array( [
		0.8, -0.6, 1.8, 0.8, 1.6, 1.2,
		r10re, r10im, r11re, r11im, r12re, r12im,
		r20re, r20im, r21re, r21im, r22re, r22im
	]);
	assertClose( extractAll( A, M, N, LDA ), expected, 'L-V-F 3x3 complex' );
});

// --- Additional skip-path tests for branch coverage ---

test( 'skips rotation when c=1, s=0 for L/V/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'left', 'variable', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip L-V-B' );
});

test( 'skips rotation when c=1, s=0 for L/T/F', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'left', 'top', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip L-T-F' );
});

test( 'skips rotation when c=1, s=0 for L/T/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'left', 'top', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip L-T-B' );
});

test( 'skips rotation when c=1, s=0 for L/B/F', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'left', 'bottom', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip L-B-F' );
});

test( 'skips rotation when c=1, s=0 for L/B/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'left', 'bottom', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip L-B-B' );
});

test( 'skips rotation when c=1, s=0 for R/V/F', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-V-F' );
});

test( 'skips rotation when c=1, s=0 for R/V/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'variable', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-V-B' );
});

test( 'skips rotation when c=1, s=0 for R/T/F', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'top', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-T-F' );
});

test( 'skips rotation when c=1, s=0 for R/T/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'top', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-T-B' );
});

test( 'skips rotation when c=1, s=0 for R/B/F', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'bottom', 'forward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-B-F' );
});

test( 'skips rotation when c=1, s=0 for R/B/B', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;
	var A = buildMatrix( M, N, [ [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ] ] );
	var original = new Float64Array( reinterpret( A, 0 ) );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	base( 'right', 'bottom', 'backward', M, N, c, 1, 0, s, 1, 0, A, 1, LDA, 0 );
	assertClose( reinterpret( A, 0 ), original, 'skip R-B-B' );
});

// --- Lowercase parameter tests ---

test( 'accepts lowercase side, pivot, direct', function t() {
	var M = 2;
	var N = 2;
	var LDA = M;

	var A1 = buildMatrix( M, N, [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ], [ 7, 8 ] ] );
	var A2 = buildMatrix( M, N, [ [ 1, 2 ], [ 3, 4 ], [ 5, 6 ], [ 7, 8 ] ] );

	var c = new Float64Array( [ 0.6 ] );
	var s = new Float64Array( [ 0.8 ] );

	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A1, 1, LDA, 0 );
	base( 'left', 'variable', 'forward', M, N, c, 1, 0, s, 1, 0, A2, 1, LDA, 0 );

	assertClose( extractAll( A1, M, N, LDA ), extractAll( A2, M, N, LDA ), 'lowercase' );
});

// --- Returns A ---

test( 'returns A', function t() {
	var A = buildMatrix( 2, 2, [ [ 1, 0 ], [ 0, 0 ], [ 0, 0 ], [ 1, 0 ] ] );
	var c = new Float64Array( [ 1 ] );
	var s = new Float64Array( [ 0 ] );
	var result = base( 'left', 'variable', 'forward', 2, 2, c, 1, 0, s, 1, 0, A, 1, 2, 0 );
	assert.strictEqual( result, A );
});
