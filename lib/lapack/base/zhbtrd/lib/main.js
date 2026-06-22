
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbtrd from './zhbtrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbtrd, 'ndarray', ndarray );


// EXPORTS //

export default zhbtrd;
