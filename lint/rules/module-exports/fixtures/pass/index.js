// PASS — canonical index.js: the offset form attached, the typed default, and
// the named ndarray export (ticket 0124: there is no main.js).
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import ndarray from './ndarray.js';

setReadOnly( ddot, 'ndarray', ndarray );

export default /** @type {typeof ddot & { ndarray: typeof ndarray }} */ ( ddot );
export { ndarray };
