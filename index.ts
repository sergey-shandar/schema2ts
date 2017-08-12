import * as fs from "fs";

namespace Ts {
    export interface Property {
        readonly name: string;
        readonly type: string;
    }
    export interface Properties {
        readonly [name: string]: string;
    }
    export interface MutableProperties extends Properties {
        [name: string]: string;
    }
    export interface Interface {
        readonly name: string;
        readonly properties: Properties;
    }
    export type Module = Interface[];
    export function* interface_(i: Interface) {
        yield "interface " + i.name + "{"
        const p = i.properties;
        for (const name in p) {
            yield "    readonly " + name + "?: " + p[name] + ";"
        }
        yield "}";
    }
}

// http://json-schema.org/schema

interface SchemaObjectMap {
    readonly [name: string]: SchemaObject;
}

interface SchemaObject {
    readonly $id?: string;
    readonly type?: string;
    readonly properties?: SchemaObjectMap;
    readonly additionalProperties?: SchemaObject;
}

function createType(schemaObject: SchemaObject) {
    const type = schemaObject.type === undefined ? "object" : schemaObject.type;
    switch (type) {
        case "object":
            let result = "{";
            const additionalProperties = schemaObject.additionalProperties;
            if (additionalProperties) {
                result += "readonly[_:string]:" + createType(additionalProperties) + ";";
            }
            return result + "}";
    }
    return type;
}

const object : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

const schemaProperties = object.properties;
const tsProperties : Ts.MutableProperties = {};
if (schemaProperties !== undefined) {    
    for (const name in schemaProperties) {
        tsProperties[name] = createType(schemaProperties[name]);
    }
}
const result = Ts.interface_({name: "SchemaObject", properties: tsProperties});

for (const line of result) {
    console.log(line);
}
