/**
* 2026-07-18  Replace `var` with `const`/`let` and group bare declarations
*
* The Fortran→JS translation emitted stdlib-style `var`: block-hoisted, one
* declaration per line, all bunched at the top of the function. This project is
* not stdlib, and that style is a poor fit for the language. This migration
* rewrites every `var` to `const` or `let` using real scope analysis, and packs
* the leftover bare `let` declarations a few per line.
*
* Policy (per declared binding, decided from eslint-scope reference data):
*
*   1. `var x = <init>;`, never reassigned            -> `const x = <init>;`
*   2. `var x = <init>;`, reassigned later            -> `let x = <init>;`
*   3. `var x;` assigned exactly once, at the same     -> FOLD: drop the bare
*      block level, before any read, no closure           declaration and rewrite
*      capture (provably a single static write)           its one `x = <rhs>;`
*                                                          as `const x = <rhs>;`
*   4. `var x;` any other shape (0 or >=2 writes,      -> `let x;`
*      written in a branch/loop, read before write,
*      captured by a closure, in a for-head, ...)
*
* Emission is statement-aware, not line-aware: each contiguous run of `var`
* declarations is re-rendered as a clean block. Folded bindings vanish, bindings
* that carry an initializer keep their own line, and the remaining bare `let`
* bindings are packed a few per line (source order preserved, wrapped at a
* readable width). This matters because the hand-optimized level-3 BLAS puts
* several `var` statements on one physical line — a naive per-line deleter would
* take out a fold's innocent line-mates.
*
* Correctness rests on eslint-scope: `const` is only chosen when a binding has
* zero write references after its initializer, and a fold only happens when the
* single write dominates every read (checked by source position) and nothing
* outside the declaring function references the binding. Anything the analysis
* is unsure about degrades to `let`, which is always safe. As a backstop the
* transformed output is re-parsed and the file is skipped if it would not parse.
*
* Idempotent: a file with no `var` is skipped.
*
*   node codemods/2026-07-18-01-var-to-const-let.mjs --dry
*   node codemods/2026-07-18-01-var-to-const-let.mjs --diff ddot
*   node codemods/2026-07-18-01-var-to-const-let.mjs
*/

import { createRequire } from 'node:module';
import { run } from './_harness.mjs';

const require = createRequire( import.meta.url );
const espree = require( 'espree' );
const eslintScope = require( 'eslint-scope' );

// Wrap grouped `let` lines once the statement text (tabs counted as 4 cols)
// would exceed this. Purely cosmetic; keeps lines readable.
const WIDTH = 80;
const TAB_COLS = 4;

const PARSE_OPTS = {
	'ecmaVersion': 2022,
	'sourceType': 'module',
	'range': true,
	'loc': true,
	'comment': true
};
const ANALYZE_OPTS = {
	'ecmaVersion': 2022,
	'sourceType': 'module',
	'optimistic': false,
	'ignoreEval': true
};

// Only whitespace, with at most one line break — the gap two declarations may
// share and still be regrouped. A blank line (two line breaks) or any comment
// deliberately breaks the run so we never merge across it.
const JOINABLE_GAP = /^[ \t]*\n?[ \t]*$/;
const SKIP = -1;

// espree 9.x cannot parse import attributes (`import x from './x.json' with {
// type: 'json' }`), which the test files use. Attributes have no bearing on
// scope, so blank the `with { ... }` clause to equal-length whitespace before
// parsing: offsets stay aligned with the original source, and every edit we make
// lands elsewhere (on `var` declarations), never on an import line.
function neutralizeImportAttributes( src ) {
	return src.split( '\n' ).map( function ( line ) {
		if ( !/^\s*(?:import|export)\b/.test( line ) || !/\bwith\s*\{/.test( line ) ) return line;
		return line.replace( /\bwith\s*\{[^}]*\}/g, ( m ) => ' '.repeat( m.length ) );
	}).join( '\n' );
}

// Attach a `__parent` pointer to every node so we can ask which block a
// statement lives in. espree/eslint-scope do not provide this.
function walkNodes( root, fn, parent ) {
	fn( root, parent );
	for ( const key of Object.keys( root ) ) {
		if ( key === '__parent' || key === 'range' || key === 'loc' ) continue;
		const val = root[ key ];
		if ( Array.isArray( val ) ) {
			for ( const c of val ) {
				if ( c && typeof c.type === 'string' ) walkNodes( c, fn, root );
			}
		} else if ( val && typeof val.type === 'string' ) {
			walkNodes( val, fn, root );
		}
	}
}

