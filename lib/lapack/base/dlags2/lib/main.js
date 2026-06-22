// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlags2 from './dlags2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlags2, 'ndarray', ndarray );


// EXPORTS //

export default dlags2;
