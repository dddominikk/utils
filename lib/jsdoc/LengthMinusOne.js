/** 
 * @template {readonly unknown[]} T
 * @typedef {T extends [...infer Rest, any] ? Rest['length'] : never} LengthMinusOne
 */

/**
* @template {unknown[]} Arr
* @typedef {Arr[LengthMinusOne<Arr>]} lastArrayElement
*/



/**
* @example
* @type lastArrayElement<['a','b','c','d', 423]>
*/
const lastArrayElementTest = 422 // Type '422' is not assignable to type '423'.(2322)
