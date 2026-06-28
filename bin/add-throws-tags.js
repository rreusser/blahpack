#!/usr/bin/env node

/**
 * Codemod: add missing @throws JSDoc annotations to BLAS/LAPACK wrapper functions.
 *
 * For each JS file under lib/{blas,lapack}/base/<routine>/lib/<file>.js:
 *   1. Finds function declarations preceded by a JSDoc block.
 *   2. Scans the function body for `throw new RangeError` / `throw new TypeError`.
 *   3. Checks whether the JSDoc already has matching `@throws {RangeError}` / `@throws {TypeError}`.
 *   4. Inserts missing annotations before @returns (or before closing the JSDoc block).
 *
 * Only modifies files that are actually missing annotations.
 *
 * Usage:
 *   node bin/add-throws-tags.js [--dry-run]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var DRY_RUN = process.argv.includes( '--dry-run' );

var ROOT = path.resolve( __dirname, '..' );

// Descriptions for the @throws annotations
var RANGE_ERROR_DESC = 'if a numerical argument does not satisfy constraints';
var TYPE_ERROR_DESC = 'if a string argument is not a valid option';

/**
 * Find all candidate JS lib files under lib/{blas,lapack}/base/<routine>/lib/<file>.js
 */
function findLibFiles( baseDir ) {
	var files = [];
	var packages = [ 'blas', 'lapack' ];

	for ( var pi = 0; pi < packages.length; pi++ ) {
		var pkg = packages[ pi ];
		var pkgDir = path.join( baseDir, 'lib', pkg, 'base' );
		var routines;
		try {
			routines = fs.readdirSync( pkgDir );
		} catch ( e ) {
			continue;
		}
		for ( var ri = 0; ri < routines.length; ri++ ) {
			var routine = routines[ ri ];
			var libDir = path.join( pkgDir, routine, 'lib' );
			var libFiles;
			try {
				libFiles = fs.readdirSync( libDir );
			} catch ( e ) {
				continue;
			}
			for ( var fi = 0; fi < libFiles.length; fi++ ) {
				var f = libFiles[ fi ];
				// Only process wrapper files (not index.js, main.js, base.js)
				if ( f.endsWith( '.js' ) &&
					f !== 'index.js' &&
					f !== 'main.js' &&
					f !== 'base.js' ) {
					files.push( path.join( libDir, f ) );
				}
			}
		}
	}
	return files;
}

/**
 * Detect JSDoc indentation prefix from existing @param / @returns lines.
 * Returns the whitespace prefix before the `*` (e.g. '' or ' ').
 */
function detectIndent( jsdocLines ) {
	for ( var i = 0; i < jsdocLines.length; i++ ) {
		var m = jsdocLines[ i ].match( /^(\s*)\* @(?:param|returns|throws)/ );
		if ( m ) {
			return m[ 1 ];
		}
	}
	// Fallback: any ' * ' line
	for ( var j = 0; j < jsdocLines.length; j++ ) {
		var m2 = jsdocLines[ j ].match( /^(\s*)\* / );
		if ( m2 ) {
			return m2[ 1 ];
		}
	}
	return '';
}

/**
 * Process a single file. Returns true if the file was (or would be) modified.
 */
function processFile( filePath ) {
	var content = fs.readFileSync( filePath, 'utf8' );
	var lines = content.split( '\n' );

	// Collect { at, newLines } — applied in reverse order
	var insertions = [];

	for ( var i = 0; i < lines.length; i++ ) {
		// Only match top-level function declarations (column 0)
		if ( !lines[ i ].startsWith( 'function ' ) ) {
			continue;
		}

		// Walk backwards past blank lines
		var j = i - 1;
		while ( j >= 0 && lines[ j ].trim() === '' ) {
			j--;
		}

		// Must end with */
		if ( j < 0 || !lines[ j ].trimEnd().endsWith( '*/' ) ) {
			continue;
		}
		var closeJ = j;

		// Walk backwards to opening /**
		while ( j >= 0 && !lines[ j ].trim().startsWith( '/**' ) ) {
			j--;
		}
		if ( j < 0 ) {
			continue;
		}
		var openJ = j;

		var jsdocLines = lines.slice( openJ, closeJ + 1 );

		// Skip JSDoc blocks with no @param or @returns (not a function JSDoc).
		// Note: some BLAS files embed @license inside the function JSDoc — those are valid.
		var hasFuncTags = jsdocLines.some( function( l ) { return /\* @(?:param|returns)/.test( l ); } );
		if ( !hasFuncTags ) {
			continue;
		}

		// Skip standalone license-only JSDoc (has @license but no @param/@returns)
		// — already excluded above. If it has both, treat it as a function JSDoc.

		// Check existing @throws in this JSDoc
		var hasRangeErrorThrows = jsdocLines.some( function( l ) {
			return /@throws\s*\{RangeError\}/.test( l );
		} );
		var hasTypeErrorThrows = jsdocLines.some( function( l ) {
			return /@throws\s*\{TypeError\}/.test( l );
		} );

		// Scan function body (from function line to EOF) for throw statements
		var bodyText = lines.slice( i ).join( '\n' );
		var throwsRangeError = /throw new RangeError/.test( bodyText );
		var throwsTypeError = /throw new TypeError/.test( bodyText );

		// Determine what is missing
		var needTypeError = throwsTypeError && !hasTypeErrorThrows;
		var needRangeError = throwsRangeError && !hasRangeErrorThrows;

		if ( !needTypeError && !needRangeError ) {
			continue;
		}

		// Detect indentation
		var indent = detectIndent( jsdocLines );

		// Build annotation lines (TypeError before RangeError by convention)
		var newAnnotations = [];
		if ( needTypeError ) {
			newAnnotations.push( indent + '* @throws {TypeError} ' + TYPE_ERROR_DESC );
		}
		if ( needRangeError ) {
			newAnnotations.push( indent + '* @throws {RangeError} ' + RANGE_ERROR_DESC );
		}

		// Find insertion point: before first @returns line, or before closing */
		var insertAt = closeJ;
		for ( var k = openJ; k <= closeJ; k++ ) {
			if ( /\* @returns/.test( lines[ k ] ) ) {
				insertAt = k;
				break;
			}
		}

		insertions.push( { at: insertAt, newLines: newAnnotations } );
	}

	if ( insertions.length === 0 ) {
		return false;
	}

	// Apply insertions in reverse order (to preserve indices)
	insertions.sort( function( a, b ) { return b.at - a.at; } );
	var result = lines.slice();
	for ( var ii = 0; ii < insertions.length; ii++ ) {
		var ins = insertions[ ii ];
		result.splice.apply( result, [ ins.at, 0 ].concat( ins.newLines ) );
	}

	var newContent = result.join( '\n' );
	if ( newContent === content ) {
		return false;
	}

	if ( !DRY_RUN ) {
		fs.writeFileSync( filePath, newContent, 'utf8' );
	}
	return true;
}

// Main
var files = findLibFiles( ROOT );
var modifiedCount = 0;
var checkedCount = 0;

for ( var i = 0; i < files.length; i++ ) {
	checkedCount++;
	var changed = processFile( files[ i ] );
	if ( changed ) {
		modifiedCount++;
		var shortPath = files[ i ].replace( ROOT + '/', '' );
		if ( DRY_RUN ) {
			console.log( '[dry-run] Would modify: ' + shortPath );
		} else {
			console.log( 'Modified: ' + shortPath );
		}
	}
}

console.log( '\nChecked ' + checkedCount + ' files. Modified ' + modifiedCount + ' files.' );
