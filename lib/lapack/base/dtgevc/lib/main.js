
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgevc from './dtgevc.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgevc, 'ndarray', ndarray );


// EXPORTS //

export default dtgevc;
