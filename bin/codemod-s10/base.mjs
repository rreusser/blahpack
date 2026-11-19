// Rewrite a routine's own base.js to the S10 form: each output scalar becomes a
// caller-provided length-1 array param, written as `x[ 0 ]` (Fortran writes the
// argument directly; the body's local of the same name becomes the array slot).
// The return value becomes INFO / the spec's return array / nothing (S11).

import { parse } from '../codemod-strided-wrapper/lib.mjs';
import { annotate, walkParents, isFunction, isReference, lineIndent, finalize, render } from './edits.mjs';
import { mainFunction, ownReturns, keyName, isComplex } from './forms.mjs';
import { arrayType, offsetName } from './plan.mjs';
import { paramLine, rewriteJsdoc } from './docs.mjs';

const REINTERPRET = 'import reinterpret from \'@stdlib/strided/base/reinterpret-complex128/lib/index.js\';';

// Declarators and references of `name` within fnNode (including nested closures
// unless they rebind the name).
function bindingInfo( fnNode, name ) {
	const decls = [];
	const refs = [];
	let shadowed = false;
	walkParents( fnNode.body, ( n ) => {
		if ( isFunction( n ) ) {
			const binds = n.params.some( ( p ) => p.type === 'Identifier' && p.name === name );
			if ( binds ) {
				shadowed = true;
				return false;
			}
		}
		if ( n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.id.name === name ) {
			decls.push( n );
		}
		if ( n.type === 'Identifier' && n.name === name && isReference( n ) ) {
			const p = n.__parent;
			if ( p.type === 'VariableDeclarator' && p.id === n ) {
				return true;
			}
			refs.push( n );
		}
		return true;
	});
	return { decls, refs, shadowed };
}

