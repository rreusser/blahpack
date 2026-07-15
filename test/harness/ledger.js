/**
* Validation ledger: an HONEST, runtime record of what was actually validated.
*
* Test-coverage percentages and assertion counts can be inflated by tests that
* assert nothing meaningful. This ledger avoids that failure mode by recording a
* validation only when a REAL check has actually run and passed: the `checked`
* wrapper runs the assertion (which throws on failure) and records the kind only
* if it returns. An empty or trivial test records nothing and therefore earns no
* validation level.
*
* Records are flushed on process exit as JSONL fragments under
* `test/.validation-ledger/`; `bin/validation-level.js` aggregates the fragments
* into per-routine levels and badges. Because `node --test` runs each file in its
* own process, each process writes its own uniquely-named fragment (no clobber).
*
* Validation kinds map to the level ladder (see README.md):
*   fixture                                   -> L1
*   residual|reconstruct|structural|orthonormal|property -> L2
*   layout-invariance                         -> L3
*   cross-validation|differential             -> L4
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

var DIR = fileURLToPath( new URL( '../.validation-ledger/', import.meta.url ) );
var _buf = [];
var _registered = false;

// HELPERS //

function _flush() {
	if ( _buf.length === 0 ) {
		return;
	}
	try {
		fs.mkdirSync( DIR, { 'recursive': true } );
		var name = 'frag-' + process.pid + '-' + Math.random().toString( 36 ).slice( 2 ) + '.jsonl';
		var lines = _buf.map( function stringify( o ) {
			return JSON.stringify( o );
		} ).join( '\n' );
		fs.writeFileSync( path.join( DIR, name ), lines + '\n' );
	} catch ( err ) {
		// Never let ledger I/O fail a test run:
		process.stderr.write( 'ledger flush failed: ' + err.message + '\n' );
	}
}


// MAIN //

/**
* Record that `routine` received validation of `kind`. Prefer `checked` so
* recording is tied to an assertion actually passing.
*
* @param {string} routine - routine name (e.g. 'dpotrf')
* @param {string} kind - validation kind (see module docs)
* @param {Object} [meta] - optional context (scalar, scheme, sizes, ...)
*/
function record( routine, kind, meta ) {
	_buf.push({
		'routine': routine,
		'kind': kind,
		'meta': meta || null
	});
	if ( !_registered ) {
		_registered = true;
		process.on( 'exit', _flush );
	}
}

/**
* Run a real check and, only if it passes (does not throw), record it. This is
* the honest path: no pass, no credit.
*
* @param {string} routine - routine name
* @param {string} kind - validation kind
* @param {Function} fn - a function that performs one or more assertions
* @param {Object} [meta]
*/
function checked( routine, kind, fn, meta ) {
	fn();
	record( routine, kind, meta );
}


// EXPORTS //

export { record, checked, DIR };
