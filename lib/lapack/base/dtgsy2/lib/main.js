// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsy2 from './dtgsy2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsy2, 'ndarray', ndarray );


// EXPORTS //

export default dtgsy2;
