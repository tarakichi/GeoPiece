<script lang="ts">
    export let data: { manifest: { areas: Record<string, any> } };
    const areas = data.manifest.areas;
</script>

<h1 class="text-xl font-bold mb-4">遊べる市区町村</h1>
<ul class="space-y-2">
    {#each Object.entries(areas) as [code, area]}
        <li>
            <a class="text-blue-600 hover:underline" href={`/play/${code}`}>
                {area.name.ja} ({code})
            </a>
        </li>
    {/each}
</ul>