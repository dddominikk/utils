/**
* @example use
* ```
* interface Thing {id: string;name: string;price: number;other: { stuff: boolean };};
* type thing_string_props = KeysMatchingValueTypes<Thing,string>; // 'id'|'name'
* const thingStringKey: KeysMatchingValueTypes<Thing, string> = 'price'; // Error: Type '"price"' is not assignable to type 'KeysByValueTypes<Thing, string>'.(2322)
* const thingNumberKey: KeysMatchingValueTypes<Thing,number> = "price"  // valid
* ```
*/


export type KeysMatchingValueTypes<Obj, Value> = {
    [Key in keyof Obj]-?: Obj[Key] extends Value ? Key : never
}[keyof Obj];