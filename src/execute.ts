import {spawn} from "child_process";
import {Stopwatch} from "pissant";

type Command = ReturnType<typeof command>;

export function command(name: string, ...args: string[])
{
    return {
        name,
        args
    };
}

let executeCount = 0;

export function execute(command: Command)
{
    return new Promise<void>((resolve, reject) => {
        const stopwatch = new Stopwatch();
        const executeName = `PROC ${++executeCount}`;

        console.log(`${executeName}: > ${command.name} ${command.args.join(" ")}`);
        const process = spawn(command.name, command.args);

        let stderr = "";

        process.stderr.setEncoding('utf8');
        process.stderr.on('data', data => {
            stderr += data;
        });

        process.on('close', exitCode => {
            if (exitCode)
            {
                console.error(`${executeName}: ...errored with Code(${exitCode}) after ${stopwatch.elapsedMillisecondsText}`);
                reject(new Error(`sox returned nonzero exit code: ${exitCode}. stderr: ${stderr}`));
                return;
            }

            console.log(`${executeName}: ...completed in ${stopwatch.elapsedMillisecondsText}`);
            resolve();
        });
    });
}