'use strict';

// Fortran expression → AST → JavaScript, for the spec generator.
//
// Grammar: the subset that appears in reference argument checks, quick-return
// conditions, dimension declarations and doc constraints (logical/relational/
// arithmetic operators, intrinsic calls, LSAME). Anything outside it throws,
// and the caller records the expression as untranslated rather than guessing.

var REL = { '.EQ.': '===', '.NE.': '!==', '.LT.': '<', '.LE.': '<=', '.GT.': '>', '.GE.': '>=', '==': '===', '/=': '!==', '<': '<', '<=': '<=', '>': '>', '>=': '>=' };

function tokenize( s ) {
	var re = /\s*(\.(?:NOT|AND|OR|EQV|NEQV|EQ|NE|LT|LE|GT|GE|TRUE|FALSE)\.|'[^']*'|[A-Z_][A-Z0-9_]*|(?:\d+\.?\d*|\.\d+)(?:[DE][-+]?\d+)?|\*\*|==|\/=|<=|>=|[-+*\/(),<>:])/gy;
	var out = [];
	var m;
	var pos = 0;
	s = String( s ).toUpperCase().trim();
	while ( pos < s.length ) {
		re.lastIndex = pos;
		m = re.exec( s );
		if ( !m ) {
			throw new Error( 'cannot tokenize at: ' + s.slice( pos ) );
		}
		out.push( m[ 1 ] );
		pos = re.lastIndex;
		while ( s[ pos ] === ' ' ) {
			pos += 1;
		}
	}
	return out;
}

function parse( expr ) {
	var toks = tokenize( expr );
	var i = 0;
	function peek() {
		return toks[ i ];
	}
	function next() {
		i += 1;
		return toks[ i - 1 ];
	}
	function expect( t ) {
		if ( next() !== t ) {
			throw new Error( 'expected ' + t + ' in ' + expr );
		}
	}
	function eqv() {
		var a = disj();
		var op;
		while ( peek() === '.EQV.' || peek() === '.NEQV.' ) {
			op = next();
			a = { 'type': 'bin', 'op': ( op === '.EQV.' ) ? '===' : '!==', 'l': a, 'r': disj() };
		}
		return a;
	}
	function disj() {
		var a = conj();
		while ( peek() === '.OR.' ) {
			next();
			a = { 'type': 'bin', 'op': '||', 'l': a, 'r': conj() };
		}
		return a;
	}
	function conj() {
		var a = negation();
		while ( peek() === '.AND.' ) {
			next();
			a = { 'type': 'bin', 'op': '&&', 'l': a, 'r': negation() };
		}
		return a;
	}
	function negation() {
		if ( peek() === '.NOT.' ) {
			next();
			return { 'type': 'not', 'e': negation() };
		}
		return relation();
	}
	function relation() {
		var a = additive();
		var op;
		if ( REL[ peek() ] ) {
			op = next();
			return { 'type': 'bin', 'op': REL[ op ], 'l': a, 'r': additive() };
		}
		return a;
	}
	function additive() {
		var a;
		var op;
		if ( peek() === '-' || peek() === '+' ) {
			op = next();
			a = multiplicative();
			if ( op === '-' ) {
				a = { 'type': 'neg', 'e': a };
			}
		} else {
			a = multiplicative();
		}
		while ( peek() === '+' || peek() === '-' ) {
			op = next();
			a = { 'type': 'bin', 'op': op, 'l': a, 'r': multiplicative() };
		}
		return a;
	}
	function multiplicative() {
		var a = power();
		var op;
		while ( peek() === '*' || peek() === '/' ) {
			op = next();
			a = { 'type': 'bin', 'op': op, 'l': a, 'r': power() };
		}
		return a;
	}
	function power() {
		var a = primary();
		if ( peek() === '**' ) {
			next();
			return { 'type': 'bin', 'op': '**', 'l': a, 'r': power() };
		}
		return a;
	}
	function primary() {
		var t = next();
		var a;
		var args;
		if ( t === undefined ) {
			throw new Error( 'unexpected end of ' + expr );
		}
		if ( t === '(' ) {
			a = eqv();
			expect( ')' );
			return a;
		}
		if ( t === '.TRUE.' || t === '.FALSE.' ) {
			return { 'type': 'bool', 'v': t === '.TRUE.' };
		}
		if ( /^'/.test( t ) ) {
			return { 'type': 'str', 'v': t.slice( 1, -1 ) };
		}
		if ( /^[\d.]/.test( t ) ) {
			return { 'type': 'num', 'v': Number( t.replace( /D/, 'E' ) ), 'int': /^\d+$/.test( t ) };
		}
		if ( !/^[A-Z_]/.test( t ) ) {
			throw new Error( 'unexpected ' + t + ' in ' + expr );
		}
		if ( peek() === '(' ) {
			next();
			args = [];
			if ( peek() !== ')' ) {
				args.push( eqv() );
				while ( peek() === ',' ) {
					next();
					args.push( eqv() );
				}
			}
			expect( ')' );
			return { 'type': 'call', 'name': t, 'args': args };
		}
		return { 'type': 'id', 'name': t };
	}
	var v = eqv();
	if ( i !== toks.length ) {
		throw new Error( 'trailing tokens in ' + expr );
	}
	return v;
}

