// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtfttp from './dtfttp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtfttp, 'ndarray', ndarray );


// EXPORTS //

export default dtfttp;
