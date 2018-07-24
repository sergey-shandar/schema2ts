import * as fs from "fs"
import * as os from "os"
import * as X from "@ts-common/schema"
import * as _ from "@ts-common/iterator"
import * as sm from "@ts-common/string-map"
import * as json from "@ts-common/json"

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

function indent(i: Iterable<string>) {
    return _.map(i, v => "    " + v)
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

namespace Schema {

    export const definitionsUri = "#/definitions/"

    export function onlyOne<T>(a: T|undefined, b: T|undefined) {
        return a !== undefined ? a : b
    }

    export function allOfSchemaObject(a: X.SchemaObject, b: X.SchemaObject): X.SchemaObject {
        return {
            $ref: onlyOne(a.$ref, b.$ref),
            default: onlyOne(a.default, b.default)
        }
    }

    export function toSchemaObject(a: X.Schema): X.SchemaObject {
        // http://json-schema.org/draft-06/json-schema-release-notes.html#additions-and-backwards-compatible-changes
        switch (a) {
            case true: return {}
            case false: return {not: {}}
            default: return a
        }
    }

    export function allOfSchema(a: X.Schema, b: X.Schema): X.Schema {
        return allOfSchemaObject(toSchemaObject(a), toSchemaObject(b))
    }

    export type NamedSchema = {
        readonly name: string
        readonly schema: X.Schema
    }

    export function* allDefinitions(root: NamedSchema): Iterable<NamedSchema> {
        const schema = root.schema
        if (typeof schema !== "boolean") {
            const definitions = schema.definitions
            if (definitions !== undefined) {
                yield* _.map(
                    sm.entries(definitions),
                    v => ({ name: sm.entryName(v), schema: sm.entryValue(v) }))
            }
        }
        yield root
    }
}

namespace Ts {
    export interface Property {
        readonly name: string
        readonly type: Type
    }
    export type Interface = ReadonlyArray<Property>
    export interface Type {
        readonly ref?: string
        readonly interface?: Interface
        readonly union?: ReadonlyArray<Type>
        readonly array?: Type
        readonly tuple?: ReadonlyArray<Type>
        readonly const?: string
    }
    export interface TypeAlias {
        readonly name: string
        readonly type: Type
    }
    export interface Const {
        readonly name: string
        readonly type: Type
        readonly value: json.Json
    }
    export interface Import {
        readonly alias: string
        readonly name: string
    }
    export interface Module {
        readonly imports: Iterable<Import>
        readonly types: Iterable<TypeAlias>
        readonly consts: Iterable<Const>
    }

    function pushUnique(a: Ts.Type[], v: Ts.Type) {
        if (a.find(x => Ts.typeEqual(x, v)) === undefined) {
            a.push(v)
        }
    }

    export function union(types: ReadonlyArray<Type>) {
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

        if (newTypes.find(i => i === anyType) !== undefined) {
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

    export function interfaceEqual(a: Interface|undefined, b: Interface|undefined) {
        return _.arrayEqual(a, b, propertyEqual)
    }

    export function typeArrayEqual(a: ReadonlyArray<Type>|undefined, b: ReadonlyArray<Type>|undefined) {
        return _.arrayEqual(a, b, typeEqual)
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
            yield *wrap(item, "ReadonlyArray<", ">")
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

    export function typeAlias(t: TypeAlias) {
        return wrap(type(t.type), "export type " + typeName(t.name) + " = ", "")
    }

    function normalizePropertyName(name: string): string {
        return _.some(name, c => c === "^") ? `"${name}"` : name
    }

    function properties(v: json.JsonObject) {
        const e = sm.entries(v)
        return _.flatMap(
            e,
            p => wrap(value(sm.entryValue(p)), normalizePropertyName(sm.entryName(p)) + ": ", ","))
    }

    function items(v: ReadonlyArray<json.Json>) {
        return _.flatMap(v, i => wrap(value(i), "", ","))
    }

    class Visitor implements json.Visitor<Iterable<string>> {
        asNull() { return ["null"] }
        asBoolean(v: boolean) { return [v ? "true" : "false"] }
        asString(v: string) { return ['"' + v + '"'] }
        asNumber(v: number) { return [v.toString()] }
        *asArray(v: json.JsonArray) {
            yield "["
            yield *indent(wrap(items(v), "", ""))
            yield "]"
        }
        *asObject(v: json.JsonObject) {
            yield "{"
            yield *indent(wrap(properties(v), "", ""))
            yield "}"
        }
    }

    const visitor: json.Visitor<Iterable<string>> = new Visitor()

    export function value(v: json.Json) {
        return json.visit(v, visitor)
    }

    export function consts(c: Const) {
        return wrap(
            value(c.value),
            "export const " + c.name + ": " + c.type.ref +" = ",
            "")
    }

    export function* import_(i: Import) {
        yield "import * as " + i.alias + " from \"" + i.name + "\""
    }

    export function* module(m: Module) {
        for (const i of m.imports) {
            yield* import_(i)
        }
        for (const i of m.types) {
            yield* typeAlias(i)
        }
        for (const i of m.consts) {
            yield* consts(i)
        }
    }

    export const anyType : Ts.Type = { ref: "any" }
    export const neverType : Ts.Type = { ref: "never" }
    export const stringType : Ts.Type = { ref: "string"}
    export const numberType : Ts.Type = { ref: "number" }
    export const booleanType : Ts.Type = { ref: "boolean" }
    export const undefinedType : Ts.Type = { ref: "undefined" }
    export const anyArrayType : Ts.Type = { array: anyType }
}

namespace Schema2Ts {
    function createTypeFromSchema(main: Schema.NamedSchema, schema: X.Schema|undefined): Ts.Type {
        if (schema === undefined) {
            return Ts.anyType
        }
        const types = createTypesFromSchema(main, schema)
        return Ts.union(types.additionalTypes.concat(_.optionalToArray(types.objectType)))
    }

    interface TsTypes {
        readonly objectType?: Ts.Type
        readonly additionalTypes: ReadonlyArray<Ts.Type>
    }

    function toTypes(types: ReadonlyArray<Ts.Type>): TsTypes {
        return { additionalTypes: types }
    }

    function createTypesFromSchema(main: Schema.NamedSchema, schemaObject: X.Schema): TsTypes {
        switch (schemaObject) {
            case true:
                return toTypes([Ts.anyType])
            case false:
                return toTypes([Ts.neverType])
        }

        // $ref
        {
            const $ref = schemaObject.$ref
            if ($ref !== undefined) {
                if ($ref === "#") return toTypes([Ts.refType(main.name)])
                if ($ref.startsWith(Schema.definitionsUri)) {
                    return toTypes([Ts.refType($ref.substr(Schema.definitionsUri.length))])
                }
                return toTypes([Ts.anyType])
            }
        }

        // enum
        {
            const enum_ = schemaObject.enum
            if (enum_ !== undefined) {
                return toTypes(enum_.map(v => ({ const: v })))
            }
        }

        // oneOf
        {
            const oneOf = schemaObject.oneOf
            if (oneOf !== undefined) {
                return toTypes(oneOf.map(v => createTypeFromSchema(main, v)))
            }
        }

        // anyOf
        {
            const anyOf = schemaObject.anyOf
            if (anyOf !== undefined) {
                return toTypes(anyOf.map(v => createTypeFromSchema(main, v)))
            }
        }

        // allOf
        {
            const allOf = schemaObject.allOf
            if (allOf !== undefined) {
                return toTypes([createTypeFromSchema(main, allOf.reduce(Schema.allOfSchema))])
            }
        }

        // items
        {
            const items = schemaObject.items
            if (items !== undefined) {
                return toTypes([ Array.isArray(items)
                    ? { tuple: items.map(v => createTypeFromSchema(main, v)) }
                    : { array: createTypeFromSchema(main, items) }
                ])
            }
        }

        const type = schemaObject.type
        if (Array.isArray(type)) {
            return {
                objectType: type.find(v => v === "object") !== undefined
                    ? createObjectType(main, schemaObject)
                    : undefined,
                additionalTypes:
                    type
                        .filter(v => v !== "object")
                        .map(t => createSimpleType(t))
            }
        } else {
            return type === "object" || type === undefined
                ? { objectType: createObjectType(main, schemaObject), additionalTypes: [] }
                : toTypes([createSimpleType(type)])
        }
    }

    function createSimpleType(type: string|undefined) {
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
            default:
                return Ts.neverType;
        }
    }

    function createObjectType(main: Schema.NamedSchema, schemaObject: X.SchemaObject): Ts.Type {
        // object
        const required: ReadonlyArray<string> =
            schemaObject.required === undefined ? [] : schemaObject.required
        const schemaProperties = schemaObject.properties

        const properties: Ts.Property[] = schemaProperties !== undefined
            ? Object
                .keys(schemaProperties)
                .map(name => ({
                    name: Ts.propertyName(name)
                        + (required.find(r => r === name) === undefined ? "?" : ""),
                    type: createTypeFromSchema(main, schemaProperties[name])
                }))
            : []

        const additionalPropertiesTypes : Ts.Type[] = []
        const additionalProperties = schemaObject.additionalProperties
        switch (additionalProperties) {
            case true:
            case undefined:
                additionalPropertiesTypes.push(Ts.anyType)
                break
            case false:
                break
            default:
                additionalPropertiesTypes.push(createTypeFromSchema(main, additionalProperties))
                break
        }

        const patternProperties = schemaObject.patternProperties
        if (patternProperties !== undefined) {
            const types = Object
                .keys(patternProperties)
                .forEach(k =>
                    additionalPropertiesTypes.push(createTypeFromSchema(main, patternProperties[k])))
        }

        if (additionalPropertiesTypes.length > 0) {
            properties.forEach(p => additionalPropertiesTypes.push(p.type))
            additionalPropertiesTypes.push(Ts.undefinedType)
            properties.push({ name: "[_:string]", type: Ts.union(additionalPropertiesTypes)})
        }

        return { interface: properties }
    }

    export function createTypeAliases(
        main: Schema.NamedSchema, ns: Schema.NamedSchema
    ): ReadonlyArray<Ts.TypeAlias> {
        const types = createTypesFromSchema(main, ns.schema)
        if (types.objectType !== undefined) {
            if (types.additionalTypes.length === 0) {
                return [{ name: ns.name, type: types.objectType }]
            }
            const objectType = ns.name + "Object"
            return [
                { name: objectType, type: types.objectType },
                {
                    name: ns.name,
                    type: Ts.union(types.additionalTypes.concat([Ts.refType(objectType)]))
                }
            ]
        }
        return [{ name: ns.name, type: Ts.union(types.additionalTypes) }]
    }
}

const argv = process.argv

const name = process.argv[2]

const output = argv.length > 3 ? argv[3] : name + ".ts"

const schemaAny = JSON.parse(fs.readFileSync(name + ".json").toString())

const schema : X.SchemaObject = schemaAny

const schemaDefinitions = schema.definitions

const shortName = "Main" // _.last(name.split("/")) || "noname"

const main = { name: shortName, schema: schema }

const result = _.map(
    Schema.allDefinitions(main),
    d => Schema2Ts.createTypeAliases(main, d))

let text = ""

const tsCommonSchema = "@ts-common/schema"
const tsCommonSchemaAlias = "ts_common_schema"

const tsModule: Ts.Module = {
    imports: [{ alias: tsCommonSchemaAlias, name: tsCommonSchema }],
    types: _.flatten(result),
    consts: [{ name: "schema", type: { ref: tsCommonSchemaAlias + ".Schema" }, value: schema }]
}

for (const line of Ts.module(tsModule)) {
    text += line + os.EOL
}

fs.writeFileSync(output, text)
