// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zdotu from './zdotu.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zdotu, 'ndarray', ndarray );


// EXPORTS //

export default zdotu;
