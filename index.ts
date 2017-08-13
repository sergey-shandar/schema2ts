import * as fs from "fs";
import * as os from "os";
import X = require("./schema");

function* wrap(i: Iterable<string>, prefix: string, suffix: string) {
    let previous: string|undefined = undefined;
    for (const v of i) {
        if (previous !== undefined) {
            yield previous;
            previous = v;
        } else {
            previous = prefix + v;
        }
    }
    if (previous !== undefined) {
        yield previous + suffix;
    } else {
        yield prefix + suffix;
    }
}

function* indent(i: IterableIterator<string>) {
    for (const v of i) {
        yield "    " + v;
    }
}

function* join(ii: Iterable<Iterable<string>>, separator: string): Iterable<string> {
    let previous : string|undefined = undefined;
    for (const i of ii) {
        if (previous !== undefined) {
            previous += separator;
        }
        let first = true;
        for (const v of i) {
            if (first) {
                previous = previous === undefined ? v : previous + v;
                first = false;
            } else {
                if (previous !== undefined) {
                    yield previous;
                }
                previous = v;
            }
        }
    }
    if (previous !== undefined) {
        yield previous;
    }
}

function* flatten<T>(ii: Iterable<Iterable<T>>): Iterable<T> {
    for (const i of ii) {
        yield* i;
    }
}

namespace Ts {
    export interface Property {
        readonly name: string;
        readonly type: Type;
    }
    export type Interface = Property[];
    export interface Type {
        readonly ref?: string;
        readonly interface?: Interface;
        readonly union?: Type[];
        readonly array?: Type;
        readonly tuple?: Type[];
        readonly const?: string;
    }
    export interface TypeAlias {
        readonly name: string;
        readonly type: Type;
    }
    export type Module = Iterable<TypeAlias>;

    export function* type(t: Type): IterableIterator<string> {
        if (t.ref !== undefined) {            
            yield t.ref;
        } else if (t.interface !== undefined) {
            if (t.interface.length == 0) {
                yield "{}";
            } else {
                yield "{"
                for (const p of t.interface) {
                    yield *indent(wrap(type(p.type), "readonly " + p.name + ": ", ";"));
                }
                yield "}";
            }
        } else if (t.union !== undefined) {
            yield *join(t.union.map(type), "|"), "(", ")";
        } else if (t.array !== undefined) {
            const item = type(t.array); 
            if (t.array.union !== undefined) {
                yield *wrap(item, "(", ")[]");
            } else {
                yield *wrap(item, "", "[]");
            }            
        } else if (t.tuple !== undefined) {
            yield *wrap(join(t.tuple.map(type), ","), "[", "]");
        } else if (t.const !== undefined) {
            yield '"' + t.const + '"';
        }
    }

    export function* typeAlias(t: TypeAlias) {
        yield* wrap(type(t.type), "export type " + typeName(t.name) + " = ", ";");
    }
    export function* module(m: Module) {
        for (const i of m) {
            yield* typeAlias(i);
        }
    }
}

const name = "swagger20";
// const name = "schema";

const definitionsUri = "#/definitions/";

function onlyOne<T>(a: T|undefined, b: T|undefined) {
    return a !== undefined ? a : b
}

function allOfSchema(a: X.SchemaObject, b: X.SchemaObject): X.SchemaObject {
    return {
        $ref: onlyOne(a.$ref, b.$ref),
        default: onlyOne(a.default, b.default)
    }
}

function createType(schema: X.Schema|undefined): Ts.Type {
    if (schema === undefined) {
        return { ref: "any" }
    }
    const types = createType0(schema)
    return types.length === 1
        ? types[0]
        : { union: types }
}