export function transformBase( src, P ) {
	const problems = [];
	const ast = annotate( parse( src ) );
	const main = mainFunction( ast, P.fn );
	const edits = [];
	const outByName = new Map( P.outs.map( ( p ) => [ p.name, p ] ) );
	const arrayified = new Set();
	let needReinterpret = false;

	// 1. Arrayify the local (or by-value param) holding each output.
	const declEdits = new Map(); // VariableDeclaration → Set(declarator) removed
	for ( const p of P.outs ) {
		const f = P.form[ p.name ];
		const N = P.pname[ p.name ];
		if ( isComplex( p ) ) {
			const bi = bindingInfo( main, N );
			if ( bi.decls.length ) {
				problems.push( 'complex output ' + N + ' collides with a local' );
			}
			continue;
		}
		const bi = bindingInfo( main, N );
		if ( bi.shadowed ) {
			problems.push( N + ' is rebound by a nested function' );
		}
		if ( f.kind === 'value' ) {
			if ( bi.decls.length ) {
				problems.push( 'by-value param ' + N + ' redeclared' );
			}
		} else if ( !bi.decls.length && !bi.refs.length ) {
			// Not used as a local: nothing to arrayify.
			continue;
		} else if ( !bi.decls.length && bi.refs.length && main.params.every( ( q ) => q.name !== N ) ) {
			// Only the array itself (a pass-through argument written by the
			// call-site rewrite): nothing to arrayify.
			continue;
		}
		for ( const d of bi.decls ) {
			const decl = d.__parent;
			if ( decl.__parent.type === 'ForStatement' || decl.__parent.type === 'ForInStatement' || decl.__parent.type === 'ForOfStatement' ) {
				problems.push( N + ' declared in a for-init' );
				continue;
			}
			if ( d.init && /^(NewExpression|ArrayExpression|ObjectExpression)$/.test( d.init.type ) ) {
				problems.push( N + ' local holds ' + d.init.type );
			}
			if ( !declEdits.has( decl ) ) {
				declEdits.set( decl, new Set() );
			}
			declEdits.get( decl ).add( d );
		}
		for ( const r of bi.refs ) {
			edits.push( { start: r.start, end: r.end, text: N + '[ 0 ]' } );
		}
		arrayified.add( N );
	}

	// 2a. Strided slots (`ab[ offsetAB + strideAB ]`) → the output's own array.
	const slotParams = new Map();
	for ( const p of P.outs ) {
		const f = P.form[ p.name ];
		if ( f.kind === 'slot' ) {
			if ( !slotParams.has( f.param ) ) {
				slotParams.set( f.param, { f, byIndex: new Map() } );
			}
			slotParams.get( f.param ).byIndex.set( f.index, P.pname[ p.name ] );
		}
	}
	for ( const [ param, { f, byIndex } ] of slotParams ) {
		const bi = bindingInfo( main, param );
		for ( const r of bi.refs ) {
			const m = r.__parent;
			if ( m.type === 'MemberExpression' && m.object === r && m.computed ) {
				const expr = src.slice( m.property.start, m.property.end ).replace( new RegExp( '\\b' + f.offset + '\\b', 'g' ), '0' ).replace( new RegExp( '\\b' + f.stride + '\\b', 'g' ), '1' );
				let k = null;
				if ( /^[\d\s+*()-]+$/.test( expr ) ) {
					k = Function( 'return ' + expr )();
				}
				if ( k !== null && byIndex.has( k ) ) {
					edits.push( { start: m.start, end: m.end, text: byIndex.get( k ) + '[ 0 ]' } );
					continue;
				}
			}
			problems.push( 'unhandled use of slot param `' + param + '` at ' + src.slice( 0, r.start ).split( '\n' ).length );
		}
	}

	// 2b. Packed `out[ k ]` / `out.M` → the output's own array. If the
	// container is used any other way (handed to a helper), keep it as a
	// module-level scratch and copy out on return.
	const outParam = Object.values( P.form ).find( ( f ) => f.kind === 'outIndex' || f.kind === 'outField' );
	let scratch = null;
	if ( outParam ) {
		const bi0 = bindingInfo( main, outParam.param );
		const odd = bi0.refs.filter( ( r ) => {
			const m = r.__parent;
			if ( m.type === 'ReturnStatement' ) {
				return false;
			}
			return !( m.type === 'MemberExpression' && m.object === r && ( ( m.computed && m.property.type === 'Literal' ) || !m.computed ) );
		});
		if ( odd.length && outParam.kind === 'outIndex' ) {
			scratch = outParam.param.toUpperCase();
			const n = Math.max( ...P.outs.filter( ( p ) => P.form[ p.name ].kind === 'outIndex' ).map( ( p ) => P.form[ p.name ].index ) ) + 1;
			for ( const r of bi0.refs ) {
				if ( r.__parent.type !== 'ReturnStatement' ) {
					edits.push( { start: r.start, end: r.end, text: scratch } );
				}
			}
			const lastImport = ast.body.filter( ( x ) => x.type === 'ImportDeclaration' ).pop();
			const firstFn = ast.body.find( ( x ) => x.start > ( lastImport ? lastImport.end : 0 ) && ( x.type === 'FunctionDeclaration' || x.type === 'VariableDeclaration' ) );
			const at = firstFn ? src.lastIndexOf( '\n', ( src.lastIndexOf( '/**', firstFn.start ) > ( lastImport ? lastImport.end : 0 ) && firstFn.type === 'FunctionDeclaration' ) ? src.lastIndexOf( '/**', firstFn.start ) : firstFn.start ) + 1 : src.length;
			edits.push( { start: at, end: at, text: '// Scratch for the helpers that fill the packed result; copied to the outputs on return.\nconst ' + scratch + ' = new Float64Array( ' + n + ' );\n\n', order: -1 } );
		}
	}
	if ( outParam && !scratch ) {
		const byIndex = new Map();
		const byKey = new Map();
		for ( const p of P.outs ) {
			const f = P.form[ p.name ];
			if ( f.kind === 'outIndex' ) {
				byIndex.set( f.index, P.pname[ p.name ] );
			} else if ( f.kind === 'outField' ) {
				byKey.set( f.key, P.pname[ p.name ] );
			}
		}
		const bi = bindingInfo( main, outParam.param );
		for ( const r of bi.refs ) {
			const m = r.__parent;
			if ( m.type === 'MemberExpression' && m.object === r ) {
				if ( m.computed && m.property.type === 'Literal' && byIndex.has( m.property.value ) ) {
					edits.push( { start: m.start, end: m.end, text: byIndex.get( m.property.value ) + '[ 0 ]' } );
					continue;
				}
				if ( !m.computed && byKey.has( m.property.name ) ) {
					edits.push( { start: m.start, end: m.end, text: byKey.get( m.property.name ) + '[ 0 ]' } );
					continue;
				}
			}
			if ( m.type === 'ReturnStatement' ) {
				continue;
			}
			problems.push( 'unhandled use of `' + outParam.param + '` at ' + src.slice( 0, r.start ).split( '\n' ).length );
		}
	}

	// 3. Declarations losing declarators.
	for ( const [ decl, gone ] of declEdits ) {
		const keep = decl.declarations.filter( ( d ) => !gone.has( d ) );
		const assigns = decl.declarations.filter( ( d ) => gone.has( d ) && d.init ).map( ( d ) => d.id.name + '[ 0 ] = ' + render( src, edits, d.init.start, d.init.end ) + ';' ).filter( ( a ) => {
			const m = /^(\w+\[ 0 \]) = (.*);$/.exec( a );
			return !( m && m[ 1 ] === m[ 2 ] );
		});
		const ind = lineIndent( src, decl.start );
		const parts = [];
		if ( keep.length ) {
			parts.push( decl.kind + ' ' + keep.map( ( d ) => render( src, edits, d.start, d.end ) ).join( ', ' ) + ';' );
		}
		parts.push( ...assigns );
		if ( parts.length ) {
			edits.push( { start: decl.start, end: decl.end, text: parts.join( '\n' + ind ), renders: true } );
		} else {
			// Remove the whole line.
			const ls = src.lastIndexOf( '\n', decl.start - 1 );
			let end = decl.end;
			// Trailing comment on the same line goes too.
			const nl = src.indexOf( '\n', end );
			if ( /^\s*(\/\/.*)?$/.test( src.slice( end, nl ) ) ) {
				end = nl;
			}
			edits.push( { start: ls, end, text: '', renders: true } );
		}
	}

	// 4. Return statements.
	const returnForm = P.outs.find( ( p ) => P.form[ p.name ].kind === 'return' );
	const rets = ownReturns( main );
	const localFns = new Set( ast.body.filter( ( x ) => x.type === 'FunctionDeclaration' && x !== main ).map( ( x ) => x.id.name ) );
	const usedIn = new Set();
	walkParents( main, ( n ) => {
		if ( n.type === 'Identifier' ) {
			usedIn.add( n.name );
		}
		return true;
	});
	const lastStmt = main.body.body[ main.body.body.length - 1 ];
	const writeOut = ( p, valText, lines ) => {
		const N = P.pname[ p.name ];
		if ( valText === N + '[ 0 ]' ) {
			return;
		}
		lines.push( N + '[ 0 ] = ' + valText + ';' );
	};
	for ( const r of rets ) {
		const lines = [];
		let infoText = null;
		const extras = [];
		let handled = false;
		if ( r.argument && r.argument.type === 'ObjectExpression' ) {
			handled = true;
			const written = new Set();
			for ( const prop of r.argument.properties ) {
				const k = keyName( prop );
				if ( k === null ) {
					problems.push( 'computed/spread key in returned object' );
					continue;
				}
				const val = render( src, edits, prop.value.start, prop.value.end );
				if ( k === 'info' ) {
					infoText = val;
					continue;
				}
				const p = P.outs.find( ( q ) => {
					const f = P.form[ q.name ];
					return f.key === k && f.kind !== 'outField';
				});
				if ( p ) {
					for ( const w of written ) {
						if ( val.includes( w + '[ 0 ]' ) ) {
							problems.push( 'return writes ' + w + ' before reading it' );
						}
					}
					writeOut( p, val, lines );
					written.add( P.pname[ p.name ] );
					continue;
				}
				const c = P.outs.find( ( q ) => P.form[ q.name ].kind === 'cfield' && ( P.form[ q.name ].re === k || P.form[ q.name ].im === k ) );
				if ( c ) {
					const N = P.pname[ c.name ];
					const off = offsetName( c );
					const im = P.form[ c.name ].im === k;
					lines.push( N + 'v[ ' + ( im ? '( ' + off + ' * 2 ) + 1' : off + ' * 2' ) + ' ] = ' + val + ';' );
					needReinterpret = true;
					continue;
				}
				extras.push( '\'' + k + '\': ' + val );
			}
		} else if ( outParam && r.argument && r.argument.type === 'Identifier' && r.argument.name === outParam.param ) {
			handled = true;
		} else if ( r.argument && r.argument.type === 'CallExpression' && r.argument.callee.type === 'Identifier' && P.outs.some( ( p ) => P.form[ p.name ].kind === 'field' ) ) {
			// Delegation to a same-file implementation returning the old object.
			handled = true;
			const tmp = [ 'result', 'res', 'out', 'obj' ].find( ( x ) => !usedIn.has( x ) );
			lines.push( 'const ' + tmp + ' = ' + render( src, edits, r.argument.start, r.argument.end ) + ';' );
			for ( const p of P.outs ) {
				const f = P.form[ p.name ];
				if ( f.kind === 'field' ) {
					writeOut( p, tmp + '.' + f.key, lines );
				}
			}
			if ( P.hasInfoKey || P.ret === 'info' ) {
				infoText = tmp + '.info';
			}
		} else if ( returnForm && r.argument ) {
			handled = true;
			writeOut( returnForm, render( src, edits, r.argument.start, r.argument.end ), lines );
		}
		if ( scratch && handled ) {
			for ( const p of P.outs ) {
				const f = P.form[ p.name ];
				if ( f.kind === 'outIndex' ) {
					lines.unshift( P.pname[ p.name ] + '[ 0 ] = ' + scratch + '[ ' + f.index + ' ];' );
				}
			}
		}
		if ( !handled ) {
			if ( r.argument && P.ret !== 'info' && P.ret !== 'function' && !( P.ret === 'array' && r.argument.type === 'Identifier' && r.argument.name.toLowerCase() === String( P.retParam ).toLowerCase() ) ) {
				problems.push( 'non-object return `' + src.slice( r.start, r.end ).slice( 0, 50 ) + '`' );
			}
			continue;
		}
		let retText;
		if ( extras.length ) {
			retText = 'return {\n' + ( infoText !== null ? [ '\'info\': ' + infoText ] : [] ).concat( extras ).map( ( x ) => '\t' + x ).join( ',\n' ) + '\n};';
		} else if ( P.ret === 'info' ) {
			retText = 'return ' + ( infoText !== null ? infoText : '0' ) + ';';
		} else if ( P.ret === 'array' ) {
			retText = 'return ' + P.retParam + ';';
		} else if ( P.ret === 'none' ) {
			retText = ( r === lastStmt ) ? null : 'return;';
		} else {
			problems.push( 'unexpected return kind ' + P.ret );
			retText = 'return;';
		}
		if ( retText ) {
			lines.push( retText );
		}
		const ind = lineIndent( src, r.start );
		const parent = r.__parent;
		const inBlock = parent.type === 'BlockStatement' || parent.type === 'SwitchCase' || parent.type === 'Program';
		let text;
		if ( inBlock ) {
			text = lines.map( ( l ) => l.replace( /\n/g, '\n' + ind ) ).join( '\n' + ind );
			if ( !lines.length ) {
				// Drop the line.
				const ls = src.lastIndexOf( '\n', r.start - 1 );
				edits.push( { start: ls, end: r.end, text: '', renders: true } );
				continue;
			}
		} else {
			text = '{\n' + lines.map( ( l ) => ind + '\t' + l.replace( /\n/g, '\n' + ind + '\t' ) ).join( '\n' ) + '\n' + ind + '}';
		}
		edits.push( { start: r.start, end: r.end, text, renders: true } );
	}

	// 5. Self-assignments `x[ 0 ] = x[ 0 ];` produced by `out[ k ] = x`.
	walkParents( main.body, ( n ) => {
		if ( n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.operator === '=' ) {
			const a = n.expression;
			const l = render( src, edits, a.left.start, a.left.end );
			const r = render( src, edits, a.right.start, a.right.end );
			if ( l === r && /\[ 0 \]$/.test( l ) ) {
				const ls = src.lastIndexOf( '\n', n.start - 1 );
				edits.push( { start: ls, end: n.end, text: '', renders: true } );
			}
		}
		return true;
	});

	// 6. Complex views.
	if ( needReinterpret ) {
		const ind = lineIndent( src, main.body.body[ 0 ].start );
		const views = P.outs.filter( ( p ) => P.form[ p.name ].kind === 'cfield' ).map( ( p ) => 'const ' + P.pname[ p.name ] + 'v = reinterpret( ' + P.pname[ p.name ] + ', 0 );' );
		const eol = src.indexOf( '\n', main.body.start );
		edits.push( { start: eol, end: eol, text: '\n' + ind + views.join( '\n' + ind ), order: 1 } );
		if ( !/import reinterpret from/.test( src ) ) {
			const im = ast.body.filter( ( n ) => n.type === 'ImportDeclaration' ).pop();
			edits.push( { start: im.end, end: im.end, text: '\n' + REINTERPRET, order: 2 } );
		}
	}

	// 7. Param list.
	const open = src.indexOf( '(', main.id.end );
	const close = main.params.length ? src.indexOf( ')', main.params[ main.params.length - 1 ].end ) : src.indexOf( ')', open );
	edits.push( { start: open, end: close + 1, text: '( ' + P.newBase.join( ', ' ) + ' )' } );

	let out = finalize( src, edits );

	// 8. JSDoc of the main function.
	out = rewriteMainJsdoc( out, P, P.fn, P.newBase, true );
	return { src: out, problems };
}

