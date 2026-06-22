/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from './../../dlamch/lib/base.js';
import dstebz from './../lib/ndarray.js';

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

var TOL = 1e-10;
var ABSTOL = 2.0 * dlamch( 'safe-minimum' );


// FUNCTIONS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

function arraysClose( got, expected, tol ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		if ( !close( got[ i ], expected[ i ], tol ) ) {
			return false;
		}
	}
	return true;
}

function int32sEqual( got, expected ) {
	var i;
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
	var ws = makeWorkspace( N );
	var M = new Int32Array( 1 );
	var nsplit = new Int32Array( 1 );
	var dArr = new Float64Array( d );
	var eArr = new Float64Array( e.length === 0 ? 1 : e );
	var info = dstebz(
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


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dstebz, 'function' );
});

test( 'dstebz.ndarray: N=0 quick return', function t() {
	var r = call( 'all', 'block', 0, 0.0, 0.0, 1, 0, ABSTOL, [], [] );
	assert.strictEqual( r.info, fxN0.info );
	assert.strictEqual( r.M, fxN0.m );
});

test( 'dstebz.ndarray: N=1 all eigenvalues', function t() {
	var r = call( 'all', 'block', 1, 0.0, 0.0, 1, 1, ABSTOL, [ 5.0 ], [ 0.0 ] );
	assert.strictEqual( r.info, fxN1All.info );
	assert.strictEqual( r.M, fxN1All.m );
	assert.strictEqual( r.nsplit, fxN1All.nsplit );
	assert.ok( close( r.w[ 0 ], fxN1All.w[ 0 ], TOL ) );
	assert.strictEqual( r.iblock[ 0 ], fxN1All.iblock[ 0 ] );
	assert.strictEqual( r.isplit[ 0 ], fxN1All.isplit[ 0 ] );
});

test( 'dstebz.ndarray: N=1 RANGE=value, eigenvalue outside interval', function t() {
	var r = call( 'value', 'block', 1, 0.0, 3.0, 1, 1, ABSTOL, [ 5.0 ], [ 0.0 ] );
	assert.strictEqual( r.info, fxN1VOutside.info );
	assert.strictEqual( r.M, fxN1VOutside.m );
});

test( 'dstebz.ndarray: 5x5 RANGE=all ORDER=block', function t() {
	var r = call( 'all', 'block', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5AllB.info );
	assert.strictEqual( r.M, fxN5AllB.m );
	assert.strictEqual( r.nsplit, fxN5AllB.nsplit );
	assert.ok( arraysClose( r.w, fxN5AllB.w, TOL ) );
	assert.ok( int32sEqual( r.iblock, fxN5AllB.iblock ) );
	assert.strictEqual( r.isplit[ 0 ], fxN5AllB.isplit[ 0 ] );
});

test( 'dstebz.ndarray: 5x5 RANGE=all ORDER=entire', function t() {
	var r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5AllE.info );
	assert.strictEqual( r.M, fxN5AllE.m );
	assert.ok( arraysClose( r.w, fxN5AllE.w, TOL ) );
});

test( 'dstebz.ndarray: 5x5 RANGE=value (0, 3]', function t() {
	var r = call( 'value', 'entire', 5, 0.0, 3.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeV.info );
	assert.strictEqual( r.M, fxN5RangeV.m );
	assert.ok( close( r.w[ 0 ], fxN5RangeV.w[ 0 ], TOL ) );
});

test( 'dstebz.ndarray: 5x5 RANGE=index il=2 iu=4', function t() {
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeI.info );
	assert.strictEqual( r.M, fxN5RangeI.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxN5RangeI.m ), fxN5RangeI.w, TOL ) );
});

test( 'dstebz.ndarray: 5x5 RANGE=index il=1 iu=N', function t() {
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5RangeIAll.info );
	assert.strictEqual( r.M, fxN5RangeIAll.m );
	assert.ok( arraysClose( r.w, fxN5RangeIAll.w, TOL ) );
});

test( 'dstebz.ndarray: 5x5 split matrix ORDER=block', function t() {
	var r = call( 'all', 'block', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5SplitB.info );
	assert.strictEqual( r.M, fxN5SplitB.m );
	assert.strictEqual( r.nsplit, fxN5SplitB.nsplit );
	assert.ok( arraysClose( r.w, fxN5SplitB.w, TOL ) );
	assert.ok( int32sEqual( r.iblock, fxN5SplitB.iblock ) );
	assert.ok( int32sEqual( r.isplit.subarray( 0, fxN5SplitB.nsplit ), fxN5SplitB.isplit ) );
});

test( 'dstebz.ndarray: 5x5 split matrix ORDER=entire', function t() {
	var r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxN5SplitE.info );
	assert.strictEqual( r.M, fxN5SplitE.m );
	assert.ok( arraysClose( r.w, fxN5SplitE.w, TOL ) );
});

test( 'dstebz.ndarray: diagonal matrix (all E=0)', function t() {
	var r = call( 'all', 'entire', 4, 0.0, 0.0, 1, 4, ABSTOL,
		[ 5.0, 1.0, 3.0, 2.0 ], [ 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, fxDiagonal.info );
	assert.strictEqual( r.M, fxDiagonal.m );
	assert.strictEqual( r.nsplit, fxDiagonal.nsplit );
	assert.ok( arraysClose( r.w, fxDiagonal.w, TOL ) );
});

test( 'dstebz.ndarray: split RANGE=value', function t() {
	var r = call( 'value', 'block', 5, -2.0, 3.5, 1, 5, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxSplitV.info );
	assert.strictEqual( r.M, fxSplitV.m );
	assert.strictEqual( r.nsplit, fxSplitV.nsplit );
});

test( 'dstebz.ndarray: split RANGE=index', function t() {
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, ABSTOL,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxSplitI.info );
	assert.strictEqual( r.M, fxSplitI.m );
});

