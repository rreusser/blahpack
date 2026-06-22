
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpgv from './zhpgv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpgv, 'ndarray', ndarray );


// EXPORTS //

export default zhpgv;
