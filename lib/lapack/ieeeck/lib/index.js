

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ieeeck from './ieeeck.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ieeeck, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ieeeck & { ndarray: typeof ndarray }} */ ( ieeeck );
export { ndarray };
