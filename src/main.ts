export function main(promise: Promise<any>)
{
    promise
        .then(() => process.exit(0))
        .catch(e => {
            console.error(`An unexpected error occurred: ${e}`);
            process.exit(1);
        });
}