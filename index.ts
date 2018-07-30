import * as fs from "fs"
import * as os from "os"
import * as X from "@ts-common/schema"
import * as _ from "@ts-common/iterator"
import { Schema, Schema2Ts, Ts } from "./lib"

const argv = process.argv

const name = process.argv[2]

const output = argv.length > 3 ? argv[3] : name + ".ts"

const schemaAny = JSON.parse(fs.readFileSync(name + ".json").toString())

const schema : X.SchemaObject = schemaAny

const schemaDefinitions = schema.definitions

const shortName = "Main" // _.last(name.split("/")) || "noname"

const main = { name: shortName, schema: schema }

const result = _.map(
    Schema.allDefinitions(main),
    d => Schema2Ts.createTypeAliases(main, d))

let text = ""

const tsCommonSchema = "@ts-common/schema"
const tsCommonSchemaAlias = "ts_common_schema"

const tsModule: Ts.Module = {
    imports: [{ alias: tsCommonSchemaAlias, name: tsCommonSchema }],
    types: _.flatten(result),
    consts: [{ name: "schema", type: { ref: tsCommonSchemaAlias + ".Schema" }, value: schema }]
}

for (const line of Ts.module(tsModule)) {
    text += line + os.EOL
}

fs.writeFileSync(output, text)
