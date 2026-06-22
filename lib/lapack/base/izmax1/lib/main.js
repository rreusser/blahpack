// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import izmax1 from './izmax1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( izmax1, 'ndarray', ndarray );


// EXPORTS //

export default izmax1;
