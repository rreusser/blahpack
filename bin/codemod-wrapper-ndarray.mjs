#!/usr/bin/env node

/**
* Codemod (ticket 0077; CONVENTIONS D5c): a layout wrapper (`<routine>.js`)
* whose routine takes a workspace calls `ndarray.js`, not `base.js`, so the
* checks ndarray.js makes (workspace minimum, stride rules) apply to a
* caller's workspace passed through the wrapper too. Enforced by the lint
* rule `wrapper-calls-ndarray`.
*
* For each wrapper that imports `./base.js` and whose spec has a param of role
* `workspace`: when ndarray.js's parameter list equals base.js's, replace
* `import base from './base.js';` with `import ndarray from './ndarray.js';`
* and every `base(` call with `ndarray(`. Anything else is listed for
* hand-handling (`--list` prints the reason).
*
* Usage:
*   node bin/codemod-wrapper-ndarray.mjs [--dry-run] [--list] [routine ...]
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as espree from 'espree';

const require = createRequire( import.meta.url );
const specLib = require( '../lint/lib/spec.cjs' );
const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];

function parse( src ) {
	return espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true } );
}

// Parameter names of the default-exported function of a file.
function exportedParams( file ) {
	const ast = parse( fs.readFileSync( file, 'utf8' ) );
	let name = null;
	let fn = null;
	ast.body.forEach( ( n ) => {
		if ( n.type === 'ExportDefaultDeclaration' ) {
			if ( n.declaration.type === 'Identifier' ) {
				name = n.declaration.name;
			} else if ( n.declaration.type === 'FunctionDeclaration' ) {
				fn = n.declaration;
			}
		}
	});
	if ( !fn && name ) {
		fn = ast.body.find( ( n ) => n.type === 'FunctionDeclaration' && n.id && n.id.name === name ) || null;
	}
	return fn ? fn.params.map( ( p ) => ( ( p.type === 'Identifier' ) ? p.name : '?' ) ) : null;
}

function modules( only ) {
	const out = [];
	PKGS.forEach( ( pkg ) => {
		const dir = path.join( ROOT, 'lib', pkg );
		if ( !fs.existsSync( dir ) ) {
			return;
		}
		fs.readdirSync( dir ).sort().forEach( ( r ) => {
			if ( only.length && !only.includes( r ) ) {
				return;
			}
			const w = path.join( dir, r, 'lib', r + '.js' );
			if ( fs.existsSync( w ) ) {
				out.push( { 'routine': r, 'dir': path.join( dir, r ), 'wrapper': w } );
			}
		});
	});
	return out;
}

function hasWorkspace( spec ) {
	return !!spec && spec.params.some( ( p ) => p.role === 'workspace' );
}

// The `import base from './base.js';` declaration and every call `base( … )`.
function sites( src ) {
	const ast = parse( src );
	const imp = ast.body.find( ( n ) => n.type === 'ImportDeclaration' && n.source.value === './base.js' );
	if ( !imp ) {
		return null;
	}
	const def = imp.specifiers.find( ( s ) => s.type === 'ImportDefaultSpecifier' );
	const local = def ? def.local.name : null;
	const calls = [];
	const refs = [];
	( function walk( node, parent ) {
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( node.type === 'Identifier' && node.name === local && parent && parent.type !== 'ImportDefaultSpecifier' ) {
			if ( parent.type === 'CallExpression' && parent.callee === node ) {
				calls.push( node );
			} else {
				refs.push( node );
			}
		}
		for ( const k of Object.keys( node ) ) {
			if ( k === 'parent' ) {
				continue;
			}
			const v = node[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( ( c ) => walk( c, node ) );
			} else if ( v && typeof v.type === 'string' ) {
				walk( v, node );
			}
		}
	})( ast, null );
	return { 'imp': imp, 'local': local, 'calls': calls, 'refs': refs, 'ast': ast };
}

function main() {
	const argv = process.argv.slice( 2 );
	const dry = argv.includes( '--dry-run' );
	const list = argv.includes( '--list' );
	const only = argv.filter( ( a ) => !a.startsWith( '--' ) );
	let changed = 0;
	const manual = [];
	modules( only ).forEach( ( m ) => {
		const spec = specLib.load( m.routine );
		if ( !hasWorkspace( spec ) ) {
			return;
		}
		const src = fs.readFileSync( m.wrapper, 'utf8' );
		const s = sites( src );
		if ( !s ) {
			return;
		}
		const why = [];
		if ( s.local !== 'base' || s.imp.specifiers.some( ( x ) => x.type === 'ImportNamespaceSpecifier' ) ) {
			why.push( 'base.js import has no default `base` (or is a namespace import)' );
		}
		if ( s.refs.length ) {
			why.push( '`base` used other than as a call' );
		}
		if ( s.calls.length === 0 ) {
			why.push( 'no `base(` call' );
		}
		if ( /\bndarray\b/.test( src.replace( /^\s*\*.*$/gm, '' ).replace( /\/\/.*$/gm, '' ) ) ) {
			why.push( 'the name `ndarray` is already used' );
		}
		const bp = exportedParams( path.join( m.dir, 'lib', 'base.js' ) );
		const np = exportedParams( path.join( m.dir, 'lib', 'ndarray.js' ) );
		if ( !bp || !np || bp.join( ',' ).toLowerCase() !== np.join( ',' ).toLowerCase() ) {
			why.push( 'ndarray.js parameters (' + ( np || [] ).join( ', ' ) + ') differ from base.js (' + ( bp || [] ).join( ', ' ) + ')' );
		}
		if ( why.length ) {
			manual.push( { 'routine': m.routine, 'why': why } );
			return;
		}
		// Replace from the end so earlier ranges stay valid.
		// Named helpers base.js exports (computeOptimalWorkSize) stay imported.
		const named = s.imp.specifiers.filter( ( x ) => x.type === 'ImportSpecifier' ).map( ( x ) => src.slice( x.range[ 0 ], x.range[ 1 ] ) );
		const text = 'import ndarray from \'./ndarray.js\';' + ( named.length ? '\nimport { ' + named.join( ', ' ) + ' } from \'./base.js\';' : '' );
		const edits = [ { 'range': s.imp.range, 'text': text } ].concat( s.calls.map( ( c ) => ( { 'range': c.range, 'text': 'ndarray' } ) ) );
		edits.sort( ( a, b ) => b.range[ 0 ] - a.range[ 0 ] );
		let out = src;
		edits.forEach( ( e ) => {
			out = out.slice( 0, e.range[ 0 ] ) + e.text + out.slice( e.range[ 1 ] );
		});
		changed += 1;
		if ( !dry ) {
			fs.writeFileSync( m.wrapper, out );
		}
	});
	console.log( ( dry ? 'would change ' : 'changed ' ) + changed + ' wrappers; ' + manual.length + ' need hand-handling' );
	if ( list ) {
		manual.forEach( ( x ) => console.log( '  ' + x.routine + ': ' + x.why.join( '; ' ) ) );
	}
}

main();
