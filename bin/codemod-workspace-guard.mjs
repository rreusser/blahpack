#!/usr/bin/env node

/**
* Codemod (ticket 0107; CONVENTIONS W3): insert into `ndarray.js` the length
* guard of every workspace whose minimum the spec knows (a param of role
* `workspace` with a non-null `minLength.js`) and that has no guard yet.
* Enforced by the lint rule `workspace-length-guard`.
*
* The guard is the spec's `minLength.js` (an expression in the base.js
* param names; `max`/`min` become `Math.max`/`Math.min` unless the file
* imports `max`/`min`), in the style of the existing WORK guards:
*
*   const minRWork = N;
*   if ( !RWORK || ( RWORK.length - offsetRWork ) < minRWork ) {
*       throw new RangeError( format( 'invalid argument. RWORK array must have at least %d elements from offset %d. Provided length: %d.', minRWork, offsetRWork, ( RWORK ) ? RWORK.length : 0 ) );
*   }
*
* (the message is the one the wrapper replay's `min-work`/`short-work`
* variants parse, test/harness/replay.js). It goes immediately before the
* top-level statement that calls `base`, so after every validation check and
* every quick return (a zero-dimension quick return comes before the
* workspace checks, W3). A `@throws {RangeError}` tag is added after the
* function's last `@throws` (or before `@returns`).
*
* `format` is imported where the file does not yet. A module the codemod
* cannot handle (an expression
* naming something that is not a parameter, a name clash, no base call) is
* listed and left alone.
*
* Usage:
*   node bin/codemod-workspace-guard.mjs [--dry-run] [routine ...]
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
	return espree.parse( src, { 'ecmaVersion': 2022, 'sourceType': 'module', 'range': true, 'loc': true } );
}

function exportedFunction( ast ) {
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
	return fn;
}

// Whether `node`'s subtree satisfies `pred`.
function some( node, pred ) {
	let found = false;
	( function walk( n ) {
		if ( found || !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( pred( n ) ) {
			found = true;
			return;
		}
		for ( const k of Object.keys( n ) ) {
			if ( k === 'parent' ) {
				continue;
			}
			const v = n[ k ];
			if ( Array.isArray( v ) ) {
				v.forEach( walk );
			} else if ( v && typeof v.type === 'string' ) {
				walk( v );
			}
		}
	})( node );
	return found;
}

// Same predicate as lint/rules/workspace-length-guard.
function hasGuard( fn, lname ) {
	return some( fn.body, ( n ) => n.type === 'IfStatement' && some( n.test, ( m ) => m.type === 'MemberExpression' && !m.computed && m.property.name === 'length' && m.object.type === 'Identifier' && m.object.name.toLowerCase() === lname ) && some( n.consequent, ( m ) => m.type === 'ThrowStatement' && m.argument && m.argument.type === 'NewExpression' && m.argument.callee.name === 'RangeError' ) );
}

// `minRWork` for RWORK, `minWork` for WORK.
function varName( ws ) {
	const m = /^(.*?)(work)$/i.exec( ws );
	if ( m ) {
		return 'min' + m[ 1 ].toUpperCase() + 'Work';
	}
	return 'min' + ws.charAt( 0 ).toUpperCase() + ws.slice( 1 ).toLowerCase();
}

function modules( only ) {
	const out = [];
	PKGS.forEach( ( pkg ) => {
		const dir = path.join( ROOT, 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			return;
		}
		fs.readdirSync( dir ).sort().forEach( ( r ) => {
			if ( only.length && !only.includes( r ) ) {
				return;
			}
			const file = path.join( dir, r, 'lib', 'ndarray.js' );
			if ( fs.existsSync( file ) ) {
				out.push( { 'routine': r, 'file': file } );
			}
		});
	});
	return out;
}

// The guard source for one workspace, or a string reason it cannot be made.
function guard( p, params, src, declared ) {
	const lname = p.name.toLowerCase();
	const at = params.findIndex( ( q ) => q.toLowerCase() === lname );
	if ( at < 0 ) {
		return { 'why': p.name + ' is not a parameter of ndarray.js' };
	}
	const W = params[ at ];
	const off = params[ at + 2 ];
	if ( !off || !/^offset/i.test( off ) ) {
		return { 'why': p.name + ': no offset parameter two after it' };
	}
	const hasMax = /^import\s+max\s+from/m.test( src );
	const hasMin = /^import\s+min\s+from/m.test( src );
	let expr = p.minLength.js;
	let bad = null;
	expr = expr.replace( /\b([A-Za-z_]\w*)\b(\s*\()?/g, ( all, id, call ) => {
		if ( call ) {
			if ( id === 'max' ) {
				return ( hasMax ? 'max' : 'Math.max' ) + call;
			}
			if ( id === 'min' ) {
				return ( hasMin ? 'min' : 'Math.min' ) + call;
			}
			bad = 'calls `' + id + '`';
			return all;
		}
		if ( params.includes( id ) ) {
			return id;
		}
		const ci = params.find( ( q ) => q.toLowerCase() === id.toLowerCase() );
		if ( ci ) {
			return ci;
		}
		bad = 'names `' + id + '`, not a parameter';
		return all;
	});
	if ( bad ) {
		return { 'why': p.name + ': `' + p.minLength.js + '` ' + bad };
	}
	const v = varName( W );
	if ( declared.has( v ) ) {
		return { 'why': p.name + ': `' + v + '` is already declared' };
	}
	declared.add( v );
	return {
		'code': [
			'\tconst ' + v + ' = ' + expr + ';',
			'\tif ( !' + W + ' || ( ' + W + '.length - ' + off + ' ) < ' + v + ' ) {',
			'\t\tthrow new RangeError( format( \'invalid argument. ' + p.name + ' array must have at least %d elements from offset %d. Provided length: %d.\', ' + v + ', ' + off + ', ( ' + W + ' ) ? ' + W + '.length : 0 ) );',
			'\t}'
		].join( '\n' ),
		'doc': '* @throws {RangeError} `' + W + '` must have at least `' + p.minLength.js + '` elements from `' + off + '`'
	};
}

function transform( m ) {
	const spec = specLib.load( m.routine );
	if ( !spec ) {
		return null;
	}
	const ws = spec.params.filter( ( p ) => p.role === 'workspace' && p.minLength && typeof p.minLength.js === 'string' && p.minLength.js !== '' );
	if ( !ws.length ) {
		return null;
	}
	const src = fs.readFileSync( m.file, 'utf8' );
	const ast = parse( src );
	const fn = exportedFunction( ast );
	if ( !fn ) {
		return { 'why': 'no exported function' };
	}
	const todo = ws.filter( ( p ) => !hasGuard( fn, p.name.toLowerCase() ) );
	if ( !todo.length ) {
		return null;
	}
	const params = fn.params.map( ( p ) => ( ( p.type === 'Identifier' ) ? p.name : '?' ) );
	const body = fn.body.body;
	const at = body.findIndex( ( s ) => some( s, ( n ) => n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'base' ) );
	if ( at < 0 ) {
		return { 'why': 'no top-level statement calls `base`' };
	}
	const declared = new Set( ( src.match( /\b(?:const|let|var)\s+(\w+)/g ) || [] ).map( ( d ) => d.split( /\s+/ )[ 1 ] ) );
	const made = todo.map( ( p ) => guard( p, params, src, declared ) );
	const why = made.filter( ( g ) => g.why );
	if ( why.length ) {
		return { 'why': why.map( ( g ) => g.why ).join( '; ' ) };
	}
	// Insert before the line of the base call's statement.
	const stmt = body[ at ];
	const lineStart = src.lastIndexOf( '\n', stmt.range[ 0 ] - 1 ) + 1;
	let out = src.slice( 0, lineStart ) + made.map( ( g ) => g.code ).join( '\n' ) + '\n' + src.slice( lineStart );
	// JSDoc: the block comment ending just before the function.
	const docEnd = out.lastIndexOf( '*/', fn.range[ 0 ] );
	const docStart = out.lastIndexOf( '/**', docEnd );
	if ( docEnd < 0 || docStart < 0 || out.slice( docEnd + 2, fn.range[ 0 ] ).trim() !== '' ) {
		return { 'why': 'no JSDoc immediately before the function' };
	}
	const doc = out.slice( docStart, docEnd );
	const lines = doc.split( '\n' );
	let last = -1;
	lines.forEach( ( l, i ) => {
		if ( /^\s*\*\s*@throws\b/.test( l ) ) {
			last = i;
		}
	});
	if ( last < 0 ) {
		last = lines.findIndex( ( l ) => /^\s*\*\s*@returns?\b/.test( l ) ) - 1;
		if ( last < -1 ) {
			last = lines.length - 2;
		}
	}
	// A @throws tag can wrap onto continuation lines: insert after them.
	while ( last + 1 < lines.length && /^\s*\*\s+[^@\s]/.test( lines[ last + 1 ] ) && !/^\s*\*\s*$/.test( lines[ last + 1 ] ) && last >= 0 && /@throws/.test( lines[ last ] ) ) {
		last += 1;
	}
	const indent = /^(\s*)\*/.exec( lines[ Math.max( last, 1 ) ] || ' *' );
	const lead = ( indent ) ? indent[ 1 ] : '';
	lines.splice( last + 1, 0, ...made.map( ( g ) => lead + g.doc ) );
	out = out.slice( 0, docStart ) + lines.join( '\n' ) + out.slice( docEnd );
	if ( !/^import\s+format\s+from/m.test( out ) ) {
		if ( !/^import base from '\.\/base\.js';$/m.test( out ) ) {
			return { 'why': 'ndarray.js imports neither `format` nor `./base.js` as expected' };
		}
		out = out.replace( /^import base from '\.\/base\.js';$/m, 'import format from \'@stdlib/string/format/lib/index.js\';\n$&' );
	}
	return { 'out': out, 'names': todo.map( ( p ) => p.name ) };
}

function main( argv ) {
	const dry = argv.includes( '--dry-run' );
	const only = argv.filter( ( a ) => !a.startsWith( '--' ) );
	let changed = 0;
	let skipped = 0;
	modules( only ).forEach( ( m ) => {
		const r = transform( m );
		if ( !r ) {
			return;
		}
		const rel = path.relative( ROOT, m.file );
		if ( r.why ) {
			skipped += 1;
			console.log( 'SKIP   ' + rel + ': ' + r.why );
			return;
		}
		changed += 1;
		console.log( ( dry ? 'WOULD  ' : 'GUARD  ' ) + rel + ': ' + r.names.join( ', ' ) );
		if ( !dry ) {
			fs.writeFileSync( m.file, r.out );
		}
	});
	console.log( ( dry ? 'would change ' : 'changed ' ) + changed + ' file(s); ' + skipped + ' left for hand-handling' );
	if ( skipped ) {
		process.exitCode = 1;
	}
}

main( process.argv.slice( 2 ) );
