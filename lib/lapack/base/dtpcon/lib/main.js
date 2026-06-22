
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtpcon from './dtpcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtpcon, 'ndarray', ndarray );


// EXPORTS //

export default dtpcon;
