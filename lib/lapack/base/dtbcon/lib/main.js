
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtbcon from './dtbcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtbcon, 'ndarray', ndarray );


// EXPORTS //

export default dtbcon;
