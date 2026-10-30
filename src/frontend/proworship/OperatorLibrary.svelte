<script lang="ts">
    import { checkProWorshipBridge } from "./bridge"
    import { findPassage, parseBibleLibrary, type BibleLibrary } from "./bibleLibrary"
    import { formatScriptureReference, parseScriptureReference, suggestBibleBooks } from "./scriptureReference"
    import { searchBibleStories, STORY_CATEGORIES } from "./bibleStories"

    type OperatorSection = "service" | "bible" | "songs" | "media" | "ai"
    export let section: OperatorSection = "service"

    let bibleView: "quick" | "stories" = "quick"
    let loadedBible: BibleLibrary | null = null
    let importError = ""
    let verseLimit = 12
    let fileInput: HTMLInputElement
    $: matchingVerses = loadedBible && selection ? findPassage(loadedBible, selection) : []
    let reference = ""
    let translation = "KJV"
    let storyQuery = ""
    let category = "All"
    let bridgeStatus = "Not checked"
    let checking = false
    $: selection = parseScriptureReference(reference)
    $: suggestions = suggestBibleBooks(reference.split(/\d/)[0])
    $: stories = searchBibleStories(storyQuery, category)

    async function importBible(event: Event) {
        const files = (event.currentTarget as HTMLInputElement).files
        if (!files?.length) return
        importError = ""
        try {
            const file = files[0]
            if (file.size > 20 * 1024 * 1024) throw new Error("Bible JSON exceeds 20 MB; please use a smaller export")
            loadedBible = parseBibleLibrary(JSON.parse(await file.text()))
            translation = loadedBible.translation
        } catch (error) {
            importError = error instanceof Error ? error.message : "Could not import Bible"
        } finally {
            if (fileInput) fileInput.value = ""
        }
    }
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
            <div class="bible-import"><label for="pw-bible-file">Import Bible JSON for this session</label><input id="pw-bible-file" bind:this={fileInput} type="file" accept=".json,application/json" on:change={importBible} /><span>{loadedBible ? loadedBible.translation + " · " + loadedBible.verses.length + " verses loaded" : "No translation text loaded"}</span>{#if importError}<p class="import-error" role="alert">{importError}</p>{/if}</div>
            {#if loadedBible && selection}<div class="passage-result"><h3>{formatScriptureReference(selection)} · {loadedBible.translation}</h3>{#if matchingVerses.length}{#each matchingVerses.slice(0,verseLimit) as verse (verse.book + verse.chapter + ":" + verse.verse)}<p><strong>{verse.chapter}:{verse.verse}</strong> {verse.text}</p>{/each}{#if matchingVerses.length > verseLimit}<button type="button" class="accent" on:click={() => (verseLimit += 12)}>Show more verses</button>{/if}{:else}<p>No matching verses in the imported translation.</p>{/if}</div>{/if}
            <p class="supporting">Verse text is now available from a locally imported JSON translation. Projection via FreeShow Preview/Live is not yet connected. Import is session-only.</p>
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
    .bible-import {background:var(--primary-darker);border:1px solid var(--primary-lighter);padding:12px;border-radius:9px;display:flex;flex-direction:column;gap:7px}.bible-import input {font-size:12px}.bible-import span {font-size:12px;opacity:.7}.import-error {font-size:12px;color:#ffaaa8}.passage-result {padding:15px 20px;background:var(--primary-darker);border-radius:10px;border:1px solid var(--primary-lighter);line-height:1.65}.passage-result h3 {font-size:17px}.passage-result p {margin:12px 0}.passage-result strong {color:#b898e7;margin-right:6px}\n    .accent {padding:10px;color:white;background:#654398;border:none;border-radius:7px;cursor:pointer}
</style>