// Longest parseable token prefix (for doc-comment constraints that run into
// prose, e.g. `MAX(1,N) IS SUFFICIENT`). Returns null if no prefix parses.
function parsePrefix( text ) {
	var toks;
	var k;
	try {
		return parse( text );
	} catch ( err ) {
		// fall through
	}
	try {
		toks = tokenize( text );
	} catch ( err ) {
		toks = tokenize( String( text ).replace( /\\.*$/, '' ) );
	}
	for ( k = toks.length - 1; k > 0; k-- ) {
		try {
			return parse( toks.slice( 0, k ).join( ' ' ) );
		} catch ( err ) {
			// shorter
		}
	}
	return null;
}

// Identifiers referenced by an AST (excluding called function names).
function ids( node, out ) {
	out = out || {};
	if ( !node ) {
		return out;
	}
	switch ( node.type ) {
	case 'id': out[ node.name ] = true; break;
	case 'bin': ids( node.l, out ); ids( node.r, out ); break;
	case 'not': case 'neg': ids( node.e, out ); break;
	case 'call': node.args.forEach( function each( a ) {
		ids( a, out );
	}); break;
	default: break;
	}
	return out;
}

// Substitute locals (unconditional or IF/ELSE cascades) into an AST.
// `locals` maps NAME → [ [guard|null|'ELSE', expr], ... ]. Returns a new AST.
// Throws when a local's definition can't be expressed (deeper nesting).
function inline( node, locals, isArg, depth ) {
	depth = depth || 0;
	if ( depth > 12 ) {
		throw new Error( 'local recursion too deep' );
	}
	function rec( n ) {
		return inline( n, locals, isArg, depth + 1 );
	}
	switch ( node.type ) {
	case 'id':
		if ( isArg( node.name ) || !locals[ node.name ] ) {
			return node;
		}
		if ( typeof locals[ node.name ] === 'string' ) {
			return constant( locals[ node.name ] );
		}
		return rec( cascade( node.name, locals[ node.name ] ) );
	case 'bin': return { 'type': 'bin', 'op': node.op, 'l': rec( node.l ), 'r': rec( node.r ) };
	case 'not': case 'neg': return { 'type': node.type, 'e': rec( node.e ) };
	case 'call': return { 'type': 'call', 'name': node.name, 'args': node.args.map( rec ) };
	case 'cond': return { 'type': 'cond', 'c': rec( node.c ), 't': rec( node.t ), 'f': rec( node.f ) };
	default: return node;
	}
}

