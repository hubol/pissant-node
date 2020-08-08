import {sleep} from "pissant";
import {getAllFiles, getFileHash} from "./file";

export async function scanDirectory(args: ScanDirectoryArgs)
{
    if (args.foreverArgs)
        await scanDirectoryForever({ ...args, ...args.foreverArgs });
    else
        await scanAndConsume(args);
}

export interface ScannedFile
{
    path: string;
    changedOrAdded: boolean;
}

export interface Scan
{
    files: ScannedFile[];
}

export type ScanConsumer = (scan: Scan) => Promise<void>;

export interface ScanDirectoryArgs extends ScanDirectoryCommonArgs
{
    foreverArgs?: ScanForeverArgs;
}

export interface ScanDirectoryCommonArgs
{
    path: string;
    scanConsumer: ScanConsumer;
}

export interface ScanForeverArgs
{
    intervalMilliseconds: number;
    checkFileContents: boolean;
}

async function scanDirectoryForever(args: ScanDirectoryCommonArgs & ScanForeverArgs)
{
    const seenHashes = { } as any;

    while (true)
    {
        try
        {
            if (args.checkFileContents)
                await scanAndConsumeCheckFileContents(args, seenHashes);
            else
                await scanAndConsume(args);
        }
        catch (e)
        {
            console.error(`Scanning ${args.path} failed:`, e);
        }

        await sleep(args.intervalMilliseconds);
    }
}

async function scanWithHashes(path: string)
{
    return await Promise.all(getAllFiles(path).map(async x => {
        return {
            path: x,
            hash: await getFileHash(x)
        };
    }));
}

async function scanAndConsumeCheckFileContents(args: ScanDirectoryCommonArgs, seenHashes: any)
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

async function scanAndConsume(args: ScanDirectoryCommonArgs)
{
    const files = getAllFiles(args.path).map(x => {
        return {
            changedOrAdded: true,
            path: x
        };
    });

    await args.scanConsumer({ files });
}