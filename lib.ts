import * as _ from "@ts-common/iterator"
import * as X from "@ts-common/schema"
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

const indent = (i: Iterable<string>) =>
    _.map(i, v => "    " + v)

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

export namespace Schema {

    export const definitionsPath = "/definitions/"

    export const propertiesPath = "/properties/"

    export const onlyOne = <T>(a: T|undefined, b: T|undefined) =>
        a !== undefined ? a : b

    export const allOfSchemaObject = (a: X.MainObject, b: X.MainObject): X.MainObject => ({
        $ref: onlyOne(a.$ref, b.$ref),
        default: onlyOne(a.default, b.default)
    })

    export const toSchemaObject = (a: X.Main): X.MainObject => {
        // http://json-schema.org/draft-06/json-schema-release-notes.html#additions-and-backwards-compatible-changes
        switch (a) {
            case true: return {}
            case false: return {not: {}}
            default: return a
        }
    }

    export const allOfSchema = (a: X.Main, b: X.Main): X.Main =>
        allOfSchemaObject(toSchemaObject(a), toSchemaObject(b))

    export type NamedSchema = {
        readonly name: string
        readonly schema: X.Main
    }

    export function* allDefinitions(root: NamedSchema): Iterable<NamedSchema> {
        const schema = root.schema
        if (typeof schema !== "boolean") {
            const definitions = schema.definitions
            if (definitions !== undefined) {
                yield* _.map(
                    sm.entries(definitions),
                    v => ({ name: sm.entryKey(v), schema: sm.entryValue(v) }))
            }
        }
        yield root
    }
}

export namespace Ts {
    export interface Property {
        readonly name: string
        readonly type: Type
    }
    export interface GenericRef {
        readonly id: string
        readonly parameters: ReadonlyArray<Type>
    }
    export type Interface = ReadonlyArray<Property>
    export interface Type {
        readonly ref?: string
        readonly interface?: Interface
        readonly union?: ReadonlyArray<Type>
        readonly array?: Type
        readonly tuple?: ReadonlyArray<Type>
        readonly const?: json.Json
        readonly genericRef?: GenericRef
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

    const pushUnique = (a: Ts.Type[], v: Ts.Type) => {
        if (a.find(x => Ts.typeEqual(x, v)) === undefined) {
            a.push(v)
        }
    }

    export const union = (types: ReadonlyArray<Type>) => {
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

    export const propertyEqual = (a: Property, b: Property): boolean =>
        a.name === b.name && typeEqual(a.type, b.type)

    export const interfaceEqual = (a: Interface|undefined, b: Interface|undefined) =>
        _.isEqual(a, b, propertyEqual)

    export const typeArrayEqual = (
        a: ReadonlyArray<Type>|undefined,
        b: ReadonlyArray<Type>|undefined
    ) => _.isEqual(a, b, typeEqual)

    export const typeEqual = (a: Type|undefined, b: Type|undefined): boolean => {
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
        } else if (t.genericRef !== undefined) {
            yield *wrap(
                join(t.genericRef.parameters.map(type), ","), t.genericRef.id + "<", ">"
            )
        }
    }

    const pascalCase = (name: string): string =>
        (name[0].toUpperCase() + name.substr(1)).replace(/-/ig, "_")

    export const typeName = (name: string): string =>
        name.split(".").map(pascalCase).join(".")

    export const refType = (name: string): Ts.Type =>
        ({ ref: typeName(name) })

    export const genericRefType = (id: string, parameters: ReadonlyArray<Ts.Type>): Ts.Type =>
        ({ genericRef: { id: typeName(id), parameters: parameters }})

    export const propertyName = (name: string): string =>
        name.replace(/-/ig, "_")

    export const typeAlias = (t: TypeAlias) =>
        wrap(type(t.type), "export type " + typeName(t.name) + " = ", "")

    const normalizePropertyName = (name: string): string =>
        _.some(name, c => c === "^") ? `"${name}"` : name

    const properties = (v: json.JsonObject) => {
        const e = sm.entries(v)
        return _.flatMap(
            e,
            ([pk, pv]) => wrap(value(pv), normalizePropertyName(pk) + ": ", ","))
    }

    const items = (v: ReadonlyArray<json.Json>) =>
        _.flatMap(v, i => wrap(value(i), "", ","))

    class Visitor implements json.Visitor<Iterable<string>> {
        asNull = () => ["null"]
        asBoolean = (v: boolean) => [v ? "true" : "false"]
        asString = (v: string) => ['"' + v + '"']
        asNumber = (v: number) => [v.toString()];
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

    export const value = (v: json.Json) => json.visit(v, visitor)

    export const consts = (c: Const) => {
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

    // export const anyType : Ts.Type = { ref: "any" }
    export const anyType: Ts.Type = { ref: "TsCommonJson.Json" }
    export const neverType : Ts.Type = { ref: "never" }
    export const stringType : Ts.Type = { ref: "string"}
    export const numberType : Ts.Type = { ref: "number" }
    export const booleanType : Ts.Type = { ref: "boolean" }
    export const undefinedType : Ts.Type = { ref: "undefined" }
    export const anyArrayType : Ts.Type = { array: anyType }
}

export namespace Schema2Ts {
    const createTypeFromSchema = (
        main: Schema.NamedSchema,
        imports: MutableStringSet,
        schema: X.Main|undefined
    ): Ts.Type => {
        if (schema === undefined) {
            return Ts.anyType
        }
        const types = createTypesFromSchema(main, imports, schema)
        return Ts.union(types.additionalTypes.concat(_.optionalToArray(types.objectType)))
    }

