'use strict';

// Guard: no escape hatches.
//
// Every check in this repo is a hard gate. A check that is allowed to fail —
// `continue-on-error`, `|| true`, a 'warn' level, a disabled or unregistered
// rule, a skipped test, a baseline / known-failures list — stops enforcing
// anything while still looking like enforcement, and such exemptions tend to
// grow until nothing is enforced. This script makes any such hatch a loud CI
// failure instead. It is not configurable and has no exemption list of its own.
//
// Usage:  node lint/verify-no-escape-hatches.cjs

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..' );
var SKIP_DIRS = { 'node_modules': true, '.git': true, 'data': true };
var problems = [];

function report( file, line, what ) {
	problems.push({ 'file': file, 'line': line, 'what': what });
}

function walk( dir, out ) {
	fs.readdirSync( dir, { 'withFileTypes': true } ).forEach( function each( e ) {
		var full = path.join( dir, e.name );
		if ( e.isDirectory() ) {
			if ( !SKIP_DIRS[ e.name ] ) {
				walk( full, out );
			}
		} else {
			out.push( full );
		}
	});
	return out;
}

function scanLines( file, patterns ) {
	var rel = path.relative( ROOT, file );
	fs.readFileSync( file, 'utf8' ).split( '\n' ).forEach( function each( text, i ) {
		patterns.forEach( function eachPattern( p ) {
			if ( p.re.test( text ) ) {
				report( rel, i + 1, p.what + ': ' + text.trim().slice( 0, 120 ) );
			}
		});
	});
}

var files = walk( ROOT, [] );

// 1. CI workflows: no step or job may be allowed to fail or be switched off.
files.filter( function isWorkflow( f ) {
	return /\.github[\\/]workflows[\\/].+\.ya?ml$/.test( f );
}).forEach( function each( f ) {
	scanLines( f, [
		{ 're': /^\s*continue-on-error\s*:/, 'what': 'CI job/step allowed to fail' },
		{ 're': /\|\|\s*(true|:|exit 0)\b/, 'what': 'CI command failure swallowed' },
		{ 're': /\bset \+e\b/, 'what': 'CI errexit disabled' },
		{ 're': /^\s*if:\s*(false|\$\{\{\s*false\s*\}\})\s*$/, 'what': 'CI job/step disabled' }
	]);
});

// 2. package.json scripts: no swallowed failures.
(function checkScripts() {
	var pkg = JSON.parse( fs.readFileSync( path.join( ROOT, 'package.json' ), 'utf8' ) );
	Object.keys( pkg.scripts || {} ).forEach( function each( name ) {
		if ( /\|\|\s*(true|:|exit 0)\b/.test( pkg.scripts[ name ] ) ) {
			report( 'package.json', 0, 'script "' + name + '" swallows its failure' );
		}
	});
})();

// 3. Every project lint rule is registered AND enabled at 'error'.
(function checkRules() {
	var config = require( path.join( ROOT, 'eslint.config.cjs' ) );
	var enabled = {};
	config.forEach( function each( block ) {
		Object.keys( block.rules || {} ).forEach( function eachRule( r ) {
			var v = block.rules[ r ];
			var level = Array.isArray( v ) ? v[ 0 ] : v;
			if ( /^blahpack\//.test( r ) ) {
				enabled[ r.slice( 9 ) ] = level;
			}
		});
	});
	fs.readdirSync( path.join( ROOT, 'lint', 'rules' ) ).forEach( function each( name ) {
		if ( !fs.existsSync( path.join( ROOT, 'lint', 'rules', name, 'rule.cjs' ) ) ) {
			return;
		}
		if ( enabled[ name ] === void 0 ) {
			report( 'eslint.config.cjs', 0, 'lint rule "' + name + '" exists but is not enabled' );
		} else if ( enabled[ name ] !== 'error' && enabled[ name ] !== 2 ) {
			report( 'eslint.config.cjs', 0, 'lint rule "' + name + '" is enabled at "' + enabled[ name ] + '", not "error"' );
		}
	});
})();

// 4. Source and tests: no suppressed project rules, no skipped or focused tests.
files.filter( function isJS( f ) {
	return /[\\/](lib|test|lint|bin)[\\/].+\.(c|m)?js$/.test( f ) && f.indexOf( 'verify-no-escape-hatches' ) === -1 && f.indexOf( path.join( 'lint', 'rules' ) ) === -1;
}).forEach( function each( f ) {
	scanLines( f, [
		{ 're': /eslint-disable[^\n]*blahpack\//, 'what': 'project lint rule suppressed' },
		{ 're': /\b(test|it|describe)\.(skip|todo|only)\s*\(/, 'what': 'test skipped / focused' },
		{ 're': /[{,]\s*'?(skip|todo|only)'?\s*:\s*(true|'[^']*'|"[^"]*")/, 'what': 'test skipped / focused via options' }
	]);
});

// 5. No baseline / known-failures / allowlist files anywhere.
files.forEach( function each( f ) {
	var base = path.basename( f );
	if ( /(baseline|known[-_]?fail|expected[-_]?fail|allow[-_]?list|skip[-_]?list|exemption|ignore[-_]?list)/i.test( base ) ) {
		report( path.relative( ROOT, f ), 0, 'baseline / known-failures / allowlist file' );
	}
});


// REPORT //

if ( problems.length === 0 ) {
	console.log( 'No escape hatches: every check is a hard gate.' );
	process.exit( 0 );
}
var bar = new Array( 79 ).join( '!' );
console.error( bar );
console.error( '!!  ESCAPE HATCH DETECTED: ' + problems.length + ' place(s) where a check is allowed to fail.' );
console.error( '!!  Fix the underlying failure instead of exempting it. There is no exemption list.' );
console.error( bar );
problems.forEach( function each( p ) {
	var loc = p.file + ( p.line ? ':' + p.line : '' );
	console.error( '  ' + loc + '  ' + p.what );
	if ( process.env.GITHUB_ACTIONS ) {
		console.log( '::error file=' + p.file + ( p.line ? ',line=' + p.line : '' ) + ',title=Escape hatch::' + p.what );
	}
});
console.error( bar );
process.exit( 1 );
