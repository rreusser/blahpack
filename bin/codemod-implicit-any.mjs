#!/usr/bin/env node

/**
* Codemod (ticket 0023, `noImplicitAny`): give each variable that TypeScript
* reports as implicitly `any` (TS7034: a `let` assigned on several paths and
* read inside a nested function, where control-flow typing cannot follow it)
* an explicit JSDoc type: the union of the types of every value assigned to
* it in the file, as the type checker sees them with `noImplicitAny` off.
*
* `let a, b, c;` becomes one `let` per annotated variable:
*
*     /** @type {number} *\/
*     let b;
*
* (a JSDoc `@type` on a multi-variable `let` types only the first one).
* A variable whose assigned values include `any`, or a type that cannot be
* written in JSDoc, is left alone and listed for a hand fix.
*
* Parameters reported as implicitly `any` (TS7006: a private helper whose
* JSDoc omits them) get a `@param` tag: the type is the union of the
* argument types at every call of the helper in the file, the description
* is copied from a same-named `@param` elsewhere in the module (else it
* names the helper's caller convention), in parameter order.
*
* A function documented `@returns {Object}` whose every `return` gives an
* object literal (a private helper returning several results, read as
* `res.info`, `res.ilo` by its caller: TS2339) gets the object's shape,
* `@returns {{info: number, ilo: number}}`.
*
* An ARPACK reverse-communication `state` parameter documented `{Object}`
* (the caller passes `{}`; the routine stores its progress on it) gets a
* `@typedef {Object} <Routine>State` with one optional `@property` per
* `state.X` the file assigns, typed from the assigned values, and the
* `@param` names that typedef. Every property is optional, so `{}` is
* still a valid first call.
*
* Usage:
*   node bin/codemod-implicit-any.mjs [--dry-run] [files...]   (default: every file tsc reports)
*/

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire( import.meta.url );
const ts = require( 'typescript' );
const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );

function program( noImplicitAny ) {
	const cfg = ts.getParsedCommandLineOfConfigFile( path.join( ROOT, 'tsconfig.json' ), { 'noImplicitAny': noImplicitAny }, Object.assign( {}, ts.sys, { 'onUnRecoverableConfigFileDiagnostic': () => {} } ) );
	return ts.createProgram( cfg.fileNames, cfg.options );
}

