export type RenameProperty<T, OldKey extends keyof T, NewKey extends string> = {
    [k in keyof T as k extends OldKey ? NewKey : k]: T[k]
};
