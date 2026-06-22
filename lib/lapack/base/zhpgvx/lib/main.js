
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpgvx from './zhpgvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpgvx, 'ndarray', ndarray );


// EXPORTS //

export default zhpgvx;
