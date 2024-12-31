export type caseInsensitiveString<T extends string> =
    string extends T ? string :
    T extends `${infer C1}${infer C2}${infer C3}` ? (
        `${Uppercase<C1> | Lowercase<C1>}${Uppercase<C2> | Lowercase<C2>}${CaseInsensitiveString<C3>}`
    ) :
    T extends `${infer C1}${infer C2}` ? `${Uppercase<C1> | Lowercase<C1>}${CaseInsensitiveString<C2>}` :
    ``;
