/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines, max-statements, camelcase */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import format from '@stdlib/string/format/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpotrf from './../../zpotrf/lib/base.js';
import zpotrs from './../../zpotrs/lib/base.js';
import base from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureLines = readFileSync( path.join( fixtureDir, 'zla_porfsx_extended.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = fixtureLines.map( parseLine );

// Standard refinement parameters matching the Fortran test.
var PREC_TYPE = 1;
var ITHRESH = 10;
var RTHRESH = 0.5;
var DZ_UB = 0.25;
var RCOND = 1.0;
var TOL = 1e-13;

// Shared constant HPD 3x3 matrix (column-major interleaved Float64 layout).
var HPD_3X3 = [
	4.0,
	0.0,
	1.0,
	-1.0,
	0.0,
	0.0,
	1.0,
	1.0,
	3.0,
	0.0,
	1.0,
	0.0,
	0.0,
	0.0,
	1.0,
	0.0,
	2.0,
	0.0
];

// Canonical unit RHS `B = [1, 1, 1]`.
var UNIT_RHS_3 = [
	1.0,
	0.0,
	1.0,
	0.0,
	1.0,
	0.0
];


// FUNCTIONS //

/**
* Parse a single JSONL fixture line.
*
* @private
* @param {string} line - JSONL fixture line
* @throws {Error} when the JSON is malformed
* @returns {Object} fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Find a fixture case by name.
*
* @private
* @param {string} name - case name
* @throws {Error} when the named case is not present
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture case not found: %s', name ) );
}

/**
* Assert two numbers are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - diagnostic label
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;
	var denom;
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

/**
* Assert two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - diagnostic label
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, format( '%s: length mismatch', msg ) );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

/**
* Run the refinement driver on an HPD system, constructing AF and initial Y.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - input matrix
* @param {Complex128Array} B - right-hand sides
* @param {Object} opts - optional knobs
* @throws {Error} when the Cholesky factor or solve fails
* @returns {Object} `{ info, y, berr_out, err_bnds_norm, err_bnds_comp }`
*/
function runCase( uplo, N, nrhs, A, B, opts ) {
	var err_bnds_norm;
	var err_bnds_comp;
	var berr_out;
	var Y_TAIL;
	var nrhs1;
	var opts1;
	var cArr;
	var info;
	var cVal;
	var AYB;
	var RES;
	var AF;
	var DY;
	var Y;
	var i;
	var j;

	opts1 = opts || {};
	nrhs1 = Math.max( nrhs, 1 );
	cArr = new Float64Array( Math.max( N, 1 ) );
	cVal = ( opts1.c === void 0 ) ? 1.0 : opts1.c;
	for ( i = 0; i < cArr.length; i++ ) {
		cArr[ i ] = cVal;
	}
	AF = new Complex128Array( reinterpret( A, 0 ) );
	if ( N > 0 ) {
		info = zpotrf( uplo, N, AF, 1, N, 0 );
		if ( info !== 0 ) {
			throw new Error( format( 'zpotrf failed: info=%d', info ) );
		}
	}
	Y = new Complex128Array( reinterpret( B, 0 ) );
	if ( N > 0 && nrhs > 0 ) {
		info = zpotrs( uplo, N, nrhs, AF, 1, N, 0, Y, 1, N, 0 );
		if ( info !== 0 ) {
			throw new Error( format( 'zpotrs failed: info=%d', info ) );
		}
	}
	RES = new Complex128Array( Math.max( N, 1 ) );
	DY = new Complex128Array( Math.max( N, 1 ) );
	Y_TAIL = new Complex128Array( Math.max( N, 1 ) );
	AYB = new Float64Array( Math.max( N, 1 ) );
	berr_out = new Float64Array( nrhs1 );
	err_bnds_norm = new Float64Array( Math.max( nrhs * 3, 1 ) );
	err_bnds_comp = new Float64Array( Math.max( nrhs * 3, 1 ) );
	for ( j = 0; j < err_bnds_norm.length; j++ ) {
		err_bnds_norm[ j ] = 0.0;
		err_bnds_comp[ j ] = 0.0;
	}
	info = base( PREC_TYPE, uplo, N, nrhs, A, 1, N, 0, AF, 1, N, 0, opts1.colequ === true, cArr, 1, 0, B, 1, N, 0, Y, 1, N, 0, berr_out, 1, 0, ( opts1.n_norms === void 0 ) ? 2 : opts1.n_norms, err_bnds_norm, 1, nrhs1, 0, err_bnds_comp, 1, nrhs1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, RCOND, ITHRESH, RTHRESH, DZ_UB, opts1.ignore_cwise === true );
	return {
		'info': info,
		'y': reinterpret( Y, 0 ),
		'berr_out': berr_out,
		'err_bnds_norm': err_bnds_norm,
		'err_bnds_comp': err_bnds_comp
	};
}

/**
* Convert a typed array (or array-like) into a plain `Array`.
*
* @private
* @param {(Array|Float64Array)} arr - input array-like
* @returns {Array} plain `Array` copy
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Verify `out` against the named fixture case with full error-bound checks.
*
* @private
* @param {Object} out - output from `runCase`
* @param {string} name - fixture case name
*/
function checkFull( out, name ) {
	var tc = findCase( name );
	assert.equal( out.info, tc.info, 'info' );
	assertArrayClose( toArray( out.y ), tc.y, TOL, 'y' );
	assertArrayClose( toArray( out.berr_out ), tc.berr_out, TOL, 'berr_out' );
	assertArrayClose( toArray( out.err_bnds_norm ), tc.err_bnds_norm, TOL, 'err_bnds_norm' );
	assertArrayClose( toArray( out.err_bnds_comp ), tc.err_bnds_comp, TOL, 'err_bnds_comp' );
}


// TESTS //

test( 'zla_porfsx_extended: basic_upper_3x3', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	out = runCase( 'upper', 3, 1, A, B, {} );
	checkFull( out, 'basic_upper_3x3' );
});

test( 'zla_porfsx_extended: basic_lower_3x3', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	out = runCase( 'lower', 3, 1, A, B, {} );
	checkFull( out, 'basic_lower_3x3' );
});

