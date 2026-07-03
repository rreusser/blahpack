#!/usr/bin/env node

/**
* Rewrites test files to load from per-scenario JSON fixtures instead of
* shared JSONL files.
*
* Replaces:
*   var fixtureDir = path.join(...);
*   var lines = readFileSync(...).trim().split('\n');
*   var fixture = lines.map(...);
*   function findCase(name) { ... }
*   ...
*   var tc = findCase('name');
*
* With:
*   var upper_basic = require('./fixtures/upper_basic.json');
*   ...
*   var tc = upper_basic;
*
* Usage:
*   node bin/conform-test-fixtures.js [--dry-run] [module-path]
*   node bin/conform-test-fixtures.js --all [--dry-run]
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var args = process.argv.slice( 2 );
var dryRun = args.includes( '--dry-run' );
var all = args.includes( '--all' );
var target = args.find( function( a ) { return a[ 0 ] !== '-'; } );

function findModules() {
	var results = [];
	var pkgs = [ 'blas', 'lapack' ];
	var i;
	var j;
	var pkg;
	var dir;
	var routines;
	var modDir;

	for ( i = 0; i < pkgs.length; i++ ) {
		pkg = pkgs[ i ];
		dir = path.join( 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		routines = fs.readdirSync( dir );
		for ( j = 0; j < routines.length; j++ ) {
			modDir = path.join( dir, routines[ j ] );
			if ( fs.existsSync( path.join( modDir, 'test', 'test.js' ) ) ) {
				results.push( modDir );
			}
		}
	}
	return results;
}

function sanitizeName( name ) {
	return name.replace( /[^a-zA-Z0-9_-]/g, '_' ).toLowerCase();
}

function nameToVarName( name ) {
	// Convert fixture name to a valid JS variable name
	// Use sanitizeName but also replace hyphens (valid in filenames, not in JS vars)
	var sanitized = sanitizeName( name ).replace( /-/g, '_' );
	// Prefix with underscore if starts with digit
	if ( /^[0-9]/.test( sanitized ) ) {
		sanitized = '_' + sanitized;
	}
	return sanitized;
}

function conformTestFixtures( modDir ) {
	var testPath = path.join( modDir, 'test', 'test.js' );
	var content = fs.readFileSync( testPath, 'utf8' );

	// Check if this file uses the JSONL pattern
	if ( content.indexOf( 'fixtureDir' ) === -1 && content.indexOf( '.jsonl' ) === -1 ) {
		return 0;
	}

	// Check if local fixtures exist
	var fixturesDir = path.join( modDir, 'test', 'fixtures' );
	if ( !fs.existsSync( fixturesDir ) ) {
		console.error( modDir + ': WARNING - no test/fixtures/ directory, skipping' );
		return 0;
	}

	// 1. Extract all findCase('name') calls
	var findCasePattern = /findCase\(\s*'([^']+)'\s*\)/g;
	var match;
	var fixtureNames = [];
	var seen = {};

	while ( ( match = findCasePattern.exec( content ) ) !== null ) {
		var name = match[ 1 ];
		if ( !seen[ name ] ) {
			fixtureNames.push( name );
			seen[ name ] = true;
		}
	}

	// Also check for inline fixture.find() pattern:
	// fixture.find( function find( t ) { ... } ) or fixture.find( function( t ) { ... } )
	if ( fixtureNames.length === 0 ) {
		var inlinePattern = /fixture\.find\(\s*function(?:\s+find)?\(\s*t\s*\)\s*\{[^}]*t\.name\s*===\s*'([^']+)'/g;
		while ( ( match = inlinePattern.exec( content ) ) !== null ) {
			var inlineName = match[ 1 ];
			if ( !seen[ inlineName ] ) {
				fixtureNames.push( inlineName );
				seen[ inlineName ] = true;
			}
		}
	}

	if ( fixtureNames.length === 0 ) {
		// No findCase or inline fixture.find calls found
		console.error( modDir + ': WARNING - no findCase() or fixture.find() calls found, skipping' );
		return 0;
	}

	// Check for dynamic findCase calls (e.g., findCase( c.name ))
	// These can't be replaced with static requires.
	// Count findCase(...) calls where the argument is NOT a string literal.
	// Exclude: the function definition, and findCase('literal') calls.
	var dynamicCount = 0;
	var allCallPattern = /findCase\(\s*([^)]+)\)/g;
	var cm;
	while ( ( cm = allCallPattern.exec( content ) ) !== null ) {
		var arg = cm[ 1 ].trim();
		// Skip: function definition (arg is 'name')
		if ( arg === 'name' && content.substring( Math.max( 0, cm.index - 20 ), cm.index ).indexOf( 'function' ) !== -1 ) {
			continue;
		}
		// Skip: string literal arguments
		if ( /^'[^']*'$/.test( arg ) || /^"[^"]*"$/.test( arg ) ) {
			continue;
		}
		dynamicCount += 1;
	}
	if ( dynamicCount > 0 ) {
		console.error( modDir + ': WARNING - has ' + dynamicCount + ' dynamic findCase() calls, skipping' );
		return 0;
	}

	// Verify all fixture files exist
	var missing = [];
	var i;
	for ( i = 0; i < fixtureNames.length; i++ ) {
		var fixturePath = path.join( fixturesDir, sanitizeName( fixtureNames[ i ] ) + '.json' );
		if ( !fs.existsSync( fixturePath ) ) {
			missing.push( fixtureNames[ i ] );
		}
	}
	if ( missing.length > 0 ) {
		console.error( modDir + ': WARNING - missing fixture files: ' + missing.join( ', ' ) );
		return 0;
	}

	// 2. Build require statements
	var requires = [];
	for ( i = 0; i < fixtureNames.length; i++ ) {
		var varName = nameToVarName( fixtureNames[ i ] );
		var fileName = sanitizeName( fixtureNames[ i ] );
		requires.push( 'var ' + varName + ' = require( \'./fixtures/' + fileName + '.json\' );' ); // eslint-disable-line max-len
	}

	// 3. Remove the JSONL loading block
	var newContent = content;

	// Remove: readFileSync require (if only used for fixtures)
	newContent = newContent.replace(
		/var readFileSync = require\( 'fs' \)\.readFileSync;\n/,
		''
	);

	// Remove: path require (if only used for fixtures)
	// Be careful - path might be used elsewhere. Only remove if no other path.join calls remain
	// We'll keep path for now and clean up in a separate pass

	// Remove the fixtureDir / lines / fixture block
	// Try with section header first, then without
	var fixtureBlockWithHeader = /\n*\/\/ FIXTURES \/\/\n+var fixtureDir[^]*?var fixture = lines\.map\([^]*?\}\s*\);\n*/;
	var fixtureBlockNoHeader = /\n*var fixtureDir[^]*?var fixture = lines\.map\([^]*?\}\s*\);\n*/;
	var requireBlock = '\n\n// FIXTURES //\n\n' + requires.join( '\n' ) + '\n';

	if ( fixtureBlockWithHeader.test( newContent ) ) {
		newContent = newContent.replace( fixtureBlockWithHeader, requireBlock );
	} else if ( fixtureBlockNoHeader.test( newContent ) ) {
		newContent = newContent.replace( fixtureBlockNoHeader, requireBlock );
	} else {
		console.error( modDir + ': WARNING - could not match fixture loading block, skipping' );
		return 0;
	}

	// 4. Remove the findCase function (including JSDoc above it)
	// Strategy: find "function findCase(" and look backward for the JSDoc block
	var findCaseIdx = newContent.indexOf( 'function findCase(' );
	if ( findCaseIdx !== -1 ) {
		// Find the closing brace of the function (at start of line)
		var afterFn = newContent.indexOf( '\n}', findCaseIdx );
		if ( afterFn !== -1 ) {
			var endIdx = afterFn + 2; // include the \n}
			// Skip any trailing newlines
			while ( endIdx < newContent.length && newContent[ endIdx ] === '\n' ) {
				endIdx += 1;
			}

			// Look backward for JSDoc /** ... */ block
			var startIdx = findCaseIdx;
			var beforeFn = newContent.substring( 0, findCaseIdx ).trimEnd();
			if ( beforeFn.endsWith( '*/' ) ) {
				// Find the matching /**
				var jsdocEnd = beforeFn.length;
				var jsdocStart = beforeFn.lastIndexOf( '/**' );
				if ( jsdocStart !== -1 ) {
					startIdx = jsdocStart;
					// Also eat any leading newlines before the JSDoc
					while ( startIdx > 0 && newContent[ startIdx - 1 ] === '\n' ) {
						startIdx -= 1;
					}
				}
			}

			newContent = newContent.substring( 0, startIdx ) + '\n\n' + newContent.substring( endIdx );
		}
	}

	// 5. Replace findCase('name') AND inline fixture.find() calls with the variable name
	for ( i = 0; i < fixtureNames.length; i++ ) {
		var varName = nameToVarName( fixtureNames[ i ] );
		var escapedName = fixtureNames[ i ].replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

		// Replace findCase( 'name' )
		var callPattern = new RegExp( "findCase\\(\\s*'" + escapedName + "'\\s*\\)", 'g' );
		newContent = newContent.replace( callPattern, varName );

		// Replace inline fixture.find patterns (both single-line and multi-line)
		var inlineLines = newContent.split( '\n' );
		var outLines = [];
		var li = 0;
		while ( li < inlineLines.length ) {
			var curLine = inlineLines[ li ];
			if ( curLine.indexOf( 'fixture.find(' ) !== -1 ) {
				// Try single-line match first:
				// tc = fixture.find( function( t ) { return t.name === 'name'; } );
				var singleMatch = curLine.match( /t\.name\s*===\s*'([^']+)'/ );
				if ( singleMatch && singleMatch[ 1 ] === fixtureNames[ i ] && curLine.indexOf( '}' ) !== -1 ) {
					var assignMatch = curLine.match( /^(\s*)((?:var\s+)?\S+)\s*=\s*fixture\.find/ );
					if ( assignMatch ) {
						outLines.push( assignMatch[ 1 ] + assignMatch[ 2 ] + ' = ' + varName + ';' );
						li += 1;
						continue;
					}
				}
				// Try multi-line match (3 lines):
				if ( li + 2 < inlineLines.length ) {
					var namePart = inlineLines[ li + 1 ];
					var closePart = inlineLines[ li + 2 ];
					var nameMatch = namePart.match( /t\.name\s*===\s*'([^']+)'/ );
					if ( nameMatch && nameMatch[ 1 ] === fixtureNames[ i ] && /^\s*\}\s*\);?\s*$/.test( closePart ) ) {
						var assignMatch2 = curLine.match( /^(\s*)((?:var\s+)?\S+)\s*=\s*fixture\.find/ );
						if ( assignMatch2 ) {
							outLines.push( assignMatch2[ 1 ] + assignMatch2[ 2 ] + ' = ' + varName + ';' );
							li += 3;
							continue;
						}
					}
				}
			}
			outLines.push( curLine );
			li += 1;
		}
		newContent = outLines.join( '\n' );
	}

	// 6. Clean up: remove unused `path` require if no longer referenced
	if ( newContent.indexOf( 'path.join' ) === -1 && newContent.indexOf( 'path.resolve' ) === -1 ) {
		newContent = newContent.replace( /var path = require\( 'path' \);\n/, '' );
	}

	// 7. Clean up: remove `node/no-sync` eslint comments if no more readFileSync
	if ( newContent.indexOf( 'readFileSync' ) === -1 ) {
		newContent = newContent.replace( / \/\/ eslint-disable-line node\/no-sync/g, '' );
	}

	// 8. Clean up empty FUNCTIONS section if findCase was the only function there
	newContent = newContent.replace( /\n*\/\/ FUNCTIONS \/\/\n+(?=\/\/ |\ntest\()/g, '\n\n' );

	// 9. Normalize blank lines: ensure exactly one blank line before section headers
	// and between require blocks and the next section
	newContent = newContent.replace( /\n{3,}/g, '\n\n' );

	// Ensure blank line before // FUNCTIONS // and // TESTS // sections
	newContent = newContent.replace( /([^\n])\n(\/\/ (?:FUNCTIONS|TESTS|VARIABLES) \/\/)/g, '$1\n\n$2' );

	if ( newContent === content ) {
		return 0;
	}

	if ( dryRun ) {
		console.log( modDir + ': would rewrite test.js (' + fixtureNames.length + ' fixtures)' );
		return 1;
	}

	fs.writeFileSync( testPath, newContent );
	console.log( modDir + ': rewrote test.js (' + fixtureNames.length + ' fixtures)' );
	return 1;
}

// Main
var modules;
var totalChanges = 0;
var i;

if ( all ) {
	modules = findModules();
} else if ( target ) {
	modules = [ target ];
} else {
	console.error( 'Usage: node bin/conform-test-fixtures.js [--all] [--dry-run] [module-path]' );
	process.exit( 1 );
}

for ( i = 0; i < modules.length; i++ ) {
	totalChanges += conformTestFixtures( modules[ i ] );
}

console.log( '\nTotal: ' + totalChanges + ' test files' + ( dryRun ? ' would be' : '' ) + ' rewritten across ' + modules.length + ' modules' );
