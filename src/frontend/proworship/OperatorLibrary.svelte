<script lang="ts">
    import { checkProWorshipBridge } from "./bridge"
    import { formatScriptureReference, parseScriptureReference, suggestBibleBooks } from "./scriptureReference"
    import { searchBibleStories, STORY_CATEGORIES } from "./bibleStories"

    type OperatorSection = "service" | "bible" | "songs" | "media" | "ai"
    export let section: OperatorSection = "service"

    let bibleView: "quick" | "stories" = "quick"
    let reference = ""
    let translation = "KJV"
    let storyQuery = ""
    let category = "All"
    let bridgeStatus = "Not checked"
    let checking = false
    $: selection = parseScriptureReference(reference)
    $: suggestions = suggestBibleBooks(reference.split(/\d/)[0])
    $: stories = searchBibleStories(storyQuery, category)

    async function testAI() {
        if (checking) return
        checking = true
        try {
            const status = await checkProWorshipBridge()
            bridgeStatus = status.connected ? "Connected" : "Not connected: " + status.message
        } catch (error) {
            bridgeStatus = error instanceof Error ? error.message : "Connection unavailable"
        } finally {
            checking = false
        }
    }
    function openStory(value: string) {
        reference = value
        bibleView = "quick"
    }
</script>

<div class="operator-panel">
    <header class="panel-heading"><span class="panel-overline">PROWORSHIPAI</span><strong>{section === "service" ? "Order of Service" : section === "bible" ? "Bible Library" : section === "songs" ? "Songs" : section === "media" ? "Media" : "AI Assistant"}</strong></header>
    {#if section === "bible"}
        <div class="segmented"><button type="button" class:chosen={bibleView === "quick"} on:click={() => (bibleView = "quick")}>Quick Bible</button><button type="button" class:chosen={bibleView === "stories"} on:click={() => (bibleView = "stories")}>Stories</button></div>
        {#if bibleView === "quick"}
            <label for="pw-bible-ref">Passage</label>
            <input id="pw-bible-ref" bind:value={reference} placeholder="John 3:16-18" autocomplete="off" />
            {#if !selection && suggestions.length}
                <div class="suggestions">{#each suggestions as book}<button type="button" on:click={() => (reference = book + " ")}>{book}</button>{/each}</div>
            {/if}
            <label for="pw-bible-translation">Translation</label>
            <select id="pw-bible-translation" bind:value={translation}>
                {#each ["KJV","NLT","AMP","MSG","TPT","CEB"] as value}<option value={value}>{value}</option>{/each}
            </select>
            <div class="reference-result">{selection ? formatScriptureReference(selection) : "Enter a book, chapter or verse range"}</div>
            <p class="supporting">Verse text and Preview/Live will be available after your installed Bible library is connected. The selection cannot yet be projected.</p>
        {:else}
            <label for="pw-story-search">Find a story</label>
            <input id="pw-story-search" bind:value={storyQuery} placeholder="Daniel, faith, miracles..." />
            <label for="pw-story-category">Category</label>
            <select id="pw-story-category" bind:value={category}>{#each STORY_CATEGORIES as value}<option value={value}>{value}</option>{/each}</select>
            <div class="story-list">{#each stories as story (story.id)}<button type="button" on:click={() => openStory(story.reference)}><strong>{story.title}</strong><small>{story.reference}</small></button>{/each}</div>
        {/if}
    {:else if section === "ai"}
        <div class="status-box"><strong>Local AI bridge</strong><span>{bridgeStatus}</span></div>
        <button type="button" class="accent" on:click={testAI} disabled={checking}>{checking ? "Checking..." : "Test connection"}</button>
        <p class="supporting">Transcription and contextual suggestions require the original ProWorshipAI backend.</p>
    {:else if section === "songs"}
        <div class="status-box"><strong>Song library</strong><span>Use FreeShow's native Songs drawer below. Your custom song library and recognition controls will replace this when connected.</span></div>
    {:else if section === "media"}
        <div class="status-box"><strong>Media library</strong><span>Use FreeShow's Media drawer below for videos, images, PDFs and PowerPoint presentations.</span></div>
    {:else}
        <slot />
    {/if}
</div>

<style>
    .operator-panel {min-height:0;display:flex;flex-direction:column;flex:1;overflow-y:auto;background:var(--primary-darkest);color:var(--text);padding:12px;gap:9px}
    .panel-heading {display:flex;flex-direction:column;gap:3px;margin-bottom:6px}.panel-overline {font-size:10px;letter-spacing:.14em;color:#b898e7;font-weight:700}.panel-heading strong {font-size:16px;font-weight:700}
    label {font-size:12px;font-weight:600;opacity:.85;margin-top:4px}
    input,select {width:100%;box-sizing:border-box;background:var(--primary-darker);color:var(--text);border:1px solid var(--primary-lighter);border-radius:7px;padding:9px;font:inherit}
    .segmented {display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:3px;background:var(--primary-darker);border-radius:8px}
    .segmented button {color:var(--text);background:transparent;border:0;padding:9px;border-radius:6px;cursor:pointer}.segmented button.chosen {background:#654398;color:white}
    .suggestions {display:flex;flex-wrap:wrap;gap:5px}.suggestions button {background:var(--primary-lighter);color:var(--text);border:0;border-radius:5px;padding:5px 8px;cursor:pointer}
    .reference-result,.status-box {background:var(--primary-darker);border:1px solid var(--primary-lighter);border-radius:8px;padding:12px;margin-top:5px;overflow-wrap:anywhere}
    .status-box {display:flex;flex-direction:column;gap:8px}.status-box span {font-size:12px;opacity:.8;line-height:1.5}
    .supporting {font-size:11px;line-height:1.6;opacity:.7}
    .story-list {display:flex;flex-direction:column;gap:5px}.story-list button {padding:9px;text-align:left;background:var(--primary-darker);color:var(--text);border:1px solid var(--primary-lighter);border-radius:7px;cursor:pointer}.story-list small {display:block;opacity:.65;margin-top:3px}
    .accent {padding:10px;color:white;background:#654398;border:none;border-radius:7px;cursor:pointer}
</style>
