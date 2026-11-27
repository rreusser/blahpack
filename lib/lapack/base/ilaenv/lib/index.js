

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ilaenv from './ilaenv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ilaenv, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof ilaenv & { ndarray: typeof ndarray }} */ ( ilaenv );
export { ndarray };
