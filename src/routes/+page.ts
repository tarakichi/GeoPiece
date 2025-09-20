import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, url }) => {
    const manifestUrl = new URL("/data/manifest.json", url).pathname;
    const manifest = await (await fetch(manifestUrl)).json();
    return { manifest };
};