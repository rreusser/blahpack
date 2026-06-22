// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlantb from './dlantb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlantb, 'ndarray', ndarray );


// EXPORTS //

export default dlantb;
