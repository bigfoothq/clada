// clada/shared/src/result.ts

/**
 * A generic Result type that represents either a successful operation with a value
 * or a failed operation with an error.
 *
 * @template T The type of the value on success.
 * @template E The type of the error on failure.
 */
export type Result<T, E> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
    [key: string]: any; // Allows for additional error properties like 'expected' or 'found'
};