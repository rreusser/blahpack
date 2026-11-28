/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from './../../dlamch/lib/base.js';
import dsterf from './../../dsterf/lib/base.js';
import dstebz from './../lib/strided.js';

import fxN0 from './fixtures/n0.json' with { type: 'json' };
import fxN1All from './fixtures/n1_all.json' with { type: 'json' };
import fxN1VOutside from './fixtures/n1_v_outside.json' with { type: 'json' };
import fxN5AllB from './fixtures/n5_all_orderb.json' with { type: 'json' };
import fxN5AllE from './fixtures/n5_all_ordere.json' with { type: 'json' };
import fxN5RangeV from './fixtures/n5_rangev.json' with { type: 'json' };
import fxN5RangeI from './fixtures/n5_rangei.json' with { type: 'json' };
import fxN5RangeIAll from './fixtures/n5_rangei_all.json' with { type: 'json' };
import fxN5SplitB from './fixtures/n5_split_orderb.json' with { type: 'json' };
import fxN5SplitE from './fixtures/n5_split_ordere.json' with { type: 'json' };
import fxDiagonal from './fixtures/diagonal.json' with { type: 'json' };
import fxSplitV from './fixtures/split_rangev.json' with { type: 'json' };
import fxSplitI from './fixtures/split_rangei.json' with { type: 'json' };
import fxWilkinson from './fixtures/wilkinson10.json' with { type: 'json' };
import fxWilkinsonI from './fixtures/wilkinson10_rangei.json' with { type: 'json' };
import fxWilkinsonV from './fixtures/wilkinson10_rangev.json' with { type: 'json' };


// VARIABLES //

const TOL = 1e-10;
const ABSTOL = 2.0 * dlamch( 'safe-minimum' );


// FUNCTIONS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

function arraysClose( got, expected, tol ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		if ( !close( got[ i ], expected[ i ], tol ) ) {
			return false;
		}
	}
	return true;
}

function int32sEqual( got, expected ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		if ( got[ i ] !== expected[ i ] ) {
			return false;
		}
	}
	return true;
}

function makeWorkspace( N ) {
	if ( N < 1 ) {
		N = 1;
	}
	return {
		w: new Float64Array( N ),
		iblock: new Int32Array( N ),
		isplit: new Int32Array( N ),
		work: new Float64Array( 4 * N ),
		iwork: new Int32Array( 3 * N )
	};
}

function call( range, order, N, vl, vu, il, iu, abstol, d, e ) {
	const ws = makeWorkspace( N );
	const M = new Int32Array( 1 );
	const nsplit = new Int32Array( 1 );
	const dArr = new Float64Array( d );
	const eArr = new Float64Array( e.length === 0 ? 1 : e );
	const info = dstebz(
		range, order, N, vl, vu, il, iu, abstol,
		dArr, 1, 0,
		eArr, 1, 0,
		M, nsplit, ws.w, 1, 0,
		ws.iblock, 1, 0,
		ws.isplit, 1, 0,
		ws.work, 1, 0,
		ws.iwork, 1, 0
	);
	return {
		info: info,
		M: M[ 0 ],
		nsplit: nsplit[ 0 ],
		w: ws.w,
		iblock: ws.iblock,
		isplit: ws.isplit
	};
}


/**
* Returns the eigenvalues of a symmetric tridiagonal matrix, sorted in ascending order, computed by an independent algorithm (implicit QL/QR, `dsterf`).
*
* @private
* @param {Array<number>} d - diagonal
* @param {Array<number>} e - off-diagonal
* @returns {Array<number>} sorted eigenvalues
*/
function oracle( d, e ) {
	const dd = new Float64Array( d );
	const ee = new Float64Array( Math.max( e.length, 1 ) );
	let i;
	for ( i = 0; i < e.length; i++ ) {
		ee[ i ] = e[ i ];
	}
	assert.strictEqual( dsterf( d.length, dd, 1, 0, ee, 1, 0 ), 0 );
	return Array.prototype.slice.call( dd ).sort( function cmp( a, b ) {
		return a - b;
	});
}