// A PARAMETER constant: real/integer literal, or complex `( re, im )`.
function constant( text ) {
	var m = /^\(\s*([-+]?[\d.]+(?:[DE][-+]?\d+)?)\s*,\s*([-+]?[\d.]+(?:[DE][-+]?\d+)?)\s*\)$/i.exec( text.trim() );
	if ( m ) {
		return { 'type': 'cnum', 're': Number( m[ 1 ].replace( /D/i, 'E' ) ), 'im': Number( m[ 2 ].replace( /D/i, 'E' ) ) };
	}
	return parse( text );
}

// Build a conditional AST from a definition list: later definitions override
// earlier ones; guarded definitions in one IF/ELSE IF/ELSE block form a chain.
function cascade( name, defs ) {
	var val = null;
	var chain = [];
	var i;
	function flushChain() {
		var j;
		var out;
		if ( !chain.length ) {
			return;
		}
		// Without an ELSE, the fall-through value is the prior definition.
		out = val;
		for ( j = chain.length - 1; j >= 0; j-- ) {
			if ( chain[ j ][ 0 ] === 'ELSE' ) {
				out = parse( chain[ j ][ 1 ] );
			} else {
				if ( out === null ) {
					throw new Error( 'local ' + name + ' undefined on some path' );
				}
				out = { 'type': 'cond', 'c': parse( chain[ j ][ 0 ] ), 't': parse( chain[ j ][ 1 ] ), 'f': out };
			}
		}
		val = out;
		chain = [];
	}
	for ( i = 0; i < defs.length; i++ ) {
		if ( defs[ i ][ 0 ] === '?' ) {
			throw new Error( 'local ' + name + ' is assigned inside nested control flow' );
		}
		if ( defs[ i ][ 0 ] === null ) {
			flushChain();
			val = parse( defs[ i ][ 1 ] );
		} else {
			// A new IF block starts when the previous guard was ELSE or this
			// guard does not continue an open chain (heuristic-free: the
			// extractor records ELSE explicitly; a fresh guard after a closed
			// chain starts a new chain).
			if ( chain.length && chain[ chain.length - 1 ][ 0 ] === 'ELSE' ) {
				flushChain();
			}
			chain.push( defs[ i ] );
		}
	}
	flushChain();
	if ( val === null ) {
		throw new Error( 'local ' + name + ' has no definition' );
	}
	return val;
}

// Three-valued evaluation (true/false/number/string/null=unknown), used to
// decide which option letters a check rejects. env.value( name ) returns the
// value of an identifier or null.
function evaluate( node, env ) {
	var a;
	var b;
	switch ( node.type ) {
	case 'bool': return node.v;
	case 'num': return node.v;
	case 'str': return node.v;
	case 'id': return env.value( node.name );
	case 'not':
		a = evaluate( node.e, env );
		return ( typeof a === 'boolean' ) ? !a : null;
	case 'neg':
		a = evaluate( node.e, env );
		return ( typeof a === 'number' ) ? -a : null;
	case 'cond':
		a = evaluate( node.c, env );
		if ( a === true ) {
			return evaluate( node.t, env );
		}
		if ( a === false ) {
			return evaluate( node.f, env );
		}
		return null;
	case 'call':
		if ( node.name === 'LSAME' && node.args.length === 2 ) {
			a = evaluate( node.args[ 0 ], env );
			b = evaluate( node.args[ 1 ], env );
			if ( typeof a === 'string' && typeof b === 'string' ) {
				return a.charAt( 0 ).toUpperCase() === b.charAt( 0 ).toUpperCase();
			}
		}
		return null;
	case 'bin':
		a = evaluate( node.l, env );
		if ( node.op === '&&' && a === false ) {
			return false;
		}
		if ( node.op === '||' && a === true ) {
			return true;
		}
		b = evaluate( node.r, env );
		if ( node.op === '&&' ) {
			return ( b === false ) ? false : ( ( a === true && b === true ) ? true : null );
		}
		if ( node.op === '||' ) {
			return ( b === true ) ? true : ( ( a === false && b === false ) ? false : null );
		}
		if ( a === null || b === null || typeof a === 'boolean' || typeof b === 'boolean' ) {
			if ( ( node.op === '===' || node.op === '!==' ) && typeof a === 'boolean' && typeof b === 'boolean' ) {
				return ( node.op === '===' ) ? a === b : a !== b;
			}
			return null;
		}
		switch ( node.op ) {
		case '===': return a === b;
		case '!==': return a !== b;
		case '<': return a < b;
		case '<=': return a <= b;
		case '>': return a > b;
		case '>=': return a >= b;
		case '+': return a + b;
		case '-': return a - b;
		case '*': return a * b;
		case '/': return Math.trunc( a / b );
		default: return Math.pow( a, b );
		}
	default: return null;
	}
}

