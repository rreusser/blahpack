// expect: noNamedNdarray
// FAIL — index.js attaches and types the offset form but does not export it by name.
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import ndarray from './ndarray.js';

setReadOnly( ddot, 'ndarray', ndarray );

export default /** @type {typeof ddot & { ndarray: typeof ndarray }} */ ( ddot );
