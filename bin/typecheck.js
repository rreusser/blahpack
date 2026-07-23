#!/usr/bin/env node

/**
 * Type-check module public interfaces.
 *
 * For each module, compiles `docs/types/test.ts` against `docs/types/index.d.ts`
 * using the TypeScript compiler API, and interprets the stdlib-style magic
 * comments that assert the public interface:
 *
 *   expr; // $ExpectType T   -> `expr` must type-check AND have type `T`
 *   expr; // $ExpectError    -> `expr` must produce a compile error
 *
 * Any diagnostic on a line NOT marked `$ExpectError` is a failure, and any
 * `$ExpectError` line that produces no diagnostic is a failure. This is what
 * turns the committed `.d.ts` from decorative into asserted-correct.
 *
 * Usage:
 *   node bin/typecheck.js [--all | module-path...] [--json]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var ts = require( 'typescript' );
var util = require( './conformance/util.js' );

var ROOT = path.resolve( __dirname, '..' );

var COMPILER_OPTIONS = {
	'strict': true,
	'noEmit': true,
	'module': ts.ModuleKind.CommonJS,
	'moduleResolution': ts.ModuleResolutionKind.Node10,
	'target': ts.ScriptTarget.ES2015,
	'lib': [ 'lib.es2015.d.ts' ],
	'esModuleInterop': false,
	'skipLibCheck': false,
	'forceConsistentCasingInFileNames': true,
	'typeRoots': [ path.join( ROOT, 'node_modules', '@stdlib' ), path.join( ROOT, 'node_modules', '@types' ) ]
};


// HELPERS //

/**
 * Parse magic-comment directives out of a test.ts source.
 *
 * @param {string} text - source text
 * @returns {Object} map from 1-based line number to { kind, expected }
 */
function parseDirectives( text ) {
	var directives = {};
	var lines = text.split( /\r?\n/ );
	var i;
	var m;
	for ( i = 0; i < lines.length; i++ ) {
		m = /\/\/\s*\$ExpectType\s+(.+?)\s*$/.exec( lines[ i ] );
		if ( m ) {
			directives[ i + 1 ] = { 'kind': 'type', 'expected': m[ 1 ].trim() };
			continue;
		}
		if ( /\/\/\s*\$ExpectError\b/.test( lines[ i ] ) ) {
			directives[ i + 1 ] = { 'kind': 'error' };
		}
	}
	return directives;
}

/**
 * Return the 1-based line number for a source position.
 */
function lineOf( sourceFile, pos ) {
	return sourceFile.getLineAndCharacterOfPosition( pos ).line + 1;
}

/**
 * Normalize a printed type for comparison. TypeScript >=5.7 prints typed
 * arrays with an explicit buffer type argument (`Float64Array<ArrayBuffer>`);
 * the canonical stdlib `$ExpectType` form omits it. Strip that argument so the
 * two agree.
 */
function normalizeType( s ) {
	return s.replace( /\b((?:Float64|Float32|Int32|Int16|Int8|Uint32|Uint16|Uint8|Uint8Clamped|BigInt64|BigUint64)Array)<[^<>]*>/g, '$1' );
}

/**
 * Find the innermost expression whose statement ends on `line`, and return its
 * type string, or null if none found.
 */
function typeOnLine( sourceFile, checker, line ) {
	var found = null;
	function visit( node ) {
		if ( ts.isExpressionStatement( node ) ) {
			var endLine = lineOf( sourceFile, node.expression.getEnd() );
			if ( endLine === line ) {
				var type = checker.getTypeAtLocation( node.expression );
				found = checker.typeToString( type, node.expression, ts.TypeFormatFlags.NoTruncation );
			}
		}
		ts.forEachChild( node, visit );
	}
	visit( sourceFile );
	return found;
}


// MAIN //

/**
 * Process one test file's diagnostics + directives into a per-module result.
 *
 * @param {string} modDir - absolute module directory
 * @param {string} testFile - absolute path to docs/types/test.ts
 * @param {Object} program - shared ts.Program
 * @returns {Object} { module, ok, errors: [ { line, message } ] }
 */
