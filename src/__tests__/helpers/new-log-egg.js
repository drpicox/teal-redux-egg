export function newLogEgg(log) {
  const PREFIX = 'redux-egg/log';

  function logReducer(state = false, action) {
    if (state) log.push(action);
    return true;
  }

  return function logEgg({ combineReducer }) {
    combineReducer(PREFIX, logReducer);
  };
}
