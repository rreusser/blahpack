#!/usr/bin/env node

/**
* Codemod (ticket 0023, `strictNullChecks`): initialize to `NaN` each `let`
* that TypeScript reports as possibly `undefined` where it is read, when
* every value ever assigned to it is a number.
*
* Fortran-style control flow assigns a variable on correlated branches
* (`k` only when M is even, read only under `if ( !misodd )`). TypeScript
* cannot correlate the conditions and reports every read. Initializing to
* `NaN` changes nothing at runtime: in arithmetic, comparisons, truthiness,
* bitwise operations, typed-array stores and array indexing, `NaN` behaves
* exactly as `undefined` does, so a real read before assignment still
* yields NaN (and the harness's poisoned inputs still catch it). A blanket
* initialization to `0` would instead hide such a read.
*
* Skipped (listed for a hand fix): a variable compared with `undefined` or
* `void 0`, tested with `typeof`, or assigned anything but numbers.
*
* Usage:
*   node bin/codemod-strict-null.mjs [--dry-run] [files...]
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire( import.meta.url );
const ts = require( 'typescript' );
const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const CODES = new Set( [ 18048, 2345, 2322, 2454, 18047, 2532 ] );

function program() {
	const cfg = ts.getParsedCommandLineOfConfigFile( path.join( ROOT, 'tsconfig.json' ), { 'strictNullChecks': true }, Object.assign( {}, ts.sys, { 'onUnRecoverableConfigFileDiagnostic': () => {} } ) );
	return ts.createProgram( cfg.fileNames, cfg.options );
}

// The deepest node spanning `pos` (for `return anorm` the reported position
// is the `return` keyword, which no identifier spans).
function nodeAt( sf, pos ) {
	let found = null;
	( function find( n ) {
		if ( n.getStart( sf ) <= pos && pos < n.getEnd() ) {
			found = n;
			ts.forEachChild( n, find );
		}
	})( sf );
	return found;
}

function main() {
	const argv = process.argv.slice( 2 );
	const dry = argv.includes( '--dry-run' );
	const only = new Set( argv.filter( ( a ) => !a.startsWith( '--' ) ).map( ( f ) => path.resolve( f ) ) );
	const p = program();
	const checker = p.getTypeChecker();
	const targets = new Map();
	ts.getPreEmitDiagnostics( p ).forEach( ( d ) => {
		if ( !CODES.has( d.code ) || !d.file ) {
			return;
		}
		const file = path.resolve( d.file.fileName );
		if ( only.size && !only.has( file ) ) {
			return;
		}
		// Every identifier in the statement holding the diagnostic: for
		// `iseed[ o ] = it1` the reported span starts at `iseed`, but the
		// variable to initialize is `it1`. Over-collecting is harmless, as
		// only number-only `let`s without an initializer are touched.
		let stmt = nodeAt( d.file, d.start );
		while ( stmt && !ts.isStatement( stmt ) ) {
			stmt = stmt.parent;
		}
		if ( !stmt ) {
			return;
		}
		( function each( n ) {
			if ( ts.isIdentifier( n ) ) {
				const sym = checker.getSymbolAtLocation( n );
				const decl = sym && sym.valueDeclaration;
				if ( decl && ts.isVariableDeclaration( decl ) && !decl.initializer && ts.isIdentifier( decl.name ) && ( decl.parent.flags & ts.NodeFlags.Let ) ) {
					if ( !targets.has( file ) ) {
						targets.set( file, new Map() );
					}
					targets.get( file ).set( sym, decl );
				}
			}
			if ( !ts.isFunctionLike( n ) || n === stmt ) {
				ts.forEachChild( n, each );
			}
		})( stmt );
	});
	const manual = [];
	let changed = 0;
	let initialized = 0;
	targets.forEach( ( syms, file ) => {
		const sf = p.getSourceFile( file );
		const src = sf.getFullText();
		const edits = [];
		syms.forEach( ( decl, sym ) => {
			const name = decl.name.text;
			let ok = true;
			let assigned = 0;
			( function walk( n ) {
				if ( ts.isIdentifier( n ) && checker.getSymbolAtLocation( n ) === sym && n !== decl.name ) {
					const par = n.parent;
					if ( ts.isTypeOfExpression( par ) ) {
						ok = false;
					}
					if ( ts.isBinaryExpression( par ) && [ ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken ].includes( par.operatorToken.kind ) ) {
						const other = ( par.left === n ) ? par.right : par.left;
						if ( ( ts.isIdentifier( other ) && other.text === 'undefined' ) || ts.isVoidExpression( other ) ) {
							ok = false;
						}
					}
					if ( ts.isBinaryExpression( par ) && par.operatorToken.kind === ts.SyntaxKind.EqualsToken && par.left === n ) {
						assigned += 1;
						const t = checker.getBaseTypeOfLiteralType( checker.getTypeAtLocation( par.right ) );
						if ( !( checker.getNonNullableType( t ).flags & ts.TypeFlags.NumberLike ) ) {
							ok = false;
						}
					}
				}
				ts.forEachChild( n, walk );
			})( sf );
			if ( !ok || !assigned ) {
				manual.push( path.relative( ROOT, file ) + ': ' + name + ( assigned ? '' : ' (never assigned)' ) );
				return;
			}
			edits.push( [ decl.name.getEnd(), ' = NaN' ] );
			initialized += 1;
		});
		if ( !edits.length ) {
			return;
		}
		edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
		let out = src;
		edits.forEach( ( e ) => {
			out = out.slice( 0, e[ 0 ] ) + e[ 1 ] + out.slice( e[ 0 ] );
		});
		changed += 1;
		if ( !dry ) {
			fs.writeFileSync( file, out );
		}
	});
	console.log( ( dry ? 'would initialize ' : 'initialized ' ) + initialized + ' variables in ' + changed + ' files' );
	if ( manual.length ) {
		console.log( manual.length + ' variables need a hand fix:' );
		manual.forEach( ( m ) => console.log( '  ' + m ) );
	}
}

main();
