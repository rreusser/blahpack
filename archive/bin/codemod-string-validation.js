#!/usr/bin/env node

/**
 * Codemod: Add validation for nonstandard string enum params in routine.js
 *
 * Reads each routine's base.js to discover accepted string values for each
 * param, then adds validation in routine.js.
 *
 * Usage:
 *   node bin/codemod-string-validation.js [--dry-run] [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './gate/util.js' );

// Params already validated by stdlib assert modules
var ALREADY_HANDLED = new Set([
	'order', 'trans', 'transa', 'transb', 'uplo', 'side', 'diag', 'norm'
]);

var ORDINALS = [
	'', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth',
	'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth',
	'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth',
	'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second',
	'Twenty-third', 'Twenty-fourth', 'Twenty-fifth'
];

function ordinal( n ) {
	return ORDINALS[ n ] || ( n + 'th' );
}

function extractExportedSignature( filePath ) {
	if ( !fs.existsSync( filePath ) ) {
		return null;
	}
	var c = fs.readFileSync( filePath, 'utf8' );
	var em = c.match( /module\.exports\s*=\s*(\w+)/ );
	var m;
	if ( em ) {
		m = c.match( new RegExp( 'function\\s+' + em[ 1 ] + '\\s*\\(\\s*([^)]+)\\)' ) );
	}
	if ( !m ) {
		m = c.match( /function\s+\w+\(\s*([^)]+)\)/ );
	}
	if ( !m ) {
		return null;
	}
	return m[ 1 ].split( /,\s*/ ).map( function( s ) { return s.trim(); });
}

/**
 * Discover which string values a param accepts by scanning base.js.
 */
function discoverAcceptedValues( baseContent, paramName ) {
	var pattern = new RegExp( '\\b' + paramName + "\\s*===\\s*'([^']+)'", 'g' );
	var values = new Set();
	var m;
	while ( ( m = pattern.exec( baseContent ) ) !== null ) {
		values.add( m[ 1 ] );
	}
	return Array.from( values );
}

function codemod( mod, dryRun ) {
	var routine = mod.routine;
	var routinePath = path.join( mod.dir, 'lib', routine + '.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );

	if ( !fs.existsSync( routinePath ) || !fs.existsSync( basePath ) ) {
		return { changed: false, reason: 'missing files' };
	}

	var routineContent = fs.readFileSync( routinePath, 'utf8' );
	var baseContent = fs.readFileSync( basePath, 'utf8' );
	var routineParams = extractExportedSignature( routinePath );
	if ( !routineParams || routineParams.length === 0 || ( routineParams.length === 1 && routineParams[ 0 ] === '' ) ) {
		return { changed: false, reason: 'no signature' };
	}

	var modified = routineContent;
	var addedChecks = [];
	var i, p, lower, values, paramIdx;

	for ( i = 0; i < routineParams.length; i++ ) {
		p = routineParams[ i ];
		lower = p.toLowerCase();

		if ( ALREADY_HANDLED.has( lower ) ) {
			continue;
		}

		// Check if this param is used as a string enum in base.js
		values = discoverAcceptedValues( baseContent, p );
		if ( values.length === 0 ) {
			continue;
		}

		// Already validated in routine.js?
		var alreadyChecked = new RegExp( "\\b" + p + "\\s*!==\\s*'" ).test( modified ) ||
			new RegExp( "invalid.*" + p ).test( modified );
		if ( alreadyChecked ) {
			continue;
		}

		paramIdx = i + 1;
		var condition = values.map( function( v ) {
			return p + " !== '" + v + "'";
		}).join( ' && ' );

		var label = p;
		var throwBlock = '\tif ( ' + condition + ' ) {\n' +
			"\t\tthrow new TypeError( format( 'invalid argument. " + ordinal( paramIdx ) +
			" argument must be a valid `" + label + "` value. Value: `%s`.', " + p + " ) );\n" +
			'\t}';

		// Find insertion point: after the last existing throw, or before stride/order logic
		var lastThrowIdx = modified.lastIndexOf( 'throw new TypeError(' );
		var lastRangeIdx = modified.lastIndexOf( 'throw new RangeError(' );
		var insertAfterIdx = Math.max( lastThrowIdx, lastRangeIdx );

		if ( insertAfterIdx >= 0 ) {
			// Find the closing brace of the last throw block
			var closeBrace = modified.indexOf( '\t}', insertAfterIdx );
			if ( closeBrace >= 0 ) {
				var insertPos = modified.indexOf( '\n', closeBrace ) + 1;
				modified = modified.substring( 0, insertPos ) + throwBlock + '\n' + modified.substring( insertPos );
				addedChecks.push( p + ' (' + values.join( '/' ) + ')' );
			}
		} else {
			// No existing throws — insert before return base( or base(
			var retPattern = /(\n)(\treturn base\(|\tbase\()/;
			var rm = modified.match( retPattern );
			if ( rm ) {
				modified = modified.replace( retPattern, '\n' + throwBlock + '\n' + rm[ 2 ] );
				addedChecks.push( p + ' (' + values.join( '/' ) + ')' );
			}
		}
	}

	if ( addedChecks.length === 0 ) {
		return { changed: false, reason: 'nothing to add' };
	}

	// Ensure format is imported
	if ( !/require.*format/.test( modified ) ) {
		modified = modified.replace(
			/var base = require\( '\.\/base\.js' \);/,
			"var format = require( '@stdlib/string/format' );\nvar base = require( './base.js' );"
		);
	}

	if ( !dryRun ) {
		fs.writeFileSync( routinePath, modified );
	}

	return { changed: true, checks: addedChecks };
}

function main() {
	var args = process.argv.slice( 2 );
	var dryRun = args.indexOf( '--dry-run' ) >= 0;
	var all = args.indexOf( '--all' ) >= 0;
	args = args.filter( function( a ) { return a !== '--dry-run' && a !== '--all'; });

	var modules;
	if ( all ) {
		modules = util.discoverModules();
	} else if ( args.length > 0 ) {
		modules = args.map( function( a ) { return util.resolveModule( a ); }).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/codemod-string-validation.js [--dry-run] [--all | module-path...]' );
		process.exit( 1 );
	}

	var changed = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		try {
			var result = codemod( mod, dryRun );
			if ( result.changed ) {
				changed++;
				if ( dryRun ) {
					console.log( mod.routine + ': ' + result.checks.join( ', ' ) );
				}
			} else {
				skipped++;
			}
		} catch ( e ) {
			errors.push( mod.routine + ': ' + e.message );
		}
	});

	console.log( '\nChanged: ' + changed + ', Skipped: ' + skipped );
	if ( errors.length > 0 ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
	if ( dryRun ) {
		console.log( '(dry run)' );
	}
}

main();
