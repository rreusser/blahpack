/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlasq3 from './../lib/dlasq3.js';


// TESTS //

test( 'dlasq3 is a function', function t() {
	assert.strictEqual( typeof dlasq3, 'function', 'is a function' );
});

test( 'dlasq3 has expected arity', function t() {
	assert.strictEqual( dlasq3.length, 21, 'has expected arity' );
});

test( 'dlasq3: a negative strideZ gives the same results as the reversed array with stride 1', function t() {
	// The wrapper's offset for a negative stride is computed from the length
	// of `z`, `4 * n0[ 0 ]` (n0 is a length-1 array). It used `n0` itself,
	// which happens to coerce to its one element; the type check flags it.
	const z = [ 4.0, 1.0, 4.0, 1.0, 3.0, 0.5, 3.0, 0.5, 2.0, 0.3, 2.0, 0.3, 1.0, 0.0, 1.0, 0.0 ];
	const run = function run( zz, stride ) {
		const s = {
			'n0': new Int32Array( [ 4 ] ),
			'pp': new Int32Array( [ 0 ] ),
			'dmin': new Float64Array( [ 1.0 ] ),
			'sigma': new Float64Array( 1 ),
			'desig': new Float64Array( 1 ),
			'qmax': new Float64Array( [ 4.0 ] ),
			'nfail': new Int32Array( 1 ),
			'iter': new Int32Array( 1 ),
			'ndiv': new Int32Array( 1 ),
			'ttype': new Int32Array( 1 ),
			'dmin1': new Float64Array( [ 1.0 ] ),
			'dmin2': new Float64Array( [ 2.0 ] ),
			'dn': new Float64Array( [ 1.0 ] ),
			'dn1': new Float64Array( [ 2.0 ] ),
			'dn2': new Float64Array( [ 3.0 ] ),
			'g': new Float64Array( 1 ),
			'tau': new Float64Array( 1 )
		};
		dlasq3( 1, s.n0, zz, stride, s.pp, s.dmin, s.sigma, s.desig, s.qmax, s.nfail, s.iter, s.ndiv, true, s.ttype, s.dmin1, s.dmin2, s.dn, s.dn1, s.dn2, s.g, s.tau ); // eslint-disable-line max-len
		return s;
	};
	const zf = new Float64Array( z );
	const zr = new Float64Array( z.slice().reverse() );
	const f = run( zf, 1 );
	const r = run( zr, -1 );
	Object.keys( f ).forEach( function each( k ) {
		assert.deepStrictEqual( Array.from( r[ k ] ), Array.from( f[ k ] ), k );
	});
	assert.deepStrictEqual( Array.from( zr ).reverse(), Array.from( zf ), 'z' );
	assert.ok( Number.isFinite( f.dmin[ 0 ] ), 'dmin is finite' );
});
