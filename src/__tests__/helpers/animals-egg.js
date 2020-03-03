const PREFIX = 'redux-egg/animals';
export const RECEIVE_ANIMAL = `${PREFIX}/RECEIVE_ANIMAL`;
export const receiveAnimal = name => ({ type: RECEIVE_ANIMAL, name });

export function getAnimals(state) {
  return state[PREFIX];
}

export function isPresent(state, { name }) {
  const animals = getAnimals(state);
  return !!animals[name];
}

function animalsReducer(state = {}, action) {
  switch (action.type) {
    case RECEIVE_ANIMAL: {
      const { name } = action;
      return { ...state, [name]: { name } };
    }
    default:
      return state;
  }
}

export default function animalsEgg({ combineReducer }) {
  combineReducer(PREFIX, animalsReducer);
}
