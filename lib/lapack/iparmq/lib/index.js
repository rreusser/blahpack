

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import iparmq from './iparmq.js';
import strided from './strided.js';


// MAIN //

setReadOnly( iparmq, 'strided', strided );


// EXPORTS //

export default /** @type {typeof iparmq & { strided: typeof strided }} */ ( iparmq );
export { strided };
