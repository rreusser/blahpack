'use strict';

// Shared helpers for the spec codemods (bin/codemod-spec/*.cjs): module
// discovery, parsing, the exported function of a file, and text edits.

var fs = require( 'fs' );
var path = require( 'path' );
var espree = require( 'espree' );
var eslintScope = require( 'eslint-scope' );

var ROOT = path.join( __dirname, '..', '..' );

// Every module: { routine, pkg, dir (…/lib), files: { base, ndarray, strided } }.
function modules( only ) {
	var out = [];
	fs.readdirSync( path.join( ROOT, 'lib' ) ).forEach( function each( pkg ) {
		var bdir = path.join( ROOT, 'lib', pkg, 'base' );
		if ( !fs.existsSync( bdir ) ) {
			return;
		}
		fs.readdirSync( bdir ).forEach( function each( r ) {
			var dir = path.join( bdir, r, 'lib' );
			if ( !fs.existsSync( path.join( dir, 'base.js' ) ) ) {
				return;
			}
			if ( only && only.length && only.indexOf( r ) < 0 ) {
				return;
			}
			out.push({
				'routine': r,
				'pkg': pkg,
				'dir': dir,
				'files': {
					'base': path.join( dir, 'base.js' ),
					'ndarray': path.join( dir, 'ndarray.js' ),
					'strided': path.join( dir, r + '.js' )
				}
			});
		});
	});
	return out.sort( function s( a, b ) {
		return a.routine < b.routine ? -1 : 1;
	});
}

function parse( src ) {
	return espree.parse( src, {
		'ecmaVersion': 2022,
		'sourceType': 'module',
		'range': true,
		'loc': true,
		'comment': true,
		'tokens': true
	});
}

// The FunctionDeclaration a module default-exports (`export default name`).
function exported( ast ) {
	var name = null;
	var fn = null;
	ast.body.forEach( function each( n ) {
		if ( n.type === 'ExportDefaultDeclaration' ) {
			if ( n.declaration.type === 'Identifier' ) {
				name = n.declaration.name;
			} else if ( n.declaration.type === 'FunctionDeclaration' ) {
				fn = n.declaration;
			}
		}
	});
	if ( !fn && name ) {
		ast.body.forEach( function each( n ) {
			if ( n.type === 'FunctionDeclaration' && n.id && n.id.name === name ) {
				fn = n;
			}
		});
	}
	return fn;
}

function params( fn ) {
	return fn.params.map( function m( p ) {
		return p.type === 'Identifier' ? p.name : null;
	});
}

// The JSDoc block comment directly before a node.
function leadingJSDoc( ast, node ) {
	var best = null;
	ast.comments.forEach( function each( c ) {
		if ( c.type === 'Block' && c.value.charAt( 0 ) === '*' && c.range[ 1 ] <= node.range[ 0 ] ) {
			if ( !best || c.range[ 1 ] > best.range[ 1 ] ) {
				best = c;
			}
		}
	});
	return best;
}

function scopeManager( ast ) {
	return eslintScope.analyze( ast, { 'ecmaVersion': 2022, 'sourceType': 'module' } );
}

// Apply [ { start, end, text } ] edits (non-overlapping) to src.
function applyEdits( src, edits ) {
	edits.sort( function s( a, b ) {
		return b.start - a.start;
	});
	edits.forEach( function each( e ) {
		src = src.slice( 0, e.start ) + e.text + src.slice( e.end );
	});
	return src;
}

module.exports = {
	'ROOT': ROOT,
	'modules': modules,
	'parse': parse,
	'exported': exported,
	'params': params,
	'leadingJSDoc': leadingJSDoc,
	'scopeManager': scopeManager,
	'applyEdits': applyEdits
};
