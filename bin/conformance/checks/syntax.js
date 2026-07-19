'use strict';

/**
 * Gate check: all JS files in lib/ must parse without syntax errors.
 *
 * Runs `node --check` on each .js file in the module's lib/ directory.
 * This catches truncated expressions, prose-as-code, and other translation
 * artifacts that would cause imports to fail at runtime — none of which ESLint
 * or the assertion-count check would detect.
 */

var path = require( 'path' );
var fs = require( 'fs' );
var childProcess = require( 'child_process' );
var util = require( '../util.js' );

var ID = 'syntax';

function check( mod ) {
	var results = [];
	var libDir = path.join( mod.dir, 'lib' );
	var errors = [];
	var entries;
	var entry;
	var entryPath;
	var result;
	var i;

	if ( !fs.existsSync( libDir ) ) {
		results.push( util.skip( ID + '.lib-parse', 'No lib/ directory' ) );
		return results;
	}

	entries = fs.readdirSync( libDir );
	for ( i = 0; i < entries.length; i++ ) {
		entry = entries[ i ];
		if ( !entry.endsWith( '.js' ) ) {
			continue;
		}
		entryPath = path.join( libDir, entry );
		try {
			result = childProcess.spawnSync(
				process.execPath,
				[ '--check', entryPath ],
				{ encoding: 'utf8', timeout: 10000 }
			);
			if ( result.status !== 0 ) {
				var stderr = result.stderr || '';
				// Extract the first "SyntaxError: ..." line for the message
				var errLine = stderr.split( '\n' ).filter( function( l ) { return /SyntaxError/.test( l ); } )[ 0 ] || 'syntax error';
				errors.push( 'lib/' + entry + ': ' + errLine.trim() );
			}
		} catch ( e ) {
			errors.push( 'lib/' + entry + ': check failed (' + e.message + ')' );
		}
	}

	if ( errors.length === 0 ) {
		results.push( util.pass( ID + '.lib-parse', 'All lib/*.js files parse without syntax errors' ) );
	} else {
		results.push( util.fail(
			ID + '.lib-parse',
			'All lib/*.js files parse without syntax errors',
			errors.length,
			errors,
			errors.length + ' file(s) with syntax errors: ' + errors.map( function( e ) { return e.split( ':' )[ 0 ]; } ).join( ', ' )
		));
	}

	return results;
}

module.exports = check;
