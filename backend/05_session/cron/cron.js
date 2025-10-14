

export async function pruneRevokedAccess(eraseRevokedAccess) {
    console.log("############# session cron\n")
    const time = Math.floor( Date.now() / 1000 );
    await eraseRevokedAccess(time);
}