function isBlockContainer( node ) {
	return node && ( node.type === 'BlockStatement' || node.type === 'Program' );
}

// The node whose lexical extent a `let`/`const` here would be scoped to: the
// enclosing block, or the loop when the declaration is a for-head. Returns null
// for any other position, which we treat as "do not touch".
function scopeNodeFor( decl ) {
	const p = decl.__parent;
	if ( isBlockContainer( p ) ) return p;
	if ( p && ( p.type === 'ForStatement' || p.type === 'ForInStatement' || p.type === 'ForOfStatement' ) ) return p;
	return null;
}

// Locate the `x = <rhs>;` statement behind a write reference, or null if the
// write is anything other than a plain simple assignment statement.
function assignmentStatement( ref ) {
	const id = ref.identifier;
	const assign = id.__parent;
	if ( !assign || assign.type !== 'AssignmentExpression' ) return null;
	if ( assign.operator !== '=' || assign.left !== id ) return null;
	const stmt = assign.__parent;
	if ( !stmt || stmt.type !== 'ExpressionStatement' ) return null;
	return stmt;
}

function lineStartOf( src, pos ) {
	return src.lastIndexOf( '\n', pos - 1 ) + 1;
}
function lineEndOf( src, pos ) {
	const nl = src.indexOf( '\n', pos );
	return nl === SKIP ? src.length : nl;
}

// The leading whitespace of the physical line that `pos` sits on.
function indentAt( src, pos ) {
	const start = lineStartOf( src, pos );
	const m = /^[ \t]*/.exec( src.slice( start ) );
	return m[ 0 ];
}

// Decide a plan for one `var` declaration. Returns:
//   { fold: true, decl, assignStmt }                        -> bare, single write, foldable
//   { fold: false, decl, kind, bare, names, text }          -> keep, rewritten in place/group
function planDeclaration( decl, byId ) {
	const container = decl.__parent;
	const decls = decl.declarations;

	// Per-binding write/read facts from scope analysis.
	const facts = decls.map( function ( d ) {
		const v = byId.get( d.id );
		const refs = v ? v.references : [];
		const writes = refs.filter( ( r ) => r.isWrite() && !r.init );
		const reads = refs.filter( ( r ) => r.isRead() );
		const foreign = v ? refs.some( ( r ) => r.from.variableScope !== v.scope.variableScope ) : true;
		return { 'declarator': d, 'name': d.id.name, 'hasInit': d.init != null, refs, writes, reads, foreign };
	});

	// A `var` is function-scoped, so it may be declared inside a nested block yet
	// used elsewhere in the function. `let`/`const` are block-scoped, so an
	// in-place rewrite is only sound when the declaration's own lexical scope
	// (its block, or a for-head's loop) contains EVERY reference. When it does
	// not, leave the declaration as `var` — converting it would break the
	// out-of-block uses (a ReferenceError, or a silent re-scoping).
	const scopeNode = scopeNodeFor( decl );
	const contained = scopeNode &&
		facts.every( ( f ) => f.refs.every(
			( r ) => r.identifier.range[ 0 ] >= scopeNode.range[ 0 ] && r.identifier.range[ 1 ] <= scopeNode.range[ 1 ]
		) );
	if ( !contained ) {
		return { 'fold': false, 'keepVar': true, decl };
	}

	// Fold a lone, uninitialized `var x;` whose single write is a plain
	// assignment in the very same block, positioned before every read.
	if (
		facts.length === 1 && !facts[ 0 ].hasInit &&
		facts[ 0 ].writes.length === 1 && !facts[ 0 ].foreign &&
		isBlockContainer( container )
	) {
		const stmt = assignmentStatement( facts[ 0 ].writes[ 0 ] );
		if (
			stmt && stmt.__parent === container &&
			facts[ 0 ].reads.every( ( r ) => r.identifier.range[ 0 ] >= stmt.range[ 1 ] )
		) {
			return { 'fold': true, decl, 'assignStmt': stmt };
		}
	}

	// Otherwise keep in place. `const` needs every binding initialized and never
	// reassigned; anything else is `let`.
	const kind = facts.every( ( f ) => f.hasInit && f.writes.length === 0 ) ? 'const' : 'let';
	const bare = facts.length === 1 && !facts[ 0 ].hasInit;
	return { 'fold': false, decl, kind, bare, 'names': facts.map( ( f ) => f.name ) };
}

