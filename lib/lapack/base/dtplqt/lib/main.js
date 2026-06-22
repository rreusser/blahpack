
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtplqt from './dtplqt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtplqt, 'ndarray', ndarray );


// EXPORTS //

export default dtplqt;
