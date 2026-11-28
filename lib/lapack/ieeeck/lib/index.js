

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ieeeck from './ieeeck.js';
import strided from './strided.js';


// MAIN //

setReadOnly( ieeeck, 'strided', strided );


// EXPORTS //

export default /** @type {typeof ieeeck & { strided: typeof strided }} */ ( ieeeck );
export { strided };
