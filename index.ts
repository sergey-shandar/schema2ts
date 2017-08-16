import * as fs from "fs"
import * as os from "os"
import X = require("./schema")

function* wrap(i: Iterable<string>, prefix: string, suffix: string) {
    let previous: string|undefined = undefined
    for (const v of i) {
        if (previous !== undefined) {
            yield previous
            previous = v
        } else {
            previous = prefix + v
        }
    }
    if (previous !== undefined) {
        yield previous + suffix
    } else {
        yield prefix + suffix
    }
}

function* indent(i: IterableIterator<string>) {
    for (const v of i) {
        yield "    " + v
    }
}

function* join(ii: Iterable<Iterable<string>>, separator: string): Iterable<string> {
    let previous : string|undefined = undefined
    for (const i of ii) {
        if (previous !== undefined) {
            previous += separator
        }
        let first = true
        for (const v of i) {
            if (first) {
                previous = previous === undefined ? v : previous + v
                first = false
            } else {
                if (previous !== undefined) {
                    yield previous
                }
                previous = v
            }
        }
    }
    if (previous !== undefined) {
        yield previous
    }
}

function* flatten<T>(ii: Iterable<Iterable<T>>): Iterable<T> {
    for (const i of ii) {
        yield* i
    }
}

namespace Schema {
    export const definitionsUri = "#/definitions/"

    export function onlyOne<T>(a: T|undefined, b: T|undefined) {
        return a !== undefined ? a : b
    }

    export function allOfSchema(a: X.SchemaObject, b: X.SchemaObject): X.SchemaObject {
        return {
            $ref: onlyOne(a.$ref, b.$ref),
            default: onlyOne(a.default, b.default)
        }
    }
}

namespace Ts {
    export interface Property {
        readonly name: string
        readonly type: Type
    }
    export type Interface = Property[]
    export interface Type {
        readonly ref?: string
        readonly interface?: Interface
        readonly union?: Type[]
        readonly array?: Type
        readonly tuple?: Type[]
        readonly const?: string
    }
    export interface TypeAlias {
        readonly name: string
        readonly type: Type
    }
    export type Module = Iterable<TypeAlias>

    function pushUnique(a: Ts.Type[], v: Ts.Type) {
        if (a.find(x => Ts.typeEqual(x, v)) === undefined) {
            a.push(v)
        }
    }

    export function union(types: Type[]) {
        let newTypes : Type[] = []

        // union flattering.
        for (const i of types) {
            if (i.union !== undefined) {
                for (const j of i.union) {
                    pushUnique(newTypes, j)
                }
            } else {
                pushUnique(newTypes, i)
            }
        }

        if(newTypes.find(i => i === anyType) !== undefined) {
            return anyType
        }

        if (newTypes.find(i => i === stringType) !== undefined) {
            newTypes = newTypes.filter(i => i.const === undefined)
        }

        return newTypes.length === 1
            ? newTypes[0]
            : { union: newTypes }
    }

    export function propertyEqual(a: Property, b: Property): boolean {
        return a.name === b.name
            && typeEqual(a.type, b.type)
    }

    export function arrayEqual<T>(
        a: T[]|undefined, b: T[]|undefined, e: (ai: T, bi: T) => boolean): boolean {

        if (a === b) {
            return true
        }
        if (a === undefined || b === undefined) {
            return false
        }
        const al = a.length
        const bl = b.length
        if (al !== bl) {
            return false
        }
        for (let i = 0; i < al; ++i) {
            if (!e(a[i], b[i])) {
                return false
            }
        }
        return true
    }

    export function interfaceEqual(a: Interface|undefined, b: Interface|undefined) {
        return arrayEqual(a, b, propertyEqual)
    }

    export function typeArrayEqual(a: Type[]|undefined, b: Type[]|undefined) {
        return arrayEqual(a, b, typeEqual)
    }

    export function typeEqual(a: Type|undefined, b: Type|undefined): boolean {
        if (a === b) {
            return true
        }
        if (a === undefined || b === undefined) {
            return false
        }
        return a.ref === b.ref
            && interfaceEqual(a.interface, b.interface)
            && typeArrayEqual(a.union, b.union)
            && typeEqual(a.array, b.array)
            && typeArrayEqual(a.tuple, b.tuple)
            && a.const === b.const
    }

    export function* type(t: Type): IterableIterator<string> {
        if (t.ref !== undefined) {
            yield t.ref
        } else if (t.interface !== undefined) {
            if (t.interface.length == 0) {
                yield "{}"
            } else {
                yield "{"
                for (const p of t.interface) {
                    yield *indent(wrap(type(p.type), "readonly " + p.name + ": ", ""))
                }
                yield "}"
            }
        } else if (t.union !== undefined) {
            yield *join(t.union.map(type), "|"), "(", ")"
        } else if (t.array !== undefined) {
            const item = type(t.array)
            if (t.array.union !== undefined) {
                yield *wrap(item, "(", ")[]")
            } else {
                yield *wrap(item, "", "[]")
            }
        } else if (t.tuple !== undefined) {
            yield *wrap(join(t.tuple.map(type), ","), "[", "]")
        } else if (t.const !== undefined) {
            yield '"' + t.const + '"'
        }
    }

    export function typeName(name: string): string {
        return (name[0].toUpperCase() + name.substr(1)).replace(/-/ig, "_")
    }

    export function refType(name: string): Ts.Type {
        return { ref: typeName(name) };
    }

