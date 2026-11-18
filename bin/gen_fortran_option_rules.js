#!/usr/bin/env node
'use strict';

// Precompute, for every reference routine, which letters each CHARACTER option
// argument accepts.
//
//   data/fortran-option-rules.json  ←  node bin/gen_fortran_option_rules.js
//
// The reference validates option arguments with argument checks such as
//
//   IF( .NOT.LSAME( SIDE, 'L' ) .AND. .NOT.LSAME( SIDE, 'R' ) ) THEN
//      INFO = -1
//
// often through logical locals (`TRAN = LSAME( TRANS, 'T' )`) or integer codes
// set by IF/ELSE cascades (`ITYPE` in DLASCL). Rather than pattern-matching
// those forms, this evaluates every check that sets `INFO = -k` (k = the
// argument's position) once per letter A–Z, with LSAME semantics and the
// routine's locals, in three-valued logic (anything else — other arguments,
// array elements — is unknown). A letter is REJECTED when some check is
// definitely true for it, and ACCEPTED otherwise.
//
// Recorded per argument: the accepted letters, and the verbatim conditions.
// Arguments with no check that ever rejects a letter are recorded as
// `"undetermined"` (the reference does not validate them, or validates them through
// something this evaluator cannot see, e.g. an integer function like ILATRANS). The JS side
// (bin/conformance/checks/option-rules.js) compares these sets with what
// ndarray.js accepts.

var path = require( 'path' );
var fs = require( 'fs' );
var fa = require( './fortran-argchecks.js' );

