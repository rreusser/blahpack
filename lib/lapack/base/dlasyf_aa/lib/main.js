
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasyfAa from './dlasyf_aa.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasyfAa, 'ndarray', ndarray );


// EXPORTS //

export default dlasyfAa;
