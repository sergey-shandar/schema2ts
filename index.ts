import * as fs from "fs";
import * as os from "os";

namespace Ts {
    export interface Property {
        readonly name: string;
        readonly type: string;
    }
    export type Properties = Property[];
    export interface Interface {        
        readonly properties: Properties;        
    }
    export interface Type {
        readonly ref?: string;
        readonly interface?: Interface;
    }
    export interface TypeAlias {
        readonly name: string;
        readonly type: Type;
    }
    export type Module = TypeAlias[];

    export function* type(t: Type) {        
        if (t.ref !== undefined) {
            yield t.ref;
        } else if(t.interface !== undefined) {
            yield "{"
            for (const p of t.interface.properties) {
                yield "    readonly " + p.name + "?: " + p.type + ";"
            }
            yield "}";
        }
    }

    export function* typeAlias(t: TypeAlias) {
        const i = t.type.interface;
        if (i !== undefined) {
            yield "type " + t.name + " = {"
            for (const p of i.properties) {
                yield "    readonly " + p.name + "?: " + p.type + ";"
            }
            yield "}";
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

function createType(schemaObject: SchemaObject): string {
    
    // $ref
    {
        const $ref = schemaObject.$ref;
        if ($ref !== undefined) {
            if ($ref === "#") return main;
            if ($ref.startsWith(definitionsUri)) {
                return $ref.substr(definitionsUri.length);
            }
            return "any";
        }
    }

    // anyOf
    {
        const anyOf = schemaObject.anyOf;
        if (anyOf !== undefined) {
            return "(" + anyOf.map(createType).join("|") + ")";
        }
    }

    const type = schemaObject.type === undefined ? "object" : schemaObject.type;
    switch (type) {
        case "object":
            let result = "{";
            const additionalProperties = schemaObject.additionalProperties;
            if (additionalProperties !== undefined) {
                result += "readonly[_:string]:" + createType(additionalProperties) + ";";
            }
            return result + "}";
        case "array":
            const items = schemaObject.items;
            const type = items !== undefined ? createType(items) : "any";
            return type + "[]";
    }

    return type;
}

const schemaObject : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

function createProperties(properties: {readonly[_:string]: SchemaObject}|undefined) {
    return properties !== undefined 
        ? Object.keys(properties).map(name => ({ name: name, type: createType(properties[name]) }))
        : [];
}

function createTypeAlias(name: string, schema: SchemaObject): Ts.TypeAlias {
    return { 
        name: name,
        type: {
            interface: { 
                properties: createProperties(schema.properties)
            }
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
