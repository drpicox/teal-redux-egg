export class AfterActionMiddlewareBuilder {
    fns: ActionMultiList;
    add(actionType: any, fn: any): void;
    build(breeds: any): () => (next: any) => (action: any) => void;
}
import { ActionMultiList } from "./ActionMultiList";
