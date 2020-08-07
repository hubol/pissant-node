import {sleep} from "pissant";
import {getAllFiles, getFileHash} from "./file";

export async function scanDirectory(args: ScanDirectoryArgs)
{
    if (args.scanCount.count === "One")
        await scanDirectoryOnce(args);
    else
        await scanDirectoryForever(args, args.scanCount.intervalMilliseconds);
}

export interface File
{
    path: string;
    changedOrAdded: boolean;
}

export interface Scan
{
    files: File[];
}

export type ScanConsumer = (scan: Scan) => Promise<void>;

export interface OneScan
{
    count: "One"
}

export interface InfiniteScan
{
    count: "Infinite",
    intervalMilliseconds: number;
}

export type ScanCount = OneScan | InfiniteScan;

export interface ScanDirectoryArgs
{
    path: string;
    scanConsumer: ScanConsumer;
    scanCount: ScanCount;
}

interface ScanDirectoryCommonArgs
{
    path: string;
    scanConsumer: ScanConsumer;
}

async function scanDirectoryForever(args: ScanDirectoryCommonArgs, intervalMilliseconds: number)
{
    const seenHashes = { } as any;

    while (true)
    {
        try
        {
            const files = (await scanWithHashes(args.path)).map(x => {
                const changedOrAdded = !(x.path in seenHashes) || seenHashes[x.path] !== x.hash;
                seenHashes[x.path] = x.hash;

                return {
                    path: x.path,
                    changedOrAdded
                }
            });

            await args.scanConsumer({ files });
        }
        catch (e)
        {
            console.error(`Scanning ${args.path} failed:`, e);
        }

        await sleep(intervalMilliseconds);
    }
}

async function scanWithHashes(path: string)
{
    return await Promise.all(getAllFiles(path).map(async x => {
        return {
            path: x,
            hash: await getFileHash(path)
        };
    }));
}

async function scanDirectoryOnce(args: ScanDirectoryCommonArgs)
{
    const files = getAllFiles(args.path).map(x => {
        return {
            changedOrAdded: true,
            path: x
        };
    });

    await args.scanConsumer({ files });
}