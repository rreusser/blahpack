'use strict';

/*
* Reference option-value check.
*
* `ndarray.js` must accept exactly the option values the reference Fortran
* accepts (data/fortran-option-rules.json ← bin/gen_fortran_option_rules.js,
* which evaluates the reference argument checks letter by letter). The
* `option-parity` check then holds the layout wrapper to the same set.
*
* A wider JS set forwards a value `base()` was never written for. stdlib's
* `isTransposeOperation` accepts `'conjugate-transpose'` for every routine, but
* reference DORMQR/DGEMQRT/DGELS accept only N and T, and ZUNMQR only N and C.
* In base.js the extra value fell into whichever branch its comparisons left
* over: `dgemqrt( 'left', 'conjugate-transpose', ... )` returned C unchanged, and
* complex routines given `'transpose'` silently applied Qᴴ (2026-11-18, 52
* arguments). A narrower set rejects valid calls.
*
* Families with a fixed vocabulary (TRANS*, SIDE, UPLO, DIAG) are compared value
* by value. Other options are compared by count, since their JS strings are
* chosen per routine. Options the reference does not restrict, or that it
* validates through something the generator cannot evaluate, are 'undetermined'
* and skipped. Options ndarray.js does not validate at all are not compared here
* (see tickets/).
*
* Fix: `node bin/codemod-option-rules.js <routine>` (families), or by hand.
*/

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( '../util.js' );
var optionSets = require( './option-parity.js' ).optionSets;

var ID = 'option-rules';
var DESC = 'ndarray.js accepts exactly the option values the reference accepts';
var RULES = null;

var FAMILIES = [
	{ 're': /^TRAN[SAB]/, 'map': { 'N': 'no-transpose', 'T': 'transpose', 'C': 'conjugate-transpose' } },
	{ 're': /^SIDE$/, 'map': { 'L': 'left', 'R': 'right', 'B': 'both' } },
	{ 're': /^UPLO$/, 'map': { 'U': 'upper', 'L': 'lower' } },
	{ 're': /^DIAG$/, 'map': { 'U': 'unit', 'N': 'non-unit' } }
];


// FUNCTIONS //

function rules() {
	if ( !RULES ) {
		RULES = JSON.parse( fs.readFileSync( path.join( util.ROOT, 'data', 'fortran-option-rules.json' ), 'utf8' ) );
	}
	return RULES;
}

function family( P ) {
	var i;
	for ( i = 0; i < FAMILIES.length; i++ ) {
		if ( FAMILIES[ i ].re.test( P ) ) {
			return FAMILIES[ i ];
		}
	}
	return null;
}

/**
* Compare a routine's ndarray.js option sets with the reference.
*
* @param {string} routine - routine name
* @param {string} src - ndarray.js source
* @returns {Array<Object>} mismatches: { param, letters, js, want (family only), extra, missing }
*/
function mismatches( routine, src ) {
	var rule = rules()[ routine ];
	var sets = optionSets( src );
	var out = [];
	if ( !rule ) {
		return out;
	}
	Object.keys( rule ).forEach( function each( P ) {
		var letters = rule[ P ].accepts;
		var name = P.toLowerCase();
		var js = sets[ name ];
		var fam;
		var want;
		var extra;
		var missing;
		if ( letters === 'undetermined' || !js ) {
			return;
		}
		fam = family( P );
		if ( fam ) {
			// In the family's canonical order (no-transpose, transpose, conjugate-transpose):
			want = Object.keys( fam.map ).filter( function f( L ) {
				return letters.indexOf( L ) >= 0;
			}).map( function m( L ) {
				return fam.map[ L ];
			});
			extra = js.filter( function f( v ) {
				return want.indexOf( v ) < 0;
			});
			missing = want.filter( function f( v ) {
				return js.indexOf( v ) < 0;
			});
			if ( extra.length || missing.length ) {
				out.push( { 'param': name, 'letters': letters, 'js': js, 'want': want, 'extra': extra, 'missing': missing } );
			}
		} else if ( js.length !== letters.length ) {
			out.push( { 'param': name, 'letters': letters, 'js': js } );
		}
	});
	return out;
}


// MAIN //

/**
* Assert ndarray.js accepts the reference option values.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array<Object>} check results
*/
function check( mod ) {
	var ndPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var src = util.readFile( ndPath );
	var bad;
	if ( !src ) {
		return [ util.skip( ID, DESC, 'No ndarray.js' ) ];
	}
	if ( !rules()[ mod.routine ] ) {
		return [ util.skip( ID, DESC, 'No reference option checks' ) ];
	}
	bad = mismatches( mod.routine, src );
	if ( bad.length ) {
		return [ util.fail( ID, DESC, bad.length, bad.map( function m( b ) {
			var where = path.relative( util.ROOT, ndPath ) + '  `' + b.param + '`  reference accepts ' + b.letters.split( '' ).join( '/' );
			if ( b.want ) {
				return where + ( b.extra.length ? '  accepts extra [' + b.extra.join( ', ' ) + ']' : '' ) + ( b.missing.length ? '  rejects [' + b.missing.join( ', ' ) + ']' : '' );
			}
			return where + ' (' + b.letters.length + ' values) but ndarray.js accepts ' + b.js.length + ' [' + b.js.join( ', ' ) + ']';
		}), 'Accept exactly the reference values (`node bin/codemod-option-rules.js ' + mod.routine + '` for TRANS/SIDE/UPLO/DIAG).' ) ];
	}
	return [ util.pass( ID, DESC ) ];
}


// EXPORTS //

module.exports = check;
module.exports.mismatches = mismatches;
