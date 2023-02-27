// gets permutations of a type
// e.g. Permutations<'a' | 'b'> = 'a' | 'b' | 'a b' | 'b a'
// taken from https://stackoverflow.com/questions/68252446/is-it-possible-to-generate-string-literal-combinations-with-template-literal-in#answer-68256789
export type Permutations<T extends string, U extends string = T> = T extends any
  ? T | `${T} ${Permutations<Exclude<U, T>>}`
  : never;
