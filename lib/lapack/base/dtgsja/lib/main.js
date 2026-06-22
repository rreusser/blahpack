// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsja from './dtgsja.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsja, 'ndarray', ndarray );


// EXPORTS //

export default dtgsja;
