<script lang="ts">
    import { onMount } from "svelte"
    import { checkProWorshipBridge, DEFAULT_BRIDGE_URL } from "./bridge"
    import { formatScriptureReference, parseScriptureReference, suggestBibleBooks } from "./scriptureReference"
    import { searchBibleStories, STORY_CATEGORIES } from "./bibleStories"

    export let embedded = false
    type Tab = "scripture" | "stories" | "ai" | "activity"
    let expanded = embedded
    let activeTab: Tab = "scripture"
    let scriptureInput = ""
    let storyQuery = ""
    let storyCategory = "All"
    $: storyResults = searchBibleStories(storyQuery, storyCategory)
    let translation = "KJV"
    const translations = ["KJV", "NLT", "AMP", "MSG", "TPT", "CEB"]
    let history: string[] = []
    let saved: string[] = []
    let preferencesLoaded = false
    onMount(() => {
        try {
            const raw = localStorage.getItem("proworshipai.freeshow.scripture.preferences.v1")
            if (raw) {
                const data = JSON.parse(raw)
                if (Array.isArray(data.saved)) saved = data.saved.filter((x: unknown) => typeof x === "string").slice(0, 20)
                if (Array.isArray(data.history)) history = data.history.filter((x: unknown) => typeof x === "string").slice(0, 20)
                if (translations.includes(data.translation)) translation = data.translation
            }
        } catch (error) { console.warn("ProWorshipAI preferences unavailable", error) }
        preferencesLoaded = true
    })
    $: if (preferencesLoaded) {
        try { localStorage.setItem("proworshipai.freeshow.scripture.preferences.v1", JSON.stringify({ saved, history, translation })) }
        catch (error) { console.warn("Could not save ProWorshipAI preferences", error) }
    }
    $: parsedScripture = parseScriptureReference(scriptureInput)
    $: suggestions = suggestBibleBooks(scriptureInput.split(/\d/)[0].trim())
    let checking = false
    let connected: boolean | null = null
    let ollamaAvailable: boolean | null = null
    let details = "AI backend has not been checked."

    function saveReference() {
        if (!parsedScripture) return
        const reference = formatScriptureReference(parsedScripture)
        history = [reference, ...history.filter((x) => x !== reference)].slice(0, 20)
    }
    function toggleFavourite() {
        if (!parsedScripture) return
        const reference = formatScriptureReference(parsedScripture)
        saved = saved.includes(reference) ? saved.filter((x) => x !== reference) : [reference, ...saved].slice(0, 20)
    }
    function useReference(reference: string) {
        scriptureInput = reference
        activeTab = "scripture"
    }
    async function copyReference() {
        if (!parsedScripture) return
        await navigator.clipboard.writeText(formatScriptureReference(parsedScripture) + " (" + translation + ")")
        saveReference()
    }
    async function testConnection() {
        if (checking) return
        checking = true
        try {
            const result = await checkProWorshipBridge()
            connected = result.connected
            ollamaAvailable = result.ollamaAvailable
            details = result.message
        } catch (error) {
            connected = false
            ollamaAvailable = null
            details = error instanceof Error ? error.message : "Connection failed"
        } finally {
            checking = false
        }
    }
</script>

