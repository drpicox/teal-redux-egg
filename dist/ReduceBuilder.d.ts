export class ReduceBuilder {
    reducers: ActionMultiList;
    add(actionType: any, reduce: any): void;
    build(): (state: {}, action: any) => any;
}
import { ActionMultiList } from "./ActionMultiList";
