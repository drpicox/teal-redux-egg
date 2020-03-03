const PREFIX = 'redux-egg/counter';

export const INCREMENT = `${PREFIX}/INCREMENT`;
export const increment = (value = 1) => ({ type: INCREMENT, value });
export const REPLACE_COUNT = `${PREFIX}/REPLACE_COUNT`;
export const replaceCount = value => ({ type: REPLACE_COUNT, value });

export function getCount(state) {
  return state[PREFIX];
}

function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.value;

    case REPLACE_COUNT:
      return action.value;

    default:
      return state;
  }
}

export default function counterEgg({ combineReducer }) {
  combineReducer(PREFIX, counterReducer);
}