function createType0(schemaObject: X.Schema): Ts.Type[] {
    if (typeof schemaObject === "boolean") {
        return [{ ref: schemaObject ? "any" : "never" }];
    }

    // $ref
    {
        const $ref = schemaObject.$ref;
        if ($ref !== undefined) {
            if ($ref === "#") return [{ ref: typeName(name) }];
            if ($ref.startsWith(definitionsUri)) {
                return [{ ref: typeName($ref.substr(definitionsUri.length)) }];
            }
            return [{ ref: "any" }];
        }
    }    

    // enum
    {
        const enum_ = schemaObject.enum;
        if (enum_ !== undefined) {
            return [{ union: enum_.map(v => ({ const: v })) }];
        }
    }

    // anyOf
    {
        const anyOf = schemaObject.anyOf;
        if (anyOf !== undefined) {
            return [{ union: anyOf.map(createType) }];
        }
    }

    // allOf
    {
        const allOf = schemaObject.allOf
        if (allOf !== undefined) {
            return [createType(allOf.reduce(allOfSchema))]
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

    const type = schemaObject.type;
    if (Array.isArray(type)) {
        return type.map(t => createType2(t, schemaObject));
    } else {
        return [createType2(type, schemaObject)]
    }
}

function typeName(name: string): string {
    return name[0].toUpperCase() + name.substr(1);
}

function propertyName(name: string): string {
    return name;
}

function createType2(type: string|undefined, schemaObject: X.SchemaObject): Ts.Type {    
    // simple types
    switch (type) {
        case "array":
            return { ref: "any[]" }
        case "string":
            return { ref: "string" }
        case "integer":
        case "number":
            return { ref: "number" }
        case "boolean":
            return { ref: "boolean" }
    }

    // object
    const required = schemaObject.required === undefined ? [] : schemaObject.required;
    const schemaProperties = schemaObject.properties;
    
    let properties: Ts.Property[] = schemaProperties !== undefined 
        ? Object
            .keys(schemaProperties)
            .map(name => ({ 
                name: propertyName(name) 
                    + (required.find(r => r === name) === undefined ? "?" : ""), 
                type: createType(schemaProperties[name]) 
            }))
        : []
    
    const additionalProperties = schemaObject.additionalProperties;
    const additionalPropertiesTypes : Ts.Type[] = [];
    switch (additionalProperties) {
        case true:
        case undefined:
            additionalPropertiesTypes.push({ ref: "any" })
            break;
        case false:
            break;
        default:
            additionalPropertiesTypes.push(createType(additionalProperties))
            break;
    }

    const patternProperties = schemaObject.patternProperties
    if (patternProperties !== undefined) {
        const types = Object
            .keys(patternProperties)
            .forEach(k => additionalPropertiesTypes.push(createType(patternProperties[k])))
    }

    if (additionalPropertiesTypes.length > 0) {
        properties.forEach(p => additionalPropertiesTypes.push(p.type))
        additionalPropertiesTypes.push({ ref: "undefined" })
        properties.push({ name: "[_:string]", type: { union: additionalPropertiesTypes }})
    }

    return { interface: properties }
}

function createTypeAliases(name: string, schema: X.Schema): Ts.TypeAlias[] {
    const types = createType0(schema);
    if (types.length === 1) {
        return [{ name: name, type: types[0]}]
    } else {
        const objectName = name + "Object";
        return [
            { name: objectName, type: types[0] },
            { 
                name: name, 
                type: { 
                    union: types
                        .filter((_, i) => i > 0)
                        .concat({ ref: typeName(objectName) })
                }
            }
        ]
    }
}

const schema : X.SchemaObject = JSON.parse(fs.readFileSync(name + ".json").toString());

const schemaDefinitions = schema.definitions;

const definitions = schemaDefinitions !== undefined
    ? Object
        .keys(schemaDefinitions)
        .map(name => createTypeAliases(name, schemaDefinitions[name]))
    : [];

const result = definitions.concat([createTypeAliases(name, schema)]);

let text = "";
for (const line of Ts.module(flatten(result))) {
    text += line + os.EOL;
}
fs.writeFileSync(name + ".d.ts", text);