// A type as JSDoc text, or null when it cannot be written safely.
function typeText( checker, t ) {
	const widened = checker.getBaseTypeOfLiteralType( t );
	let s = checker.typeToString( checker.getWidenedType( widened ), void 0, ts.TypeFormatFlags.NoTruncation );
	// Typed arrays print with their buffer parameter.
	s = s.replace( /\b(Float64Array|Float32Array|Int32Array|Uint32Array|Int16Array|Uint16Array|Int8Array|Uint8Array|Uint8ClampedArray)<[^<>]*>/g, '$1' );
	if ( /\bany\b|import\(|=>|\{/.test( s ) ) {
		return null;
	}
	return s;
}

function main() {
	const argv = process.argv.slice( 2 );
	const dry = argv.includes( '--dry-run' );
	const only = new Set( argv.filter( ( a ) => !a.startsWith( '--' ) ).map( ( f ) => path.resolve( f ) ) );
	const strict = program( true );
	const targets = new Map();
	ts.getPreEmitDiagnostics( strict ).forEach( ( d ) => {
		if ( ( d.code !== 7034 && d.code !== 7006 && d.code !== 2339 ) || !d.file ) {
			return;
		}
		const f = path.resolve( d.file.fileName );
		if ( only.size && !only.has( f ) ) {
			return;
		}
		if ( !targets.has( f ) ) {
			targets.set( f, new Set() );
		}
		targets.get( f ).add( d.start );
	});
	const loose = program( false );
	const checker = loose.getTypeChecker();
	const manual = [];
	let changed = 0;
	targets.forEach( ( starts, file ) => {
		const sf = loose.getSourceFile( file );
		const src = sf.getFullText();
		// Declarations to annotate: identifier start -> { decl, stmt }.
		const decls = new Map();
		const assigned = new Map();
		( function walk( n ) {
			if ( ts.isVariableDeclaration( n ) && ts.isIdentifier( n.name ) && starts.has( n.name.getStart( sf ) ) ) {
				decls.set( checker.getSymbolAtLocation( n.name ), { 'decl': n, 'stmt': n.parent.parent } );
			}
			if ( ts.isBinaryExpression( n ) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier( n.left ) ) {
				const sym = checker.getSymbolAtLocation( n.left );
				if ( !assigned.has( sym ) ) {
					assigned.set( sym, [] );
				}
				assigned.get( sym ).push( n.right );
			}
			ts.forEachChild( n, walk );
		})( sf );
		// Group by statement, so each `let` is rewritten once.
		const byStmt = new Map();
		decls.forEach( ( v, sym ) => {
			const rhs = assigned.get( sym ) || [];
			const types = [ ...new Set( rhs.map( ( e ) => typeText( checker, checker.getTypeAtLocation( e ) ) ) ) ];
			const name = v.decl.name.text;
			if ( !rhs.length || types.includes( null ) ) {
				manual.push( path.relative( ROOT, file ) + ': ' + name + ( rhs.length ? ' (assigned an untypable value)' : ' (never assigned)' ) );
				return;
			}
			const T = types.length === 1 ? types[ 0 ] : types.map( ( x ) => ( /\s/.test( x ) ? '(' + x + ')' : x ) ).join( ' | ' );
			if ( !byStmt.has( v.stmt ) ) {
				byStmt.set( v.stmt, [] );
			}
			byStmt.get( v.stmt ).push( { 'name': name, 'type': T, 'decl': v.decl } );
		});
		const edits = [];
		// Parameters (TS7006), grouped by their function.
		const byFn = new Map();
		( function walkP( n ) {
			if ( ts.isParameter( n ) && ts.isIdentifier( n.name ) && starts.has( n.name.getStart( sf ) ) ) {
				const fn = n.parent;
				if ( !byFn.has( fn ) ) {
					byFn.set( fn, [] );
				}
				byFn.get( fn ).push( n );
			}
			ts.forEachChild( n, walkP );
		})( sf );
		const descs = {};
		// Real descriptions only: never this codemod's own fallback text.
		const harvest = ( text ) => {
			for ( const m of text.matchAll( /@param \{[^}]*\} \[?(\w+)[^\n]*? - ([^\n]+)/g ) ) {
				if ( !/^as passed by /.test( m[ 2 ] ) ) {
					descs[ m[ 1 ] ] = descs[ m[ 1 ] ] || m[ 2 ];
				}
			}
		};
		harvest( src );
		const dir = path.dirname( file );
		[ 'strided.js', 'base.js' ].forEach( ( f ) => {
			const other = path.join( dir, f );
			if ( other !== file && fs.existsSync( other ) ) {
				harvest( fs.readFileSync( other, 'utf8' ) );
			}
		});
		byFn.forEach( ( params, fn ) => {
			if ( !fn.name || !ts.isIdentifier( fn.name ) ) {
				params.forEach( ( p ) => manual.push( path.relative( ROOT, file ) + ': parameter ' + p.name.text + ' of an anonymous function' ) );
				return;
			}
			const sym = checker.getSymbolAtLocation( fn.name );
			const calls = [];
			( function walkC( n ) {
				if ( ts.isCallExpression( n ) && ts.isIdentifier( n.expression ) && checker.getSymbolAtLocation( n.expression ) === sym ) {
					calls.push( n );
				}
				ts.forEachChild( n, walkC );
			})( sf );
			const tags = [];
			for ( const p of params ) {
				const i = fn.parameters.indexOf( p );
				const types = [ ...new Set( calls.map( ( c ) => ( c.arguments[ i ] ? typeText( checker, checker.getTypeAtLocation( c.arguments[ i ] ) ) : null ) ) ) ];
				if ( !calls.length || types.includes( null ) ) {
					manual.push( path.relative( ROOT, file ) + ': parameter ' + p.name.text + ' of ' + fn.name.text + ( calls.length ? ' (an argument is untypable)' : ' (no call in the file)' ) );
					continue;
				}
				const T = types.length === 1 ? types[ 0 ] : types.map( ( x ) => ( /\s/.test( x ) ? '(' + x + ')' : x ) ).join( ' | ' );
				tags.push( { 'i': i, 'text': '@param {' + T + '} ' + p.name.text + ' - ' + ( descs[ p.name.text ] || 'as passed by `' + fn.name.text + '`\'s callers' ) } );
			}
			if ( !tags.length ) {
				return;
			}
			// Insert the tags into the function's JSDoc in parameter order:
			// before the first existing @param of a later parameter, else
			// before @returns, else at the end of the block.
			const fnStart = fn.getStart( sf );
			const jsdocEnd = src.lastIndexOf( '*/', fnStart );
			const jsdocStart = src.lastIndexOf( '/**', fnStart );
			const between = src.slice( jsdocEnd + 2, fnStart );
			if ( jsdocStart < 0 || jsdocEnd < jsdocStart || /\S/.test( between.replace( /\/\/[^\n]*/g, '' ) ) ) {
				const lines = [ '/**', '* ' + fn.name.text + '.', '*', '* @private' ].concat( tags.map( ( t ) => '* ' + t.text ) ).concat( [ '*/' ] );
				const lineStart = src.lastIndexOf( '\n', fnStart - 1 ) + 1;
				const indent = src.slice( lineStart, fnStart );
				edits.push( [ fnStart, fnStart, lines.join( '\n' + indent ) + '\n' + indent ] );
				return;
			}
			const block = src.slice( jsdocStart, jsdocEnd );
			const blockLines = block.split( '\n' );
			const indent = ( /\n([ \t]*)\*/.exec( block ) || [ '', '' ] )[ 1 ];
			const out = [];
			let pending = tags.slice().sort( ( a, b ) => a.i - b.i );
			const paramIndex = ( line ) => {
				const m = /@param \{[^}]*\} \[?(\w+)/.exec( line );
				return m ? fn.parameters.findIndex( ( q ) => ts.isIdentifier( q.name ) && q.name.text === m[ 1 ] ) : -2;
			};
			blockLines.forEach( ( line ) => {
				const pi = paramIndex( line );
				const isReturns = /@(returns|throws|example)\b/.test( line );
				if ( pending.length && ( isReturns || pi > -1 ) ) {
					const before = pending.filter( ( t ) => isReturns || t.i < pi );
					before.forEach( ( t ) => out.push( indent + '* ' + t.text ) );
					pending = pending.filter( ( t ) => !before.includes( t ) );
				}
				out.push( line );
			});
			if ( pending.length ) {
				// No @returns/@throws: append before the closing line.
				const last = out.pop();
				pending.forEach( ( t ) => out.push( indent + '* ' + t.text ) );
				out.push( last );
			}
			edits.push( [ jsdocStart, jsdocEnd, out.join( '\n' ) ] );
		});
		// `@returns {Object}` of a function that returns object literals.
		( function walkR( n ) {
			if ( ( ts.isFunctionDeclaration( n ) || ts.isFunctionExpression( n ) ) && n.body ) {
				const fnStart = n.getStart( sf );
				const jsdocEnd = src.lastIndexOf( '*/', fnStart );
				const jsdocStart = src.lastIndexOf( '/**', fnStart );
				const between = src.slice( jsdocEnd + 2, fnStart );
				const block = ( jsdocStart >= 0 && jsdocEnd > jsdocStart && !/\S/.test( between ) ) ? src.slice( jsdocStart, jsdocEnd ) : '';
				const m = /@returns \{Object\}/.exec( block );
				const rets = [];
				( function walkRet( k ) {
					if ( k !== n && ( ts.isFunctionDeclaration( k ) || ts.isFunctionExpression( k ) || ts.isArrowFunction( k ) ) ) {
						return;
					}
					if ( ts.isReturnStatement( k ) ) {
						rets.push( k.expression );
					}
					ts.forEachChild( k, walkRet );
				})( n.body );
				if ( m && rets.length && rets.every( ( e ) => e && ts.isObjectLiteralExpression( e ) ) ) {
					const shape = {};
					let ok = true;
					rets.forEach( ( e ) => {
						checker.getPropertiesOfType( checker.getTypeAtLocation( e ) ).forEach( ( prop ) => {
							const t = typeText( checker, checker.getTypeOfSymbolAtLocation( prop, e ) );
							if ( t === null ) {
								ok = false;
							}
							shape[ prop.name ] = shape[ prop.name ] ? [ ...new Set( shape[ prop.name ].concat( [ t ] ) ) ] : [ t ];
						});
					});
					const keys = Object.keys( shape );
					// Every return must give the same keys.
					if ( ok && rets.every( ( e ) => checker.getPropertiesOfType( checker.getTypeAtLocation( e ) ).length === keys.length ) ) {
						const T = '{' + keys.map( ( k ) => k + ': ' + shape[ k ].join( '|' ) ).join( ', ' ) + '}';
						edits.push( [ jsdocStart + m.index, jsdocStart + m.index + m[ 0 ].length, '@returns {' + T + '}' ] );
					} else {
						manual.push( path.relative( ROOT, file ) + ': @returns {Object} of ' + ( n.name ? n.name.text : 'a function' ) + ' (shape not uniform or untypable)' );
					}
				}
			}
			ts.forEachChild( n, walkR );
		})( sf );
		// ARPACK `state` objects.
		const stateDiag = [ ...starts ].some( ( st ) => /\bstate\b/.test( src.slice( Math.max( 0, st - 6 ), st ) ) );
		const pm = /^\* @param \{Object\} state - [^\n]*$/m.exec( src );
		if ( pm && stateDiag ) {
			const props = new Map();
			( function walkS( n ) {
				if ( ts.isBinaryExpression( n ) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression( n.left ) && ts.isIdentifier( n.left.expression ) && n.left.expression.text === 'state' ) {
					const k = n.left.name.text;
					const t = typeText( checker, checker.getTypeAtLocation( n.right ) );
					props.set( k, ( props.get( k ) || new Set() ).add( ( t === null || t === 'undefined' || t === 'null' ) ? 'Object' : t ) );
				}
				ts.forEachChild( n, walkS );
			})( sf );
			const routine = path.basename( path.dirname( path.dirname( file ) ) );
			const name = routine.charAt( 0 ).toUpperCase() + routine.slice( 1 ) + 'State';
			const keys = [ ...props.keys() ].sort();
			const typedef = [ '/**', '* Persistent reverse-communication state of `' + routine + '` (the caller passes `{}` on first use).', '*', '* @private', '* @typedef {Object} ' + name ]
				.concat( keys.map( ( k ) => '* @property {' + [ ...props.get( k ) ].join( '|' ) + '} [' + k + '] - saved `' + k + '`' ) )
				.concat( [ '*/', '', '', '' ] ).join( '\n' );
			const main = src.indexOf( '// MAIN //' );
			if ( main >= 0 && keys.length ) {
				edits.push( [ main, main, '// TYPES //\n\n' + typedef ] );
				edits.push( [ pm.index, pm.index + pm[ 0 ].length, pm[ 0 ].replace( '{Object}', '{' + name + '}' ) ] );
			} else {
				manual.push( path.relative( ROOT, file ) + ': state typedef (no // MAIN // section or no assigned properties)' );
			}
		}
		byStmt.forEach( ( vars, stmt ) => {
			const list = stmt.declarationList;
			const start = stmt.getStart( sf );
			const lineStart = src.lastIndexOf( '\n', start - 1 ) + 1;
			const indent = src.slice( lineStart, start );
			const kind = ( list.flags & ts.NodeFlags.Const ) ? 'const' : ( ( list.flags & ts.NodeFlags.Let ) ? 'let' : 'var' );
			const typed = new Set( vars.map( ( v ) => v.decl ) );
			const rest = list.declarations.filter( ( d ) => !typed.has( d ) ).map( ( d ) => d.getText( sf ) );
			const lines = [];
			if ( rest.length ) {
				lines.push( kind + ' ' + rest.join( ', ' ) + ';' );
			}
			vars.forEach( ( v ) => {
				lines.push( '/** @type {' + v.type + '} */' );
				lines.push( kind + ' ' + v.decl.getText( sf ) + ';' );
			});
			edits.push( [ start, stmt.getEnd(), lines.join( '\n' + indent ) ] );
		});
		if ( !edits.length ) {
			return;
		}
		edits.sort( ( a, b ) => b[ 0 ] - a[ 0 ] );
		let out = src;
		edits.forEach( ( e ) => {
			out = out.slice( 0, e[ 0 ] ) + e[ 2 ] + out.slice( e[ 1 ] );
		});
		changed += 1;
		if ( !dry ) {
			fs.writeFileSync( file, out );
		}
	});
	console.log( ( dry ? 'would change ' : 'changed ' ) + changed + ' files' );
	if ( manual.length ) {
		console.log( manual.length + ' variables need a hand fix:' );
		manual.forEach( ( m ) => console.log( '  ' + m ) );
	}
}

main();
