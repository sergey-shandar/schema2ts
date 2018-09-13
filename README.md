# schema2ts

JSON Schema to TypeScript. See also https://www.jsonschemavalidator.net/

See also http://json-schema.org/draft-07/schema

## Normalized Schema Object

Excluding `$id`, `$schema`, `$ref`, `$comment`, `title`, `description`, `default`, `readOnly`, `examples`

```ts
interface SimpleType {
  readonly array?: ArrayType
  readonly boolean?: BooleanType
  readonly integer?: IntegerType
  readonly null?: NullType
  readonly number?: NumberType
  readonly object?: ObjectType
  readonly string?: StringType
}

interface ArrayType {
}

interface BooleanType {
}

interface IntegerType extends NumberType {
}

interface NullType {
}

interface NumberType {
    readonly multipleOf?: number
    readonly maximum?: number
    readonly exclusiveMaximum?: number
    readonly minimum?: number
    readonly exclusiveMinimum?: number
}

interface ObjectType {
}

interface StringType {
}
```
