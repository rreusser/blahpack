'use strict';

/*
* Machine-constant check (CONVENTIONS X4, ticket 0089).
*
* LAPACK has two machine epsilons: `DLAMCH('E')` = 2^-53, the rounding unit,
* and `DLAMCH('P')` = 2^-52 = eps*base. A port that picks the other one moves
* every threshold built from it by 2x, or sqrt(2) under a square root (SMLNUM,
* BIGNUM, RMIN/RMAX rescaling bounds, convergence tolerances). Results usually
* still pass residual checks, so tests cannot see it; borderline inputs then
* take a different path than the reference. 35 modules had it wrong.
*
* The check compares, per module, the epsilon each `lib/*.js` file uses with
* the `DLAMCH` letters of the reference source, recorded in
* data/fortran-checks.json (`dlamch`, by bin/spec-gen/extract.cjs):
*
*   'E'  dlamch( 'epsilon' ), the literal 1.1102230246251565e-16
*   'P'  dlamch( 'precision' ), the literal 2.220446049250313e-16,
*        @stdlib/constants/float64/eps, Number.EPSILON
*
* A module fails when it uses a class its reference never queries. (The
* reverse is not checked: a module may share an implementation that holds
* the constant, as dlaqr3 shares dlaqr2's.) `Number.MIN_VALUE` always fails:
* `DLAMCH('S')` is the smallest normal number (X4).
*
* Not covered: constants precomputed from epsilon as literals (zlargv's
* SAFMN2 was 2^-511 where the formula gives 2^-484). Write the formula
* instead of its value, so this check sees the epsilon it uses.
*
* There is no exception/skip mechanism: a mismatch is fixed in the code.
*/

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'machine-constants';
var NAME = 'machine epsilon matches the reference DLAMCH query';

var SOURCES = [
	{ 'cls': 'E', 're': /\bdlamch\(\s*'epsilon'\s*\)/g, 'what': "dlamch( 'epsilon' )" },
	{ 'cls': 'E', 're': /\b1\.1102230246251565e-16\b/g, 'what': '1.1102230246251565e-16' },
	{ 'cls': 'P', 're': /\bdlamch\(\s*'precision'\s*\)/g, 'what': "dlamch( 'precision' )" },
	{ 'cls': 'P', 're': /\b2\.220446049250313e-16\b/g, 'what': '2.220446049250313e-16' },
	{ 'cls': 'P', 're': /@stdlib\/constants\/float64\/eps\b/g, 'what': '@stdlib/constants/float64/eps' },
	{ 'cls': 'P', 're': /\bNumber\.EPSILON\b/g, 'what': 'Number.EPSILON' }
];

var FORTRAN = null;


// FUNCTIONS //

/**
* Blanks comments, keeping newlines so offsets map to the same lines.
*
* @private
* @param {string} src - JS source
* @returns {string} source without comments
*/
function stripComments( src ) {
	return src.replace( /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, function blank( c ) {
		return c.replace( /[^\n]/g, ' ' );
	});
}

/**
* The DLAMCH letters the reference queries, or null when the routine has no
* record in data/fortran-checks.json.
*
* @private
* @param {string} routine - routine name
* @returns {(Array<string>|null)} letters
*/
function fortranLetters( routine ) {
	var rec;
	if ( FORTRAN === null ) {
		FORTRAN = JSON.parse( fs.readFileSync( path.join( util.ROOT, 'data', 'fortran-checks.json' ), 'utf8' ) );
	}
	rec = FORTRAN[ routine ];
	if ( !rec ) {
		return null;
	}
	return rec.dlamch || [];
}


// MAIN //

/**
* Checks the module's machine epsilon against its reference.
*
* @param {Object} mod - { dir, pkg, routine }
* @returns {Array<Object>} check results
*/
function check( mod ) {
	var violations = [];
	var letters = fortranLetters( mod.routine );
	var libDir = path.join( mod.dir, 'lib' );
	var files;
	if ( letters === null ) {
		return [ util.skip( ID, NAME, 'No reference facts in data/fortran-checks.json' ) ];
	}
	files = ( fs.existsSync( libDir ) ? fs.readdirSync( libDir ) : [] ).filter( function js( f ) {
		return /\.js$/.test( f );
	}).sort();
	files.forEach( function each( f ) {
		var p = path.join( libDir, f );
		var src = stripComments( util.readFile( p ) || '' );
		var rel = path.relative( util.ROOT, p );
		function line( i ) {
			return src.slice( 0, i ).split( '\n' ).length;
		}
		SOURCES.forEach( function eachSource( s ) {
			var m;
			if ( letters.indexOf( s.cls ) !== -1 ) {
				return;
			}
			s.re.lastIndex = 0;
			while ( ( m = s.re.exec( src ) ) !== null ) {
				violations.push( rel + ':' + line( m.index ) + '  ' + s.what + " is DLAMCH('" + s.cls + "'), which the reference never queries (it queries: " + ( letters.join( ', ' ) || 'none' ) + ')' );
			}
		});
		var mv = /\bNumber\.MIN_VALUE\b/g;
		var m2;
		while ( ( m2 = mv.exec( src ) ) !== null ) {
			violations.push( rel + ':' + line( m2.index ) + "  Number.MIN_VALUE is subnormal; DLAMCH('S') is the smallest normal number, 2.2250738585072014e-308" );
		}
	});
	if ( violations.length ) {
		return [ util.fail( ID, NAME, violations.length, violations, "Use the machine constant the reference DLAMCH call asks for: 'E' is dlamch( 'epsilon' ) (2^-53), 'P' is dlamch( 'precision' ) (2^-52)." ) ];
	}
	return [ util.pass( ID, NAME ) ];
}


// EXPORTS //

module.exports = check;