var OUT = path.join( fa.ROOT, 'data', 'fortran-option-rules.json' );
var SIGS = JSON.parse( fs.readFileSync( path.join( fa.ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );
var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' );


// EXPRESSION EVALUATION (three-valued: true / false / number / string / null = unknown) //

function tokenize( s ) {
	var re = /\s*(\.(?:NOT|AND|OR|EQV|NEQV|EQ|NE|LT|LE|GT|GE|TRUE|FALSE)\.|'[^']*'|[A-Z_][A-Z0-9_]*|\d+(?:\.\d*)?(?:[DE][-+]?\d+)?|\*\*|==|\/=|<=|>=|[-+*\/(),<>])/gy;
	var out = [];
	var m;
	var pos = 0;
	s = s.trim();
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

var REL = { '.EQ.': 1, '.NE.': 1, '.LT.': 1, '.LE.': 1, '.GT.': 1, '.GE.': 1, '==': 1, '/=': 1, '<': 1, '<=': 1, '>': 1, '>=': 1 };

function not3( a ) {
	return ( typeof a === 'boolean' ) ? !a : null;
}
function and3( a, b ) {
	if ( a === false || b === false ) {
		return false;
	}
	return ( a === true && b === true ) ? true : null;
}
function or3( a, b ) {
	if ( a === true || b === true ) {
		return true;
	}
	return ( a === false && b === false ) ? false : null;
}
function rel( op, a, b ) {
	if ( a === null || b === null || typeof a === 'boolean' || typeof b === 'boolean' ) {
		return null;
	}
	switch ( op ) {
	case '.EQ.': case '==': return a === b;
	case '.NE.': case '/=': return a !== b;
	case '.LT.': case '<': return a < b;
	case '.LE.': case '<=': return a <= b;
	case '.GT.': case '>': return a > b;
	default: return a >= b;
	}
}

// env: { arg: 'TRANS', letter: 'C', locals: {...}, depth }
function evaluate( expr, env ) {
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
		var b;
		while ( peek() === '.EQV.' || peek() === '.NEQV.' ) {
			op = next();
			b = disj();
			a = ( typeof a === 'boolean' && typeof b === 'boolean' ) ? ( ( op === '.EQV.' ) ? a === b : a !== b ) : null;
		}
		return a;
	}
	function disj() {
		var a = conj();
		while ( peek() === '.OR.' ) {
			next();
			a = or3( a, conj() );
		}
		return a;
	}
	function conj() {
		var a = negation();
		while ( peek() === '.AND.' ) {
			next();
			a = and3( a, negation() );
		}
		return a;
	}
	function negation() {
		if ( peek() === '.NOT.' ) {
			next();
			return not3( negation() );
		}
		return relation();
	}
	function relation() {
		var a = additive();
		var op;
		if ( REL[ peek() ] ) {
			op = next();
			return rel( op, a, additive() );
		}
		return a;
	}
	function arith( op, a, b ) {
		if ( typeof a !== 'number' || typeof b !== 'number' ) {
			return null;
		}
		switch ( op ) {
		case '+': return a + b;
		case '-': return a - b;
		case '*': return a * b;
		case '/': return Math.trunc( a / b );
		default: return Math.pow( a, b );
		}
	}
	function additive() {
		var a;
		if ( peek() === '-' || peek() === '+' ) {
			a = ( next() === '-' ) ? arith( '-', 0, multiplicative() ) : multiplicative();
		} else {
			a = multiplicative();
		}
		while ( peek() === '+' || peek() === '-' ) {
			a = arith( next(), a, multiplicative() );
		}
		return a;
	}
	function multiplicative() {
		var a = power();
		while ( peek() === '*' || peek() === '/' ) {
			a = arith( next(), a, power() );
		}
		return a;
	}
	function power() {
		var a = primary();
		if ( peek() === '**' ) {
			next();
			return arith( '**', a, power() );
		}
		return a;
	}
	function args() {
		var out = [];
		expect( '(' );
		if ( peek() !== ')' ) {
			out.push( eqv() );
			while ( peek() === ',' ) {
				next();
				out.push( eqv() );
			}
		}
		expect( ')' );
		return out;
	}
	function primary() {
		var t = next();
		var a;
		if ( t === '(' ) {
			a = eqv();
			expect( ')' );
			return a;
		}
		if ( t === '.TRUE.' ) {
			return true;
		}
		if ( t === '.FALSE.' ) {
			return false;
		}
		if ( /^'/.test( t ) ) {
			return t.slice( 1, -1 );
		}
		if ( /^\d/.test( t ) ) {
			return /^\d+$/.test( t ) ? Number( t ) : null;
		}
		if ( peek() === '(' ) {
			a = args();
			if ( t === 'LSAME' && a.length === 2 && typeof a[ 0 ] === 'string' && typeof a[ 1 ] === 'string' ) {
				return a[ 0 ].charAt( 0 ) === a[ 1 ].charAt( 0 );
			}
			return null;
		}
		return identifier( t );
	}
	function identifier( t ) {
		var defs;
		var val;
		var matched;
		var g;
		var j;
		if ( t === env.arg ) {
			return env.letter;
		}
		defs = env.locals[ t ];
		if ( !defs || env.depth > 8 ) {
			return null;
		}
		val = null;
		matched = false;
		for ( j = 0; j < defs.length; j++ ) {
			if ( defs[ j ][ 0 ] === null ) {
				val = sub( defs[ j ][ 1 ] );
				matched = false;
				continue;
			}
			if ( defs[ j ][ 0 ] === 'ELSE' ) {
				if ( !matched ) {
					val = sub( defs[ j ][ 1 ] );
				}
				matched = false;
				continue;
			}
			if ( matched ) {
				continue;
			}
			g = sub( defs[ j ][ 0 ] );
			if ( g === true ) {
				val = sub( defs[ j ][ 1 ] );
				matched = true;
			} else if ( g === null ) {
				return null;
			}
		}
		return val;
	}
	function sub( e ) {
		return evaluate( e, { 'arg': env.arg, 'letter': env.letter, 'locals': env.locals, 'depth': env.depth + 1 } );
	}
	var v = eqv();
	if ( i !== toks.length ) {
		throw new Error( 'trailing tokens in ' + expr );
	}
	return v;
}


// MAIN //

function main() {
	var all = {};
	var errors = [];
	fa.eachSource( function each( name, lines ) {
		var sig = SIGS[ name ];
		var checks;
		var loc;
		var opts = {};
		if ( !sig || !sig.arguments ) {
			return;
		}
		checks = fa.infoChecks( lines );
		if ( !checks.length ) {
			return;
		}
		loc = fa.locals( lines );
		sig.arguments.forEach( function eachArg( a, idx ) {
			var conds;
			var accepted;
			if ( !/^CHARACTER/.test( a.type || '' ) ) {
				return;
			}
			// LAPACK: INFO = -k. Reference BLAS: INFO = k, set before XERBLA;
			// accept a positive k only when the condition depends on the argument.
			conds = checks.filter( function f( c ) {
				if ( c.k === -( idx + 1 ) ) {
					return true;
				}
				return c.k === idx + 1 && Object.keys( fa.usedLocals( c.cond, loc ) ).concat( c.cond.match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] ).some( function dep( id ) {
					return id === a.name || ( loc[ id ] || [] ).some( function d( def ) {
						return ( ( def[ 0 ] || '' ) + ' ' + def[ 1 ] ).indexOf( a.name ) >= 0;
					});
				});
			}).map( function m( c ) {
				return c.cond;
			});
			if ( !conds.length ) {
				return;
			}
			try {
				accepted = LETTERS.filter( function keep( L ) {
					return !conds.some( function rejects( c ) {
						return evaluate( c, { 'arg': a.name, 'letter': L, 'locals': loc, 'depth': 0 } ) === true;
					});
				});
			} catch ( err ) {
				errors.push( name + ' ' + a.name + ': ' + err.message );
				return;
			}
			opts[ a.name ] = {
				'position': idx + 1,
				'accepts': ( accepted.length === LETTERS.length || accepted.length === 0 ) ? 'undetermined' : accepted.join( '' ),
				'conditions': conds
			};
		});
		if ( Object.keys( opts ).length ) {
			all[ name ] = opts;
		}
	});
	fs.writeFileSync( OUT, fa.sortedJSON( all ) );
	process.stderr.write( 'wrote option rules for ' + Object.keys( all ).length + ' routines to ' + path.relative( fa.ROOT, OUT ) + '\n' );
	if ( errors.length ) {
		process.stderr.write( errors.length + ' conditions could not be evaluated:\n  ' + errors.join( '\n  ' ) + '\n' );
	}
}

main();
