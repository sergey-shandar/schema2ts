import * as lib from "../lib"
import { assert } from "chai"

describe("test", () => {
    it("createRefType", () => {
        const ref = lib.Schema2Ts.createRefType({ name: "", schema: {} }, "#/definitions/a")
        assert.equal(ref.ref, "A")
    })
})