
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhpcon from './zhpcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhpcon, 'ndarray', ndarray );


// EXPORTS //

export default zhpcon;
