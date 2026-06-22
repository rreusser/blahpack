
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrevc from './dtrevc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrevc, 'ndarray', ndarray );


// EXPORTS //

export default dtrevc;
