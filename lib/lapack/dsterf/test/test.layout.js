/* eslint-disable no-restricted-syntax */

// Layout invariance (CONVENTIONS S13): the same problem, stored row-major, with
// padded leading dimensions, offsets and non-unit or negative vector strides,
// gives the canonical result. These inputs reach the calls that the
// stride-provenance lint rule found passing a literal or another array's stride
// (test/harness/LEARNINGS.md, 2026-11-20).

// MODULES //

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { specLayoutInvariant } from '../../../../../test/harness/spec-layout.js';
import dsterf from './../lib/ndarray.js';


// TESTS //

test( 'dsterf: eigenvalues do not depend on the storage of d and e (scaled paths)', function t() {
	[ 1.0e154, 1.0e-155, 1.0 ].forEach( function each( scale ) {
		const d = new Float64Array( [ 4.0, 1.0, 3.0, 2.0, 5.0 ].map( function m( x ) {
			return x * scale;
		}) );
		const e = new Float64Array( [ 1.0, 0.5, 0.25, 0.75 ].map( function m( x ) {
			return x * scale;
		}) );
		specLayoutInvariant( 'dsterf', dsterf, [ 5, d, 1, 0, e, 1, 0 ] );
	});
});
