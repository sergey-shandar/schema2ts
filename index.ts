import * as fs from "fs"
import * as os from "os"
import * as X from "@ts-common/schema"
import * as _ from "@ts-common/iterator"
import { Schema, Schema2Ts, Ts } from "./lib"
import * as sm from "@ts-common/string-map"
import { parse } from "@ts-common/json-parser"

const argv = _.toArray(_.drop(process.argv, 2))

const name = argv[0]

const output = name + ".ts" // argv.length > 3 ? argv[3] : name + ".ts"

const selfSchema = _.some(argv, v => v === "--self-schema")

const fileName = name + ".json"

const schemaAny = parse(
    { kind: "file", url: fileName },
    fs.readFileSync(fileName).toString()
)

const schema : X.SchemaObject = schemaAny as any

const shortName = "Main" // _.last(name.split("/")) || "noname"

const main = { name: shortName, schema: schema }

const importSet: Schema2Ts.MutableStringSet = {}

const result = _.toArray(_.flatten(_.map(
    Schema.allDefinitions(main),
    d => Schema2Ts.createTypeAliases(main, importSet, d)
)))

let text = ""

const tsCommonSchema = "@ts-common/schema"
const tsCommonSchemaAlias = "TsCommonSchema"

const tsCommonJson = "@ts-common/json"
const tsCommonJsonAlias = "TsCommonJson"

const importsArray = Array.from(_.map(
    sm.keys(importSet),
    v => ({ alias: Ts.typeName(v), name: "./" + v })
))


const tsModule: Ts.Module = {
    imports: [
        ...(selfSchema ? [] : [{ alias: tsCommonSchemaAlias, name: tsCommonSchema }]),
        { alias: tsCommonJsonAlias, name: tsCommonJson },
        ...importsArray
    ],
    types: result,
    consts: [{
        name: "schema",
        type: { ref: selfSchema ? "Main" : tsCommonSchemaAlias + ".Main" },
        value: schema
    }]
}

for (const line of Ts.module(tsModule)) {
    text += line + os.EOL
}

fs.writeFileSync(output, text)
