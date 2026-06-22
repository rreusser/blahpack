// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlabad from './dlabad.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlabad, 'ndarray', ndarray );


// EXPORTS //

export default dlabad;
