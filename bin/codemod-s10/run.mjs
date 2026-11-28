// S10 codemod driver: migrate routines whose output scalars are returned in a
// result object, packed into an `out` array/object, returned directly, or
// passed by value, to one caller-provided length-1 typed array per output
// scalar (CONVENTIONS S10), and rewrite every caller.
//
//   node bin/codemod-s10/run.mjs [--dry] [--list] <routine...>
//
// Order of work per wave:
//   1. every call site in lib/, test/, bench/, examples/ (calls.mjs), including
//      each routine's own strided.js / <r>.js calls to base;
//   2. each routine's base.js (base.mjs);
//   3. strided.js / <r>.js parameter lists, JSDoc, argument ordinals;
//   4. signature lines in README.md and docs/repl.txt.
// Anything the codemod cannot rewrite is reported as a problem and the wave
// is not written (unless --force).

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, parse, exportedName, ordinal } from '../codemod-strided-wrapper/lib.mjs';
import { plan } from './plan.mjs';
import { worklist } from './forms.mjs';
import { transformBase, rewriteMainJsdoc, rewriteWrapperReturns } from './base.mjs';
import { FileRewriter, allSources, removeDead } from './calls.mjs';
import { walkParents } from './edits.mjs';
import { dropOutputChecks } from './drop-output-checks.mjs';

function walkAll( ast, fn ) {
	walkParents( ast, ( n ) => {
		fn( n );
		return true;
	});
}

const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const FORCE = argv.includes( '--force' );
const routines = argv.filter( ( a ) => !a.startsWith( '--' ) );

if ( argv.includes( '--list' ) ) {
	for ( const d of worklist() ) {
		console.log( d.routine );
	}
	process.exit( 0 );
}
if ( !routines.length ) {
	console.error( 'usage: run.mjs [--dry] [--force] <routine...>' );
	process.exit( 2 );
}

const plans = routines.map( plan );
const problems = [];
for ( const P of plans ) {
	if ( P.error ) {
		problems.push( P.routine + ': ' + P.error );
	} else if ( P.problems.length ) {
		problems.push( ...P.problems.map( ( x ) => P.routine + ': ' + x ) );
	} else if ( !P.outs.length ) {
		problems.push( P.routine + ': nothing to migrate' );
	}
}
if ( problems.length ) {
	console.error( problems.join( '\n' ) );
	process.exit( 1 );
}

const writes = new Map(); // file → new source
const warnings = [];
const read = ( f ) => ( writes.has( f ) ? writes.get( f ) : fs.readFileSync( f, 'utf8' ) );

// 1. Call sites.
const idx = new Map();
for ( const P of plans ) {
	const lib = path.join( P.dir, 'lib' );
	idx.set( path.join( lib, 'base.js' ), { P, kind: 'base' } );
	idx.set( path.join( lib, 'strided.js' ), { P, kind: 'strided' } );
	idx.set( path.join( lib, P.routine + '.js' ), { P, kind: 'wrapper' } );
	idx.set( path.join( lib, 'index.js' ), { P, kind: 'wrapper', hasStrided: true } );
}
for ( const f of allSources() ) {
	const src = fs.readFileSync( f, 'utf8' );
	if ( !/import\s+\w+\s+from\s+'\./.test( src ) ) {
		continue;
	}
	let rw;
	try {
		rw = new FileRewriter( f, idx, plans );
	} catch ( e ) {
		continue; // unparsable file
	}
	if ( !rw.run() ) {
		continue;
	}
	problems.push( ...rw.problems );
	warnings.push( ...rw.warnings );
	try {
		writes.set( f, rw.finish() );
	} catch ( e ) {
		problems.push( path.relative( ROOT, f ) + ': ' + e.message );
	}
}

// 2. base.js of each routine.
for ( const P of plans ) {
	const f = path.join( P.dir, 'lib', 'base.js' );
	try {
		const res = transformBase( read( f ), P );
		problems.push( ...res.problems.map( ( x ) => P.routine + '/base.js: ' + x ) );
		writes.set( f, res.src );
	} catch ( e ) {
		problems.push( P.routine + '/base.js: ' + e.message );
	}
}

