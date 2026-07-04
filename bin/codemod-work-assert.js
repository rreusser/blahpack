/**
 * Insert a canonical WORK-size assertion into ndarray.js wrappers that
 * document an UNCONDITIONAL minimum workspace length but lack the runtime
 * check (gate: work-assert).
 *
 * Source of truth: the module's own `@param {...} WORK - ... length ... EXPR`
 * JSDoc, i.e. the contract the translator already declared. The inserted
 * assertion enforces that contract; the module's existing tests are the
 * correctness guard (a too-strict formula makes a passing test throw, and
 * this tool reverts any module whose tests regress).
 *
 * Deliberately conservative — it SKIPS a module when:
 *   - the WORK doc has no length formula, or a conditional one
 *     (`if`/`when`/`for`/`jobz`/`norm`/`not referenced`), which needs
 *     per-argument logic;
 *   - the formula references anything other than max/min/+/-/*, integers,
 *     and dimension params actually in the signature;
 *   - an assertion is already present.
 *
 * Usage:
 *   node bin/codemod-work-assert.js --dry        # report what it would do
 *   node bin/codemod-work-assert.js <routine>... # apply to named routines
 *   node bin/codemod-work-assert.js --all        # apply to every candidate
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = resolve( import.meta.dirname, '..' );
const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const ALL = argv.includes( '--all' );
const NAMED = argv.filter( ( a ) => !a.startsWith( '--' ) );

const CONDITIONAL = /\b(if|when|for|jobz|norm|not referenced|otherwise|depending)\b/i;

function findModuleDir( routine ) {
	for ( const pkg of [ 'blas', 'lapack' ] ) {
		const d = join( ROOT, 'lib', pkg, 'base', routine );
		if ( existsSync( join( d, 'lib', 'ndarray.js' ) ) ) return d;
	}
	return null;
}

function allRoutines() {
	const out = [];
	for ( const pkg of [ 'blas', 'lapack' ] ) {
		const base = join( ROOT, 'lib', pkg, 'base' );
		if ( !existsSync( base ) ) continue;
		for ( const e of readdirSync( base, { withFileTypes: true } ) ) {
			if ( e.isDirectory() ) out.push( e.name );
		}
	}
	return out;
}

// Pull the signature parameter list of the exported (or first) function.
function signatureParams( src ) {
	const m = src.match( /function\s+\w+\s*\(\s*([^)]*)\)/ );
	if ( !m ) return null;
	return m[ 1 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
}

// Scan a maximal arithmetic expression from the start of `s`, respecting
// parentheses. Stops at the doc's wrapping close-paren (depth would go
// negative) or the first character outside the arithmetic grammar.
function scanExpression( s ) {
	let depth = 0;
	let out = '';
	for ( let i = 0; i < s.length; i++ ) {
		const ch = s[ i ];
		if ( ch === '(' ) { depth += 1; out += ch; continue; }
		if ( ch === ')' ) {
			if ( depth === 0 ) break; // wrapper close-paren from the prose
			depth -= 1; out += ch; continue;
		}
		if ( /[A-Za-z0-9_+\-*,\s]/.test( ch ) ) { out += ch; continue; }
		break; // anything else ends the expression
	}
	// If unbalanced, drop trailing unmatched content.
	if ( depth !== 0 ) return null;
	return out.trim().replace( /[,\s]+$/, '' );
}

// Extract an unconditional length expression from a WORK/RWORK/IWORK @param.
// Returns { workName, expr } or null.
function extractWorkSpec( src ) {
	const lines = src.split( '\n' );
	for ( const line of lines ) {
		// Only the primary WORK array — RWORK/IWORK secondary workspaces in
		// complex routines need their own (often multi-workspace) treatment,
		// and the gate credits a `WORK` assertion specifically.
		const pm = line.match( /@param\s+\{[^}]*\}\s+(WORK)\b(.*)$/ );
		if ( !pm ) continue;
		const workName = pm[ 1 ];
		const rest = pm[ 2 ].replace( /`/g, '' );
		// Conditional workspace sizing needs per-argument logic — skip.
		if ( CONDITIONAL.test( rest ) ) return { workName, expr: null };
		const lm = rest.match( /length\s*(?:>=|of\s+at\s+least|at\s+least|of)?\s*/i );
		if ( !lm ) continue;
		const tail = rest.slice( lm.index + lm[ 0 ].length );
		const expr = scanExpression( tail );
		if ( !expr ) continue;
		return { workName, expr };
	}
	return null;
}

