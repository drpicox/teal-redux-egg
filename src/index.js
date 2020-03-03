import storeEgg from './store-egg';
import combineReducersEgg from './combine-reducers-egg';
import interceptorsEgg from './interceptors-egg';

export default function reduxEgg(incubators) {
  storeEgg(incubators);
  combineReducersEgg(incubators);
  interceptorsEgg(incubators);
}
