<script lang="ts">
    import type { OperatorSection } from "./OperatorLibrary.svelte"
    export let section: OperatorSection
    export let onSelect: (section: OperatorSection) => void
    const sections: { id: OperatorSection; name: string }[] = [
        { id: "service", name: "Service" },
        { id: "bible", name: "Bible" },
        { id: "songs", name: "Songs" },
        { id: "media", name: "Media" },
        { id: "ai", name: "AI" }
    ]
</script>
<nav class="operator-navigation" aria-label="ProWorshipAI navigation">
    {#each sections as entry (entry.id)}
        <button type="button" class:active={section === entry.id} on:click={() => onSelect(entry.id)}>{entry.name}</button>
    {/each}
</nav>
<style>
    .operator-navigation {display:flex;align-items:stretch;gap:4px;padding:5px 10px;background:var(--primary-darker);border-bottom:1px solid var(--primary-lighter);min-height:34px}
    button {border:0;background:transparent;color:var(--text);opacity:.78;font:inherit;font-size:13px;font-weight:600;padding:7px 16px;border-radius:7px;cursor:pointer}
    button:hover {background:var(--primary-lighter);opacity:1}
    button.active {background:#654398;color:#fff;opacity:1}
    @media(max-width:700px) {button {padding:7px 10px;font-size:12px}}
</style>