// Translate a Fortran-ish length expression to JS. Returns null if it uses
// anything outside the safe grammar (max/min, ints, +-*, and given vars).
function toJs( expr, params ) {
	// Only allow: word tokens, digits, ( ) , + - * space
	if ( /[^A-Za-z0-9_(),+\-*\s]/.test( expr ) ) return null;
	const vars = new Set();
	let bad = false;
	expr.replace( /[A-Za-z_]\w*/g, ( tok ) => {
		if ( tok === 'max' || tok === 'min' ) return tok;
		vars.add( tok );
		return tok;
	});
	for ( const v of vars ) {
		if ( !params.includes( v ) ) { bad = true; }
	}
	if ( bad ) return null;
	// Normalize to the codebase's spacing (spaced infix operators and
	// parens) before mapping max/min -> Math.max/Math.min.
	let js = expr
		.replace( /([+*])/g, ' $1 ' )
		.replace( /-/g, ' - ' )
		.replace( /\(/g, '( ' )
		.replace( /\)/g, ' )' )
		.replace( /\s+/g, ' ' )
		.replace( /\(\s+\)/g, '()' )
		.trim();
	js = js.replace( /\bmax\s*\(/g, 'Math.max(' ).replace( /\bmin\s*\(/g, 'Math.min(' );
	return js;
}

function alreadyAsserts( src ) {
	const lines = src.split( '\n' );
	let sawLen = false;
	for ( const l of lines ) {
		if ( /\bWORK\b.*\.length|\.length.*\bWORK\b/.test( l ) ) sawLen = true;
		if ( sawLen && /throw\s+new\s+RangeError/.test( l ) ) return true;
	}
	return false;
}

function offsetNameFor( workName, params ) {
	// Prefer an explicit offset<Work> param; fall back to conventional names.
	const cands = [ 'offset' + workName.charAt( 0 ) + workName.slice( 1 ).toLowerCase(), 'offset' + workName, 'offsetWork' ];
	for ( const c of cands ) {
		if ( params.includes( c ) ) return c;
	}
	// Any param starting with 'offset' and containing 'ork'/'WORK'.
	return params.find( ( p ) => /^offset/i.test( p ) && /work/i.test( p ) ) || null;
}

function buildAssertion( workName, offsetName, js ) {
	return [
		'\tvar minWork = Math.max( 1, ' + js + ' );',
		'\tif ( !' + workName + ' || ( ' + workName + '.length - ' + offsetName + ' ) < minWork ) {',
		'\t\tthrow new RangeError( format( \'invalid argument. ' + workName + ' array must have at least %d elements from offset %d. Provided length: %d.\', minWork, ' + offsetName + ', ( ' + workName + ' ) ? ' + workName + '.length : 0 ) );',
		'\t}'
	].join( '\n' );
}

function processModule( routine ) {
	const dir = findModuleDir( routine );
	if ( !dir ) return { routine, status: 'no-module' };
	const file = join( dir, 'lib', 'ndarray.js' );
	const src = readFileSync( file, 'utf8' );
	if ( !/\bWORK\b/.test( src ) ) return { routine, status: 'no-work' };
	if ( alreadyAsserts( src ) ) return { routine, status: 'already' };

	const params = signatureParams( src );
	if ( !params ) return { routine, status: 'no-signature' };

	const spec = extractWorkSpec( src );
	if ( !spec || !spec.expr ) return { routine, status: 'no-formula' };

	const js = toJs( spec.expr, params );
	if ( !js ) return { routine, status: 'unsafe-formula', expr: spec.expr };

	const offsetName = offsetNameFor( spec.workName, params );
	if ( !offsetName ) return { routine, status: 'no-offset' };

	if ( !/\bformat\b/.test( src ) || !/import\s+format\b/.test( src ) ) {
		return { routine, status: 'no-format-import' };
	}

	// Insert before the `return base(` line.
	const lines = src.split( '\n' );
	const idx = lines.findIndex( ( l ) => /return\s+base\s*\(/.test( l ) );
	if ( idx === -1 ) return { routine, status: 'no-base-call' };

	if ( DRY ) return { routine, status: 'would-fix', expr: spec.expr, js };

	const assertion = buildAssertion( spec.workName, offsetName, js );
	lines.splice( idx, 0, assertion, '' );
	writeFileSync( file, lines.join( '\n' ) );

	// Verify with the module's tests; revert on regression.
	try {
		execSync( 'node --test ' + join( dir, 'test' ) + '/test*.js', { cwd: ROOT, stdio: 'pipe' } );
	} catch ( err ) {
		writeFileSync( file, src );
		return { routine, status: 'reverted-test-fail', expr: spec.expr };
	}
	return { routine, status: 'fixed', expr: spec.expr, js };
}

const targets = NAMED.length ? NAMED : ( ALL || DRY ? allRoutines() : [] );
if ( !targets.length ) {
	console.error( 'Specify routine names, --all, or --dry.' );
	process.exit( 1 );
}

const counts = {};
const fixed = [];
for ( const r of targets ) {
	const res = processModule( r );
	counts[ res.status ] = ( counts[ res.status ] || 0 ) + 1;
	if ( res.status === 'would-fix' || res.status === 'fixed' ) {
		fixed.push( res.routine + '  (minWork = max(1, ' + res.js + '))' );
	}
	if ( res.status === 'reverted-test-fail' ) {
		console.log( 'REVERTED (tests failed): ' + res.routine + '  expr=' + res.expr );
	}
}
console.log( '\n' + ( DRY ? '[dry] ' : '' ) + 'candidates fixed:' );
for ( const f of fixed ) console.log( '  ' + f );
console.log( '\nstatus counts:', JSON.stringify( counts, null, 0 ) );