/**
* Asserts that the first `M` computed eigenvalues equal `expected` (as a set, compared after sorting) to tolerance.
*
* @private
* @param {Object} r - result of `call`
* @param {Array<number>} expected - expected eigenvalues (ascending)
* @param {number} tol - tolerance
*/
function assertEigenvalues( r, expected, tol ) {
	const got = Array.prototype.slice.call( r.w, 0, r.M ).sort( function cmp( a, b ) {
		return a - b;
	});
	let i;
	assert.strictEqual( r.M, expected.length, 'M' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( got[ i ] - expected[ i ] ) <= tol, 'w[' + i + ']: expected ' + expected[ i ] + ', got ' + got[ i ] );
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dstebz, 'function' );
});

test( 'dstebz.strided: N=0 quick return', function t() {
	const r = call( 'all', 'block', 0, 0.0, 0.0, 1, 0, ABSTOL, [], [] );
	assert.strictEqual( r.info, fxN0.info );
	assert.strictEqual( r.M, fxN0.m );
});

test( 'dstebz.strided: N=1 all eigenvalues', function t() {
	const r = call( 'all', 'block', 1, 0.0, 0.0, 1, 1, ABSTOL, [ 5.0 ], [ 0.0 ] );
	assert.strictEqual( r.info, fxN1All.info );
	assert.strictEqual( r.M, fxN1All.m );
	assert.strictEqual( r.nsplit, fxN1All.nsplit );
	assert.ok( close( r.w[ 0 ], fxN1All.w[ 0 ], TOL ) );
	assert.strictEqual( r.iblock[ 0 ], fxN1All.iblock[ 0 ] );
	assert.strictEqual( r.isplit[ 0 ], fxN1All.isplit[ 0 ] );
});

test( 'dstebz.strided: N=1 RANGE=value, eigenvalue outside interval', function t() {
	const r = call( 'value', 'block', 1, 0.0, 3.0, 1, 1, ABSTOL, [ 5.0 ], [ 0.0 ] );
	assert.strictEqual( r.info, fxN1VOutside.info );
	assert.strictEqual( r.M, fxN1VOutside.m );
});

test( 'dstebz.strided: 5x5 RANGE=all ORDER=block', function t() {
	const r = call( 'all', 'block', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5AllB.info );
	assert.strictEqual( r.M, fxN5AllB.m );
	assert.strictEqual( r.nsplit, fxN5AllB.nsplit );
	assert.ok( arraysClose( r.w, fxN5AllB.w, TOL ) );
	assert.ok( int32sEqual( r.iblock, fxN5AllB.iblock ) );
	assert.strictEqual( r.isplit[ 0 ], fxN5AllB.isplit[ 0 ] );
});

test( 'dstebz.strided: 5x5 RANGE=all ORDER=entire', function t() {
	const r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5AllE.info );
	assert.strictEqual( r.M, fxN5AllE.m );
	assert.ok( arraysClose( r.w, fxN5AllE.w, TOL ) );
});

test( 'dstebz.strided: 5x5 RANGE=value (0, 3]', function t() {
	const r = call( 'value', 'entire', 5, 0.0, 3.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeV.info );
	assert.strictEqual( r.M, fxN5RangeV.m );
	assert.ok( close( r.w[ 0 ], fxN5RangeV.w[ 0 ], TOL ) );
});

test( 'dstebz.strided: 5x5 RANGE=index il=2 iu=4', function t() {
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeI.info );
	assert.strictEqual( r.M, fxN5RangeI.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxN5RangeI.m ), fxN5RangeI.w, TOL ) );
});

test( 'dstebz.strided: 5x5 RANGE=index il=1 iu=N', function t() {
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeIAll.info );
	assert.strictEqual( r.M, fxN5RangeIAll.m );
	assert.ok( arraysClose( r.w, fxN5RangeIAll.w, TOL ) );
});

test( 'dstebz.strided: 5x5 split matrix ORDER=block', function t() {
	const r = call( 'all', 'block', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5SplitB.info );
	assert.strictEqual( r.M, fxN5SplitB.m );
	assert.strictEqual( r.nsplit, fxN5SplitB.nsplit );
	assert.ok( arraysClose( r.w, fxN5SplitB.w, TOL ) );
	assert.ok( int32sEqual( r.iblock, fxN5SplitB.iblock ) );
	assert.ok( int32sEqual( r.isplit.subarray( 0, fxN5SplitB.nsplit ), fxN5SplitB.isplit ) );
});

