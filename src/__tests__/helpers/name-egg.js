const PREFIX = 'redux-egg/name';
export const REPLACE_NAME = `${PREFIX}/REPLACE_NAME`;
export const replaceName = name => ({ type: REPLACE_NAME, name });

export function getName(state) {
  return state[PREFIX];
}

function nameReducer(state = null, action) {
  switch (action.type) {
    case REPLACE_NAME: {
      return action.name;
    }
    default:
      return state;
  }
}

export default function nameEgg({ combineReducer }) {
  combineReducer(PREFIX, nameReducer);
}
