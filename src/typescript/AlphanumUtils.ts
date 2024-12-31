/**
 * @typedef {`${'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'}`} ALPHABET
 * @typedef {`${ALPHABET|Lowercase<ALPHABET>|0|1|2|3|4|5|6|7|8|9}`} AlphanumericCharacter A case-insensitive alphanumeric string validator.
 * @typedef {AlphanumericCharacter} C
 **/
export type ALPHABET = `${'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'}`;
export type Alphanumeric = `${ALPHABET|Lowercase<ALPHABET>|0|1|2|3|4|5|6|7|8|9}`;
export type char = Alphanumeric;