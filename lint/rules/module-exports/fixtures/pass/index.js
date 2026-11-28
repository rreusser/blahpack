// PASS — canonical index.js: the offset form attached, the typed default, and
// the named strided export (ticket 0124: there is no main.js).
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import strided from './strided.js';

setReadOnly( ddot, 'strided', strided );

export default /** @type {typeof ddot & { strided: typeof strided }} */ ( ddot );
export { strided };