test( 'zla_porfsx_extended: multi_rhs_upper_3x3', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array([
		1.0,
		0.0,
		2.0,
		1.0,
		3.0,
		0.0,
		4.0,
		0.0,
		5.0,
		-1.0,
		6.0,
		0.0
	]);
	out = runCase( 'upper', 3, 2, A, B, {} );
	checkFull( out, 'multi_rhs_upper_3x3' );
});

test( 'zla_porfsx_extended: colequ_upper_3x3', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	out = runCase( 'upper', 3, 1, A, B, {
		'colequ': true,
		'c': 0.5
	});
	checkFull( out, 'colequ_upper_3x3' );
});

test( 'zla_porfsx_extended: n_norms_zero_upper_3x3', function t() {
	var out;
	var tc;
	var A;
	var B;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	out = runCase( 'upper', 3, 1, A, B, {
		'n_norms': 0
	});
	tc = findCase( 'n_norms_zero_upper_3x3' );
	assert.equal( out.info, tc.info, 'info' );
	assertArrayClose( toArray( out.y ), tc.y, TOL, 'y' );
	assertArrayClose( toArray( out.berr_out ), tc.berr_out, TOL, 'berr_out' );
	for ( i = 0; i < out.err_bnds_norm.length; i++ ) {
		assert.equal( out.err_bnds_norm[ i ], 0.0, 'err_bnds_norm not written' );
		assert.equal( out.err_bnds_comp[ i ], 0.0, 'err_bnds_comp not written' );
	}
});

test( 'zla_porfsx_extended: ignore_cwise_upper_3x3', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	out = runCase( 'upper', 3, 1, A, B, {
		'ignore_cwise': true
	});
	checkFull( out, 'ignore_cwise_upper_3x3' );
});

test( 'zla_porfsx_extended: nrhs=0 quick return', function t() {
	var out;
	var A;
	var B;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( 3 );
	out = runCase( 'upper', 3, 0, A, B, {} );
	assert.equal( out.info, 0, 'info' );
});

test( 'zla_porfsx_extended: ithresh=1 with near-converged Y leaves loop unbroken', function t() {
	var berr_out;
	var cArr;
	var info;
	var AYB;
	var ebc;
	var ebn;
	var RES;
	var AF;
	var DY;
	var YT;
	var A;
	var B;
	var Y;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	AF = new Complex128Array( reinterpret( A, 0 ) );
	RES = new Complex128Array( 3 );
	DY = new Complex128Array( 3 );
	YT = new Complex128Array( 3 );
	berr_out = new Float64Array( 1 );
	cArr = new Float64Array( 3 );
	ebn = new Float64Array( 3 );
	ebc = new Float64Array( 3 );
	AYB = new Float64Array( 3 );
	for ( i = 0; i < 3; i++ ) {
		cArr[ i ] = 1.0;
	}
	info = zpotrf( 'upper', 3, AF, 1, 3, 0 );
	assert.equal( info, 0, 'zpotrf' );
	Y = new Complex128Array([
		0.26,
		-0.07,
		0.13,
		0.14,
		0.45,
		-0.06
	]);
	info = base( PREC_TYPE, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, cArr, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-20, 1, 0.5, 0.25, false );
	assert.equal( info, 0, 'info' );
});

