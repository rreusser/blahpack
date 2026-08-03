// PASS — main.js attaches the ndarray variant and exports the routine default.
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import ndarray from './ndarray.js';
setReadOnly( ddot, 'ndarray', ndarray );
export default ddot;
