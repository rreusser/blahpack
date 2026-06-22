
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaic1 from './dlaic1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaic1, 'ndarray', ndarray );


// EXPORTS //

export default dlaic1;
