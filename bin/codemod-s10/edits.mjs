// Text-edit and AST helpers for the S10 codemod.
//
// Edits are { start, end, text }. A "big" edit whose text was rendered from its
// node with the leaf edits inside it already applied (see `render`) supersedes
// those leaf edits: `finalize` drops any edit contained in another.

export function walkParents( root, visit ) {
	( function rec( node, parent, key ) {
		if ( !node || typeof node.type !== 'string' ) {
			return;
		}
		if ( visit( node, parent, key ) === false ) {
			return;
		}
		for ( const k of Object.keys( node ) ) {
			if ( k === 'type' || k === 'start' || k === 'end' || k === 'loc' || k.startsWith( '__' ) ) {
				continue;
			}
			const v = node[ k ];
			if ( Array.isArray( v ) ) {
				for ( const c of v ) {
					if ( c && typeof c.type === 'string' ) {
						c.__parent = node;
						rec( c, node, k );
					}
				}
			} else if ( v && typeof v.type === 'string' ) {
				v.__parent = node;
				rec( v, node, k );
			}
		}
	})( root, null, null );
}

// Annotate every node with __parent.
export function annotate( ast ) {
	walkParents( ast, () => true );
	return ast;
}

export function isFunction( n ) {
	return n && ( n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression' );
}

export function enclosingFunction( node ) {
	let n = node.__parent;
	while ( n && !isFunction( n ) ) {
		n = n.__parent;
	}
	return n || null;
}

export function enclosingStatement( node ) {
	let n = node;
	while ( n.__parent && !/Statement$|Declaration$/.test( n.type ) ) {
		n = n.__parent;
	}
	// A VariableDeclaration inside a for-init is not a statement we can insert before.
	return n;
}

// Is `id` (an Identifier node) a variable reference (not a property name)?
export function isReference( id ) {
	const p = id.__parent;
	if ( !p ) {
		return true;
	}
	if ( p.type === 'MemberExpression' && p.property === id && !p.computed ) {
		return false;
	}
	if ( p.type === 'Property' && p.key === id && !p.computed && !p.shorthand ) {
		return false;
	}
	if ( p.type === 'MethodDefinition' && p.key === id ) {
		return false;
	}
	if ( ( p.type === 'ImportSpecifier' || p.type === 'ImportDefaultSpecifier' ) ) {
		return false;
	}
	if ( p.type === 'LabeledStatement' || p.type === 'BreakStatement' || p.type === 'ContinueStatement' ) {
		return false;
	}
	return true;
}

// All identifier names used as bindings or references anywhere in the AST.
export function usedNames( ast ) {
	const s = new Set();
	walkParents( ast, ( n ) => {
		if ( n.type === 'Identifier' && isReference( n ) ) {
			s.add( n.name );
		}
		return true;
	});
	return s;
}

export function lineIndent( src, pos ) {
	const ls = src.lastIndexOf( '\n', pos - 1 ) + 1;
	const m = /^[\t ]*/.exec( src.slice( ls ) );
	return m[ 0 ];
}

// Drop edits contained in a larger edit (the larger one already rendered them),
// check for partial overlaps, and apply.
export function finalize( src, edits ) {
	const sorted = edits.slice().sort( ( a, b ) => ( a.start - b.start ) || ( ( b.end - b.start ) - ( a.end - a.start ) ) );
	const kept = [];
	for ( const e of sorted ) {
		const outer = kept.find( ( k ) => k.start <= e.start && e.end <= k.end && !( k.start === e.start && k.end === e.end && k.start === k.end ) );
		if ( outer && !( e.start === e.end && ( e.start === outer.start || e.start === outer.end ) ) ) {
			if ( !outer.renders ) {
				throw new Error( 'edit [' + e.start + ',' + e.end + '] inside non-rendering edit [' + outer.start + ',' + outer.end + ']: ' + JSON.stringify( src.slice( outer.start, outer.end ).slice( 0, 80 ) ) );
			}
			continue;
		}
		const clash = kept.find( ( k ) => e.start < k.end && k.start < e.end );
		if ( clash ) {
			throw new Error( 'overlapping edits at ' + e.start + ': ' + JSON.stringify( src.slice( clash.start, clash.end ).slice( 0, 60 ) ) + ' / ' + JSON.stringify( src.slice( e.start, e.end ).slice( 0, 60 ) ) );
		}
		kept.push( e );
	}
	kept.sort( ( a, b ) => ( b.start - a.start ) || ( b.order || 0 ) - ( a.order || 0 ) );
	let out = src;
	for ( const e of kept ) {
		out = out.slice( 0, e.start ) + e.text + out.slice( e.end );
	}
	return out;
}

// Source text of [start, end) with the leaf edits strictly inside applied.
export function render( src, edits, start, end ) {
	const inner = edits.filter( ( e ) => e.start >= start && e.end <= end && !( e.start === start && e.end === end && e.renders ) );
	let text = src.slice( start, end );
	inner.sort( ( a, b ) => b.start - a.start );
	let last = Infinity;
	for ( const e of inner ) {
		if ( e.end > last ) {
			continue;
		}
		text = text.slice( 0, e.start - start ) + e.text + text.slice( e.end - start );
		last = e.start;
	}
	return text;
}

// Span that deletes the statement [start, end) together with its own line
// (leading indentation, a trailing `//` comment, the newline), so a zero-width
// insertion at the end of the previous line is untouched. Falls back to the
// bare span when other code shares the line.
export function lineSpan( src, start, end ) {
	const ls = src.lastIndexOf( '\n', start - 1 ) + 1;
	let nl = src.indexOf( '\n', end );
	if ( nl === -1 ) {
		nl = src.length;
	}
	if ( !/^[\t ]*$/.test( src.slice( ls, start ) ) || !/^[\t ]*(\/\/.*)?$/.test( src.slice( end, nl ) ) ) {
		return { start, end };
	}
	return { start: ls, end: Math.min( nl + 1, src.length ) };
}
