/**
* Workspace-conformance: the seam neither the property nor the leading-dimension
* layer exercises.
*
* Blocked LAPACK routines consume a scratch WORK buffer whose size the caller (or
* an auto-allocating wrapper) must get right. Reference LAPACK negotiates that size
* at runtime (the `LWORK = -1` workspace query) and — crucially — ADAPTS the block
* size to whatever `LWORK` it is handed (`dgeqrf.f` shrinks `NB` when
* `LWORK < N*NB`, falling back to the unblocked kernel), so an under-estimate only
* costs speed, never correctness. Our JS translations hardcode `NB`, do NOT adapt,
* and several store the block-reflector `T` in a SEPARATE trailing block — so the
* reference `LWORK` formula they copy UNDER-counts their real consumption. Sizing
* WORK to that formula then reads past the buffer → `undefined` → NaN in the
* output. The property layer missed this because its fixtures were unblocked and it
* over-sized WORK.
*
* This module asserts the CONTRACT a wrapper advertises: whatever minimum WORK
* length it accepts (throwing below it), that minimum must actually SUFFICE on the
* blocked path. It derives the claimed minimum from the wrapper's own behaviour —
* no formula is duplicated in the test — then runs at exactly that length with a
* POISONED buffer and asserts every output is finite. A too-small claim (over-read
* → NaN) or a read-before-write (poison → NaN) fails loudly.
*/

// HELPERS //

function fail( msg ) {
	throw new Error( msg );
}

/**
* Whether `run( workLen )` is accepted (does not throw) at this WORK length. A
* throw is interpreted as "WORK too small" (the wrapper's RangeError guard).
*
* @private
*/
function accepts( run, workLen ) {
	try {
		run( workLen );
		return true;
	} catch ( e ) {
		return false;
	}
}


// MAIN //

/**
* Probe the smallest WORK length the wrapper accepts (its advertised minimum) via
* exponential + binary search over `run`'s throw boundary.
*
* @param {Function} run - `run( workLen )` builds a WORK buffer of length
*   `workLen`, drives the routine (ndarray form, `strideWork=1`, `offsetWork=0`),
*   and returns a flat array of the output's real components. MUST throw the
*   wrapper's RangeError when WORK is too small.
* @param {number} maxCap - upper bound for the search.
* @param {string} label
* @returns {number} the smallest accepted WORK length.
*/
function claimedMinimum( run, maxCap, label ) {
	var lo; // largest known-rejected length (or 0)
	var hi; // smallest known-accepted length
	var mid;
	var u;

	// Exponential search for an accepted upper bound:
	u = 1;
	lo = 0;
	hi = -1;
	while ( u <= maxCap ) {
		if ( accepts( run, u ) ) {
			hi = u;
			break;
		}
		lo = u;
		u *= 2;
	}
	if ( hi < 0 ) {
		fail( label + ': routine still rejects/throws at WORK length ' + maxCap + ' — not a workspace-size boundary (a non-workspace error?).' );
	}
	// Binary search the boundary in (lo, hi]:
	while ( hi - lo > 1 ) {
		mid = Math.floor( ( lo + hi ) / 2 );
		if ( accepts( run, mid ) ) {
			hi = mid;
		} else {
			lo = mid;
		}
	}
	return hi;
}

/**
* Assert that the WORK minimum a wrapper advertises actually suffices: run at
* exactly that length with a poisoned buffer and require finite output.
*
* @param {Function} run - see `claimedMinimum`; returns flat output components.
* @param {Object} [opts] - `{ max }` search cap (default 1<<22).
* @param {string} label
* @returns {number} the advertised minimum WORK length (for reporting).
*/
function assertWorkspaceSufficient( run, opts, label ) {
	var o = opts || {};
	var maxCap = ( o.max === void 0 ) ? ( 1 << 22 ) : o.max;
	var minLen = claimedMinimum( run, maxCap, label );
	var out = run( minLen ); // executed with a poisoned buffer of exactly minLen
	var i;
	for ( i = 0; i < out.length; i++ ) {
		if ( !Number.isFinite( out[ i ] ) ) {
			fail( label + ': WORK length ' + minLen + ' is advertised as sufficient, but the output has a non-finite value at component ' + i + ' — the routine reads past its own claimed workspace (blocked-path under-allocation).' );
		}
	}
	return minLen;
}

/**
* Allocate a poisoned (NaN-filled) real WORK buffer — a convenience for `run`
* closures so over-reads past the used region AND reads-before-write both surface
* as NaN.
*/
function poisonedWork( workLen ) {
	var w = new Float64Array( Math.max( workLen, 0 ) );
	w.fill( NaN );
	return w;
}


// EXPORTS //

export { assertWorkspaceSufficient, claimedMinimum, poisonedWork };