// Render an ordered list of declaration items into source lines. Consecutive
// bare `let` items are packed together and wrapped; anything with an
// initializer keeps its own line.
function renderItems( items, indent ) {
	const budget = WIDTH - ( indent.length * TAB_COLS );
	const lines = [];
	let row = [];
	function flush() {
		if ( row.length ) {
			lines.push( indent + 'let ' + row.join( ', ' ) + ';' );
			row = [];
		}
	}
	for ( const it of items ) {
		if ( it.bare ) {
			const candidate = 'let ' + row.concat( it.name ).join( ', ' ) + ';';
			if ( row.length && candidate.length > budget ) flush();
			row.push( it.name );
		} else {
			flush();
			lines.push( indent + it.text );
		}
	}
	flush();
	return lines;
}

// Group consecutive same-container declarations (no blank line or comment
// between them, aligned indentation) so they can be re-emitted as one block. A
// declaration that nests another (a multi-line initializer with its own `var`
// inside) is never grouped or re-emitted — re-rendering it would swallow the
// inner declaration and collide with the inner declaration's own edit.
function groupDeclarations( src, decls, solo ) {
	const groups = [];
	let cur = null;
	for ( const decl of decls.slice().sort( ( a, b ) => a.range[ 0 ] - b.range[ 0 ] ) ) {
		if ( !isBlockContainer( decl.__parent ) || solo.has( decl ) ) {
			// A for-head (or solo) declaration: never grouped.
			groups.push( [ decl ] );
			cur = null;
			continue;
		}
		if ( cur ) {
			const prev = cur[ cur.length - 1 ];
			const gap = src.slice( prev.range[ 1 ], decl.range[ 0 ] );
			// A same-line sibling shares the group trivially; a decl on a fresh
			// line joins only when its line is indented like the group's first.
			const alignedOrSameLine =
				!gap.includes( '\n' ) ||
				indentAt( src, decl.range[ 0 ] ) === indentAt( src, cur[ 0 ].range[ 0 ] );
			if ( decl.__parent === prev.__parent && JOINABLE_GAP.test( gap ) && alignedOrSameLine ) {
				cur.push( decl );
				continue;
			}
		}
		cur = [ decl ];
		groups.push( cur );
	}
	return groups;
}