test( 'dstebz.ndarray: Wilkinson 10 RANGE=all', function t() {
	var r = call( 'all', 'entire', 10, 0.0, 0.0, 1, 10, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinson.info );
	assert.strictEqual( r.M, fxWilkinson.m );
	assert.ok( arraysClose( r.w, fxWilkinson.w, TOL ) );
});

test( 'dstebz.ndarray: Wilkinson 10 RANGE=index il=3 iu=7', function t() {
	var r = call( 'index', 'entire', 10, 0.0, 0.0, 3, 7, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinsonI.info );
	assert.strictEqual( r.M, fxWilkinsonI.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxWilkinsonI.m ), fxWilkinsonI.w, TOL ) );
});

test( 'dstebz.ndarray: Wilkinson 10 RANGE=value (1, 4]', function t() {
	var r = call( 'value', 'entire', 10, 1.0, 4.0, 1, 10, ABSTOL,
		[ 4.0, 3.0, 2.0, 1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0 ],
		[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, fxWilkinsonV.info );
	assert.strictEqual( r.M, fxWilkinsonV.m );
	assert.ok( arraysClose( r.w.subarray( 0, fxWilkinsonV.m ), fxWilkinsonV.w, TOL ) );
});

test( 'dstebz.ndarray: simple 3x3 d=[2,2,2] e=[1,1] => eigenvalues 2±sqrt(2), 2', function t() {
	var r = call( 'all', 'entire', 3, 0.0, 0.0, 1, 3, ABSTOL,
		[ 2.0, 2.0, 2.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
	var expected = [ 2.0 - Math.sqrt( 2.0 ), 2.0, 2.0 + Math.sqrt( 2.0 ) ];
	assert.ok( arraysClose( r.w, expected, 1e-8 ) );
});

test( 'dstebz.ndarray: 2x2 d=[1,1] e=[1] => eigenvalues 0, 2', function t() {
	var r = call( 'all', 'entire', 2, 0.0, 0.0, 1, 2, ABSTOL,
		[ 1.0, 1.0 ], [ 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 2 );
	assert.ok( close( r.w[ 0 ], 0.0, 1e-8 ) );
	assert.ok( close( r.w[ 1 ], 2.0, 1e-8 ) );
});

test( 'dstebz.ndarray: positive abstol', function t() {
	// Exercise the abstol > 0 branch.
	var r = call( 'all', 'entire', 3, 0.0, 0.0, 1, 3, 1.0e-6,
		[ 2.0, 2.0, 2.0 ], [ 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.ndarray: clustered index range hits idiscl/idiscu trim path', function t() {
	// Many tied/near-equal eigenvalues with il=2 iu=2 forces trimming
	// of duplicates from outer eigenvalues.
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 2, ABSTOL,
		[ 1.0, 1.0, 1.0, 1.0, 1.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 1 );
});

test( 'dstebz.ndarray: index range with abstol=0 (default tolerance)', function t() {
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, 0.0,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.ndarray: all range with abstol=0', function t() {
	var r = call( 'all', 'entire', 5, 0.0, 0.0, 1, 5, 0.0,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 5 );
});

test( 'dstebz.ndarray: tied eigenvalues with index middle slice', function t() {
	// All identical eigenvalues -> heavy trimming on both sides.
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 3, 3, ABSTOL,
		[ 2.0, 2.0, 2.0, 2.0, 2.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 1 );
});

test( 'dstebz.ndarray: tied diagonal with il=4 iu=5', function t() {
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 4, 5, ABSTOL,
		[ 2.0, 2.0, 2.0, 2.0, 2.0 ], [ 0.0, 0.0, 0.0, 0.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 2 );
});

test( 'dstebz.ndarray: 5x5 RANGE=index il=2 iu=4 with positive abstol', function t() {
	// Exercise abstol > 0 path within irange=3.
	var r = call( 'index', 'entire', 5, 0.0, 0.0, 2, 4, 1.0e-6,
		[ 2.0, -1.0, 3.0, 0.5, 4.0 ], [ 1.0, 1.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 3 );
});

test( 'dstebz.ndarray: split RANGE=value with block below wl', function t() {
	// e=0 splits into [d1, d2, d3] block sizes 1,1,3.
	// wl=2.5 wu=10 ensures some blocks have gu < wl => continue path.
	var r = call( 'value', 'entire', 5, 2.5, 10.0, 1, 5, ABSTOL,
		[ 1.0, 0.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	// Expect at most a few eigenvalues in interval (2.5, 10].
	assert.ok( r.M >= 0 );
});

test( 'dstebz.ndarray: split RANGE=value where gl >= gu after intersection', function t() {
	// Tight interval that overlaps no block: blocks above the upper bound
	var r = call( 'value', 'entire', 5, -100.0, -50.0, 1, 5, ABSTOL,
		[ 1.0, 0.0, 3.0, 0.5, 4.0 ], [ 0.0, 0.0, 1.0, 1.0 ] );
	assert.strictEqual( r.info, 0 );
	assert.strictEqual( r.M, 0 );
});

test( 'dstebz.ndarray: throws TypeError for invalid range', function t() {
	var ws = makeWorkspace( 1 );
	var M = new Int32Array( 1 );
	var nsplit = new Int32Array( 1 );
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

test( 'dstebz.ndarray: throws TypeError for invalid order', function t() {
	var ws = makeWorkspace( 1 );
	var M = new Int32Array( 1 );
	var nsplit = new Int32Array( 1 );
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

test( 'dstebz.ndarray: throws RangeError for negative N', function t() {
	var ws = makeWorkspace( 1 );
	var M = new Int32Array( 1 );
	var nsplit = new Int32Array( 1 );
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