export function returnsLine( P ) {
	if ( P.extras.length ) {
		return '* @returns {Object} result with ' + [ 'info' ].concat( P.extras ).map( ( x ) => '`' + x + '`' ).join( ', ' );
	}
	if ( P.ret === 'info' ) {
		return '* @returns {integer} status code (0 = success)';
	}
	if ( P.ret === 'array' ) {
		const p = P.spec.params.find( ( x ) => x.name.toLowerCase() === String( P.retParam ).toLowerCase() );
		const t = p ? ( isComplex( p ) ? 'Complex128Array' : ( p.dtype === 'int32' ? 'Int32Array' : 'Float64Array' ) ) : 'Float64Array';
		return '* @returns {' + t + '} `' + P.retParam + '`';
	}
	if ( P.ret === 'none' ) {
		return '* @returns {void}';
	}
	return null;
}

// Rewrite the JSDoc preceding `function <fn>(` in src.
export function rewriteMainJsdoc( src, P, fn, newList, isBase ) {
	const fi = src.search( new RegExp( 'function\\s+' + fn + '\\s*\\(' ) );
	const ds = src.lastIndexOf( '/**', fi );
	const de = src.indexOf( '*/', ds ) + 2;
	if ( ds === -1 || de > fi ) {
		return src;
	}
	const doc = src.slice( ds, de );
	const added = {};
	const retyped = {};
	for ( const p of P.outs ) {
		const f = P.form[ p.name ];
		const N = P.pname[ p.name ];
		if ( f.kind === 'value' ) {
			retyped[ N ] = arrayType( p );
		} else {
			const ls = paramLine( P.routine, p, N );
			added[ N ] = [ ls[ 0 ] ];
			if ( ls[ 1 ] ) {
				added[ offsetName( p ) ] = [ ls[ 1 ] ];
			}
		}
	}
	void isBase;
	const nd = rewriteJsdoc( doc, newList, added, retyped, returnsLine( P ) );
	return src.slice( 0, ds ) + nd + src.slice( de );
}