    interface TsTypes {
        readonly objectType?: Ts.Type
        readonly additionalTypes: ReadonlyArray<Ts.Type>
    }

    const toTypes = (types: ReadonlyArray<Ts.Type>): TsTypes =>
        ({ additionalTypes: types })

    export type MutableStringSet = sm.MutableStringMap<boolean>

    const getTypePrefix = (imports: MutableStringSet, before: string): string => {
        if (before === "") {
            return ""
        }
        const beforeSplit = before.split("/")
        const fileName = beforeSplit[beforeSplit.length - 1]
        const ns = fileName.split(".")[0]
        imports[ns] = true
        return ns + "."
    }

    const getRefType = (prefix: string, after: string): Ts.Type => {
        if (after.startsWith(Schema.definitionsPath)) {
            return Ts.refType(prefix + after.substr(Schema.definitionsPath.length))
        }
        if (after.startsWith(Schema.propertiesPath)) {
            return Ts.genericRefType(
                "TsCommonJson.Property",
                [   Ts.refType(prefix + "Main"),
                    { const: after.substr(Schema.propertiesPath.length) }
                ]
            )
        }
        return Ts.anyType
    }

    export const createRefType = (
        main: Schema.NamedSchema,
        imports: MutableStringSet,
        $ref: string
    ): Ts.Type => {
        if ($ref === "#") {
            return Ts.refType(main.name)
        }
        const split = $ref.split("#")
        if (split.length !== 2) {
            return Ts.anyType
        }
        const before = split[0]
        const after = split[1]
        const prefix = getTypePrefix(imports, before)
        return getRefType(prefix, after)
    }

    const createTypesFromSchema = (
        main: Schema.NamedSchema,
        imports: MutableStringSet,
        schemaObject: X.Main
    ): TsTypes => {
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
                return toTypes([createRefType(main, imports, $ref)])
            }
        }

        // enum
        {
            const enum_ = schemaObject.enum
            if (enum_ !== undefined) {
                return toTypes(enum_.map(v => {
                    const x: Ts.Type = { const: v }
                    return x //{ const: v }
                }))
            }
        }

        // oneOf
        {
            const oneOf = schemaObject.oneOf
            if (oneOf !== undefined) {
                return toTypes(oneOf.map(v => createTypeFromSchema(main, imports, v)))
            }
        }

        // anyOf
        {
            const anyOf = schemaObject.anyOf
            if (anyOf !== undefined) {
                return toTypes(anyOf.map(v => createTypeFromSchema(main, imports, v)))
            }
        }

        // allOf
        {
            const allOf = schemaObject.allOf
            if (allOf !== undefined) {
                return toTypes([createTypeFromSchema(
                    main, imports, allOf.reduce(Schema.allOfSchema)
                )])
            }
        }

        // items
        {
            const items = schemaObject.items
            if (items !== undefined) {
                return toTypes([ _.isArray(items)
                    ? { tuple: items.map(v => createTypeFromSchema(main, imports, v)) }
                    : { array: createTypeFromSchema(main, imports, items) }
                ])
            }
        }

        const type = schemaObject.type
        if (_.isArray(type)) {
            return {
                objectType: type.find(v => v === "object") !== undefined
                    ? createObjectType(main, imports, schemaObject)
                    : undefined,
                additionalTypes:
                    type
                        .filter(v => v !== "object")
                        .map(t => createSimpleType(t))
            }
        } else {
            return type === "object" || type === undefined
                ? { objectType: createObjectType(main, imports, schemaObject), additionalTypes: [] }
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

    const createObjectType = (
        main: Schema.NamedSchema,
        imports: MutableStringSet,
        schemaObject: X.MainObject
    ): Ts.Type => {
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
                    type: createTypeFromSchema(main, imports, schemaProperties[name])
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
                additionalPropertiesTypes.push(createTypeFromSchema(
                    main, imports, additionalProperties
                ))
                break
        }

        const patternProperties = schemaObject.patternProperties
        if (patternProperties !== undefined) {
            const types = Object
                .keys(patternProperties)
                .forEach(k =>
                    additionalPropertiesTypes.push(createTypeFromSchema(
                        main, imports, patternProperties[k]
                    )))
        }

        if (additionalPropertiesTypes.length > 0) {
            properties.forEach(p => additionalPropertiesTypes.push(p.type))
            additionalPropertiesTypes.push(Ts.undefinedType)
            if (properties.length === 0) {
                properties.push({ name: "[_:string]", type: Ts.union(additionalPropertiesTypes)})
            }
        }

        return { interface: properties }
    }

    export const createTypeAliases = (
        main: Schema.NamedSchema,
        imports: MutableStringSet,
        ns: Schema.NamedSchema
    ): ReadonlyArray<Ts.TypeAlias> => {
        const types = createTypesFromSchema(main, imports, ns.schema)
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
