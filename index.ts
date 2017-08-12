import * as fs from "fs";

namespace Ts {
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
}

function createType(schemaObject: SchemaObject) {
    return schemaObject.type === undefined ? "object" : schemaObject.type;
}

const object : SchemaObject = JSON.parse(fs.readFileSync("schema.json").toString());

const schemaProperties = object.properties;
const tsProperties : Ts.MutableProperties = {};
if (schemaProperties !== undefined) {    
    for (const name in schemaProperties) {
        tsProperties[name] = createType(schemaProperties[name]);
    }
}
const result = Ts.interface_({name: "Schema", properties: tsProperties});

for (const line of result) {
    console.log(line);
}
