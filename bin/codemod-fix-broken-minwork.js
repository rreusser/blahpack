#!/usr/bin/env node
'use strict';

/**
 * Repair codemod: replace broken `var minWork = <malformed_expr>;` lines in
 * <routine>.js wrapper files with correctly extracted expressions.
 *
 * These broken lines were produced by codemod-work-autoalloc.js when it had
 * two bugs in extractSizeFromFortran:
 *   1. `.replace( /\s*[,!].*$/, '' )` stripped from commas, truncating
 *      `MAX(1, 8*N)` to `MAX(1` → `Math.max( 1;`
 *   2. Fortran prose ("N when NORM = 'I'...") passed to JS unmodified
 *
 * Strategy:
 *   1. Use node --check to identify .js files with syntax errors
 *   2. For each broken file, extract the correct minWork from Fortran source
 *      using the fixed extraction logic
 *   3. Replace the broken `var minWork = ...;` line in the null-check block
 *
 * Usage:
 *   node bin/codemod-fix-broken-minwork.js [--dry-run] [--all] [module-paths...]
 */

var path = require( 'path' );
var fs = require( 'fs' );
var childProcess = require( 'child_process' );
var util = require( './gate/util.js' );

var ROOT = util.ROOT;
var WORK_ARGS = util.FORTRAN_WORK_ARGS;

var argv = process.argv.slice( 2 );
var dryRun = argv.indexOf( '--dry-run' ) !== -1;
var doAll = argv.indexOf( '--all' ) !== -1;
var modulePaths = argv.filter( function( a ) { return !a.startsWith( '--' ); } );

var stats = { fixed: 0, skipped: 0, errors: 0, unchanged: 0 };


// FORTRAN HELPERS (fixed versions) //

