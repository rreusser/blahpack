'use strict';

// Corpus gate for the signature rules.
//
// Runs every rule in the lint/ library over ALL of the library's `base.js`
// files (the ~900 translated routines) and reports, per rule and per message,
// exactly what fails. The project contract is that this exits 0 — a green
// corpus. A regression is fixed in the code or accommodated by upgrading the
// rule; it is never silenced per routine.
//
// Usage:
//   node lint/verify-corpus.cjs            # summary + exit code
//   node lint/verify-corpus.cjs --list     # list every failing file+message
//   node lint/verify-corpus.cjs --rule <name>

var path = require( 'path' );
var fs = require( 'fs' );
var { Linter } = require( './lib/require-eslint.cjs' );

var ROOT = path.join( __dirname, '..' );
var LIB = path.join( ROOT, 'lib' );
var plugin = require( './plugin.cjs' );

var argv = process.argv.slice( 2 );
var LIST = argv.indexOf( '--list' ) !== -1;
var onlyRule = null;
var ri = argv.indexOf( '--rule' );
if ( ri !== -1 ) {
	onlyRule = argv[ ri + 1 ];
}

// Recursively find every base.js under lib/.
function findBaseFiles( dir, out ) {
	fs.readdirSync( dir ).forEach( function forEach( entry ) {
		var full = path.join( dir, entry );
		var stat = fs.statSync( full );
		if ( stat.isDirectory() ) {
			findBaseFiles( full, out );
		} else if ( entry === 'base.js' ) {
			out.push( full );
		}
	});
	return out;
}

var files = findBaseFiles( LIB, [] );

var ruleNames = Object.keys( plugin.rules ).filter( function filter( n ) {
	return !onlyRule || n === onlyRule;
});

var linter = new Linter( { 'configType': 'flat', 'cwd': ROOT } );

var rulesConfig = {};
ruleNames.forEach( function forEach( n ) {
	rulesConfig[ 'blahpack/' + n ] = 'error';
});

var config = {
	'plugins': { 'blahpack': plugin },
	'languageOptions': {
		'ecmaVersion': 2022,
		'sourceType': 'module'
	},
	'linterOptions': {
		// base.js files carry inline eslint-disable directives for rules outside
		// this focused run (e.g. max-len); don't report them as our violations.
		'reportUnusedDisableDirectives': 'off'
	},
	'rules': rulesConfig
};

var ruleIdSet = {};
ruleNames.forEach( function forEach( n ) {
	ruleIdSet[ 'blahpack/' + n ] = true;
});

var byMessage = {};
var failingFiles = [];
var total = 0;
var fatal = [];

files.forEach( function forEach( file ) {
	total += 1;
	var code = fs.readFileSync( file, 'utf8' );
	var messages = linter.verify( code, config, { 'filename': file } );
	if ( messages.length === 0 ) {
		return;
	}
	var rel = path.relative( ROOT, file );
	var counted = false;
	messages.forEach( function forEachMsg( m ) {
		if ( m.fatal ) {
			fatal.push( rel + ': ' + m.message );
			counted = true;
			return;
		}
		// Only our rules' findings count; inline directives that reference other
		// (unloaded) rules produce "definition not found" noise we ignore here.
		if ( !ruleIdSet[ m.ruleId ] ) {
			return;
		}
		var key = ( m.ruleId || 'unknown' ) + ' :: ' + ( m.messageId || m.message.slice( 0, 40 ) );
		byMessage[ key ] = byMessage[ key ] || [];
		byMessage[ key ].push( { 'file': rel, 'message': m.message } );
		counted = true;
	});
	if ( counted ) {
		failingFiles.push( rel );
	}
});

var totalViolations = 0;
Object.keys( byMessage ).forEach( function forEach( k ) {
	totalViolations += byMessage[ k ].length;
});

console.log( 'Corpus: ' + total + ' base.js files, rules: ' + ruleNames.join( ', ' ) );
console.log( 'Files with violations: ' + failingFiles.length );
console.log( 'Total violations: ' + totalViolations );
if ( fatal.length ) {
	console.log( 'FATAL parse/rule errors: ' + fatal.length );
	fatal.slice( 0, 20 ).forEach( function forEach( f ) {
		console.log( '  ! ' + f );
	});
}
console.log( '' );
console.log( 'By message:' );
Object.keys( byMessage ).sort( function cmp( a, b ) {
	return byMessage[ b ].length - byMessage[ a ].length;
}).forEach( function forEach( k ) {
	console.log( '  ' + byMessage[ k ].length + '  ' + k );
	if ( LIST ) {
		byMessage[ k ].forEach( function forEachV( v ) {
			console.log( '        ' + v.file + '  —  ' + v.message );
		});
	} else {
		byMessage[ k ].slice( 0, 6 ).forEach( function forEachV( v ) {
			console.log( '        ' + v.file );
		});
		if ( byMessage[ k ].length > 6 ) {
			console.log( '        … +' + ( byMessage[ k ].length - 6 ) + ' more' );
		}
	}
});

process.exit( ( totalViolations + fatal.length ) > 0 ? 1 : 0 );
