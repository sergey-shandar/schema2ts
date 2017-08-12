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
                previous = (previous === undefined ? "" : previous) + v;
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
        }
    }

    export function* typeAlias(t: TypeAlias) {
        const array = [...type(t.type)];
        const i = t.type.interface;
        if (i !== undefined) {
            yield* wrap(type(t.type), "type " + t.name + " = ", ";");
        }
    }
    export function* module(m: Module) {
        for (const i of m) {
            yield* typeAlias(i);
        }
    }
}

// http://json-schema.org/schema

interface SchemaObject {
    readonly $id?: string;
    readonly $ref?: string;
    readonly type?: string;
    readonly anyOf?: SchemaObject[];
    readonly definitions?: {readonly [_:string]: SchemaObject};
    readonly properties?: {readonly [_:string]: SchemaObject};
    readonly additionalProperties?: SchemaObject;
    readonly items?: SchemaObject;
}

const main = "SchemaObject";

const definitionsUri = "#/definitions/";

function createType(schemaObject: SchemaObject|undefined): Ts.Type {
    
    if (schemaObject === undefined) {
        return { ref: "any" };
    }

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

    // anyOf
    {
        const anyOf = schemaObject.anyOf;
        if (anyOf !== undefined) {
            return { union: anyOf.map(createType) };
        }
    }

    const type = schemaObject.type === undefined ? "object" : schemaObject.type;
    switch (type) {
        case "object":
            let properties: Ts.Property[] = [];
            const additionalProperties = schemaObject.additionalProperties;
            if (additionalProperties !== undefined) {
                properties.push({ name: "[_:string]", type: createType(additionalProperties) });
            }
            return { interface: properties };
        case "array":
            return { array: createType(schemaObject.items) };
    }

    return { ref: type };
}

const schemaObject : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

function createProperties(properties: {readonly[_:string]: SchemaObject}|undefined) : Ts.Property[] {
    return properties !== undefined 
        ? Object.keys(properties).map(name => ({ name: name + "?", type: createType(properties[name]) }))
        : [];
}

function createTypeAlias(name: string, schema: SchemaObject): Ts.TypeAlias {
    return { 
        name: name,
        type: {
            interface: createProperties(schema.properties)
        }
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
    text += os.EOL + line;
}
fs.writeFileSync("schema.d.ts", text);
