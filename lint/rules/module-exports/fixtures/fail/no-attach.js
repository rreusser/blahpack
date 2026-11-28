// expect: noAttach
// FAIL — index.js exports both forms but never attaches the offset form to the default.
import ddot from './ddot.js';
import strided from './strided.js';

export default ddot;
export { strided };
