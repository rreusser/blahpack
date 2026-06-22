// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhesv from './zhesv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhesv, 'ndarray', ndarray );


// EXPORTS //

export default zhesv;
