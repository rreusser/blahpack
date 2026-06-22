
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtplqt2 from './dtplqt2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtplqt2, 'ndarray', ndarray );


// EXPORTS //

export default dtplqt2;
