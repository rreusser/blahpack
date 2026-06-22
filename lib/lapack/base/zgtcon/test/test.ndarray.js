/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zgttrf from './../../zgttrf/lib/ndarray.js';
import zgtcon from './../lib/ndarray.js';


// FUNCTIONS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// LAPACK's "complex absolute value": |re| + |im|
function cabs1( re, im ) {
	return Math.abs( re ) + Math.abs( im );
}

// Build a packed real Float64Array of length 2*len from re/im arrays.
function packComplex( re, im ) {
	var out;
	var i;
	out = new Float64Array( 2 * re.length );
	for ( i = 0; i < re.length; i++ ) {
		out[ ( 2 * i ) ] = re[ i ];
		out[ ( 2 * i ) + 1 ] = im[ i ];
	}
	return out;
}

// One-norm of complex tridiagonal: max column sum of cabs1
function norm1Tri( DLre, DLim, Dre, Dim, DUre, DUim, N ) {
	var col;
	var max;
	var i;
	max = 0.0;
	for ( i = 0; i < N; i++ ) {
		col = cabs1( Dre[ i ], Dim[ i ] );
		if ( i > 0 ) {
			col += cabs1( DUre[ i - 1 ], DUim[ i - 1 ] );
		}
		if ( i < N - 1 ) {
			col += cabs1( DLre[ i ], DLim[ i ] );
		}
		if ( col > max ) {
			max = col;
		}
	}
	return max;
}

function normInfTri( DLre, DLim, Dre, Dim, DUre, DUim, N ) {
	var row;
	var max;
	var i;
	max = 0.0;
	for ( i = 0; i < N; i++ ) {
		row = cabs1( Dre[ i ], Dim[ i ] );
		if ( i > 0 ) {
			row += cabs1( DLre[ i - 1 ], DLim[ i - 1 ] );
		}
		if ( i < N - 1 ) {
			row += cabs1( DUre[ i ], DUim[ i ] );
		}
		if ( row > max ) {
			max = row;
		}
	}
	return max;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgtcon, 'function', 'main export is a function' );
});

test( 'zgtcon: throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zgtcon( 'invalid', 3, new Complex128Array( 2 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 6 ), 1, 0 );
	}, TypeError );
});

test( 'zgtcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgtcon( 'one-norm', -1, new Complex128Array( 2 ), 1, 0, new Complex128Array( 3 ), 1, 0, new Complex128Array( 2 ), 1, 0, new Complex128Array( 1 ), 1, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Complex128Array( 6 ), 1, 0 );
	}, RangeError );
});