    export function propertyName(name: string): string {
        return name.replace(/-/ig, "_")
    }

    export function* typeAlias(t: TypeAlias) {
        yield* wrap(type(t.type), "export type " + typeName(t.name) + " = ", "")
    }

    export function* module(m: Module) {
        for (const i of m) {
            yield* typeAlias(i)
        }
    }

    export const anyType : Ts.Type = { ref: "any" }
    export const neverType : Ts.Type = { ref: "never" }
    export const anyArrayType : Ts.Type = { array: anyType }
    export const stringType : Ts.Type = { ref: "string"}
    export const numberType : Ts.Type = { ref: "number" }
    export const booleanType : Ts.Type = { ref: "boolean" }
    export const undefinedType : Ts.Type = { ref: "undefined" }
}

const name = "swagger20"
// const name = "schema"
// const name = "swagger-autorest"

function createType(schema: X.Schema|undefined): Ts.Type {
    if (schema === undefined) {
        return Ts.anyType
    }
    return Ts.union(createType0(schema))
}

function createType0(schemaObject: X.Schema): Ts.Type[] {
    switch (schemaObject) {
        case true:
            return [Ts.anyType]
        case false:
            return [Ts.neverType]
    }

    // $ref
    {
        const $ref = schemaObject.$ref
        if ($ref !== undefined) {
            if ($ref === "#") return [Ts.refType(name)]
            if ($ref.startsWith(Schema.definitionsUri)) {
                return [Ts.refType($ref.substr(Schema.definitionsUri.length))]
            }
            return [Ts.anyType]
        }
    }

    // enum
    {
        const enum_ = schemaObject.enum
        if (enum_ !== undefined) {
            return [Ts.union(enum_.map(v => ({ const: v })))]
        }
    }

    // oneOf
    {
        const oneOf = schemaObject.oneOf
        if (oneOf !== undefined) {
            return [Ts.union(oneOf.map(createType))]
        }
    }

    // anyOf
    {
        const anyOf = schemaObject.anyOf
        if (anyOf !== undefined) {
            return [Ts.union(anyOf.map(createType))]
        }
    }

    // allOf
    {
        const allOf = schemaObject.allOf
        if (allOf !== undefined) {
            return [createType(allOf.reduce(Schema.allOfSchema))]
        }
    }

    // items
    {
        const items = schemaObject.items
        if (items !== undefined) {
            return [ Array.isArray(items)
                ? { tuple: items.map(createType) }
                : { array: createType(items) }
            ]
        }
    }

    const type = schemaObject.type
    if (Array.isArray(type)) {
        return type.map(t => createType2(t, schemaObject))
    } else {
        return [createType2(type, schemaObject)]
    }
}

function createType2(type: string|undefined, schemaObject: X.SchemaObject): Ts.Type {
    // simple types
    switch (type) {
        case "array":
            return Ts.anyArrayType
        case "string":
            return Ts.stringType
        case "integer":
        case "number":
            return Ts.numberType
        case "boolean":
            return Ts.booleanType
    }

    // object
    const required = schemaObject.required === undefined ? [] : schemaObject.required
    const schemaProperties = schemaObject.properties

    let properties: Ts.Property[] = schemaProperties !== undefined
        ? Object
            .keys(schemaProperties)
            .map(name => ({
                name: Ts.propertyName(name)
                    + (required.find(r => r === name) === undefined ? "?" : ""),
                type: createType(schemaProperties[name])
            }))
        : []

    const additionalProperties = schemaObject.additionalProperties
    const additionalPropertiesTypes : Ts.Type[] = []
    switch (additionalProperties) {
        case true:
        case undefined:
            additionalPropertiesTypes.push(Ts.anyType)
            break
        case false:
            break
        default:
            additionalPropertiesTypes.push(createType(additionalProperties))
            break
    }

    const patternProperties = schemaObject.patternProperties
    if (patternProperties !== undefined) {
        const types = Object
            .keys(patternProperties)
            .forEach(k =>
                additionalPropertiesTypes.push(createType(patternProperties[k])))
    }

    if (additionalPropertiesTypes.length > 0) {
        properties.forEach(p => additionalPropertiesTypes.push(p.type))
        additionalPropertiesTypes.push(Ts.undefinedType)
        properties.push({ name: "[_:string]", type: Ts.union(additionalPropertiesTypes)})
    }

    return { interface: properties }
}

function createTypeAliases(name: string, schema: X.Schema|undefined): Ts.TypeAlias[] {
    if (schema === undefined) {
        return []
    }
    const types = createType0(schema)
    if (types.length === 1) {
        return [{ name: name, type: types[0]}]
    } else {
        const objectName = name + "Object"
        return [
            { name: objectName, type: types[0] },
            {
                name: name,
                type: Ts.union(types
                    .filter((_, i) => i > 0)
                    .concat(Ts.refType(objectName)))
            }
        ]
    }
}

const schema : X.SchemaObject = JSON.parse(fs.readFileSync(name + ".json").toString())

const schemaDefinitions = schema.definitions

const definitions = schemaDefinitions !== undefined
    ? Object
        .keys(schemaDefinitions)
        .map(name => createTypeAliases(name, schemaDefinitions[name]))
    : []

const result = definitions.concat([createTypeAliases(name, schema)])

let text = ""
for (const line of Ts.module(flatten(result))) {
    text += line + os.EOL
}
fs.writeFileSync(name + ".d.ts", text)
