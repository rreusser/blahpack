
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarzb from './dlarzb.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarzb, 'ndarray', ndarray );


// EXPORTS //

export default dlarzb;
