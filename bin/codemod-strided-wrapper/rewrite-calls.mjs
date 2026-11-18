// Rewrite every call site of one strided wrapper after its signature changed.
//
// Call sites are found by resolving imports (lib/<r>.js, lib/index.js,
// lib/main.js) in lib/, bench/ and test/ with an AST parser. Arguments are
// remapped by parameter name from the OLD list to the wrapper's CURRENT list:
// kept params keep their argument, dropped params are removed, and inserted
// params get a value — `order` → 'column-major', `stride*` → 1, or whatever
// `--insert name=value` says. `.length` arity assertions are updated.
//
// Usage:
//   node bin/codemod-strided-wrapper/rewrite-calls.mjs <routine> --old "N, x, y, strideXY" \
//     [--insert WORK=null] [--rename oldName=newName] [--dry]
//
// `--rename` maps an old param to a new one with a different name (the
// argument is carried over).

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadModules, findCallSites, buildMapping, callEdit, applyEdits, isStride } from './lib.mjs';

const argv = process.argv.slice( 2 );
const routine = argv[ 0 ];
const opt = ( name ) => {
	const out = [];
	argv.forEach( ( a, i ) => {
		if ( a === name ) {
			out.push( argv[ i + 1 ] );
		}
	});
	return out;
};
const DRY = argv.includes( '--dry' );
const oldList = ( opt( '--old' )[ 0 ] || '' ).split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
if ( !routine || !oldList.length ) {
	console.error( 'usage: rewrite-calls.mjs <routine> --old "p1, p2, ..." [--insert name=value] [--rename old=new] [--dry]' );
	process.exit( 2 );
}
const inserts = new Map( opt( '--insert' ).map( ( s ) => [ s.slice( 0, s.indexOf( '=' ) ).toLowerCase(), s.slice( s.indexOf( '=' ) + 1 ) ] ) );
const renames = new Map( opt( '--rename' ).map( ( s ) => s.split( '=' ).map( ( x ) => x.trim() ) ) );

const m = loadModules().find( ( x ) => x.routine === routine );
if ( !m ) {
	console.error( 'no module ' + routine );
	process.exit( 2 );
}
const newList = m.got;
const oldForMap = oldList.map( ( p ) => renames.get( p ) || p );
const mapping = buildMapping( oldForMap, newList, ( p ) => {
	if ( inserts.has( p.toLowerCase() ) ) {
		return inserts.get( p.toLowerCase() );
	}
	if ( p === 'order' ) {
		return '\'column-major\'';
	}
	if ( isStride( p ) ) {
		return '1';
	}
	throw new Error( 'no value for inserted param ' + p + ' (use --insert ' + p + '=<value>)' );
});
const kept = new Set( mapping.filter( ( x ) => x.from !== void 0 ).map( ( x ) => x.from ) );

let ncalls = 0;
let nlen = 0;
let warn = 0;
const sites = findCallSites( [ m ] );
for ( const [ file, bindings ] of sites ) {
	const src = fs.readFileSync( file, 'utf8' );
	const edits = [];
	for ( const b of bindings ) {
		for ( const c of b.calls ) {
			if ( c.arguments.length > oldList.length ) {
				// More arguments than the old list: the call does not use that
				// signature (already rewritten, or a mismatched --old). Leave it.
				console.error( 'WARN arg count ' + c.arguments.length + ' > ' + oldList.length + ', SKIPPED at ' + path.relative( ROOT, file ) + ':' + src.slice( 0, c.start ).split( '\n' ).length );
				warn += 1;
				continue;
			}
			if ( c.arguments.length < oldList.length ) {
				console.error( 'WARN arg count ' + c.arguments.length + ' < ' + oldList.length + ' (trailing args treated as omitted) at ' + path.relative( ROOT, file ) + ':' + src.slice( 0, c.start ).split( '\n' ).length );
				warn += 1;
			}
			c.arguments.forEach( ( a, i ) => {
				if ( !kept.has( i ) && /^offset/i.test( oldList[ i ] || '' ) && !( a.type === 'Literal' && a.value === 0 ) ) {
					console.error( 'WARN dropped nonzero ' + oldList[ i ] + '=' + src.slice( a.start, a.end ) + ' at ' + path.relative( ROOT, file ) + ':' + src.slice( 0, c.start ).split( '\n' ).length );
					warn += 1;
				}
			});
			edits.push( callEdit( src, c, mapping ) );
			ncalls += 1;
		}
		for ( const sp of b.spreads ) {
			console.error( 'WARN spread call at ' + path.relative( ROOT, file ) + ' (rewrite by hand)' );
			warn += 1;
		}
		for ( const L of b.lengths ) {
			const mm = /^(\s*,\s*)(\d+)/.exec( src.slice( L.end, L.end + 20 ) );
			if ( mm && Number( mm[ 2 ] ) === oldList.length ) {
				edits.push( { start: L.end + mm[ 1 ].length, end: L.end + mm[ 0 ].length, text: String( newList.length ) } );
				nlen += 1;
			}
		}
	}
	if ( edits.length && !DRY ) {
		fs.writeFileSync( file, applyEdits( src, edits ) );
	}
}
console.log( routine + ': ' + oldList.length + ' → ' + newList.length + ' params; calls: ' + ncalls + ', arity asserts: ' + nlen + ', warnings: ' + warn + ( DRY ? ' (dry)' : '' ) );
