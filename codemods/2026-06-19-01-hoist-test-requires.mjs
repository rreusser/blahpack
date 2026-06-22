/**
* 2026-06-19  Hoist lazy test-callback requires to top level
*
* Requires inside test callbacks are an anti-pattern: a module dependency hidden
* in a function body, often re-fetched in several blocks. ESM has no in-function
* imports anyway, so this lifts every indented (in-block) `require()` in a test
* file to a single top-level `var NAME = require( ... )` and deletes the local
* copies. A later pass (02-cjs-to-esm) then rewrites the hoisted line as a normal
* `import`.
*
* Runs FIRST, on the clean CJS tree, before 02-cjs-to-esm. Safe because every
* lazily-required name maps to exactly one specifier across the codebase (verified
* before writing this migration); a name seen with two specifiers is left in place
* and reported.
*
* Scope: test files only (`/test/`). Idempotent: a file with no indented require is
* skipped.
*
*   node codemods/2026-06-19-01-hoist-test-requires.mjs --dry
*   node codemods/2026-06-19-01-hoist-test-requires.mjs
*/

import { run } from './_harness.mjs';

// Matches an indented (in-block) require declaration/assignment, with optional
// `var`, optional `.member`, and optional trailing comment.
const LAZY = /^[ \t]+(?:var\s+)?([A-Za-z0-9_$]+)\s*=\s*require\(\s*'([^']+)'\s*\)(\.[A-Za-z0-9_$]+)?;[ \t]*(?:\/\/[^\n]*)?$/;

function transform( src, file ) {
	if ( !file.includes( '/test/' ) ) return null;
	if ( !/require\(/.test( src ) ) return null;

	const lines = src.split( '\n' );

	// Collect lazy requires and detect conflicts.
	const wanted = new Map(); // name -> `require( 'spec' ).member`
	let conflict = false;
	for ( const line of lines ) {
		const m = line.match( LAZY );
		if ( !m ) continue;
		const [ , name, spec, member ] = m;
		const rhs = `require( '${spec}' )${member || ''}`;
		if ( wanted.has( name ) && wanted.get( name ) !== rhs ) {
			console.error( `WARN ${file}: '${name}' lazily required with two specifiers; leaving in place` );
			conflict = true;
		} else {
			wanted.set( name, rhs );
		}
	}
	if ( !wanted.size || conflict ) return conflict ? null : null;

	// Names already declared at top level (column 0) as a require — don't duplicate.
	const topLevel = new Set();
	for ( const line of lines ) {
		const m = line.match( /^var ([A-Za-z0-9_$]+) = require\(/ );
		if ( m ) topLevel.add( m[ 1 ] );
	}

	// Drop: every lazy require line, and any bare top-level `var NAME;` forward
	// declaration for a hoisted name.
	const hoistNames = new Set( wanted.keys() );
	const kept = lines.filter( ( line ) => {
		if ( LAZY.test( line ) ) return false;
		const bare = line.match( /^[ \t]*var ([A-Za-z0-9_$]+);[ \t]*$/ );
		if ( bare && hoistNames.has( bare[ 1 ] ) ) return false;
		return true;
	});

	// Build the new top-level require lines (skip names already declared up top).
	const additions = [];
	for ( const [ name, rhs ] of wanted ) {
		if ( !topLevel.has( name ) ) additions.push( `var ${name} = ${rhs};` );
	}
	if ( !additions.length ) return kept.join( '\n' );

	// Insert after the last existing top-level require, else after the header.
	let insertAt = -1;
	for ( let i = 0; i < kept.length; i++ ) {
		if ( /^var [A-Za-z0-9_$]+ = require\(/.test( kept[ i ] ) ) insertAt = i;
	}
	if ( insertAt >= 0 ) {
		kept.splice( insertAt + 1, 0, ...additions );
	} else {
		const headerEnd = kept.findIndex( ( l ) => l.trim() === "'use strict';" );
		const at = headerEnd >= 0 ? headerEnd + 1 : 0;
		kept.splice( at, 0, '', ...additions );
	}
	return kept.join( '\n' );
}

run({
	name: 'hoist-test-requires',
	roots: [ 'lib' ],
	extensions: [ '.js' ],
	transform
});
