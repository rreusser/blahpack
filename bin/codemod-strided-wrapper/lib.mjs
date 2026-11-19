// Shared helpers for the strided-wrapper signature codemods.
//
// The strided wrapper `<routine>.js` must equal the exact strided projection of
// `base.js` (CONVENTIONS.md D1–D3, lint/lib/strided-projection.cjs). These
// helpers load every module's signatures, locate every call site of a wrapper
// anywhere in the repository (by resolving imports with an AST parser, not by
// name matching), and rewrite those calls from an old parameter list to a new
// one.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

const require = createRequire( import.meta.url );
export const ROOT = path.resolve( path.dirname( new URL( import.meta.url ).pathname ), '..', '..' );
const projection = require( path.join( ROOT, 'lint', 'lib', 'strided-projection.cjs' ) );
export const { isWorkspace, isPackedMatrix } = projection;

export function isStride( x ) {
	return /^stride/i.test( x );
}
export function isOffset( x ) {
	return /^offset/i.test( x );
}

// Parameter list of `function <routine>(...)` in `src`.
export function paramsOf( src, routine ) {
	const m = new RegExp( 'function\\s+' + routine + '\\s*\\(([^)]*)\\)' ).exec( src );
	if ( !m ) {
		return null;
	}
	return m[ 1 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
}

// Every module: { routine, dir, wrapper, base, got, want, ok }.
export function loadModules() {
	const out = [];
	const libdir = path.join( ROOT, 'lib' );
	for ( const pkg of fs.readdirSync( libdir ) ) {
		const bdir = path.join( libdir, pkg, 'base' );
		if ( !fs.existsSync( bdir ) || !fs.statSync( bdir ).isDirectory() ) {
			continue;
		}
		for ( const r of fs.readdirSync( bdir ) ) {
			const dir = path.join( bdir, r );
			const bfile = path.join( dir, 'lib', 'base.js' );
			const wfile = path.join( dir, 'lib', r + '.js' );
			if ( !fs.existsSync( bfile ) || !fs.existsSync( wfile ) ) {
				continue;
			}
			const base = paramsOf( fs.readFileSync( bfile, 'utf8' ), r );
			const got = paramsOf( fs.readFileSync( wfile, 'utf8' ), r );
			if ( !base || !got ) {
				continue;
			}
			const want = projection.project( base, { 'routine': r } ).params;
			const ok = want.length === got.length && want.every( ( x, i ) => x.toLowerCase() === got[ i ].toLowerCase() );
			out.push( { routine: r, dir, wrapper: wfile, base, got, want, ok } );
		}
	}
	return out;
}

const SKIP_DIRS = new Set( [ 'node_modules', '.git', 'data', 'fixtures', 'coverage' ] );

function listSources( dir, out ) {
	for ( const e of fs.readdirSync( dir ) ) {
		if ( SKIP_DIRS.has( e ) ) {
			continue;
		}
		const full = path.join( dir, e );
		const st = fs.statSync( full );
		if ( st.isDirectory() ) {
			listSources( full, out );
		} else if ( /\.(m?js)$/.test( e ) ) {
			out.push( full );
		}
	}
	return out;
}

export function parse( src ) {
	return acorn.parse( src, { ecmaVersion: 'latest', sourceType: 'module', allowHashBang: true, allowReturnOutsideFunction: true } );
}

// Map: absolute wrapper-entry file → module record, for the entry points that
// export the strided wrapper as default: lib/<r>.js, lib/index.js, lib/main.js.
function entryIndex( modules ) {
	const idx = new Map();
	for ( const m of modules ) {
		for ( const f of [ m.routine + '.js', 'index.js', 'main.js' ] ) {
			idx.set( path.join( m.dir, 'lib', f ), m );
		}
	}
	return idx;
}

// Find all call sites of the given modules' strided wrappers.
// Returns Map<file, Array<{ module, local, calls: [CallExpression], lengths: [MemberExpression] }>>.
export function findCallSites( modules, opts = {} ) {
	const wanted = entryIndex( modules );
	const files = [];
	for ( const d of opts.dirs || [ 'lib', 'bench', 'test' ] ) {
		const full = path.join( ROOT, d );
		if ( fs.existsSync( full ) ) {
			listSources( full, files );
		}
	}
	const res = new Map();
	for ( const file of files ) {
		const src = fs.readFileSync( file, 'utf8' );
		// Cheap prefilter: must import some lib/*.js.
		if ( !/\/lib\/[A-Za-z0-9_]+\.js'/.test( src ) && !/from '\.\/[A-Za-z0-9_]+\.js'/.test( src ) ) {
			continue;
		}
		let ast;
		try {
			ast = parse( src );
		} catch ( e ) {
			continue;
		}
		const bindings = [];
		for ( const node of ast.body ) {
			if ( node.type !== 'ImportDeclaration' ) {
				continue;
			}
			const spec = node.source.value;
			if ( !spec.startsWith( '.' ) ) {
				continue;
			}
			const target = path.resolve( path.dirname( file ), spec );
			const m = wanted.get( target );
			if ( !m ) {
				continue;
			}
			// The module's own lib/main.js / lib/index.js import the wrapper to
			// re-export it; they never call it.
			if ( path.dirname( file ) === path.join( m.dir, 'lib' ) ) {
				continue;
			}
			for ( const s of node.specifiers ) {
				if ( s.type === 'ImportDefaultSpecifier' ) {
					bindings.push( { module: m, local: s.local.name, calls: [], lengths: [], spreads: [] } );
				}
			}
		}
		if ( !bindings.length ) {
			continue;
		}
		const byName = new Map( bindings.map( ( b ) => [ b.local, b ] ) );
		walk.full( ast, ( node ) => {
			if ( node.type === 'CallExpression' && node.callee.type === 'Identifier' && byName.has( node.callee.name ) ) {
				const b = byName.get( node.callee.name );
				if ( node.arguments.some( ( a ) => a.type === 'SpreadElement' ) ) {
					b.spreads.push( node );
				} else {
					b.calls.push( node );
				}
			}
			if ( node.type === 'MemberExpression' && !node.computed && node.object.type === 'Identifier' && byName.has( node.object.name ) && node.property.name === 'length' ) {
				byName.get( node.object.name ).lengths.push( node );
			}
		});
		res.set( file, bindings );
	}
	return res;
}

// Build the new argument texts for a call, given the old argument source texts.
//   mapping: array over newParams of either { from: oldIndex } or { insert: text }.
// Trailing omitted arguments stay omitted.
export function remapArgs( oldArgs, mapping ) {
	const out = [];
	let lastPresent = -1;
	mapping.forEach( ( mp, i ) => {
		if ( mp.from !== void 0 ) {
			if ( mp.from < oldArgs.length ) {
				out.push( oldArgs[ mp.from ] );
				lastPresent = i;
			} else {
				out.push( null );
			}
		} else {
			out.push( mp.insert );
		}
	});
	// Trim trailing positions that were omitted in the original call.
	const maxOld = oldArgs.length;
	let keep = out.length;
	if ( maxOld < Math.max( ...mapping.filter( ( m ) => m.from !== void 0 ).map( ( m ) => m.from + 1 ), 0 ) ) {
		keep = lastPresent + 1;
	}
	return out.slice( 0, keep ).map( ( x ) => ( x === null ? 'void 0' : x ) );
}

// Mapping from old param list to new param list (case-insensitive by name).
//   inserted(name) → text for a param absent from the old list (or throws).
export function buildMapping( oldParams, newParams, inserted ) {
	const lower = oldParams.map( ( x ) => x.toLowerCase() );
	return newParams.map( ( p ) => {
		const j = lower.indexOf( p.toLowerCase() );
		if ( j !== -1 ) {
			return { from: j };
		}
		return { insert: inserted( p ) };
	});
}

// Apply text edits [{ start, end, text }] (non-overlapping) to src.
export function applyEdits( src, edits ) {
	edits.sort( ( a, b ) => b.start - a.start );
	let out = src;
	for ( const e of edits ) {
		out = out.slice( 0, e.start ) + e.text + out.slice( e.end );
	}
	return out;
}

// Rewrite one call expression's argument list. Preserves the original
// formatting of retained arguments; joins with ', '.
export function callEdit( src, call, mapping ) {
	const oldArgs = call.arguments.map( ( a ) => src.slice( a.start, a.end ) );
	const args = remapArgs( oldArgs, mapping );
	const open = src.indexOf( '(', call.callee.end );
	const inner = args.length ? ' ' + args.join( ', ' ) + ' ' : '';
	return { start: open, end: call.end, text: '(' + inner + ')' };
}

// Split the top-level comma-separated arguments of a parenthesized text
// starting at index `open` (which must be '('). Returns { args, end } where
// `end` is the index just past the matching ')'.
export function splitArgs( text, open ) {
	let depth = 0;
	let cur = '';
	const args = [];
	let quote = null;
	for ( let i = open; i < text.length; i++ ) {
		const c = text[ i ];
		if ( quote ) {
			cur += c;
			if ( c === quote && text[ i - 1 ] !== '\\' ) {
				quote = null;
			}
			continue;
		}
		if ( c === '\'' || c === '"' || c === '`' ) {
			quote = c;
			cur += c;
			continue;
		}
		if ( c === '(' || c === '[' || c === '{' ) {
			depth += 1;
			if ( depth === 1 ) {
				continue;
			}
		} else if ( c === ')' || c === ']' || c === '}' ) {
			depth -= 1;
			if ( depth === 0 ) {
				if ( cur.trim() ) {
					args.push( cur.trim() );
				}
				return { args, end: i + 1 };
			}
		} else if ( c === ',' && depth === 1 ) {
			args.push( cur.trim() );
			cur = '';
			continue;
		}
		cur += c;
	}
	return null;
}

// Textual rewrite of `name( ... )` calls in comment / doc text whose argument
// count equals oldParams.length. Signature-like occurrences (args === old param
// names) become the new param names.
export function rewriteTextCalls( text, name, oldParams, newParams, inserted ) {
	const mapping = buildMapping( oldParams, newParams, inserted );
	const re = new RegExp( '(^|[^A-Za-z0-9_.])(' + name + '|\\{\\{alias\\}\\})\\s*\\(', 'g' );
	let out = '';
	let last = 0;
	let m;
	while ( ( m = re.exec( text ) ) !== null ) {
		const open = m.index + m[ 0 ].length - 1;
		const sp = splitArgs( text, open );
		if ( !sp ) {
			continue;
		}
		let repl = null;
		const lowerArgs = sp.args.map( ( a ) => a.replace( /^\*\s*/, '' ).toLowerCase() );
		if ( sp.args.length === oldParams.length && lowerArgs.every( ( a, i ) => a === oldParams[ i ].toLowerCase() ) ) {
			repl = newParams;
		} else if ( sp.args.length === oldParams.length ) {
			repl = remapArgs( sp.args, mapping );
		}
		if ( repl ) {
			out += text.slice( last, open ) + '(' + ( repl.length ? ' ' + repl.join( ', ' ) + ' ' : '' ) + ')';
			last = sp.end;
			re.lastIndex = sp.end;
		}
	}
	return out + text.slice( last );
}

export function ordinal( n ) {
	const w = [ 'Zeroth', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth', 'Twenty-seventh', 'Twenty-eighth', 'Twenty-ninth', 'Thirtieth' ];
	return w[ n ] || ( n + 'th' );
}
