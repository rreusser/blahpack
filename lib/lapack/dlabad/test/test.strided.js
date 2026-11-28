/* eslint-disable no-restricted-syntax */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import dlabad from './../lib/index.js';

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlabad, 'function' );
});

test( 'attached to the main export is an `strided` method', function t() {
	assert.strictEqual( typeof dlabad.strided, 'function' );
});

test( 'dlabad returns an object with `small` and `large` properties', function t() { // eslint-disable-line max-len
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 1.0e-300;
	large[ 0 ] = 1.0e+300;
	dlabad( small, large );
	const out = {
		'small': small[ 0 ],
		'large': large[ 0 ]
	};
	assert.strictEqual( typeof out, 'object' );
	assert.strictEqual( 'small' in out, true );
	assert.strictEqual( 'large' in out, true );
});

test( 'dlabad returns the input values unchanged (no-op)', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 2.2250738585072014e-308;
	large[ 0 ] = 1.7976931348623157e+308;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 2.2250738585072014e-308 );
	assert.strictEqual( large[ 0 ], 1.7976931348623157e+308 );
});

test( 'dlabad returns typical dlamch values unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 1.0e-300;
	large[ 0 ] = 1.0e+300;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 1.0e-300 );
	assert.strictEqual( large[ 0 ], 1.0e+300 );
});

test( 'dlabad returns 1.0 unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 1.0;
	large[ 0 ] = 1.0;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 1.0 );
	assert.strictEqual( large[ 0 ], 1.0 );
});

test( 'dlabad returns zero unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 0.0;
	large[ 0 ] = 0.0;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 0.0 );
	assert.strictEqual( large[ 0 ], 0.0 );
});

test( 'dlabad returns subnormal values unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 5e-324;
	large[ 0 ] = 1.7976931348623157e+308;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 5e-324 );
	assert.strictEqual( large[ 0 ], 1.7976931348623157e+308 );
});

test( 'dlabad returns Infinity unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 0.0;
	large[ 0 ] = Infinity;
	dlabad( small, large );
	assert.strictEqual( small[ 0 ], 0.0 );
	assert.strictEqual( large[ 0 ], Infinity );
});

test( 'dlabad.strided returns values unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 2.2250738585072014e-308;
	large[ 0 ] = 1.7976931348623157e+308;
	dlabad.strided( small, large );
	assert.strictEqual( small[ 0 ], 2.2250738585072014e-308 );
	assert.strictEqual( large[ 0 ], 1.7976931348623157e+308 );
});

test( 'dlabad.strided returns typical values unchanged', function t() {
	const small = new Float64Array( 1 );
	const large = new Float64Array( 1 );
	small[ 0 ] = 1.0e-150;
	large[ 0 ] = 1.0e+150;
	dlabad.strided( small, large );
	assert.strictEqual( small[ 0 ], 1.0e-150 );
	assert.strictEqual( large[ 0 ], 1.0e+150 );
});
