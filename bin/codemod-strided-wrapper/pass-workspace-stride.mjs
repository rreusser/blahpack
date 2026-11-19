// Pass 1: drop workspace and packed-matrix strides from strided wrappers
// (CONVENTIONS D2/D5). A packed matrix AP is a contiguous triangle: no stride.
//
// A workspace array (WORK, IWORK, RWORK, …) is opaque scratch: the strided
// wrapper takes just `WORK` and passes `WORK, 1, 0` to base. This pass removes
// every `stride<Work>` parameter that follows a workspace array in
// `<routine>.js` but is absent from the strided projection, rewrites the body
// (the stride becomes 1, its stride2offset offset becomes 0), and rewrites every
// call site in the repository to drop the argument.
//
// Usage: node bin/codemod-strided-wrapper/pass-workspace-stride.mjs [--dry] [routine...]

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadModules, isStride, isWorkspace, isPackedMatrix, findCallSites, buildMapping, callEdit, applyEdits, rewriteTextCalls } from './lib.mjs';

const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const only = argv.filter( ( a ) => !a.startsWith( '--' ) );

function esc( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

// Workspace-stride params of `got` that the projection does not have.
function droppedStrides( m ) {
	const want = new Set( m.want.map( ( x ) => x.toLowerCase() ) );
	return m.got.filter( ( p, i ) => isStride( p ) && i > 0 && ( isWorkspace( m.got[ i - 1 ] ) || isPackedMatrix( m.got[ i - 1 ], m.routine ) ) && !want.has( p.toLowerCase() ) );
}

function transformWrapper( src, m, drops ) {
	let s = src;
	const newParams = m.got.filter( ( p ) => !drops.includes( p ) );

	// Signature.
	s = s.replace( new RegExp( '(function\\s+' + m.fn + '\\s*\\()[^)]*\\)' ), '$1 ' + newParams.join( ', ' ) + ' )' );

	for ( const sw of drops ) {
		const W = esc( sw );
		// JSDoc @param line.
		s = s.replace( new RegExp( '\\n\\s*\\*\\s*@param\\s+\\{[^}]*\\}\\s+' + W + '\\b[^\\n]*', 'g' ), '' );
		// `if ( SW === void 0 ) { SW = 1; }` defaults.
		s = s.replace( new RegExp( '\\n[\\t ]*if \\( ' + W + ' === void 0 \\) \\{\\s*' + W + ' = 1;\\s*\\}', 'g' ), '' );
		// `SW = 1;` resets.
		s = s.replace( new RegExp( '\\n[\\t ]*' + W + ' = 1;', 'g' ), '' );
		// `[const] X = stride2offset( LEN, SW );` → X is 0.
		const offRe = new RegExp( '\\n[\\t ]*(?:const |let |var )?([A-Za-z_$][\\w$]*) = stride2offset\\((?:[^;]*?), ' + W + ' \\);', 'g' );
		const offVars = [];
		s = s.replace( offRe, ( _, v ) => {
			offVars.push( v );
			return '';
		});
		for ( const v of offVars ) {
			// Remove from `let a, v, b;` declarations.
			s = s.replace( new RegExp( '(\\n[\\t ]*let [^;\\n]*?)\\b' + esc( v ) + ',\\s*', 'g' ), '$1' );
			s = s.replace( new RegExp( '(\\n[\\t ]*let [^;\\n]*?),\\s*' + esc( v ) + '\\s*;', 'g' ), '$1;' );
			s = s.replace( new RegExp( '\\n[\\t ]*let ' + esc( v ) + ';', 'g' ), '' );
			s = s.replace( new RegExp( '\\n[\\t ]*' + esc( v ) + ' = 0;', 'g' ), '' );
			s = s.replace( new RegExp( '\\b' + esc( v ) + '\\b', 'g' ), '0' );
		}
		// Now-empty else branches.
		s = s.replace( /\} else \{\s*\}/g, '}' );
		// `x = ( SW === void 0 ) ? 1 : SW;` and plain aliases `x = SW;`.
		s = s.replace( new RegExp( '\\( ' + W + ' === void 0 \\) \\? 1 : ' + W, 'g' ), '1' );
		// Any remaining reference: the stride is 1.
		s = s.replace( new RegExp( '\\b' + W + '\\b', 'g' ), '1' );
	}
	// Drop a now-unused stride2offset import.
	if ( !/stride2offset\(/.test( s ) ) {
		s = s.replace( /\nimport stride2offset from [^\n]*;/, '' );
	}
	// Text-level example calls in comments.
	s = s.replace( /(\/\*\*[\s\S]*?\*\/)/g, ( c ) => rewriteTextCalls( c, m.fn, m.got, newParams, () => {
		throw new Error( 'insert' );
	}) );
	return { src: s, newParams };
}

const modules = loadModules();
const todo = [];
for ( const m of modules ) {
	if ( m.ok || ( only.length && !only.includes( m.routine ) ) ) {
		continue;
	}
	const drops = droppedStrides( m );
	if ( drops.length ) {
		todo.push( { m, drops } );
	}
}

let problems = 0;
const changed = [];
for ( const { m, drops } of todo ) {
	const src = fs.readFileSync( m.wrapper, 'utf8' );
	const { src: out, newParams } = transformWrapper( src, m, drops );
	// Sanity: no leftovers like `1 = ` or `=== void 0` on a literal.
	if ( /\n[\t ]*1 = |\b1 === void 0/.test( out ) ) {
		console.error( 'LEFTOVER ' + m.routine );
		problems += 1;
		continue;
	}
	m.newParams = newParams;
	m.newSrc = out;
	changed.push( m );
}

// Call sites.
const sites = findCallSites( changed );
let ncalls = 0;
let nlen = 0;
const fileEdits = new Map();
const wrapperFiles = new Set( changed.map( ( m ) => m.wrapper ) );
for ( const [ file, bindings ] of sites ) {
	if ( wrapperFiles.has( file ) ) {
		console.error( 'CALL SITE INSIDE CHANGED WRAPPER ' + path.relative( ROOT, file ) );
		problems += 1;
		continue;
	}
	const src = fs.readFileSync( file, 'utf8' );
	const edits = [];
	for ( const b of bindings ) {
		const m = b.module;
		const mapping = buildMapping( m.got, m.newParams, ( p ) => {
			throw new Error( m.routine + ': cannot insert ' + p );
		});
		const dropIdx = m.got.map( ( p, i ) => ( m.newParams.includes( p ) ? -1 : i ) ).filter( ( i ) => i >= 0 );
		for ( const c of b.calls ) {
			for ( const i of dropIdx ) {
				const a = c.arguments[ i ];
				if ( a && isPackedMatrix( m.got[ i - 1 ], m.routine ) && !( a.type === 'Literal' && a.value === 1 ) ) {
					console.error( 'NON-UNIT PACKED STRIDE ' + path.relative( ROOT, file ) + ': ' + m.routine + ' ' + src.slice( a.start, a.end ) );
					problems += 1;
				}
			}
			edits.push( callEdit( src, c, mapping ) );
			ncalls += 1;
		}
		for ( const sp of b.spreads ) {
			console.error( 'SPREAD call in ' + path.relative( ROOT, file ) + ' for ' + m.routine );
			problems += 1;
		}
		for ( const L of b.lengths ) {
			// `x.length, <old arity>` in an assertion.
			const after = src.slice( L.end, L.end + 20 );
			const mm = /^(\s*,\s*)(\d+)/.exec( after );
			if ( mm && Number( mm[ 2 ] ) === m.got.length ) {
				edits.push( { start: L.end + mm[ 1 ].length, end: L.end + mm[ 0 ].length, text: String( m.newParams.length ) } );
				nlen += 1;
			}
		}
	}
	fileEdits.set( file, applyEdits( src, edits ) );
}

console.log( 'wrappers: ' + changed.length + ', calls: ' + ncalls + ', arity asserts: ' + nlen + ', problems: ' + problems );
if ( !DRY ) {
	for ( const m of changed ) {
		fs.writeFileSync( m.wrapper, m.newSrc );
	}
	for ( const [ file, src ] of fileEdits ) {
		fs.writeFileSync( file, src );
	}
}