test( 'zla_porfsx_extended: ithresh=1 diverging initial Y breaks via z_state unstable', function t() {
	var berr_out;
	var cArr;
	var info;
	var AYB;
	var ebc;
	var ebn;
	var RES;
	var AF;
	var DY;
	var YT;
	var A;
	var B;
	var Y;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	AF = new Complex128Array( reinterpret( A, 0 ) );
	RES = new Complex128Array( 3 );
	DY = new Complex128Array( 3 );
	YT = new Complex128Array( 3 );
	berr_out = new Float64Array( 1 );
	cArr = new Float64Array( 3 );
	ebn = new Float64Array( 3 );
	ebc = new Float64Array( 3 );
	AYB = new Float64Array( 3 );
	for ( i = 0; i < 3; i++ ) {
		cArr[ i ] = 1.0;
	}
	info = zpotrf( 'upper', 3, AF, 1, 3, 0 );
	assert.equal( info, 0, 'zpotrf' );
	Y = new Complex128Array([
		10.0,
		10.0,
		10.0,
		10.0,
		10.0,
		10.0
	]);
	info = base( PREC_TYPE, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, cArr, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 1, 0.5, 0.25, false );
	assert.equal( info, 0, 'info' );
});

test( 'zla_porfsx_extended: all-zero initial Y exercises normx==0 branch', function t() {
	var berr_out;
	var cArr;
	var info;
	var AYB;
	var ebc;
	var ebn;
	var RES;
	var AF;
	var DY;
	var YT;
	var A;
	var B;
	var Y;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	AF = new Complex128Array( reinterpret( A, 0 ) );
	Y = new Complex128Array( 3 );
	RES = new Complex128Array( 3 );
	DY = new Complex128Array( 3 );
	YT = new Complex128Array( 3 );
	berr_out = new Float64Array( 1 );
	cArr = new Float64Array( 3 );
	ebn = new Float64Array( 3 );
	ebc = new Float64Array( 3 );
	AYB = new Float64Array( 3 );
	for ( i = 0; i < 3; i++ ) {
		cArr[ i ] = 1.0;
	}
	info = zpotrf( 'upper', 3, AF, 1, 3, 0 );
	assert.equal( info, 0, 'zpotrf' );
	info = base( PREC_TYPE, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, cArr, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.equal( info, 0, 'info' );
});

test( 'zla_porfsx_extended: Y with zero entries exercises yk==0 branch', function t() {
	var berr_out;
	var cArr;
	var info;
	var AYB;
	var ebc;
	var ebn;
	var RES;
	var AF;
	var DY;
	var YT;
	var A;
	var B;
	var Y;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array([
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	AF = new Complex128Array( reinterpret( A, 0 ) );
	RES = new Complex128Array( 3 );
	DY = new Complex128Array( 3 );
	YT = new Complex128Array( 3 );
	berr_out = new Float64Array( 1 );
	cArr = new Float64Array( 3 );
	ebn = new Float64Array( 3 );
	ebc = new Float64Array( 3 );
	AYB = new Float64Array( 3 );
	for ( i = 0; i < 3; i++ ) {
		cArr[ i ] = 1.0;
	}
	info = zpotrf( 'upper', 3, AF, 1, 3, 0 );
	assert.equal( info, 0, 'zpotrf' );
	Y = new Complex128Array([
		0.0,
		0.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	info = base( PREC_TYPE, 'upper', 3, 1, A, 1, 3, 0, AF, 1, 3, 0, false, cArr, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.equal( info, 0, 'info' );
});

test( 'zla_porfsx_extended: negative prec_type early return', function t() {
	var berr_out;
	var cArr;
	var info;
	var AYB;
	var ebc;
	var ebn;
	var RES;
	var yv;
	var DY;
	var YT;
	var A;
	var B;
	var Y;
	var i;
	A = new Complex128Array( HPD_3X3 );
	B = new Complex128Array( UNIT_RHS_3 );
	Y = new Complex128Array( 3 );
	RES = new Complex128Array( 3 );
	DY = new Complex128Array( 3 );
	YT = new Complex128Array( 3 );
	berr_out = new Float64Array( 1 );
	cArr = new Float64Array( 3 );
	ebn = new Float64Array( 3 );
	ebc = new Float64Array( 3 );
	AYB = new Float64Array( 3 );
	info = base( -1, 'upper', 3, 1, A, 1, 3, 0, A, 1, 3, 0, false, cArr, 1, 0, B, 1, 3, 0, Y, 1, 3, 0, berr_out, 1, 0, 2, ebn, 1, 1, 0, ebc, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1.0, 10, 0.5, 0.25, false );
	assert.equal( info, 0, 'early return info' );
	yv = reinterpret( Y, 0 );
	for ( i = 0; i < yv.length; i++ ) {
		assert.equal( yv[ i ], 0.0, 'Y untouched' );
	}
});