<div class="pw-workspace" class:embedded>
    {#if expanded}
        <section class="pw-panel" aria-label="ProWorshipAI workspace">
            <header class="pw-header">
                <div class="pw-mark" aria-hidden="true">P</div>
                <div class="pw-title"><strong>ProWorshipAI</strong><small>Presentation workspace</small></div>
                {#if !embedded}<button class="pw-icon" type="button" aria-label="Close ProWorshipAI workspace" on:click={() => (expanded = false)}>✕</button>{/if}
            </header>
            <nav class="pw-tabs" aria-label="ProWorshipAI sections">
                <button type="button" class:active={activeTab === "scripture"} on:click={() => (activeTab = "scripture")}>Scripture</button>
                <button type="button" class:active={activeTab === "stories"} on:click={() => (activeTab = "stories")}>Stories</button>
                <button type="button" class:active={activeTab === "ai"} on:click={() => (activeTab = "ai")}>AI Engine</button>
                <button type="button" class:active={activeTab === "activity"} on:click={() => (activeTab = "activity")}>Library</button>
            </nav>
            <div class="pw-body">
                {#if activeTab === "scripture"}
                    <div class="pw-section-label">QUICK BIBLE</div>
                    <label for="pw-ref">Scripture reference</label>
                    <input id="pw-ref" bind:value={scriptureInput} on:keydown={(e) => { if (e.key === "Enter") saveReference() }} placeholder="John 3:16-18" autocomplete="off" />
                    {#if suggestions.length && !parsedScripture}
                        <div class="pw-suggest">
                            {#each suggestions as book}
                                <button type="button" on:click={() => (scriptureInput = book + " ")}>{book}</button>
                            {/each}
                        </div>
                    {/if}
                    <div class="pw-row"><label for="pw-translation">Translation</label><select id="pw-translation" bind:value={translation}>{#each translations as option}<option value={option}>{option}</option>{/each}</select></div>
                    <div class="pw-result" aria-live="polite">
                        {#if parsedScripture}
                            <strong>{formatScriptureReference(parsedScripture)}</strong><small>Reference recognised · {translation}</small>
                        {:else}
                            <strong>{scriptureInput.trim() ? "Reference not recognised" : "Find a Bible passage"}</strong><small>Enter a book, chapter or verse range</small>
                        {/if}
                    </div>
                    <div class="pw-actions">
                        <button type="button" class="primary" disabled={!parsedScripture} on:click={saveReference}>Add to recent</button>
                        <button type="button" disabled={!parsedScripture} on:click={toggleFavourite}>{parsedScripture && saved.includes(formatScriptureReference(parsedScripture)) ? "★ Saved" : "☆ Save"}</button>
                        <button type="button" disabled={!parsedScripture} on:click={copyReference}>Copy</button>
                    </div>
                    <p class="pw-footnote">Reference management is active. Translation text, Preview and Live will become available when the original libraries and FreeShow output adapter are connected.</p>
                {:else if activeTab === "stories"}
                    <div class="pw-section-label">BIBLE STORIES</div>
                    <label for="pw-story-search">Find a story</label>
                    <input id="pw-story-search" bind:value={storyQuery} placeholder="Daniel, miracles, faith..." />
                    <label for="pw-story-cat">Category</label>
                    <select id="pw-story-cat" bind:value={storyCategory}>{#each STORY_CATEGORIES as category}<option value={category}>{category}</option>{/each}</select>
                    <p class="pw-info">{storyResults.length} matching stories</p>
                    {#each storyResults as story (story.id)}<button type="button" class="pw-history" on:click={() => useReference(story.reference)}><strong>{story.title}</strong><small>{story.reference} · {story.category}</small></button>{/each}
                    <p class="pw-footnote">Choose a story to load its reference into Quick Bible. Passage text and projection are not yet connected.</p>
                {:else if activeTab === "ai"}
                    <div class="pw-section-label">LOCAL AI ENGINE</div>
                    <div class="pw-status"><span class:online={connected === true} class="pw-dot"></span><div><strong>{connected === null ? "Not checked" : connected ? "Connected" : "Offline"}</strong><small>{DEFAULT_BRIDGE_URL}</small></div></div>
                    <p class="pw-info">{details}</p>
                    <p class="pw-info">Ollama: {ollamaAvailable === null ? "Unknown" : ollamaAvailable ? "Available" : "Unavailable"}</p>
                    <button type="button" class="primary" disabled={checking} on:click={testConnection}>{checking ? "Checking..." : "Test local AI connection"}</button>
                    <p class="pw-footnote">Live transcription and contextual Top 3 suggestions are awaiting backend integration.</p>
                {:else}
                    <div class="pw-section-label">SAVED REFERENCES</div>
                    {#if saved.length}
                        {#each saved as reference}<button type="button" class="pw-history" on:click={() => useReference(reference)}>★ {reference}</button>{/each}
                    {:else}<p class="pw-info">No favourites saved in this session.</p>{/if}
                    <div class="pw-section-label pw-space">RECENT REFERENCES</div>
                    {#if history.length}
                        {#each history as reference}<button type="button" class="pw-history" on:click={() => useReference(reference)}>{reference}</button>{/each}
                    {:else}<p class="pw-info">No recent references in this session.</p>{/if}
                    <p class="pw-footnote">Saved references and translation choice persist locally. Your complete Bible library will be connected separately.</p>
                {/if}
            </div>
        </section>
    {/if}
    {#if !embedded}<button type="button" class="pw-launch" aria-expanded={expanded} on:click={() => (expanded = !expanded)}><span class="pw-launch-mark">P</span><span>ProWorshipAI</span><span class="pw-chevron">{expanded ? "×" : "⌃"}</span></button>{/if}
</div>

<style>
    .pw-workspace.embedded {position:relative;bottom:auto;right:auto;z-index:1;min-height:0;width:100%;display:flex;flex-direction:column;flex:1;overflow:hidden}
    .pw-workspace.embedded .pw-panel {width:auto;max-width:none;max-height:none;margin:0;border:0;border-radius:0;box-shadow:none;flex:1;min-height:0}
    .pw-workspace.embedded .pw-body {min-height:0;flex:1}
    .pw-workspace {position:absolute;bottom:38px;right:14px;z-index:60;font-family:inherit;font-size:13px;color:#f5f0ff}
    button,input,select {font:inherit}
    button {cursor:pointer}
    .pw-launch {display:flex;align-items:center;gap:10px;padding:8px 13px;border:1px solid #9672ce;border-radius:14px;color:#fff;background:linear-gradient(120deg,#5a3296,#32204f);box-shadow:0 8px 25px #0007;font-weight:700}
    .pw-launch-mark,.pw-mark {display:grid;place-items:center;background:linear-gradient(140deg,#a879ed,#6941a0);color:white;font-weight:800;border-radius:9px}
    .pw-launch-mark {width:24px;height:24px}.pw-chevron {margin-left:10px;opacity:.8}
    .pw-panel {width:min(480px,calc(100vw - 32px));max-height:min(640px,calc(100vh - 120px));display:flex;flex-direction:column;margin-bottom:10px;background:#191725;border:1px solid #4d4167;border-radius:18px;overflow:hidden;box-shadow:0 20px 65px #000a}
    .pw-header {display:flex;align-items:center;gap:12px;padding:16px;background:linear-gradient(110deg,#32214e,#211b31)}
    .pw-mark {height:36px;width:36px;font-size:20px}.pw-title {display:flex;flex:1;min-width:0;flex-direction:column;gap:2px}.pw-title strong {font-size:16px}.pw-title small {color:#bcaed5;font-size:11px}
    .pw-icon {border:0;background:#ffffff13;color:white;border-radius:9px;padding:7px 11px}
    .pw-tabs {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:8px 12px;background:#201b2d}.pw-tabs button {min-width:0;white-space:nowrap;font-size:12px;border:0;background:transparent;color:#bfb2d1;border-radius:9px;padding:10px 5px}.pw-tabs button.active {color:white;background:#674495;font-weight:700}
    .pw-body {padding:18px;overflow-y:auto;min-height:230px}.pw-section-label {font-size:10px;color:#ae91da;font-weight:800;letter-spacing:.12em;margin-bottom:13px}.pw-space {margin-top:20px}
    label {display:block;color:#dcd2ea;font-weight:600;font-size:12px;margin-bottom:7px}
    input,select {box-sizing:border-box;color:#fff;background:#2b253b;border:1px solid #514465;border-radius:10px;padding:11px;outline:none}
    input {width:100%;margin-bottom:12px}input:focus,select:focus {border-color:#b18ae5;box-shadow:0 0 0 2px #8c5ccb35}
    .pw-suggest {display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}.pw-suggest button {background:#342745;color:#e4d4ff;border:1px solid #5c4477;border-radius:8px;padding:5px 9px}
    .pw-row {display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.pw-row label {margin:0}.pw-row select {width:138px}
    .pw-result {display:flex;flex-direction:column;gap:6px;padding:15px;margin-bottom:15px;border:1px solid #4b3a6a;background:#282039;border-radius:12px}.pw-result strong {font-size:17px}.pw-result small {color:#b8a7d1}
    .pw-actions {display:flex;gap:7px;flex-wrap:wrap}.pw-actions button,.pw-body>.primary {border:1px solid #615078;border-radius:9px;padding:10px;background:#332a43;color:white}.pw-actions .primary,.pw-body>.primary {background:#754ab2;border-color:#9469d1;font-weight:700}.pw-actions button:disabled,.pw-body button:disabled {opacity:.4;cursor:default}
    .pw-footnote {font-size:11px;line-height:1.5;color:#a99bbf;margin-top:17px}.pw-info {color:#c9bdd9;line-height:1.6;overflow-wrap:anywhere}
    .pw-dot {height:9px;width:9px;background:#d29e70;border-radius:50%}.pw-dot.online {background:#66d7a3}.pw-status {display:flex;align-items:center;gap:12px;background:#282039;border-radius:11px;padding:13px;margin-bottom:15px}.pw-status div {display:flex;flex-direction:column;gap:3px}.pw-status small {font-size:11px;color:#b8a7d1}
    .pw-history strong,.pw-history small {display:block;} .pw-history small {color:#ae98ca;margin-top:4px;font-size:11px;}
    .pw-history {display:block;width:100%;text-align:left;color:#e7dafa;background:#2a2438;border:1px solid #453658;border-radius:9px;margin:7px 0;padding:10px}
</style>
