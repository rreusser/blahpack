#!/usr/bin/env node

// Codemod: hoist var declarations to the top of each function body.
//
// Fixes no-use-before-define by splitting `var x = expr;` into
// `var x;` at the top and `x = expr;` at the original position.
//
// Within each function, var declarations are reordered by name length
// (longest first) per stdlib/vars-order.
//
// Usage:
//   node bin/codemod-hoist-vars.js lib/blas/base/dcopy/test/test.js
//   node bin/codemod-hoist-vars.js --dry-run lib/blas/base/{name}/test/test.js

'use strict';

var esprima = require( 'esprima' );
var fs = require( 'fs' );

var dryRun = false;
var files = [];
var i;

for ( i = 2; i < process.argv.length; i++ ) {
	if ( process.argv[ i ] === '--dry-run' ) {
		dryRun = true;
	} else {
		files.push( process.argv[ i ] );
	}
}

if ( files.length === 0 ) {
	process.stderr.write(
		'Usage: node bin/codemod-hoist-vars.js [--dry-run] <files...>\n'
	);
	process.exit( 1 );
}

// For each function body in the source, collect all var declarations,
// move them to the top of the body (sorted by name length desc),
// and replace original declarations with assignments.
function hoistVars( src ) {
	var ast;
	try {
		ast = esprima.parseScript( src, {
			range: true,
			comment: true,
			loc: true
		});
	} catch ( e ) {
		process.stderr.write( 'Parse error: ' + e.message + '\n' );
		return src;
	}

	// Collect function bodies
	var edits = [];

	function visitFunction( body, bodyRange ) {
		if ( !body || body.length === 0 ) {
			return;
		}

		// Find all VariableDeclaration nodes at the top level of this body
		var decls = [];
		var otherStart = -1;
		var lastDeclEnd = -1;
		var seenNonDecl = false;
		var needsHoist = false;
		var j;
		var k;
		var stmt;
		var declarator;

		for ( j = 0; j < body.length; j++ ) {
			stmt = body[ j ];
			if ( stmt.type === 'VariableDeclaration' ) {
				if ( seenNonDecl ) {
					needsHoist = true;
				}
				for ( k = 0; k < stmt.declarations.length; k++ ) {
					declarator = stmt.declarations[ k ];
					decls.push({
						name: declarator.id.name,
						hasInit: declarator.init !== null,
						initRange: declarator.init ?
							[ declarator.init.range[0], declarator.init.range[1] ] :
							null,
						fullRange: stmt.range,
						stmtIdx: j
					});
				}
				lastDeclEnd = stmt.range[1];
			} else {
				if ( !seenNonDecl ) {
					otherStart = j;
				}
				seenNonDecl = true;
			}
		}

		if ( !needsHoist || decls.length === 0 ) {
			return;
		}

		edits.push({
			body: body,
			decls: decls,
			bodyRange: bodyRange
		});
	}

	function walk( node ) {
		if ( !node || typeof node !== 'object' ) {
			return;
		}
		if ( node.type === 'FunctionDeclaration' ||
			node.type === 'FunctionExpression' ||
			node.type === 'ArrowFunctionExpression' ) {
			if ( node.body && node.body.type === 'BlockStatement' ) {
				visitFunction( node.body.body, node.body.range );
			}
		}
		var keys = Object.keys( node );
		var m;
		var child;
		for ( m = 0; m < keys.length; m++ ) {
			child = node[ keys[m] ];
			if ( Array.isArray( child ) ) {
				child.forEach( walk );
			} else if ( child && typeof child === 'object' && child.type ) {
				walk( child );
			}
		}
	}

	walk( ast );

	if ( edits.length === 0 ) {
		return src;
	}

	// Apply edits from bottom to top (so ranges stay valid)
	edits.sort( function cmp( a, b ) {
		return b.bodyRange[0] - a.bodyRange[0];
	});

	edits.forEach( function applyEdit( edit ) {
		var bodyStr = src.substring( edit.bodyRange[0], edit.bodyRange[1] );
		var bodyOffset = edit.bodyRange[0];

		// Figure out indentation from first statement
		var firstStmt = edit.body[0];
		var lineStart = src.lastIndexOf( '\n', firstStmt.range[0] ) + 1;
		var indent = '';
		while ( lineStart + indent.length < firstStmt.range[0] &&
			( src[ lineStart + indent.length ] === '\t' ||
			  src[ lineStart + indent.length ] === ' ' ) ) {
			indent += src[ lineStart + indent.length ];
		}

		// Group declarations: those already at the top (before any non-decl)
		// vs those that need hoisting
		var topDecls = [];
		var hoistDecls = [];
		var seenNonDecl2 = false;
		var n;

		for ( n = 0; n < edit.body.length; n++ ) {
			if ( edit.body[n].type !== 'VariableDeclaration' ) {
				seenNonDecl2 = true;
			}
		}

		// Collect all var names and which ones have initializers that need
		// to become assignments
		var allNames = [];
		var replacements = []; // ranges to replace in src

		edit.decls.forEach( function collectDecl( d ) {
			allNames.push( d.name );
			if ( d.hasInit ) {
				// Replace `var x = expr;` with `x = expr;`
				replacements.push({
					range: d.fullRange,
					replacement: indent + d.name + ' = ' +
						src.substring( d.initRange[0], d.initRange[1] ) + ';'
				});
			} else {
				// Remove `var x;` entirely (will be in hoisted block)
				replacements.push({
					range: d.fullRange,
					replacement: null // Remove
				});
			}
		});

		// Sort names by length descending (vars-order)
		allNames.sort( function cmp( a, b ) {
			return b.length - a.length;
		});

		// Deduplicate
		var seen = {};
		var uniqueNames = [];
		allNames.forEach( function dedup( name ) {
			if ( !seen[ name ] ) {
				seen[ name ] = true;
				uniqueNames.push( name );
			}
		});

		// Build hoisted var block
		var hoistBlock = uniqueNames.map( function fmtVar( name ) {
			return indent + 'var ' + name + ';';
		}).join( '\n' );

		// Apply replacements from bottom to top within the body
		replacements.sort( function cmp( a, b ) {
			return b.range[0] - a.range[0];
		});

		var result = src;
		replacements.forEach( function applyReplacement( r ) {
			if ( r.replacement === null ) {
				// Remove the line entirely (including trailing newline)
				var start = r.range[0];
				var end = r.range[1];

				// Extend to remove the full line (leading whitespace + trailing newline)
				var ls = result.lastIndexOf( '\n', start - 1 );
				if ( ls !== -1 ) {
					start = ls;
				}
				if ( result[ end ] === '\n' ) {
					end += 1;
				}
				result = result.substring( 0, start ) +
					result.substring( end );
			} else {
				// Find the full line and replace it
				var lineS = result.lastIndexOf( '\n', r.range[0] - 1 );
				var lineE = result.indexOf( '\n', r.range[1] );
				if ( lineS === -1 ) {
					lineS = 0;
				}
				if ( lineE === -1 ) {
					lineE = result.length;
				}
				result = result.substring( 0, lineS + 1 ) +
					r.replacement + '\n' +
					result.substring( lineE + 1 );
			}
		});

		// Now insert the hoisted var block at the top of the function body
		// Find the opening { of the body
		var openBrace = edit.bodyRange[0];
		var insertAfter = openBrace + 1;

		// Skip the newline after {
		if ( result[ insertAfter ] === '\n' ) {
			insertAfter += 1;
		}

		// Check if there are already var declarations at the top
		// If so, replace them; otherwise insert
		var firstLine = result.substring( insertAfter,
			result.indexOf( '\n', insertAfter ) );
		if ( /^\s*var\s/.test( firstLine ) ) {
			// Find the end of existing var block
			var pos = insertAfter;
			while ( pos < result.length ) {
				var nl = result.indexOf( '\n', pos );
				if ( nl === -1 ) break;
				var nextLine = result.substring( nl + 1,
					result.indexOf( '\n', nl + 1 ) );
				if ( !/^\s*var\s/.test( nextLine ) ) {
					// Insert after this last var line
					result = result.substring( 0, pos ) +
						hoistBlock + '\n' +
						result.substring( nl + 1 );
					break;
				}
				pos = nl + 1;
			}
		} else {
			result = result.substring( 0, insertAfter ) +
				hoistBlock + '\n\n' +
				result.substring( insertAfter );
		}

		src = result;
	});

	return src;
}

var changed = 0;

files.forEach( function processFile( file ) {
	if ( !fs.existsSync( file ) ) {
		return;
	}
	var src = fs.readFileSync( file, 'utf8' );
	var result = hoistVars( src );

	if ( result !== src ) {
		changed += 1;
		if ( dryRun ) {
			process.stdout.write( 'WOULD FIX: ' + file + '\n' );
		} else {
			fs.writeFileSync( file, result, 'utf8' );
			process.stdout.write( 'FIXED: ' + file + '\n' );
		}
	} else {
		process.stdout.write( 'OK: ' + file + '\n' );
	}
});

process.stdout.write( '\n' + changed + ' files ' +
	( dryRun ? 'would be ' : '' ) + 'changed\n' );