test( 'zgtcon: N=0 quick return (rcond=1)', function t() {
	var rcond;
	var info;
	rcond = new Float64Array( 1 );
	info = zgtcon( 'one-norm', 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0, 0.0, rcond, new Complex128Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'zgtcon: anorm=0 returns rcond=0', function t() {
	var rcond;
	var info;
	var IPIV;
	var work;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 3;
	DL = new Complex128Array( packComplex( [ 1.0, 1.0 ], [ 0.0, 0.0 ] ) );
	D = new Complex128Array( packComplex( [ 4.0, 4.0, 4.0 ], [ 1.0, 1.0, 1.0 ] ) );
	DU = new Complex128Array( packComplex( [ 1.0, 1.0 ], [ 0.0, 0.0 ] ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 0.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zgtcon: zero diagonal element returns rcond=0', function t() {
	var rcond;
	var info;
	var IPIV;
	var work;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 3;
	DL = new Complex128Array( packComplex( [ 0.5, 0.5 ], [ 0.0, 0.0 ] ) );
	D = new Complex128Array( packComplex( [ 4.0, 0.0, 4.0 ], [ 1.0, 0.0, 1.0 ] ) );
	DU = new Complex128Array( packComplex( [ 1.0, 1.0 ], [ 0.0, 0.0 ] ) );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( N );
	rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 6.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'zgtcon: tridiag_1norm fixture (5x5 complex, one-norm)', function t() {
	var anorm;
	var rcond;
	var info;
	var DLre;
	var DLim;
	var DUre;
	var DUim;
	var IPIV;
	var work;
	var Dre;
	var Dim;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 5;
	DLre = [ -1.0, -1.0, -1.0, -1.0 ];
	DLim = [ 0.0, 0.0, 0.0, 0.0 ];
	Dre = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	Dim = [ 1.0, 1.0, 1.0, 1.0, 1.0 ];
	DUre = [ -1.0, -1.0, -1.0, -1.0 ];
	DUim = [ 0.0, 0.0, 0.0, 0.0 ];
	DL = new Complex128Array( packComplex( DLre, DLim ) );
	D = new Complex128Array( packComplex( Dre, Dim ) );
	DU = new Complex128Array( packComplex( DUre, DUim ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	anorm = norm1Tri( DLre, DLim, Dre, Dim, DUre, DUim, N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.3221335728920476, 1e-9 ) );
});

test( 'zgtcon: tridiag_Inorm fixture (5x5 complex, inf-norm)', function t() {
	var anorm;
	var rcond;
	var info;
	var DLre;
	var DLim;
	var DUre;
	var DUim;
	var IPIV;
	var work;
	var Dre;
	var Dim;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 5;
	DLre = [ -1.0, -1.0, -1.0, -1.0 ];
	DLim = [ 0.0, 0.0, 0.0, 0.0 ];
	Dre = [ 4.0, 4.0, 4.0, 4.0, 4.0 ];
	Dim = [ 1.0, 1.0, 1.0, 1.0, 1.0 ];
	DUre = [ -1.0, -1.0, -1.0, -1.0 ];
	DUim = [ 0.0, 0.0, 0.0, 0.0 ];
	DL = new Complex128Array( packComplex( DLre, DLim ) );
	D = new Complex128Array( packComplex( Dre, Dim ) );
	DU = new Complex128Array( packComplex( DUre, DUim ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	anorm = normInfTri( DLre, DLim, Dre, Dim, DUre, DUim, N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'inf-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.3221335728920476, 1e-9 ) );
});

test( 'zgtcon: N=1 fixture', function t() {
	var rcond;
	var info;
	var IPIV;
	var work;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 1;
	DL = new Complex128Array( 0 );
	D = new Complex128Array( packComplex( [ 3.0 ], [ 1.0 ] ) );
	DU = new Complex128Array( 0 );
	DU2 = new Complex128Array( 0 );
	IPIV = new Int32Array( N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 4.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.7905694150420948, 1e-9 ) );
});

test( 'zgtcon: complex_4x4_1norm fixture', function t() {
	var rcond;
	var info;
	var DLre;
	var DLim;
	var DUre;
	var DUim;
	var IPIV;
	var work;
	var Dre;
	var Dim;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 4;
	DLre = [ 2.0, 1.0, 0.5 ];
	DLim = [ 1.0, 3.0, 0.5 ];
	Dre = [ 5.0, 6.0, 7.0, 4.0 ];
	Dim = [ 2.0, 1.0, 3.0, 2.0 ];
	DUre = [ 1.0, 2.0, 1.5 ];
	DUim = [ 0.5, 1.0, 0.5 ];
	DL = new Complex128Array( packComplex( DLre, DLim ) );
	D = new Complex128Array( packComplex( Dre, Dim ) );
	DU = new Complex128Array( packComplex( DUre, DUim ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, 14.0, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.23370487167082180, 1e-9 ) );
});

test( 'zgtcon: 7x7 inf-norm exercises full reverse-comm', function t() {
	var anorm;
	var rcond;
	var info;
	var DLre;
	var DLim;
	var DUre;
	var DUim;
	var IPIV;
	var work;
	var Dre;
	var Dim;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 7;
	DLre = [ -1.0, -1.0, -1.0, -1.0, -1.0, -1.0 ];
	DLim = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
	Dre = [ 3.0, 3.0, 3.0, 3.0, 3.0, 3.0, 3.0 ];
	Dim = [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5 ];
	DUre = [ -1.0, -1.0, -1.0, -1.0, -1.0, -1.0 ];
	DUim = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
	DL = new Complex128Array( packComplex( DLre, DLim ) );
	D = new Complex128Array( packComplex( Dre, Dim ) );
	DU = new Complex128Array( packComplex( DUre, DUim ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	anorm = normInfTri( DLre, DLim, Dre, Dim, DUre, DUim, N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'inf-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'zgtcon: 6x6 one-norm exercises kase=1 path', function t() {
	var anorm;
	var rcond;
	var info;
	var DLre;
	var DLim;
	var DUre;
	var DUim;
	var IPIV;
	var work;
	var Dre;
	var Dim;
	var DU2;
	var DL;
	var DU;
	var N;
	var D;
	N = 6;
	DLre = [ 0.5, -0.5, 0.5, -0.5, 0.5 ];
	DLim = [ 0.25, 0.5, -0.25, 0.5, -0.25 ];
	Dre = [ 4.0, 5.0, 6.0, 5.0, 4.0, 3.0 ];
	Dim = [ 1.0, -1.0, 2.0, -2.0, 1.0, 1.0 ];
	DUre = [ -1.0, 1.0, -0.5, 0.75, -0.5 ];
	DUim = [ 0.0, 0.0, 0.5, 0.0, -0.5 ];
	DL = new Complex128Array( packComplex( DLre, DLim ) );
	D = new Complex128Array( packComplex( Dre, Dim ) );
	DU = new Complex128Array( packComplex( DUre, DUim ) );
	DU2 = new Complex128Array( N - 2 );
	IPIV = new Int32Array( N );
	anorm = norm1Tri( DLre, DLim, Dre, Dim, DUre, DUim, N );
	zgttrf( N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	rcond = new Float64Array( 1 );
	work = new Complex128Array( 2 * N );
	info = zgtcon( 'one-norm', N, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});