var PREC = { '||': 1, '&&': 2, '===': 3, '!==': 3, '<': 4, '<=': 4, '>': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '**': 7 };

// Emit JavaScript. ctx:
//   name( FNAME ) → JS identifier, or throws for an unknown identifier
//   dtype( FNAME ) → 'int32' | 'float64' | 'complex128' | 'bool' | 'string' | ...
//   option( FNAME, letter ) → canonical string, or throws if unmapped
// Helpers used in emitted code: max, min, abs, trunc, real, imag.
function emit( node, ctx ) {
	return gen( node, 0 );

	function isInt( n ) {
		switch ( n.type ) {
		case 'num': return n.int;
		case 'id': return ctx.dtype( n.name ) === 'int32';
		case 'neg': return isInt( n.e );
		case 'bin': return ( '+-*/'.indexOf( n.op ) >= 0 || n.op === '**' ) && isInt( n.l ) && isInt( n.r );
		case 'call': return ( n.name === 'MAX' || n.name === 'MIN' || n.name === 'ABS' || n.name === 'MOD' ) && n.args.every( isInt );
		default: return false;
		}
	}
	function isComplex( n ) {
		return n.type === 'id' && /^complex/.test( ctx.dtype( n.name ) || '' );
	}
	function wrap( s, p, outer ) {
		return ( p < outer ) ? '(' + s + ')' : s;
	}
	function nary( name, args ) {
		// stdlib max/min are binary (CONVENTIONS N7): nest.
		var s = gen( args[ 0 ], 0 );
		var k;
		for ( k = 1; k < args.length; k++ ) {
			s = name + '( ' + s + ', ' + gen( args[ k ], 0 ) + ' )';
		}
		return s;
	}
	function gen( n, outer ) {
		var p;
		var s;
		var opt;
		switch ( n.type ) {
		case 'bool': return String( n.v );
		case 'num': return String( n.v );
		case 'str': return '\'' + n.v + '\'';
		case 'id': return ctx.name( n.name );
		case 'neg': return wrap( '-' + gen( n.e, 8 ), 8, outer );
		case 'not':
			if ( n.e.type === 'call' && n.e.name === 'LSAME' && n.e.args.length === 2 && n.e.args[ 0 ].type === 'id' && n.e.args[ 1 ].type === 'str' ) {
				opt = ctx.option( n.e.args[ 0 ].name, n.e.args[ 1 ].v.charAt( 0 ) );
				return wrap( ctx.name( n.e.args[ 0 ].name ) + ' !== \'' + opt + '\'', 3, outer );
			}
			if ( n.e.type === 'bin' && PREC[ n.e.op ] === 3 ) {
				// !( a === b ) → a !== b
				return gen( { 'type': 'bin', 'op': ( n.e.op === '===' ) ? '!==' : '===', 'l': n.e.l, 'r': n.e.r }, outer );
			}
			return wrap( '!' + gen( n.e, 8 ), 8, outer );
		case 'cond':
			return wrap( gen( n.c, 1 ) + ' ? ' + gen( n.t, 1 ) + ' : ' + gen( n.f, 1 ), 0.5, outer );
		case 'call':
			switch ( n.name ) {
			case 'MAX': return nary( 'max', n.args );
			case 'MIN': return nary( 'min', n.args );
			case 'ABS': return 'abs( ' + gen( n.args[ 0 ], 0 ) + ' )';
			case 'MOD': return wrap( gen( n.args[ 0 ], 6.5 ) + ' % ' + gen( n.args[ 1 ], 6.5 ), 6, outer );
			case 'LSAME':
				if ( n.args.length === 2 && n.args[ 0 ].type === 'id' && n.args[ 1 ].type === 'str' ) {
					opt = ctx.option( n.args[ 0 ].name, n.args[ 1 ].v.charAt( 0 ) );
					return wrap( ctx.name( n.args[ 0 ].name ) + ' === \'' + opt + '\'', 3, outer );
				}
				throw new Error( 'unsupported LSAME form' );
			default:
				throw new Error( 'unsupported call ' + n.name );
			}
		case 'bin':
			if ( ( n.op === '===' || n.op === '!==' ) && isComplex( n.l ) && ( n.r.type === 'num' || n.r.type === 'cnum' ) ) {
				s = 'real( ' + gen( n.l, 0 ) + ' ) ' + n.op + ' ' + ( ( n.r.type === 'cnum' ) ? n.r.re : n.r.v ) + ( ( n.op === '===' ) ? ' && ' : ' || ' ) + 'imag( ' + gen( n.l, 0 ) + ' ) ' + n.op + ' ' + ( ( n.r.type === 'cnum' ) ? n.r.im : 0 );
				return wrap( s, ( n.op === '===' ) ? 2 : 1, outer );
			}
			if ( n.r.type === 'cnum' || n.l.type === 'cnum' ) {
				throw new Error( 'complex constant outside a complex comparison' );
			}
			if ( n.op === '/' && isInt( n.l ) && isInt( n.r ) ) {
				return 'trunc( ' + gen( n.l, 6 ) + ' / ' + gen( n.r, 6.5 ) + ' )';
			}
			p = PREC[ n.op ];
			if ( n.op === '**' ) {
				return wrap( gen( n.l, 8 ) + '**' + gen( n.r, 7 ), 7, outer );
			}
			// Mixed &&/|| always gets explicit parentheses (no-mixed-operators).
			s = gen( n.l, ( n.op === '||' ) ? 2.5 : p ) + ' ' + n.op + ' ' + gen( n.r, ( n.op === '||' ) ? 2.5 : p + 0.5 );
			return wrap( s, p, outer );
		default:
			throw new Error( 'cannot emit ' + n.type );
		}
	}
}

