
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsen from './dtgsen.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsen, 'ndarray', ndarray );


// EXPORTS //

export default dtgsen;
