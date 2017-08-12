import * as fs from "fs";
import * as os from "os";

namespace Ts {
    export interface Property {
        readonly name: string;
        readonly type: string;
    }
    export type Properties = Property[];
    export interface Interface {
        readonly name: string;
        readonly properties: Properties;
    }
    export type Module = Interface[];
    export function* interface_(i: Interface) {
        yield "interface " + i.name + "{"
        for (const p of i.properties) {
            yield "    readonly " + p.name + "?: " + p.type + ";"
        }
        yield "}";
    }
}

// http://json-schema.org/schema

interface SchemaObject {
    readonly $id?: string;
    readonly $ref?: string;
    readonly type?: string;
    readonly anyOf?: SchemaObject[];
    readonly properties?: {readonly [name: string]: SchemaObject};
    readonly additionalProperties?: SchemaObject;
}

const main = "SchemaObject";

function createType(schemaObject: SchemaObject): string {
    
    // $ref
    {
        const $ref = schemaObject.$ref;
        if ($ref !== undefined) {
            return $ref === "#" ? main : "any";
        }
    }

    // anyOf
    {
        const anyOf = schemaObject.anyOf;
        if (anyOf !== undefined) {
            return anyOf.map(createType).join("|");
        }
    }

    const type = schemaObject.type === undefined ? "object" : schemaObject.type;
    switch (type) {
        case "object":
            let result = "{";
            const additionalProperties = schemaObject.additionalProperties;
            if (additionalProperties) {
                result += "readonly[_:string]:" + createType(additionalProperties) + ";";
            }
            return result + "}";
        case "array":
            return "any[]";
    }

    return type;
}

const object : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

const schemaProperties = object.properties;
const tsProperties = schemaProperties !== undefined 
    ? Object.keys(schemaProperties).map(name => ({ name: name, type: createType(schemaProperties[name]) }))
    : [];
const result = Ts.interface_({name: main, properties: tsProperties});

let text = "";
for (const line of result) {
    text += os.EOL + line;
}
fs.writeFileSync("schema.d.ts", text);
