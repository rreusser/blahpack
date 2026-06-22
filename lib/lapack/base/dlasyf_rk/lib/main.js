
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasyfRk from './dlasyf_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasyfRk, 'ndarray', ndarray );


// EXPORTS //

export default dlasyfRk;
