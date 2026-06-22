

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarmm from './dlarmm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarmm, 'ndarray', ndarray );


// EXPORTS //

export default dlarmm;