test( 'dstebz.strided: 5x5 split matrix ORDER=entire', function t() {
	const r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5SplitE.info );
	assert.strictEqual( r.M, fxN5SplitE.m );
	assert.ok( arraysClose( r.w, fxN5SplitE.w, TOL ) );
});

test( 'dstebz.strided: diagonal matrix (all E=0)', function t() {
	const r = call( 'all', 'entire', 4, 0.0, 0.0, 1, 4, ABSTOL,
		[ 5.0, 1.0, 3.0, 2.0 ], [ 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, fxDiagonal.info );
	assert.strictEqual( r.M, fxDiagonal.m );
	assert.strictEqual( r.nsplit, fxDiagonal.nsplit );
	assert.ok( arraysClose( r.w, fxDiagonal.w, TOL ) );
});

test( 'dstebz.strided: split RANGE=value', function t() {
	const r = call( 'value', 'block', 5, -2.0, 3.5, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxSplitV.info );
	assert.strictEqual( r.M, fxSplitV.m );
	assert.strictEqual( r.nsplit, fxSplitV.nsplit );
});

test( 'dstebz.strided: split RANGE=index', function t() {
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxSplitI.info );
	assert.strictEqual( r.M, fxSplitI.m );
});

test( 'dstebz.strided: Wilkinson 10 RANGE=all', function t() {
	const r = call( 'all', 'entire', 10, 0.0, 0.0, 1, 10, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinson.info );
	assert.strictEqual( r.M, fxWilkinson.m );
	assert.ok( arraysClose( r.w, fxWilkinson.w, TOL ) );
});

test( 'dstebz.strided: Wilkinson 10 RANGE=index il=3 iu=7', function t() {
	const r = call( 'index', 'entire', 10, 0.0, 0.0, 3, 7, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinsonI.info );
	assert.strictEqual( r.M, fxWilkinsonI.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxWilkinsonI.m ), fxWilkinsonI.w, TOL ) );
});

test( 'dstebz.strided: Wilkinson 10 RANGE=value (1, 4]', function t() {
	const r = call( 'value', 'entire', 10, 1.0, 4.0, 1, 10, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinsonV.info );
	assert.strictEqual( r.M, fxWilkinsonV.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxWilkinsonV.m ), fxWilkinsonV.w, TOL ) );
});

