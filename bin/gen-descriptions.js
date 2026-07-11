/**
 * Compute clean, appropriately-short, Unicode-formatted module descriptions
 * from data/routines.json (the source of truth), and emit them to
 * data/descriptions.generated.json keyed by routine name (lowercase).
 *
 * Background: the per-module README taglines, docs/repl.txt, and some
 * package.json "description" fields were truncated mid-sentence (the README
 * generator read only the first physical JSDoc line, and a codemod turned
 * clause-continuing commas into sentence-ending periods). The full text is
 * intact in routines.json. This regenerates a correct short description:
 * the first sentence, minus the trailing dimensional qualifier
 * ("..., where A is an N-by-N matrix"), with Fortran math turned into
 * Unicode (A**T -> Aᵀ, alpha*A*x -> α·A·x, etc.).
 *
 * A few routines have garbled source briefs (flattened ASCII-art tables) or
 * only a terse placeholder; those are supplied by OVERRIDES below.
 *
 * Usage:
 *   node bin/gen-descriptions.js            # write data/descriptions.generated.json
 *   node bin/gen-descriptions.js --print R  # print the description for routine R
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );

// Hand-written descriptions for routines whose routines.json brief is
// garbled (flattened matrix layouts) or an unusable terse placeholder.
const OVERRIDES = {
	dormbr: 'Multiplies a general matrix by the orthogonal matrix Q or P from a bidiagonal reduction',
	zunmbr: 'Multiplies a general matrix by the unitary matrix Q or P from a bidiagonal reduction',
	dggsvp3: 'Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD',
	dggsvp: 'Computes orthogonal matrices U, V, and Q that reduce a matrix pair to triangular form for the generalized SVD',
	zlansf: 'Returns the one-norm, Frobenius norm, infinity-norm, or largest absolute value of a complex Hermitian matrix in RFP format',
	dlauu2: 'Computes the product U·Uᵀ or Lᵀ·L, where U and L are upper or lower triangular matrices',
	dlauum: 'Computes the product U·Uᵀ or Lᵀ·L, where U and L are upper or lower triangular matrices',
	zlauu2: 'Computes the product U·Uᴴ or Lᴴ·L, where U and L are upper or lower triangular matrices',
	zlauum: 'Computes the product U·Uᴴ or Lᴴ·L, where U and L are upper or lower triangular matrices'
};

const SUP = { T: 'ᵀ', H: 'ᴴ' };

// Turn Fortran math notation into Unicode.
function toUnicode( s ) {
	// Transpose/conjugate-transpose: A**T, A^T, A**H, A^H -> Aᵀ / Aᴴ
	s = s.replace( /\*\*\s*([TH])\b/g, ( _m, c ) => SUP[ c ] );
	s = s.replace( /\^\s*([TH])\b/g, ( _m, c ) => SUP[ c ] );
	// Greek scalars / eigenvalue
	s = s.replace( /\bconjg\(\s*alpha\s*\)/g, 'conj(α)' );
	s = s.replace( /\balpha\b/g, 'α' ).replace( /\bbeta\b/g, 'β' );
	s = s.replace( /\(\s*lambda\s*\)|\blambda\b/g, 'λ' );
	// Capitalize matrix-property adjectives that LAPACK briefs lowercase.
	s = s.replace( /\bhermitian\b/g, 'Hermitian' );
	// Remaining multiplication '*' between operands -> middle dot
	s = s.replace( /\s*\*\s*/g, '·' );
	// Comparisons
	s = s.replace( /<=/g, '≤' ).replace( />=/g, '≥' ).replace( /!=/g, '≠' );
	// Tighten "op( A )" -> "op(A)".
	s = s.replace( /\bop\(\s*([A-Z])\s*\)/g, 'op($1)' );
	return s;
}

// Expand LAPACK's terse matrix-type codes used in driver briefs.
const MATRIX_CODES = [
	[ /\bfor GB matrices\b/g, 'for general band matrices' ],
	[ /\bfor GE matrices\b/g, 'for general matrices' ],
	[ /\bfor GT matrices\b/g, 'for general tridiagonal matrices' ],
	[ /\bfor HE matrices\b/g, 'for Hermitian matrices' ],
	[ /\bfor PB matrices\b/g, 'for positive definite band matrices' ],
	[ /\bfor PO matrices\b/g, 'for positive definite matrices' ],
	[ /\bfor PT matrices\b/g, 'for positive definite tridiagonal matrices' ],
	[ /\bfor SY matrices\b/g, 'for symmetric matrices' ],
	// "OTHER" is a non-informative catch-all — drop the trailing clause.
	[ /\s+for OTHER matrices\b/g, '' ]
];
function expandCodes( s ) {
	for ( const [ re, rep ] of MATRIX_CODES ) s = s.replace( re, rep );
	return s;
}

// First sentence, dimensional-qualifier trimmed. Depth-aware so we do not
// split on a period inside parentheses (e.g. `|Re(.)|`).
function shorten( raw ) {
	let s = raw.trim();
	// Drop a trailing ", where ..." (or " where ...") qualifier.
	s = s.split( /,?\s+where\s+/i )[ 0 ];
	// Stop at the first real sentence boundary: ". " followed by a capital,
	// but not inside parens and not a decimal.
	let depth = 0;
	for ( let i = 0; i < s.length; i++ ) {
		const ch = s[ i ];
		if ( ch === '(' ) depth++;
		else if ( ch === ')' ) depth = Math.max( 0, depth - 1 );
		else if ( ch === '.' && depth === 0 ) {
			const next = s.slice( i + 1 );
			if ( /^\s+[A-Z]/.test( next ) ) { s = s.slice( 0, i ); break; }
		}
	}
	s = s.replace( /\s+/g, ' ' ).replace( /[\s,;:.]+$/, '' ).trim();
	return s;
}

function buildDescription( name, raw ) {
	const key = name.toLowerCase();
	if ( OVERRIDES[ key ] ) return OVERRIDES[ key ];
	if ( !raw ) return null;
	return toUnicode( expandCodes( shorten( raw ) ) );
}

// --- load routines.json -----------------------------------------------------

const data = JSON.parse( readFileSync( join( ROOT, 'data', 'routines.json' ), 'utf8' ) );
const out = {};
for ( const alg of data.routines ) {
	for ( const v of ( alg.variants || [] ) ) {
		const desc = buildDescription( v.name, v.description );
		if ( desc ) out[ v.name.toLowerCase() ] = desc;
	}
}
// Overrides that may not correspond to a routines.json variant.
for ( const k of Object.keys( OVERRIDES ) ) {
	if ( !out[ k ] ) out[ k ] = OVERRIDES[ k ];
}

const printArg = process.argv.indexOf( '--print' );
if ( printArg !== -1 ) {
	const r = ( process.argv[ printArg + 1 ] || '' ).toLowerCase();
	console.log( out[ r ] || '(no description for ' + r + ')' );
} else {
	const path = join( ROOT, 'data', 'descriptions.generated.json' );
	writeFileSync( path, JSON.stringify( out, null, 2 ) + '\n' );
	console.log( 'Wrote ' + Object.keys( out ).length + ' descriptions to data/descriptions.generated.json' );
}
