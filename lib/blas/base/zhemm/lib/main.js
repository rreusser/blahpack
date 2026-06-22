// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhemm from './zhemm.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhemm, 'ndarray', ndarray );


// EXPORTS //

export default zhemm;
