import { render } from "@testing-library/react"
import { describe, it } from "vitest"
import {
    toTitleCase,
    ellipsis,
    cachedPromise,
    hslToHex,
    stripTags,
    roundToPrecision,
    escapeForFileName,
    lengthToEm,
    buildPermissionId,
    buildPermissionLabel,
    defer,
    humanizeColumnName,
    classList,
    isEmptyObject,
    requestPermission,
    stripValue,
    highlight,
    Json,
    strip
} from "../utils"

function wait(ms = 0) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

describe("utils", () => {

    describe("defer", () => {
        it ("works with delay", async () => {
            let calls = 0
            let fn = () => calls += 1
            defer(fn, "x", 1)
            defer(fn, "x", 1)
            expect(calls).toEqual(0)
            await wait(10)
            expect(calls).toEqual(1)
        })

        it ("works without delay", async () => {
            // console.log("=====>", requestAnimationFrame)
            let calls = 0
            let fn = () => calls += 1
            defer(fn, "x")
            defer(fn, "x")
            expect(calls).toEqual(0)
            await wait(100)
            expect(calls).toEqual(1)
        })
    })

    it ("classList", () => {
        expect(classList({})).toBeUndefined
        expect(classList({ a: true, b: false, c: true })).toEqual("a c")
    })

    it("humanizeColumnName", () => {
        expect(humanizeColumnName("x icd 10 y")).toEqual("X ICD10 Y")
        expect(humanizeColumnName("x iCd  10 y")).toEqual("X ICD10 Y")
        expect(humanizeColumnName("x icD-10 y")).toEqual("X ICD10 Y")
        expect(humanizeColumnName("x icD-10 y")).toEqual("X ICD10 Y")

        expect(humanizeColumnName("x cnt y")).toEqual("X Count Y")
        expect(humanizeColumnName("x cNt y")).toEqual("X Count Y")
        expect(humanizeColumnName("x CNT y")).toEqual("X Count Y")
    
        expect(humanizeColumnName("x COVID y")).toEqual("X COVID-19 Y")
        expect(humanizeColumnName("x CoviD y")).toEqual("X COVID-19 Y")
        expect(humanizeColumnName("x Covid  19 y")).toEqual("X COVID-19 Y")
        expect(humanizeColumnName("x covid-19 y")).toEqual("X COVID-19 Y")

        expect(humanizeColumnName("xencty")).toEqual("Xencty")
        expect(humanizeColumnName("x encty")).toEqual("X Encty")
        expect(humanizeColumnName("xenct y")).toEqual("Xenct Y")
        expect(humanizeColumnName("x enct y")).toEqual("X Encounter Y")
        expect(humanizeColumnName("x encT y")).toEqual("X Encounter Y")

        expect(humanizeColumnName("xency")).toEqual("Xency")
        expect(humanizeColumnName("x ency")).toEqual("X Ency")
        expect(humanizeColumnName("xenc y")).toEqual("Xenc Y")
        expect(humanizeColumnName("x enc y")).toEqual("X Encounter Y")
        expect(humanizeColumnName("x enC y")).toEqual("X Encounter Y")

        expect(humanizeColumnName("xcondy")).toEqual("Xcondy")
        expect(humanizeColumnName("x condy")).toEqual("X Condy")
        expect(humanizeColumnName("xcond y")).toEqual("Xcond Y")
        expect(humanizeColumnName("x cond y")).toEqual("X Condition Y")
        expect(humanizeColumnName("x conD y")).toEqual("X Condition Y")

        expect(humanizeColumnName("xcaty")).toEqual("Xcaty")
        expect(humanizeColumnName("x caty")).toEqual("X Caty")
        expect(humanizeColumnName("xcat y")).toEqual("Xcat Y")
        expect(humanizeColumnName("x cat y")).toEqual("X Category Y")
        expect(humanizeColumnName("x caT y")).toEqual("X Category Y")

        expect(humanizeColumnName("x pcr y")).toEqual("X PCR Y")
        expect(humanizeColumnName("x Pcr y")).toEqual("X PCR Y")

        expect(humanizeColumnName("x nlp y")).toEqual("X NLP Y")
        expect(humanizeColumnName("x nLp y")).toEqual("X NLP Y")

        expect(humanizeColumnName("x dx y")).toEqual("X Diagnosis Y")
        expect(humanizeColumnName("x Dx y")).toEqual("X Diagnosis Y")

        expect(humanizeColumnName("x ed y")).toEqual("X ED Y")
        expect(humanizeColumnName("x eD y")).toEqual("X ED Y")

        expect(humanizeColumnName("x std dev y")).toEqual("X Standard Deviation Y")
        expect(humanizeColumnName("x Std dEV y")).toEqual("X Standard Deviation Y")
        expect(humanizeColumnName("x STD  dEV y")).toEqual("X Standard Deviation Y")
    })

    describe("toTitleCase", () => {
        const map = {
            ""              : "",
            "this is a test": "This Is A Test",
            "this-is-a-test": "This Is A Test",
            "this_is_a_test": "This Is A Test",
            "this_IsA-test" : "This Is A Test",
            "my ICD10"      : "My ICD10",
        }

        for (const input in map) {
            const output = map[input as keyof typeof map];
            it (JSON.stringify(input) + " => " + JSON.stringify(output), () => {
                expect(toTitleCase(input)).toEqual(output)
            }) 
        }
    })

    it("ellipsis", () => {
        expect(ellipsis("abc", 2)).toEqual("ab…")
        expect(ellipsis("abc", 5)).toEqual("abc")
    })

    it("hslToHex", () => {
        expect(hslToHex(20, 0, 0)).toEqual("#000000")
    })

    describe("generateColors", () => {
        it.todo ("works")
    })

    it("stripValue", () => {
        expect(stripValue({}, null)).toEqual({})
        expect(stripValue({ a: 1, b: null }, null)).toEqual({ a: 1 })
        expect(stripValue({ a: 1, b: null, c: 4 }, null)).toEqual({ a: 1, c: 4 })

        expect(stripValue([], null)).toEqual([])
        expect(stripValue([1, null], null)).toEqual([1])
        expect(stripValue([1, null, 4], null)).toEqual([1, 4])
    })

    it("isEmptyObject", () => {
        expect(isEmptyObject({})).toEqual(true)
        expect(isEmptyObject({ a: 2 })).toEqual(false)
    })

    describe("forEach", () => {
        it.todo ("works")
    })

    it("strip", () => {
        expect(strip({}, ["a"])).toEqual({})
        expect(strip({ a: 1, b: 2 }, ["a"])).toEqual({ b: 2 })
        expect(strip({ a: 1, b: { c: 2, d: 3 }}, ["b.d"])).toEqual({ a: 1, b: { c: 2 }})
        expect(strip({ a: 1, b: [ 1, { c: 2, d: 3 } ]}, ["b"])).toEqual({ a: 1 })
        expect(strip({ a: 1, b: [ 1, { c: 2, d: 3 } ]}, ["b.[].1"])).toEqual({ a: 1, b: [1] })
        expect(strip({ a: 1, b: [ 1, { c: 2, d: 3 } ]}, ["b.[].0"])).toEqual({ a: 1, b: [{ c: 2, d: 3 }] })
    })

    it("stripTags", () => {
        expect(stripTags('a<a href="x">b<b>c</b>d</a>e')).toEqual("abcde")
    })

    it("highlight", () => {
        render(<span>{ highlight("this is a test") }</span>);
        expect(document.querySelector(".search-match")).not.toBeInTheDocument();
        render(<span>{ highlight("this is a test", "is a") }</span>);
        expect(document.querySelector(".search-match")).toHaveTextContent("is a");
    })

    it("Json", () => {
        render(<span>{ Json({ a: 1, b: true, c: "test", d: null, e: [1,2,3,4,5], f: {}, g: [1,2], h: () => {} }) }</span>);
        expect(document.querySelector(".json-null")).toHaveTextContent("null");
        expect(document.querySelector(".json-bool")).toHaveTextContent("true");
        expect(document.querySelector(".json-number")).toHaveTextContent("1");
        expect(document.querySelector(".json-string")).toHaveTextContent("test");
    })

    it("roundToPrecision", () => {
        expect(roundToPrecision(1, 0)).toEqual(1)
        expect(roundToPrecision(1, 2)).toEqual(1)
        expect(roundToPrecision(1.2345, 0)).toEqual(1)
        expect(roundToPrecision(1.2345, 1)).toEqual(1.2)
        expect(roundToPrecision(1.2345, 2)).toEqual(1.23)
        expect(roundToPrecision(1.2345, 3)).toEqual(1.235)
        expect(roundToPrecision(1.2345, 4)).toEqual(1.2345)
        expect(roundToPrecision(1.2345, 5)).toEqual(1.2345)
        expect(roundToPrecision("abcd", 5)).toBeNaN
    })

    it("escapeForFileName", () => {
        expect(escapeForFileName('a/b:c*d?e"f<g>h|x\\y:z.')).toEqual("a_b_c_d_e_f_g_h_x_y_z")
    })

    describe("lengthToEm", () => {
        it ("works without arguments", () => {
            expect(lengthToEm()).toEqual(1)
        })
        it ("works with pixels", () => {
            expect(lengthToEm("16px")).toEqual(1)
            expect(lengthToEm("20px")).toEqual(1.25)
            expect(lengthToEm("20px", 10)).toEqual(2)
        })
        it ("works with rem", () => {
            expect(lengthToEm("16rem")).toEqual(16)
        })
        it ("works with em", () => {
            expect(lengthToEm("16em")).toEqual(16)
        })
        it ("works with %", () => {
            expect(lengthToEm("12%")).toEqual(12/100)
        })
        it ("returns 1 for unknown units", () => {
            expect(lengthToEm("12ch")).toEqual(1)
        })
    })

    it("buildPermissionLabel", () => {
        expect(buildPermissionLabel({
            action: "read",
            attribute: "name",
            permission: true,
            resource: "Chart",
            resource_id: 5
        })).toEqual(' allowed to read the "name" attribute of Chart#5')
        expect(buildPermissionLabel({
            action: "read",
            attribute: "name",
            permission: true,
            resource: "Chart",
            resource_id: 5,
            user_group_id: 4
        })).toEqual('Members of user group #4 are allowed to read the "name" attribute of Chart#5')
        expect(buildPermissionLabel({
            action: "read",
            attribute: "name",
            permission: false,
            resource: "Chart",
            resource_id: 5,
            role: "manager"
        })).toEqual('Users with role "manager" are not allowed to read the "name" attribute of Chart#5')
        expect(buildPermissionLabel({
            action: "read",
            attribute: "name",
            permission: false,
            resource: "Chart",
            resource_id: 5,
            user_id: 23
        })).toEqual('User#23 is not allowed to read the "name" attribute of Chart#5')
    })

    it("buildPermissionId", () => {
        expect(buildPermissionId({
            resource: "resource",
            action  : "action"
        })).toEqual("resource.action")
        expect(buildPermissionId({
            resource: "resource",
            action  : "action",
            resource_id: 3
        })).toEqual("resource#3.action")
        expect(buildPermissionId({
            resource: "resource",
            action  : "action",
            resource_id: 3,
            attribute: "attribute"
        })).toEqual("resource#3.attribute.action")
    })

    it("requestPermission", () => {
        let rejection = ""
        
        function onReject(msg: string) {
            rejection = msg    
        }
        
        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: { role: "system" } as any
        }, onReject)).toEqual(true)

        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: { role: "owner" } as any
        }, onReject)).toEqual(true)
        
        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: null
        }, onReject)).toEqual(false)
        expect(rejection).toEqual(
            'Guest needs at least one of the following permissions: "Resource#5.read", "Resource.read".'
        )

        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: { id: 1, role: "admin" } as any
        }, onReject)).toEqual(false)
        expect(rejection).toEqual(
            'User#1(role="admin") needs at least one of the following permissions: "Resource#5.read", "Resource.read".'
        )

        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: { permissions: ["Resource#5.read"] } as any
        }, onReject)).toEqual(true)

        expect(requestPermission({
            action: "read",
            resource: "Resource",
            resource_id: 5,
            user: { permissions: ["Resource.read"] } as any
        }, onReject)).toEqual(true)
    })

    it("cachedPromise", async () => {
        let calls = 0
        let job = async () => { calls += 1 }
        const cached = cachedPromise<void>(job)
        expect(calls).toEqual(0)
        await cached()
        expect(calls).toEqual(1)
        await cached()
        expect(calls).toEqual(1)
    })
})
