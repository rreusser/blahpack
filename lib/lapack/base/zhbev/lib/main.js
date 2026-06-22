
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhbev from './zhbev.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhbev, 'ndarray', ndarray );


// EXPORTS //

export default zhbev;
