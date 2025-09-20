import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({ fetch, params, url }) => {
    const manifestUrl = new URL("/data/manifest.json", url).pathname;
    const manifest = await (await fetch(manifestUrl)).json();
    
    const code = params.code;
    const area = manifest.areas?.[code];
    if (!area) throw error(404, "Unsupported area code");

    const topoUrl = new URL(area.topo, url).pathname;
    const topo = await (await fetch(topoUrl)).json();

    return { code, area, topo };
}