// Wrapper quick returns: `return { 'info': 0, 'sdim': 0 };` in ndarray.js /
// <r>.js → output writes + the new return value.
export function rewriteWrapperReturns( src, P, fn ) {
	const ast = annotate( parse( src ) );
	const main = mainFunction( ast, fn );
	const edits = [];
	const problems = [];
	for ( const r of ownReturns( main ) ) {
		if ( !r.argument || r.argument.type !== 'ObjectExpression' ) {
			continue;
		}
		const lines = [];
		let infoText = null;
		const extras = [];
		for ( const prop of r.argument.properties ) {
			const k = keyName( prop );
			const val = src.slice( prop.value.start, prop.value.end );
			if ( k === 'info' ) {
				infoText = val;
				continue;
			}
			const p = P.outs.find( ( q ) => P.form[ q.name ].key === k && P.form[ q.name ].kind !== 'outField' );
			if ( p && !isComplex( p ) ) {
				lines.push( P.pname[ p.name ] + '[ 0 ] = ' + val + ';' );
				continue;
			}
			extras.push( '\'' + k + '\': ' + val );
		}
		if ( extras.length ) {
			lines.push( 'return {\n' + ( infoText !== null ? [ '\'info\': ' + infoText ] : [] ).concat( extras ).map( ( x ) => '\t' + x ).join( ',\n' ) + '\n};' );
		} else if ( P.ret === 'info' ) {
			lines.push( 'return ' + ( infoText !== null ? infoText : '0' ) + ';' );
		} else if ( P.ret === 'array' ) {
			lines.push( 'return ' + P.retParam + ';' );
		} else {
			lines.push( 'return;' );
		}
		const ind = lineIndent( src, r.start );
		const inBlock = r.__parent.type === 'BlockStatement' || r.__parent.type === 'SwitchCase';
		const text = inBlock ? lines.map( ( l ) => l.replace( /\n/g, '\n' + ind ) ).join( '\n' + ind ) : '{\n' + lines.map( ( l ) => ind + '\t' + l.replace( /\n/g, '\n' + ind + '\t' ) ).join( '\n' ) + '\n' + ind + '}';
		edits.push( { start: r.start, end: r.end, text } );
	}
	return { src: edits.length ? finalize( src, edits ) : src, problems };
}