test( 'dstebz.strided: simple 3x3 d=[2,2,2] e=[1,1] => eigenvalues 2±sqrt(2), 2', function t() {
	const r = call( 'all', 'entire', 3, 0.0, 0.0, 1, 3, ABSTOL,
		[ 2.0, 2.0, 2.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
	const expected = [ 2.0 - Math.sqrt( 2.0 ), 2.0, 2.0 + Math.sqrt( 2.0 ) ];
	assert.ok( arraysClose( r.w, expected, 1e-8 ) );
});

test( 'dstebz.strided: 2x2 d=[1,1] e=[1] => eigenvalues 0, 2', function t() {
	const r = call( 'all', 'entire', 2, 0.0, 0.0, 1, 2, ABSTOL,
		[ 1.0, 1.0 ], [ 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 2 );
	assert.ok( close( r.w[ 0 ], 0.0, 1e-8 ) );
	assert.ok( close( r.w[ 1 ], 2.0, 1e-8 ) );
});

test( 'dstebz.strided: positive abstol', function t() {
	// Exercise the abstol > 0 branch.
	const r = call( 'all', 'entire', 3, 0.0, 0.0, 1, 3, 1.0e-6,
		[ 2.0, 2.0, 2.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.strided: clustered index range hits idiscl/idiscu trim path', function t() {
	// Many tied/near-equal eigenvalues with il=2 iu=2 forces trimming
	// of duplicates from outer eigenvalues.
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 2, ABSTOL,
		[ 1.0, 1.0, 1.0, 1.0, 1.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 1 );
});

test( 'dstebz.strided: index range with abstol=0 (default tolerance)', function t() {
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, 0.0,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.strided: all range with abstol=0', function t() {
	const r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, 0.0,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 5 );
});

test( 'dstebz.strided: tied eigenvalues with index middle slice', function t() {
	// All identical eigenvalues -> heavy trimming on both sides.
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 3, 3, ABSTOL,
		[ 2.0, 2.0, 2.0, 2.0, 2.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 1 );
});

test( 'dstebz.strided: tied diagonal with il=4 iu=5', function t() {
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 4, 5, ABSTOL,
		[ 2.0, 2.0, 2.0, 2.0, 2.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 2 );
});

test( 'dstebz.strided: 5x5 RANGE=index il=2 iu=4 with positive abstol', function t() {
	// Exercise abstol > 0 path within irange=3.
	const r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, 1.0e-6,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.strided: split RANGE=value with block below wl', function t() {
	// e[1]=0 splits into blocks {1,2}, {3,4,5}; with (wl,wu] = (2.5,10] the
	// Gershgorin interval of block {1,2} lies below wl and is skipped.
	const d = [ 1.0, 0.0, 3.0, 0.5, 4.0 ];
	const e = [ 0.1, 0.0, 1.0, 1.0 ];
	const r = call( 'value', 'entire', 5, 2.5, 10.0, 1, 5, ABSTOL, d, e );
	const expected = oracle( d, e ).filter( function inRange( v ) {
		return v > 2.5 && v <= 10.0;
	});
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.nsplit, 2 );
	assert.ok( expected.length > 0 );
	assertEigenvalues( r, expected, 1e-12 );
	assert.strictEqual( r.iblock[ 0 ], 2 );
});

test( 'dstebz.strided: split RANGE=value where gl >= gu after intersection', function t() {
	// Tight interval that overlaps no block: blocks above the upper bound
	const r = call( 'value', 'entire', 5, -100.0, -50.0, 1, 5, ABSTOL,
		[ 1.0, 0.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 0 );
});

test( 'dstebz.strided: throws TypeError for invalid range', function t() {
	const ws = makeWorkspace( 1 );
	const M = new Int32Array( 1 );
	const nsplit = new Int32Array( 1 );
	assert.throws( function throws() {
		dstebz(
			'invalid', 'block', 1, 0, 0, 1, 1, ABSTOL,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			M, nsplit, ws.w, 1, 0,
			ws.iblock, 1, 0,
			ws.isplit, 1, 0,
			ws.work, 1, 0,
			ws.iwork, 1, 0
		);
	}, TypeError );
});

test( 'dstebz.strided: throws TypeError for invalid order', function t() {
	const ws = makeWorkspace( 1 );
	const M = new Int32Array( 1 );
	const nsplit = new Int32Array( 1 );
	assert.throws( function throws() {
		dstebz(
			'all', 'invalid', 1, 0, 0, 1, 1, ABSTOL,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			M, nsplit, ws.w, 1, 0,
			ws.iblock, 1, 0,
			ws.isplit, 1, 0,
			ws.work, 1, 0,
			ws.iwork, 1, 0
		);
	}, TypeError );
});

test( 'dstebz.strided: throws RangeError for negative N', function t() {
	const ws = makeWorkspace( 1 );
	const M = new Int32Array( 1 );
	const nsplit = new Int32Array( 1 );
	assert.throws( function throws() {
		dstebz(
			'all', 'block', -1, 0, 0, 1, 0, ABSTOL,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			M, nsplit, ws.w, 1, 0,
			ws.iblock, 1, 0,
			ws.isplit, 1, 0,
			ws.work, 1, 0,
			ws.iwork, 1, 0
		);
	}, RangeError );
});

test( 'dstebz.strided: RANGE=value returns info=-5 when vl >= vu', function t() {
	const r = call( 'value', 'block', 3, 2.0, 2.0, 1, 3, ABSTOL, [ 1.0, 2.0, 3.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, -5 );
	assert.strictEqual( r.M, 0 );
});

test( 'dstebz.strided: RANGE=index returns info=-6 when il is out of range', function t() {
	let r = call( 'index', 'block', 3, 0.0, 0.0, 0, 2, ABSTOL, [ 1.0, 2.0, 3.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, -6 );
	r = call( 'index', 'block', 3, 0.0, 0.0, 4, 4, ABSTOL, [ 1.0, 2.0, 3.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, -6 );
});

test( 'dstebz.strided: RANGE=index returns info=-7 when iu is out of range', function t() {
	let r = call( 'index', 'block', 3, 0.0, 0.0, 2, 1, ABSTOL, [ 1.0, 2.0, 3.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, -7 );
	r = call( 'index', 'block', 3, 0.0, 0.0, 1, 4, ABSTOL, [ 1.0, 2.0, 3.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, -7 );
});

test( 'dstebz.strided: RANGE=value with a multi-element block entirely below wl', function t() {
	// Blocks {1,2} (eigenvalues 0.9, 1.1) and {3,4} (9.9, 10.1); block {1,2}
	// Lies below wl = 5 and is skipped.
	const d = [ 1.0, 1.0, 10.0, 10.0 ];
	const e = [ 0.1, 0.0, 0.1 ];
	let r;
	r = call( 'value', 'block', 4, 5.0, 20.0, 1, 4, ABSTOL, d, e );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.nsplit, 2 );
	assertEigenvalues( r, oracle( d, e ).slice( 2 ), 1e-13 );
	assert.deepStrictEqual( Array.prototype.slice.call( r.iblock, 0, 2 ), [ 2, 2 ] );
	assert.deepStrictEqual( Array.prototype.slice.call( r.isplit, 0, 2 ), [ 2, 4 ] );

	// Same, sorted over the entire matrix:
	r = call( 'value', 'entire', 4, 5.0, 20.0, 1, 4, ABSTOL, d, e );
	assert.strictEqual( r.info, 0 );
	assertEigenvalues( r, oracle( d, e ).slice( 2 ), 1e-13 );
	assert.ok( r.w[ 0 ] < r.w[ 1 ] );
});

test( 'dstebz.strided: RANGE=index with tied eigenvalues across blocks (discard paths)', function t() {
	// Identical blocks: the eigenvalues come in exactly tied pairs, so the
	// Interval (wl,wu] found for il..iu contains extra copies that must be
	// Discarded (IDISCL/IDISCU > 0).
	const d = [ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ];
	const e = [ 1.0, 0.0, 1.0, 0.0, 1.0 ];
	const ev = oracle( d, e );
	let il;
	let iu;
	let r;
	for ( il = 1; il <= 6; il++ ) {
		for ( iu = il; iu <= 6; iu++ ) {
			r = call( 'index', 'entire', 6, 0.0, 0.0, il, iu, ABSTOL, d, e );
			assert.strictEqual( r.info, 0, 'info il=' + il + ' iu=' + iu );
			assertEigenvalues( r, ev.slice( il - 1, iu ), 1e-13 );
			r = call( 'index', 'block', 6, 0.0, 0.0, il, iu, ABSTOL, d, e );
			assert.strictEqual( r.info, 0, 'info il=' + il + ' iu=' + iu );
			assertEigenvalues( r, ev.slice( il - 1, iu ), 1e-13 );
		}
	}
});

test( 'dstebz.strided: RANGE=index discards a surplus tied eigenvalue below il', function t() {
	// Three identical 3x3 blocks: every eigenvalue is triply tied, and the
	// Eigenvalues counted below il that are not <= WLU are discarded from
	// The left (IDISCL > 0 after the first trimming pass).
	const d = [ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0 ];
	const e = [ 1.0, 2.0, 0.0, 1.0, 2.0, 0.0, 1.0, 2.0 ];
	const r = call( 'index', 'entire', 9, 0.0, 0.0, 5, 7, ABSTOL, d, e );
	assert.strictEqual( r.info, 0 );
	assertEigenvalues( r, oracle( d, e ).slice( 4, 7 ), 1e-13 );
	assert.ok( r.w[ 0 ] <= r.w[ 1 ] && r.w[ 1 ] <= r.w[ 2 ] );
});

test( 'dstebz.strided: RANGE=index discards a surplus near-tied eigenvalue above iu', function t() {
	// Four nearly identical 3x3 blocks (the last perturbed by ~5e-15) with a
	// Loose abstol: eigenvalues counted above iu are discarded from the
	// Right (IDISCU > 0 after the first trimming pass).
	const p = 4.7473193703905304e-15;
	const d = [ 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, 2.0 + p, 2.0 + p, p ];
	const e = [ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0 ];
	const r = call( 'index', 'entire', 12, 0.0, 0.0, 8, 11, 1e-8, d, e );
	assert.strictEqual( r.info, 0 );
	assertEigenvalues( r, oracle( d, e ).slice( 7, 11 ), 1e-7 );
});
