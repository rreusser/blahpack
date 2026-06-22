
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtptri from './dtptri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtptri, 'ndarray', ndarray );


// EXPORTS //

export default dtptri;