function transform( src, file ) {
	if ( !/\bvar\b/.test( src ) ) return null;

	const parseSrc = neutralizeImportAttributes( src );
	let ast;
	try {
		ast = espree.parse( parseSrc, PARSE_OPTS );
	} catch {
		return null; // not parseable as ESM under our options; leave untouched
	}
	walkNodes( ast, ( node, parent ) => { node.__parent = parent; } );
	const sm = eslintScope.analyze( ast, ANALYZE_OPTS );

	// Map every declaration Identifier node -> its resolved Variable.
	const byId = new Map();
	for ( const scope of sm.scopes ) {
		for ( const v of scope.variables ) {
			for ( const d of v.defs ) {
				if ( d.name ) byId.set( d.name, v );
			}
		}
	}

	const decls = [];
	walkNodes( ast, ( node ) => {
		if ( node.type === 'VariableDeclaration' && node.kind === 'var' ) decls.push( node );
	});
	if ( !decls.length ) return null;

	const planOf = new Map();
	for ( const decl of decls ) planOf.set( decl, planDeclaration( decl, byId ) );

	// Declarations that must stand alone — never grouped or re-emitted as part of
	// a block. Two reasons: (a) the declaration nests another (a function-
	// expression initializer with its own `var` inside), so re-rendering it would
	// swallow the inner declaration and collide with its edit; (b) it is a
	// cross-block `var` we are leaving as-is (`keepVar`).
	const solo = new Set();
	for ( const a of decls ) {
		if ( planOf.get( a ).keepVar ) {
			solo.add( a );
			continue;
		}
		for ( const b of decls ) {
			if ( a !== b && b.range[ 0 ] > a.range[ 0 ] && b.range[ 1 ] <= a.range[ 1 ] ) {
				solo.add( a );
				break;
			}
		}
	}

	const edits = [];

	// (1) Every fold prefixes its surviving assignment with `const `.
	for ( const decl of decls ) {
		const plan = planOf.get( decl );
		if ( plan.fold ) {
			const at = plan.assignStmt.expression.range[ 0 ];
			edits.push({ 'start': at, 'end': at, 'text': 'const ' });
		}
	}

	// (2) Re-emit each declaration group as a clean block.
	for ( const group of groupDeclarations( src, decls, solo ) ) {
		const first = group[ 0 ];
		const last = group[ group.length - 1 ];
		const container = first.__parent;

		// Fall back to an in-place keyword swap when the group is not a clean
		// run of whole-line declarations we can safely re-render (a for-head, a
		// declaration sharing its line with other code, or a trailing comment we
		// would otherwise drop).
		const startCol = src.slice( lineStartOf( src, first.range[ 0 ] ), first.range[ 0 ] );
		const tail = src.slice( last.range[ 1 ], lineEndOf( src, last.range[ 1 ] ) );
		const clean =
			isBlockContainer( container ) && startCol.trim() === '' && tail.trim() === '' &&
			!group.some( ( d ) => solo.has( d ) );
		if ( !clean ) {
			for ( const decl of group ) {
				const plan = planOf.get( decl );
				if ( plan.keepVar ) {
					continue; // left as `var`; no edit
				} else if ( plan.fold ) {
					// Surgically drop just this statement (+ one separator space).
					let s = decl.range[ 0 ];
					let e = decl.range[ 1 ];
					if ( src[ e ] === ' ' ) e += 1;
					else if ( src[ s - 1 ] === ' ' ) s -= 1;
					edits.push({ 'start': s, 'end': e, 'text': '' });
				} else {
					edits.push({ 'start': decl.range[ 0 ], 'end': decl.range[ 0 ] + 3, 'text': plan.kind });
				}
			}
			continue;
		}

		const indent = startCol;
		const items = [];
		for ( const decl of group ) {
			const plan = planOf.get( decl );
			if ( plan.fold ) continue;
			if ( plan.bare ) {
				items.push({ 'bare': true, 'name': plan.names[ 0 ] });
			} else {
				const body = decl.declarations
					.map( ( d ) => src.slice( d.range[ 0 ], d.range[ 1 ] ) )
					.join( ', ' );
				items.push({ 'bare': false, 'text': plan.kind + ' ' + body + ';' });
			}
		}
		const blockStart = lineStartOf( src, first.range[ 0 ] );
		const blockEnd = lineEndOf( src, last.range[ 1 ] );
		if ( items.length === 0 ) {
			// Whole block folded away: remove the lines and their line break.
			const drop = blockEnd < src.length ? blockEnd + 1 : blockEnd;
			edits.push({ 'start': blockStart, 'end': drop, 'text': '' });
		} else {
			edits.push({ 'start': blockStart, 'end': blockEnd, 'text': renderItems( items, indent ).join( '\n' ) });
		}
	}

	// Backstop: overlapping edits would corrupt output. This should never happen
	// (nesting declarations are excluded above), but if it does, skip the file
	// rather than write garbage.
	const ascending = edits.slice().sort( ( a, b ) => ( a.start - b.start ) || ( a.end - b.end ) );
	for ( let i = 1; i < ascending.length; i++ ) {
		if ( ascending[ i ].start < ascending[ i - 1 ].end ) {
			process.stderr.write( `SKIP ${file} (overlapping edits)\n` );
			return null;
		}
	}

	edits.sort( ( a, b ) => b.start - a.start );
	let out = src;
	for ( const e of edits ) out = out.slice( 0, e.start ) + e.text + out.slice( e.end );

	// Backstop: never emit output that no longer parses.
	try {
		espree.parse( neutralizeImportAttributes( out ), PARSE_OPTS );
	} catch ( err ) {
		process.stderr.write( `SKIP ${file} (output would not parse): ${err.message}\n` );
		return null;
	}
	return out === src ? null : out;
}

run({
	'name': 'var-to-const-let',
	'roots': [ 'lib' ],
	'extensions': [ '.js' ],
	transform
});
