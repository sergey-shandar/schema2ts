import * as lib from "../lib"
import { assert } from "chai"

describe("test", () => {
    it("createRefType('#/definitions/a')", () => {
        const ref = lib.Schema2Ts.createRefType({ name: "", schema: {} }, "#/definitions/a")
        assert.equal(ref.ref, "A")
    })
    it("createRefType('xx/my.json#/definitions/a')", () => {
        const ref = lib.Schema2Ts.createRefType({ name: "", schema: {} }, "xx/my.json#/definitions/a")
        assert.equal(ref.ref, "My.A")
    })
})