// Canonical Fortran text of an AST (stable spacing, for the spec's `fortran`).
function fortran( node ) {
	var F = { '===': '.EQ.', '!==': '.NE.', '<': '.LT.', '<=': '.LE.', '>': '.GT.', '>=': '.GE.', '&&': '.AND.', '||': '.OR.' };
	function g( n, outer ) {
		var p;
		var s;
		switch ( n.type ) {
		case 'bool': return n.v ? '.TRUE.' : '.FALSE.';
		case 'num': return String( n.v );
		case 'str': return '\'' + n.v + '\'';
		case 'id': return n.name;
		case 'neg': return '-' + g( n.e, 8 );
		case 'not': return ( outer > 2 ? '(' : '' ) + '.NOT.' + g( n.e, 8 ) + ( outer > 2 ? ')' : '' );
		case 'call': return n.name + '(' + n.args.map( function m( a ) {
			return g( a, 0 );
		}).join( ',' ) + ')';
		case 'cond': return '(' + g( n.c, 0 ) + ' ? ' + g( n.t, 0 ) + ' : ' + g( n.f, 0 ) + ')';
		case 'bin':
			p = PREC[ n.op ];
			s = g( n.l, p ) + ( F[ n.op ] ? ' ' + F[ n.op ] + ' ' : n.op ) + g( n.r, p + 0.5 );
			return ( p < outer ) ? '(' + s + ')' : s;
		default: return '?';
		}
	}
	return g( node, 0 );
}

module.exports = {
	'tokenize': tokenize,
	'parse': parse,
	'parsePrefix': parsePrefix,
	'ids': ids,
	'inline': inline,
	'cascade': cascade,
	'evaluate': evaluate,
	'emit': emit,
	'fortran': fortran
};
