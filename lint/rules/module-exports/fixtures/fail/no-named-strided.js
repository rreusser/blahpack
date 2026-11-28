// expect: noNamedStrided
// FAIL — index.js attaches and types the offset form but does not export it by name.
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import strided from './strided.js';

setReadOnly( ddot, 'strided', strided );

export default /** @type {typeof ddot & { strided: typeof strided }} */ ( ddot );
