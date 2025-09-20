<script lang="ts">
    import { onMount } from "svelte";
    import { feature } from "topojson-client";
    import { geoMercator, geoPath } from "d3-geo";

    export let data: { code: string; area: any; topo: any };

    const W = 860, H = 640;

    const objName = Object.keys(data.topo.objects)[0];
    const fc: any = feature(data.topo, data.topo.objects[objName]);

    let path!: d3.GeoPath<any, any>;
    let boardPaths: string[] = [];

    type Piece = {
        id: number;
        name: string;
        target: { x: number; y: number };
        x: number; y: number;
        placed: boolean;
        d: string;
    };
    let pieces: Piece[] = [];

    let dragId: number | null = null;
    let dragOffset = { x: 0, y: 0 };
    const SNAP = 14;

    onMount(() => {
        const proj = geoMercator().fitSize([W, H], fc);
        path = geoPath(proj);

        boardPaths = fc.features.map((f: any) => path(f)!);

        pieces = fc.features.map((f: any, i: number) => {
            const d = path(f)!;

            const [cx, cy] = path.centroid(f);

            const x = Math.random() * (W * 0.35) - 40;
            const y = Math.random() * (H - 60) + 30;

            const name =
                f.properties?.S_NAME ??
                f.properties?.NAME ??
                `piece-${i}`;

            return { id: i, name, target: { x: cx, y: cy }, x, y, placed: false, d };
        });
    });

    function onpointerdown(e: PointerEvent, id: number) {
        const p = pieces.find(p => p.id === id)!;
        if (p.placed) return;
        (e.target as Element).setPointerCapture(e.pointerId);
        dragId = id;

        const bbox = (e.currentTarget as SVGGElement).getBoundingClientRect();
        const px = e.clientX - bbox.left, py = e.clientY - bbox.top;
        dragOffset.x = px - p.x; dragOffset.y = py - p.y;
    }

    function onpointermove(e: PointerEvent) {
        if (dragId === null) return;
        const bbox = (e.currentTarget as SVGElement).getBoundingClientRect();
        const px = e.clientX - bbox.left, py = e.clientY - bbox.top;
        const p = pieces.find(p => p.id === dragId)!;
        p.x = px - dragOffset.x;
        p.y = py - dragOffset.y;
    }

    function onpointerup() {
        if (dragId === null) return;
        const p = pieces.find(p => p.id === dragId)!;

        const dx = p.x - (p.target.x - 0);
        const dy = p.y - (p.target.y - 0);
        const dist = Math.hypot(dx, dy);

        if (dist < SNAP) {
            p.x = p.target.x;
            p.y = p.target.y;
            p.placed = true;
        }

        dragId = null;
    }
</script>

<h1 class="text-lg font-semibold mb-2">
    {data.area.name.ja} ({data.code})
</h1>

<svg
    viewBox={`0 0  ${W} ${H}`}
    class="w-full max-w-5xl border rounded mb-4 select-none"
    {onpointermove}
    {onpointerup}
>
    <g>
        {#each boardPaths as d}
            <path d={d} class="fill-gray-50 stroke-gray-300" />
        {/each}
    </g>

    <g>
        {#each pieces as p (p.id)}
            <g
                transform={`translate(${p.x}, ${p.y})`}
                onpointerdown={(e) => onpointerdown(e, p.id)}
                style="cursor: grab;"
                opacity={p.placed ? 0.4 : 1}
            >
                <path d={p.d} class="fill-white stroke-gray-600" />
                <text x="0" y="0" class="text-[10px] fill-gray-700">{p.name}</text>
            </g>
        {/each}
    </g>
</svg>

<p class="text-sm text-gray-600">
    おけたピース: {pieces.filter(p => p.placed).length} / {pieces.length}
</p>