
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgbbrd from './dgbbrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgbbrd, 'ndarray', ndarray );


// EXPORTS //

export default dgbbrd;