function fortranExprToJS( s ) {
	s = s.trim();
	s = s.replace( /\b[Mm][Aa][Xx]\s*\(/g, 'Math.max( ' );
	s = s.replace( /\b[Mm][Ii][Nn]\s*\(/g, 'Math.min( ' );
	s = s.replace( /\*/g, ' * ' ).replace( /\+/g, ' + ' ).replace( /-/g, ' - ' );
	s = s.replace( /\s{2,}/g, ' ' ).trim();
	return s;
}

/**
 * Extract balanced-paren content starting at `pos` (the opening `(`).
 * Returns the string inside the outermost parens, or null on failure.
 */
function extractBalanced( s, pos ) {
	if ( s[ pos ] !== '(' ) return null;
	var depth = 0;
	var i;
	for ( i = pos; i < s.length; i++ ) {
		if ( s[ i ] === '(' ) depth++;
		else if ( s[ i ] === ')' ) {
			depth--;
			if ( depth === 0 ) return s.slice( pos + 1, i );
		}
	}
	return null;
}

/**
 * Clean a Fortran expression fragment: strip ! comments, trailing period or
 * semicolon, and handle "N when NORM = ..." prose by taking only the part
 * before "when".
 */
/**
 * Extract the first complete mathematical expression from a Fortran string.
 * Stops at English prose that follows the expression (e.g., ", and for best
 * performance" or "where NB is the block size"). Handles nested parens.
 */
function cleanFortranExpr( expr ) {
	expr = expr.trim()
		.replace( /\s*!.*$/, '' )  // strip Fortran ! inline comments
		.replace( /[.;]\s*$/, '' ) // strip trailing period or semicolon
		.trim();

	// Fortran conditional prose: "N when NORM = '...'..." → "N"
	if ( / when /i.test( expr ) ) {
		expr = expr.replace( / when .*/i, '' ).trim();
	}

	// Walk paren-aware to strip trailing prose like ", and for best performance"
	// or "where NB is..." that follows the mathematical expression. Prose words
	// (and/or/where/if/for/when) cannot appear as Fortran variable names in size
	// expressions, so matching them after [,\s]+ is safe at any paren depth.
	//
	// Handles two tricky cases:
	//   - depth > 0 when prose is found: Fortran comment omits closing parens
	//     (e.g. "LWORK >= MAX(1, 2*NBA * MAX(NBA, MIN(NRHS, 32)), where").
	//     We stop at the prose and add the missing ')' chars.
	//   - trailing ',' with no prose: Fortran continuation comma
	//     (e.g. "LWORK >= NBLOCAL * MAX(NBLOCAL,(N-NBLOCAL)),")
	//     Stripped by the final replace at the end.
	var depth = 0;
	var i;
	var ch;
	var started = false;
	var stopIdx = -1;
	var stopDepth = 0;
	for ( i = 0; i < expr.length; i++ ) {
		ch = expr[ i ];
		if ( ch === '(' ) { depth++; started = true; }
		else if ( ch === ')' ) { depth--; }
		else { started = true; }

		if ( started && i + 1 < expr.length ) {
			var rest = expr.slice( i + 1 );
			// ", word" or " word" where word is English prose → stop
			if ( /^[,\s]+(and|or|where|if|for|when)\b/i.test( rest ) ) {
				stopIdx = i + 1;
				stopDepth = depth;
				break;
			}
		}
	}

	if ( stopIdx !== -1 ) {
		expr = expr.slice( 0, stopIdx ).trim();
		// Close any parens that were still open when prose was encountered
		if ( stopDepth > 0 ) {
			expr += ')'.repeat( stopDepth );
		}
	}

	// Strip trailing Fortran continuation comma or whitespace
	expr = expr.replace( /[,\s]+$/, '' );

	return expr;
}

/**
 * Extract the minimum workspace size from Fortran source comments.
 * Fixed version:
 *   - only strips Fortran ! comments (not commas)
 *   - handles prose like "N when NORM = 'I'..."
 *   - uses balanced-paren extraction for `dimension(...)` so nested
 *     expressions like `max(1,2*N-2)` are captured correctly
 */
function extractSizeFromFortran( fortran, workArg, lenArg, varName ) {
	var lines = fortran.split( '\n' );
	var lenRe = new RegExp( '\\b' + lenArg + '\\s*>=\\s*(.+)', 'i' );
	var dimSearchRe = new RegExp( '\\b' + workArg + '\\b.*\\bdimension\\s*\\(', 'i' );
	var m;
	var expr;
	var dimPos;
	var i;

	// Pattern 1: LWORK >= expr (or "where LWORK >= expr")
	for ( i = 0; i < lines.length; i++ ) {
		m = lenRe.exec( lines[ i ] );
		if ( m ) {
			expr = cleanFortranExpr( m[ 1 ] );
			if ( expr ) {
				return fortranExprToJS( expr );
			}
		}
	}

	// Pattern 2: dimension(expr) inline — for workspace args without length param
	// Uses balanced-paren extraction to handle nested MAX()/MIN() in the dimension.
	for ( i = 0; i < lines.length; i++ ) {
		if ( !dimSearchRe.test( lines[ i ] ) ) continue;
		dimPos = lines[ i ].indexOf( 'dimension' );
		if ( dimPos === -1 ) continue;
		dimPos = lines[ i ].indexOf( '(', dimPos );
		if ( dimPos === -1 ) continue;
		expr = extractBalanced( lines[ i ], dimPos );
		if ( !expr ) continue;
		expr = cleanFortranExpr( expr );
		if ( expr && expr !== '*' ) {
			return 'Math.max( 1, ' + fortranExprToJS( expr ) + ' )';
		}
	}

	return null;
}

/**
 * Returns true if the file has a syntax error (node --check fails).
 */
function hasSyntaxError( filePath ) {
	var result = childProcess.spawnSync(
		process.execPath,
		[ '--check', filePath ],
		{ encoding: 'utf8', timeout: 10000 }
	);
	return result.status !== 0;
}

/**
 * Identify which var name(s) have broken `var <name> = <broken>;` lines.
 * Looks for lines inside null-check blocks that are syntactically the minWork
 * declarations and match known broken patterns.
 */
var BROKEN_PATTERNS = [
	/^var\s+(\w+)\s*=\s*max\s*\(\s*1\s*;/,                      // max(1;
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1\s*;/,                 // Math.max( 1;
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1\s*,\s*max\s*\(/,      // Math.max(1,max(...
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1,\s*Math\.max\s*\(\s*1,/, // Math.max(1,Math.max(1,...
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1,\s*\d+\s*\*\s*\w+\s*\(/, // Math.max(1,N*func(... unbalanced
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1,\s*\d+\s*\*\s*[a-z]+\s*\(/i, // Math.max(1,5*min(...
	/^var\s+(\w+)\s*=\s*.+\bwhen\b/,                              // N when NORM = ...
	/^var\s+(\w+)\s*=\s*[^;]+\.\s*;/,                            // M.; or N*NB.; etc.
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1,\s*Math\.max\s*\(\s*1,LWORK\s*\)/, // Math.max(1,Math.max(1,LWORK))
	/^var\s+(\w+)\s*=\s*NBLOCAL/,                                 // NBLOCAL * Math.max(...
	/^var\s+(\w+)\s*=\s*\d+\s+when\b/,                           // 1 when N <= 1
	/^var\s+(\w+)\s*=\s*Math\.max\s*\(\s*1,\s*\d+\s*\*\s*\(/,   // Math.max( 1, 2 * (N - 1 )  unbalanced
];

function findBrokenMinWork( content ) {
	var lines = content.split( '\n' );
	var broken = [];
	var i;
	var j;
	var line;
	var m;

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ].trim();
		for ( j = 0; j < BROKEN_PATTERNS.length; j++ ) {
			m = BROKEN_PATTERNS[ j ].exec( line );
			if ( m ) {
				broken.push({ lineIdx: i, varName: m[ 1 ], line: lines[ i ] });
				break;
			}
		}
	}
	return broken;
}

/**
 * Replace a broken minWork line with the correct expression.
 * Preserves indentation of the original line.
 */
function repairLine( originalLine, newExpr ) {
	var indent = originalLine.match( /^(\s*)/ )[ 1 ];
	var varMatch = originalLine.trim().match( /^var\s+(\w+)\s*=/ );
	if ( !varMatch ) return null;
	return indent + 'var ' + varMatch[ 1 ] + ' = ' + newExpr + ';';
}

function processModule( mod ) {
	var wrapperPath = path.join( mod.dir, 'lib', mod.routine + '.js' );

	if ( !fs.existsSync( wrapperPath ) ) {
		stats.skipped++;
		return;
	}

	if ( !hasSyntaxError( wrapperPath ) ) {
		stats.unchanged++;
		return;
	}

	var fortran = util.readFortran( mod.routine );
	if ( !fortran ) {
		console.log( 'SKIP (no Fortran): ' + mod.routine );
		stats.skipped++;
		return;
	}

	var fArgs = util.fortranArgs( fortran, mod.routine );
	var workArgs = fArgs.filter( function( a ) { return WORK_ARGS.indexOf( a ) !== -1; } );

	var META = {
		WORK:  { lenArg: 'LWORK',  varName: 'minWork'  },
		RWORK: { lenArg: 'LRWORK', varName: 'minRwork' },
		IWORK: { lenArg: 'LIWORK', varName: 'minIwork' },
		SWORK: { lenArg: 'LWORK',  varName: 'minWork'  },
		BWORK: { lenArg: 'LWORK',  varName: 'minBwork' }
	};

	var wrapperContent = fs.readFileSync( wrapperPath, 'utf8' );
	var broken = findBrokenMinWork( wrapperContent );

	if ( broken.length === 0 ) {
		// Syntax error but no recognizable broken minWork pattern — skip
		console.log( 'SKIP (unrecognized error): ' + mod.routine );
		stats.skipped++;
		return;
	}

	var lines = wrapperContent.split( '\n' );
	var changed = false;
	var i;
	var b;
	var w;
	var meta;
	var newExpr;
	var newLine;

	for ( i = 0; i < broken.length; i++ ) {
		b = broken[ i ];
		// Figure out which workspace arg this var belongs to
		meta = null;
		for ( w in META ) {
			if ( META[ w ].varName === b.varName ) {
				meta = { workArg: w, lenArg: META[ w ].lenArg, varName: b.varName };
				break;
			}
		}
		if ( !meta ) {
			// Try to infer from workArgs
			if ( workArgs.length > 0 ) {
				w = workArgs[ 0 ];
				meta = { workArg: w, lenArg: ( META[ w ] || META.WORK ).lenArg, varName: b.varName };
			}
		}
		if ( !meta ) {
			console.log( 'SKIP (cannot map ' + b.varName + ' to workspace arg): ' + mod.routine );
			continue;
		}

		newExpr = extractSizeFromFortran( fortran, meta.workArg, meta.lenArg, meta.varName );
		if ( !newExpr ) {
			console.log( 'SKIP (no formula found for ' + b.varName + '): ' + mod.routine );
			continue;
		}

		newLine = repairLine( b.line, newExpr );
		if ( !newLine ) continue;

		lines[ b.lineIdx ] = newLine;
		changed = true;
		console.log( 'FIX ' + mod.routine + '/' + mod.routine + '.js:' + ( b.lineIdx + 1 ) );
		console.log( '  WAS: ' + b.line.trim() );
		console.log( '  NOW: ' + newLine.trim() );
	}

	if ( !changed ) {
		stats.skipped++;
		return;
	}

	var newContent = lines.join( '\n' );

	// Verify the fix produces valid syntax:
	var checkResult = childProcess.spawnSync(
		process.execPath,
		[ '--input-type=module', '--check' ],
		{ input: newContent, encoding: 'utf8', timeout: 10000 }
	);

	if ( checkResult.status !== 0 ) {
		console.log( 'WARN: fix did not resolve syntax error in ' + mod.routine + ' — skipping write' );
		console.log( checkResult.stderr );
		stats.errors++;
		return;
	}

	if ( dryRun ) {
		console.log( '  [dry-run] would write ' + wrapperPath );
	} else {
		fs.writeFileSync( wrapperPath, newContent, 'utf8' );
	}
	stats.fixed++;
}


// MODULE DISCOVERY //

function discoverModules() {
	var libDir = path.join( ROOT, 'lib' );
	var packages = [];
	var dirs;
	var subDirs;
	var pkgDir;
	var routineDir;
	var pkgName;
	var routineName;
	var i;
	var j;

	if ( !fs.existsSync( libDir ) ) return [];

	dirs = fs.readdirSync( libDir );
	for ( i = 0; i < dirs.length; i++ ) {
		pkgDir = path.join( libDir, dirs[ i ], 'base' );
		if ( !fs.existsSync( pkgDir ) ) continue;
		pkgName = dirs[ i ];
		subDirs = fs.readdirSync( pkgDir );
		for ( j = 0; j < subDirs.length; j++ ) {
			routineDir = path.join( pkgDir, subDirs[ j ] );
			if ( !fs.statSync( routineDir ).isDirectory() ) continue;
			routineName = subDirs[ j ];
			packages.push({
				dir: routineDir,
				pkg: pkgName + '/base/' + routineName,
				routine: routineName
			});
		}
	}
	return packages;
}

function resolveModules() {
	if ( doAll ) {
		return discoverModules();
	}
	return modulePaths.map( function( p ) {
		var absDir = path.isAbsolute( p ) ? p : path.join( ROOT, p );
		var parts = absDir.replace( ROOT + path.sep, '' ).split( path.sep );
		var routine = parts[ parts.length - 1 ];
		return { dir: absDir, pkg: parts.slice( 0, -1 ).join( '/' ) + '/' + routine, routine: routine };
	});
}


// RUN //

var modules = resolveModules();
if ( modules.length === 0 ) {
	console.error( 'Usage: node bin/codemod-fix-broken-minwork.js [--dry-run] [--all] [module-paths...]' );
	process.exit( 1 );
}

modules.forEach( processModule );

console.log( '\nDone: fixed=' + stats.fixed + ' skipped=' + stats.skipped + ' unchanged=' + stats.unchanged + ' errors=' + stats.errors );
