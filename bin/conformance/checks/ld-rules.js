'use strict';

/*
* Leading-dimension rule check.
*
* Every layout wrapper `<routine>.js` must validate each leading-dimension
* argument with exactly the checks derived from the reference Fortran argument
* checks (data/fortran-ld-rules.json → bin/conformance/ld-rules.js):
*
*   - column-major: the Fortran rule itself, including its job-flag condition
*     (`LDZ >= 1, and >= N only when WANTZ`), its band bound (`KL+KU+1`), and its
*     option-dependent dimension (`NROWA` = M or K by TRANSA);
*   - row-major: the same rule with the bound replaced by the array's declared
*     column count.
*
* No other check on that argument may remain. A 2026-11-18 audit found ~220
* wrappers whose scaffolded checks ("rows if column-major, columns if
* row-major") rejected valid calls (band storage, transposed operands, unwanted
* vectors), accepted out-of-bounds ones, or compared against an output array.
*
* A bound may not reference an array argument or a reference output (INTENT(OUT)):
* `max( 1, M )` with M the Int32Array eigenvector count is NaN, so `LD < NaN`
* never fires (tickets/0001). The translator reports such a rule as unresolved;
* give the column count in ld-rules.js COLS.
*
* Fix a failure with `node bin/codemod-ld-checks.js <routine>`. Rules whose
* row-major layout is not yet verified are marked 'skip' in ld-rules.js and
* only their column-major check is enforced.
*/

var path = require( 'path' );
var util = require( '../util.js' );
var ld = require( '../ld-rules.js' );

var ID = 'ld-rules';
var DESC = 'leading-dimension checks match the reference Fortran rules';


// MAIN //

/**
* Assert a wrapper's leading-dimension checks are the reference-derived ones.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array<Object>} check results
*/
function check( mod ) {
	var wrapperPath = path.join( mod.dir, 'lib', mod.routine + '.js' );
	var src = util.readFile( wrapperPath );
	var base = util.readFile( path.join( mod.dir, 'lib', 'base.js' ) );
	var nd = util.readFile( path.join( mod.dir, 'lib', 'ndarray.js' ) ) || '';
	var violations = [];
	var params;
	var exp;
	if ( !src || !base ) {
		return [ util.skip( ID, DESC, 'No ' + mod.routine + '.js or base.js' ) ];
	}
	exp = ld.expected( mod.routine, src, base, nd );
	if ( !Object.keys( exp ).length ) {
		return [ util.skip( ID, DESC, 'No leading-dimension params with a reference rule' ) ];
	}
	params = ld.wrapperParams( src, mod.routine );
	Object.keys( exp ).forEach( function each( name ) {
		var rec = exp[ name ];
		var want;
		var codes;
		if ( rec.unresolved.length ) {
			violations.push( name + ': reference rule could not be translated (' + rec.unresolved.join( ', ' ) + ') — extend bin/conformance/ld-rules.js' );
			return;
		}
		want = ld.checks( name, rec, params );
		codes = want.map( function c( w ) {
			return w.code;
		});
		codes.forEach( function eachCode( code ) {
			if ( src.indexOf( code ) < 0 ) {
				violations.push( name + ': missing `' + code.split( '\n' )[ 0 ].trim() + '`' );
			}
		});
		ld.existingChecks( src, name ).forEach( function eachHave( h ) {
			var own = codes.some( function s( code ) {
				return code.indexOf( '\tif ( ' + h.cond + ' ) {' ) === 0;
			});
			if ( !own && !( rec.row === 'skip' && h.order === 'row-major' ) ) {
				violations.push( name + ': extra check `' + h.cond + '`' );
			}
		});
	});
	if ( violations.length ) {
		return [ util.fail( ID, DESC, violations.length, violations.map( function m( v ) {
			return path.relative( util.ROOT, wrapperPath ) + '  ' + v;
		}), 'Regenerate with `node bin/codemod-ld-checks.js ' + mod.routine + '`.' ) ];
	}
	return [ util.pass( ID, DESC ) ];
}


// EXPORTS //

module.exports = check;
