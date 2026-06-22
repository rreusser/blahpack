
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarzb from './zlarzb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarzb, 'ndarray', ndarray );


// EXPORTS //

export default zlarzb;
