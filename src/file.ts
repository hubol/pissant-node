import fs from "fs";
import path from "path";

export async function getFileHash(fileName: string)
{
    const fileSizeInBytes = await getFileSizeInBytes(fileName);
    if (fileSizeInBytes === 0)
        return "";

    let start = fileSizeInBytes / 2;
    const end = fileSizeInBytes - 1;
    if (start === end)
        start = 0;

    const length = Math.min(end - start, 1024);

    const buffer = await readBytesToBuffer(fileName, start, length);
    return buffer.toString("base64");
}

export function readBytesToBuffer(fileName: string, start: number, length: number)
{
    if (start < 0)
        throw new Error(`Invalid start position: ${start}`);
    if (length <= 0)
        throw new Error(`Invalid length: ${length}`);

    return new Promise<Buffer>((resolve, reject) => {
        fs.open(fileName, "r", (err, fd) => {
            if (err) {
                reject(err);
                return;
            }

            const buffer = Buffer.alloc(length);
            fs.read(fd, buffer, 0, length, start, err => {
                fs.closeSync(fd);

                if (err) {
                    reject(err);
                    return;
                }

                resolve(buffer);
            });
        });
    });
}

export function getFileSizeInBytes(fileName: string)
{
    return new Promise<number>((resolve, reject) => {
        fs.stat(fileName, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(stats.size);
        });
    });
}

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = [])
{
    if (!fs.existsSync(dirPath))
        return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory())
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        else
            arrayOfFiles.push(filePath);
    });

    return arrayOfFiles;
}

export function getDirectory(filePath: string)
{
    return path.dirname(filePath);
}

export function createDirectory(directoryPath: string)
{
    fs.mkdirSync(directoryPath, { recursive: true });
}

export function getRelativePath(sourcePath: string, destinationPath: string)
{
    const relativePath = path.relative(sourcePath, destinationPath).replace("\\", "/");
    if (relativePath.charAt(0) !== ".")
        return "./" + relativePath;
    return relativePath;
}

export function ensureDirectory(file: string)
{
    createDirectory(getDirectory(file));
}