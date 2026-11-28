

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import iparmq from './iparmq.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( iparmq, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof iparmq & { ndarray: typeof ndarray }} */ ( iparmq );
export { ndarray };