// 3. Wrappers.
const ORD = [];
for ( let i = 1; i <= 60; i++ ) {
	ORD.push( ordinal( i ) );
}
function remapOrdinals( src, oldL, newL ) {
	const words = ORD.slice().sort( ( a, b ) => b.length - a.length ).map( ( w ) => w.replace( /-/g, '\\-' ) );
	const re = new RegExp( '\\b(' + words.join( '|' ) + ')( argument)', 'gi' );
	return src.replace( re, ( all, w, rest ) => {
		const i = ORD.findIndex( ( o ) => o.toLowerCase() === w.toLowerCase() );
		if ( i === -1 || i >= oldL.length ) {
			return all;
		}
		const j = newL.findIndex( ( x ) => x.toLowerCase() === oldL[ i ].toLowerCase() );
		if ( j === -1 || j >= ORD.length ) {
			return all;
		}
		let n = ORD[ j ];
		if ( w[ 0 ] === w[ 0 ].toLowerCase() ) {
			n = n[ 0 ].toLowerCase() + n.slice( 1 );
		}
		return n + rest;
	});
}
for ( const P of plans ) {
	for ( const [ file, oldL, newL ] of [ [ 'strided.js', P.oldNd, P.newNd ], [ P.routine + '.js', P.oldStrided, P.newStrided ] ] ) {
		const f = path.join( P.dir, 'lib', file );
		if ( !fs.existsSync( f ) || !oldL ) {
			continue;
		}
		let src = read( f );
		const fn = exportedName( src );
		const ast = parse( src );
		const main = ast.body.find( ( n ) => n.type === 'FunctionDeclaration' && n.id.name === fn );
		const open = src.indexOf( '(', main.id.end );
		const close = main.params.length ? src.indexOf( ')', main.params[ main.params.length - 1 ].end ) : src.indexOf( ')', open );
		src = src.slice( 0, open ) + '( ' + newL.join( ', ' ) + ' )' + src.slice( close + 1 );
		// Packed-container reads in the wrapper (`out.M = 0;` quick returns).
		for ( const p of P.outs ) {
			const fm = P.form[ p.name ];
			if ( fm.kind === 'outField' ) {
				src = src.slice( 0, open ) + src.slice( open ).replace( new RegExp( '\\b' + fm.param + '\\.' + fm.key + '\\b', 'g' ), P.pname[ p.name ] + '[ 0 ]' );
			} else if ( fm.kind === 'outIndex' ) {
				src = src.slice( 0, open ) + src.slice( open ).replace( new RegExp( '\\b' + fm.param + '\\[\\s*' + fm.index + '\\s*\\]', 'g' ), P.pname[ p.name ] + '[ 0 ]' );
			}
		}
		// Locals computed only from removed params (`const oab = stride2offset( 2, strideAB );`).
		const removedNames = oldL.filter( ( x ) => P.removed.has( x.toLowerCase() ) || ( [ ...P.removed ].some( ( r ) => x.toLowerCase() === 'stride' + r ) ) );
		if ( removedNames.length ) {
			const re = new RegExp( '\\b(?:const|let)\\s+(\\w+)\\s*=[^;]*\\b(?:' + removedNames.join( '|' ) + ')\\b[^;]*;', 'g' );
			const dead = [];
			let mm;
			while ( ( mm = re.exec( src ) ) !== null ) {
				dead.push( mm[ 1 ] );
			}
			src = removeDead( src, dead, dead );
		}
		// Removed params must not be referenced any more.
		for ( const r of P.removed ) {
			const nm = oldL.find( ( x ) => x.toLowerCase() === r );
			if ( nm && new RegExp( '[^.\\w\'`]' + nm + '\\b(?!\\s*:)' ).test( src.slice( src.indexOf( ')', open ) + 1 ).replace( /\/\*\*[\s\S]*?\*\//g, '' ).replace( /\/\/.*$/gm, '' ).replace( /'[^'\n]*'/g, '\'\'' ) ) ) {
				problems.push( P.routine + '/' + file + ': removed param `' + nm + '` still referenced' );
			}
		}

		src = rewriteWrapperReturns( src, P, fn ).src;
		src = remapOrdinals( src, oldL, newL );
		src = rewriteMainJsdoc( src, P, fn, newL, false );
		writes.set( f, src );
	}
}

// 4. Signature lines in README.md / docs/repl.txt.
function esc( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}
for ( const P of plans ) {
	for ( const rel of [ 'README.md', 'docs/repl.txt' ] ) {
		const f = path.join( P.dir, rel );
		if ( !fs.existsSync( f ) ) {
			continue;
		}
		let src = read( f );
		const before = src;
		for ( const [ oldL, newL ] of [ [ P.oldStrided, P.newStrided ], [ P.oldNd || P.oldBase, P.newNd || P.newBase ] ] ) {
			if ( !oldL ) {
				continue;
			}
			const re = new RegExp( '((?:' + esc( P.routine ) + '|\\{\\{alias\\}\\})(?:\\.strided)?\\(\\s*)' + oldL.map( esc ).join( ',\\s*' ) + '(\\s*\\))', 'g' );
			src = src.replace( re, '$1' + newL.join( ', ' ) + '$2' );
		}
		if ( src !== before ) {
			writes.set( f, src );
		}
	}
}

// 5. Imports left unused by the rewrite (`stride2offset` of a removed
// strided pair).
for ( const [ f, s ] of writes ) {
	if ( !f.endsWith( '.js' ) ) {
		continue;
	}
	const before = fs.readFileSync( f, 'utf8' );
	let ast;
	try {
		ast = parse( s );
	} catch ( e ) {
		problems.push( path.relative( ROOT, f ) + ': does not parse after rewrite: ' + e.message );
		continue;
	}
	let out = s;
	const imports = ast.body.filter( ( n ) => n.type === 'ImportDeclaration' && n.specifiers.length === 1 && n.specifiers[ 0 ].type === 'ImportDefaultSpecifier' );
	for ( const imp of imports.reverse() ) {
		const name = imp.specifiers[ 0 ].local.name;
		const count = ( text ) => {
			let n = 0;
			try {
				walkAll( parse( text ), ( x ) => {
					if ( x.type === 'Identifier' && x.name === name ) {
						n += 1;
					}
				});
			} catch ( e ) {
				n = 99;
			}
			return n;
		};
		if ( count( out ) === 1 && count( before ) > 1 ) {
			const nl = out.indexOf( '\n', imp.end );
			out = out.slice( 0, imp.start ) + out.slice( nl + 1 );
		}
	}
	writes.set( f, out );
}

if ( warnings.length ) {
	console.error( 'WARNINGS:\n  ' + warnings.join( '\n  ' ) );
}
if ( problems.length ) {
	console.error( 'PROBLEMS:\n  ' + problems.join( '\n  ' ) );
}
console.error( writes.size + ' files' + ( DRY ? ' (dry run)' : '' ) );
if ( DRY ) {
	for ( const f of writes.keys() ) {
		console.log( path.relative( ROOT, f ) );
	}
	if ( process.env.S10_DUMP ) {
		for ( const [ f, s ] of writes ) {
			const out = path.join( process.env.S10_DUMP, path.relative( ROOT, f ) );
			fs.mkdirSync( path.dirname( out ), { recursive: true } );
			fs.writeFileSync( out, s );
		}
	}
} else if ( problems.length && !FORCE ) {
	console.error( 'not written (problems); fix the codemod or pass --force' );
	process.exit( 1 );
} else {
	for ( const [ f, s ] of writes ) {
		fs.writeFileSync( f, s );
	}
	// 6. Wrapper validation of output scalars (and its tests).
	for ( const P of plans ) {
		dropOutputChecks( P.routine, false );
	}
}
