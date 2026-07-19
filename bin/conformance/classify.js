'use strict';

/**
 * Classify a module based on conformance check results.
 *
 * Categories:
 *   scaffold    — base.js has TODOs/stubs, OR tests are stub-only, OR wrappers throw "not yet implemented"
 *   in-progress — base.js is implemented, tests exist, but some gates fail
 *   complete    — ALL gates pass (no failures)
 *
 * @param {Array} results - array of check result objects
 * @returns {string} 'scaffold' | 'in-progress' | 'complete'
 */
function classify( results ) {
	var hasFailure = false;
	var isScaffold = false;
	var scaffoldIds = [
		'scaffolding.no-todo-base',
		'scaffolding.no-assert-fail',
		'scaffolding.no-stub-wrappers',
		'tests.assertion-count'
	];
	var i;
	var r;

	for ( i = 0; i < results.length; i++ ) {
		r = results[ i ];
		if ( r.status === 'fail' ) {
			hasFailure = true;
			if ( scaffoldIds.indexOf( r.id ) !== -1 ) {
				isScaffold = true;
			}
		}
	}

	if ( isScaffold ) {
		return 'scaffold';
	}
	if ( hasFailure ) {
		return 'in-progress';
	}
	return 'complete';
}

module.exports = classify;
