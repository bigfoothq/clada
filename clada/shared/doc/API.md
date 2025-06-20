# Shared Utilities API

## xml-to-dom.js
```typescript
parseToDom(xml: string): Result<Node[]>
```

## path-validate.js
```typescript
validatePath(path: string, options?: {allowEscape?: boolean}): Result<string>
```

## result.js
```typescript
map<T,U>(result: Result<T>, fn: (value: T) => U): Result<U>
flatMap<T,U>(result: Result<T>, fn: (value: T) => Result<U>): Result<U>
```