/**
* Run by `bin/coverage.mjs` alongside a module's own tests, under coverage
* (ticket 0065; CONVENTIONS T3/T4): replays the module's recorded
* `strided.js` calls through its wrapper IN THIS PROCESS (exact, null-work
* and transposed variants; no probing), so the wrapper lines those calls
* reach (both `order` branches, `WORK = null` allocations, the base call)
* count toward the wrapper's coverage.
*
* It asserts nothing: whether the wrapper's results are right is the
* `replay` gate's job (bin/wrapper-replay.mjs). The module is named by
* `REPLAY_MODULE`.
*/

import test from 'node:test';
import { replayModule } from './replay.js';

const dir = process.env.REPLAY_MODULE;

test( 'wrapper replay (counts toward wrapper coverage)', async function t() {
	if ( dir ) {
		await replayModule( dir, { 'probe': false } );
	}
});
