import {createDirectory, getDirectory, getRelativePath} from "../src";
import mock from "mock-fs";
import * as fs from "fs";

test("getRelativePath", () => {
    expect(getRelativePath("C:/fuck/you", "C:/fuck/")).toBe("..");
    expect(getRelativePath("fuck/you", "fuck/.help")).toBe("../.help");
    expect(getRelativePath("C:/fuck/you", "C:/fuck/you/hubol/youre/awesome")).toBe("./hubol/youre/awesome");
});

test("getDirectory", () => {
    expect(getDirectory("src/help/textures.ts")).toBe("src/help");
    expect(getDirectory("src/help/")).toBe("src");
})

test("createDirectory", () => {
    createDirectory(getDirectory("src/help/textures.ts"));
    expect(fs.existsSync("src")).toBeTruthy();
    expect(fs.existsSync("src/help")).toBeTruthy();
    expect(fs.existsSync("help")).toBeFalsy();
});

beforeEach(() => mock());
afterEach(mock.restore);