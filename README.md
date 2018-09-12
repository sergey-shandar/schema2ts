# schema2ts

JSON Schema to TypeScript. See also https://www.jsonschemavalidator.net/

## Normalized Schema Object

```ts
interface SchemaObject {
  readonly array?: ArrayType
  readonly boolean?: BooleanType
  readonly integer?: IntegerType
  readonly null?: NullType
  readonly number?: NumerType
  readonly object?: ObjectType
  readonly string?: StringType
}

interface ArrayType {
}

interface BooleanType {
}

interface IntegerType {
}

interface NullType {
}

interface NumberType {
}

interface ObjectType {
}

interface StringType {
}
```