function evaluate( modDir, testFile, program ) {
	var rel = path.relative( ROOT, modDir );
	var sourceFile = program.getSourceFile( testFile );
	var checker = program.getTypeChecker();

	var directives = parseDirectives( sourceFile.text );

	var diagnostics = []
		.concat( program.getSemanticDiagnostics( sourceFile ) )
		.concat( program.getSyntacticDiagnostics( sourceFile ) );

	var errors = [];
	var seenErrorLines = {};

	var i;
	var d;
	var line;
	for ( i = 0; i < diagnostics.length; i++ ) {
		d = diagnostics[ i ];
		if ( !d.file || d.file.fileName !== testFile ) {
			continue;
		}
		line = lineOf( d.file, d.start );
		seenErrorLines[ line ] = true;
		if ( directives[ line ] && directives[ line ].kind === 'error' ) {
			continue; // expected error; consume it
		}
		errors.push({
			'line': line,
			'message': ts.flattenDiagnosticMessageText( d.messageText, '\n' )
		});
	}

	Object.keys( directives ).forEach( function onDirective( k ) {
		var ln = parseInt( k, 10 );
		var dir = directives[ k ];
		if ( dir.kind === 'error' && !seenErrorLines[ ln ] ) {
			errors.push({ 'line': ln, 'message': 'expected a type error, but none occurred' });
			return;
		}
		if ( dir.kind === 'type' && !seenErrorLines[ ln ] ) {
			var actual = typeOnLine( sourceFile, checker, ln );
			if ( actual !== null && normalizeType( actual ) !== normalizeType( dir.expected ) ) {
				errors.push({ 'line': ln, 'message': 'expected type `' + dir.expected + '`, got `' + actual + '`' });
			}
		}
	});

	errors.sort( function byLine( a, b ) { return a.line - b.line; } );
	return { 'module': rel, 'ok': errors.length === 0, 'errors': errors };
}

/**
 * Type-check a batch of modules in a single shared program.
 *
 * Each `test.ts` is its own module scope, so a shared program is safe and
 * avoids re-parsing lib + @stdlib/types once per module.
 *
 * @param {Array<string>} modDirs - absolute module directories
 * @returns {Array<Object>} per-module results
 */
function checkModules( modDirs ) {
	var jobs = [];
	var missing = [];
	modDirs.forEach( function classify( modDir ) {
		var testFile = path.join( modDir, 'docs', 'types', 'test.ts' );
		var dtsFile = path.join( modDir, 'docs', 'types', 'index.d.ts' );
		if ( !fs.existsSync( testFile ) || !fs.existsSync( dtsFile ) ) {
			missing.push({ 'module': path.relative( ROOT, modDir ), 'ok': false, 'errors': [ { 'line': 0, 'message': 'missing docs/types/index.d.ts or test.ts' } ] });
			return;
		}
		jobs.push({ 'modDir': modDir, 'testFile': testFile });
	});

	if ( jobs.length === 0 ) {
		return missing;
	}
	var program = ts.createProgram( jobs.map( function root( j ) { return j.testFile; } ), COMPILER_OPTIONS );
	var results = jobs.map( function run( j ) { return evaluate( j.modDir, j.testFile, program ); } );
	return missing.concat( results );
}


function main() {
	var args = process.argv.slice( 2 );
	var json = args.indexOf( '--json' ) >= 0;
	var all = args.indexOf( '--all' ) >= 0;
	var modules = args.filter( function keep( a ) { return !a.startsWith( '-' ); } );

	var dirs;
	if ( all ) {
		dirs = util.discoverModules( 'all' ).map( function toDir( m ) { return m.dir; } );
	} else {
		dirs = modules.map( function toAbs( m ) { return path.resolve( ROOT, m ); } );
	}

	var results = checkModules( dirs );
	var failed = results.filter( function isFail( r ) { return !r.ok; } );

	if ( json ) {
		console.log( JSON.stringify({ 'total': results.length, 'failed': failed.length, 'results': failed }, null, 2 ) );
	} else {
		failed.forEach( function report( r ) {
			console.log( 'FAIL ' + r.module );
			r.errors.forEach( function line( e ) {
				console.log( '  test.ts:' + e.line + '  ' + e.message );
			});
		});
		console.log( '' );
		console.log( failed.length === 0 ?
			( 'OK: ' + results.length + ' module(s) type-check' ) :
			( failed.length + '/' + results.length + ' module(s) FAILED type-check' )
		);
	}
	process.exitCode = failed.length === 0 ? 0 : 1;
}


// EXPORTS //

module.exports = {
	'checkModules': checkModules,
	'COMPILER_OPTIONS': COMPILER_OPTIONS
};

if ( require.main === module ) {
	main();
}
