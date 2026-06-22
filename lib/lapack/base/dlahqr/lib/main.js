// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlahqr from './dlahqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlahqr, 'ndarray', ndarray );


// EXPORTS //

export default dlahqr;
