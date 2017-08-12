import * as fs from "fs";
import * as os from "os";

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
    export type Module = TypeAlias[];

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
            yield *wrap(type(t.array), "", "[]");
        } else if (t.tuple !== undefined) {
            yield *wrap(join(t.tuple.map(type), ","), "[", "]");
        } else if (t.const !== undefined) {
            yield '"' + t.const + '"';
        }
    }

    export function* typeAlias(t: TypeAlias) {
        yield* wrap(type(t.type), "type " + t.name + " = ", ";");
    }
    export function* module(m: Module) {
        for (const i of m) {
            yield* typeAlias(i);
        }
    }
}

const main = "SchemaObject";

const definitionsUri = "#/definitions/";

function onlyOne<T>(a: T|undefined, b: T|undefined) {
    return a !== undefined ? a : b;
}

function allOfSchema(a: SchemaObject, b: SchemaObject): SchemaObject {
    return {
        $ref: onlyOne(a.$ref, b.$ref),
        default: onlyOne(a.default, b.default)
    };
}

function createType(schemaObject: SchemaObject|undefined): Ts.Type {
    if (schemaObject === undefined) {
        return { ref: "any" };
    }

    return createType2(schemaObject);
}

function createType2(schemaObject: SchemaObject): Ts.Type {    

    // $ref
    {
        const $ref = schemaObject.$ref;
        if ($ref !== undefined) {
            if ($ref === "#") return { ref: main };
            if ($ref.startsWith(definitionsUri)) {
                return { ref: $ref.substr(definitionsUri.length) };
            }
            return { ref: "any" };
        }
    }

    // enum
    {
        const enum_ = schemaObject.enum;
        if (enum_ !== undefined) {
            return { union: enum_.map(v => ({ const: v })) };
        }
    }

    // anyOf
    {
        const anyOf = schemaObject.anyOf;
        if (anyOf !== undefined) {
            return { union: anyOf.map(createType) };
        }
    }

    // allOf
    {
        const allOf = schemaObject.allOf;
        if (allOf !== undefined) {
            return createType(allOf.reduce(allOfSchema));
        }
    }

    // items
    {
        const items = schemaObject.items;
        if (items !== undefined) {
            return Array.isArray(items) 
                ? { tuple: items.map(createType) }
                : { array: createType(items) };
        }
    }

    // simple types
    switch (schemaObject.type) {
        case "array":
            return { ref: "any[]" };
        case "string":
            return { ref: "string" };
        case "integer":
            return { ref: "number" };
    }

    // object
    const schemaProperties = schemaObject.properties;
    let properties: Ts.Property[] = schemaProperties !== undefined 
        ? Object
            .keys(schemaProperties)
            .map(name => ({ name: name + "?", type: createType(schemaProperties[name]) }))
        : [];
    const additionalProperties = schemaObject.additionalProperties;
    if (additionalProperties !== undefined) {
        properties.push({ name: "[_:string]", type: createType(additionalProperties) });
    }
    return { interface: properties };
}

const schemaObject : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

function createTypeAlias(name: string, schema: SchemaObject): Ts.TypeAlias {
    return { 
        name: name,
        type: createType(schema)
    };
}

const schemaDefinitions = schemaObject.definitions;

const definitions = schemaDefinitions !== undefined
    ? Object
        .keys(schemaDefinitions)
        .map(name => createTypeAlias(name, schemaDefinitions[name]))
    : [];

const result = definitions.concat(createTypeAlias(main, schemaObject));

let text = "";
for (const line of Ts.module(result)) {
    text += line + os.EOL;
}
fs.writeFileSync("schema.d.ts", text);
