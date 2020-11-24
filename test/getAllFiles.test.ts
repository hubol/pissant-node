import {getAllFiles} from "../src";
import mock from "mock-fs";

test("getAllFiles", () => {
    expect(getAllFiles("src/assets"))
        .toStrictEqual(["src/assets/directory/image0.png", "src/assets/image0.png", "src/assets/image1.png"]);
});

beforeEach(() => mock({
    "src/assets/image0.png": "whatever",
    "src/assets/image1.png": "whatever",
    "src/assets/directory/image0.png": "whatever",
}));
afterEach(mock.restore);