<script lang="ts">
    import { checkProWorshipBridge, DEFAULT_BRIDGE_URL } from "./bridge"
    import { formatScriptureReference, parseScriptureReference } from "./scriptureReference"

    let scriptureInput = ""
    $: parsedScripture = parseScriptureReference(scriptureInput)
    let expanded = false
    let checking = false
    let connected: boolean | null = null
    let ollamaAvailable: boolean | null = null
    let details = "Select Test connection to check the optional local AI bridge."

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

<div class="pw-wrapper">
    <button type="button" class="pw-toggle" aria-expanded={expanded} on:click={() => (expanded = !expanded)}>
        <span class="pw-dot" class:online={connected === true} />
        ProWorshipAI {expanded ? "▲" : "▼"}
    </button>
    {#if expanded}
        <section class="pw-panel" aria-label="ProWorshipAI AI bridge">
            <div class="pw-heading">ProWorshipAI — FreeShow Edition</div>
            <p>AI bridge: {connected === null ? "Not checked" : connected ? "Connected" : "Offline"}</p>
            <p>Ollama: {ollamaAvailable === null ? "Unknown" : ollamaAvailable ? "Available" : "Unavailable"}</p>
            <p class="pw-message">{details}</p>
            <p class="pw-endpoint">Local endpoint: {DEFAULT_BRIDGE_URL}</p>
            <button type="button" class="pw-test" on:click={testConnection} disabled={checking}>
                {checking ? "Checking..." : "Test connection"}
            </button>
            <div class="pw-scripture"><label for="pw-scripture-ref">Quick Scripture reference</label><input id="pw-scripture-ref" type="text" bind:value={scriptureInput} placeholder="John 3:16-18" autocomplete="off" /><p aria-live="polite">{!scriptureInput.trim() ? "Enter a Bible reference." : parsedScripture ? "Recognised: " + formatScriptureReference(parsedScripture) : "Reference not recognised."}</p></div>
            <p class="pw-note">Reference entry only; Bible text and live projection will be connected after library integration.</p>
        </section>
    {/if}
</div>

<style>
    .pw-wrapper { position: absolute; bottom: 34px; right: 12px; z-index: 90; font-size: 13px; }
    .pw-toggle { display: flex; align-items: center; gap: 7px; background: #543580; color: white; border: 1px solid #9b80c5; border-radius: 7px; padding: 7px 11px; cursor: pointer; }
    .pw-dot { width: 8px; height: 8px; border-radius: 50%; background: #b4a2c9; }
    .pw-dot.online { background: #5fe6aa; }
    .pw-panel { width: 300px; max-width: calc(100vw - 40px); margin-bottom: 8px; background: #241b32; color: #fff; padding: 15px; border: 1px solid #9473ba; border-radius: 9px; box-shadow: 0 8px 26px #0008; }
    .pw-heading { font-weight: 700; font-size: 14px; margin-bottom: 10px; }
    .pw-panel p { margin: 6px 0; }
    .pw-message { overflow-wrap: anywhere; color: #ddd0ee; }
    .pw-endpoint { font-size: 11px; opacity: .75; }
    .pw-test { margin-top: 8px; padding: 8px 10px; border-radius: 6px; background: #7650a4; color: white; border: 1px solid #ad92d5; cursor: pointer; }
    .pw-test:disabled { opacity: .6; cursor: progress; }
    .pw-scripture { margin-top: 14px; border-top: 1px solid #70538a; padding-top: 10px; }\n    .pw-scripture label { display: block; margin-bottom: 5px; }\n    .pw-scripture input { box-sizing: border-box; width: 100%; background: #362747; border: 1px solid #9677b9; border-radius: 5px; color: white; padding: 8px; }\n    .pw-scripture p { color: #d8c7e9; font-size: 11px; }\n    .pw-note { font-size: 11px; opacity: .8; margin-top: 12px !important; }
</style>
