import * as lib from "../lib"
import { assert } from "chai"

describe("test", () => {
    it("createRefType('#/definitions/a')", () => {
        const imports: lib.Schema2Ts.MutableStringSet = {}
        const ref = lib.Schema2Ts.createRefType(
            { name: "", schema: {} }, imports, "#/definitions/a"
        )
        assert.equal(ref.ref, "A")
    })
    it("createRefType('xx/my.json#/definitions/a')", () => {
        const imports: lib.Schema2Ts.MutableStringSet = {}
        const ref = lib.Schema2Ts.createRefType(
            { name: "", schema: {} }, imports, "xx/my.json#/definitions/a"
        )
        assert.equal(ref.ref, "My.A")
    })
})