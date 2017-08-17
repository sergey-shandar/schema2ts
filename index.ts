import * as fs from "fs"
import * as os from "os"
import X = require("./schema")

function* map<T, R>(i: Iterable<T>, f: (v: T) => R) {
    for (const v of i) {
        yield f(v)
    }
}

function* flatten<T>(ii: Iterable<Iterable<T>>): Iterable<T> {
    for (const i of ii) {
        yield* i
    }
}

type KeyValue<T> = {
    key: string
    value: T
}

function* properties<T>(o: { [k:string]: T|undefined }): Iterable<KeyValue<T>> {
    for (let key in o) {
        const value = o[key]
        if (value !== undefined) {
            yield { key: key, value: value }
        }
    }
}

function optionalToArray<T>(v: T|undefined): T[] {
    return v === undefined ? [] : [v]
}

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

function indent(i: IterableIterator<string>) {
    return map(i, v => "    " + v)
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

    export function allOfSchema(a: X.SchemaObject, b: X.SchemaObject): X.SchemaObject {
        return {
            $ref: onlyOne(a.$ref, b.$ref),
            default: onlyOne(a.default, b.default)
        }
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
                yield* map(properties(definitions), v => ({ name: v.key, schema: v.value }))
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
        return Ts.union(types.additionalTypes.concat(optionalToArray(types.objectType)))
    }

    interface TsTypes {
        readonly objectType?: Ts.Type
        readonly additionalTypes: Ts.Type[]
    }

    function toTypes(types: Ts.Type[]): TsTypes {
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
        const required = schemaObject.required === undefined ? [] : schemaObject.required
        const schemaProperties = schemaObject.properties

        let properties: Ts.Property[] = schemaProperties !== undefined
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

    export function createTypeAliases(main: Schema.NamedSchema, ns: Schema.NamedSchema): Ts.TypeAlias[] {
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

namespace Php {
    type Type = {
        readonly name: string
    }
    type Expression = {
    }
    type Statement = {
        readonly return: Expression
    }
    export type Function = {
        readonly name: string
        readonly return: Type
        readonly body: Statement[]
    }
    export type Class = {
        readonly name: string
        readonly extends: string
        readonly functions: Function[]
    }

    export function* functionToText(function_: Function) {
        yield "function " + function_.name + "()"
        yield "{"
        yield "}"
    }

    export function* classToText(class_: Class) {
        yield "<?php"
        yield "class " + class_.name + " extends " + class_.extends
        yield "{"
        yield *flatten(class_.functions.map(f => indent(functionToText(f))))
        yield "}"
    }
}

namespace SchemaToPhp {
    export function schemaToClass(ns: Schema.NamedSchema): Php.Class|undefined {
        const schema = ns.schema
        if (typeof schema === "boolean") {
            return undefined
        }
        const p = schema.properties
        const functions: Php.Function[] = p !== undefined
            ? Array.from(map(properties(p), p => ({
                name: p.key,
                return: { name: "void" },
                body: []
            })))
            : []
        return { name: ns.name, extends: "DataAbstract", functions: functions }
    }
}

const name = process.argv[2]

const schema : X.SchemaObject = JSON.parse(fs.readFileSync(name + ".json").toString())

const schemaDefinitions = schema.definitions

const main = { name: name, schema: schema }

const result = map(
    Schema.allDefinitions(main),
    d => Schema2Ts.createTypeAliases(main, d))

let text = ""
for (const line of Ts.module(flatten(result))) {
    text += line + os.EOL
}
fs.writeFileSync(name + ".d.ts", text)

const phpClasses = map(Schema.allDefinitions(main), d => SchemaToPhp.schemaToClass(d))

for (const class_ of phpClasses) {
    if (class_ !== undefined) {
        let text = ""
        for (const line of Php.classToText(class_)) {
            text += line + os.EOL
        }
        fs.writeFileSync(class_.name + ".php", text)
    }
}