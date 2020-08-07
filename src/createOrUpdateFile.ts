import fs from "fs";
import {ensureDirectory} from "./file";

export function createOrUpdateFile(file: string, text: string)
{
    ensureDirectory(file);
    if (fs.existsSync(file))
    {
        const currentText = fs.readFileSync(file).toString();
        if (currentText === text)
            return;
    }

    console.log(`Writing ${file}...`);
    fs.writeFileSync(file, text);
}