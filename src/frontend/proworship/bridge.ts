/**
 * ProWorshipAI FreeShow Edition: optional, read-only localhost bridge.
 *
 * This does not start the legacy app or access its Bible/song libraries.
 * Keep networking behind an explicit user action; don't poll on every render.
 */
export type BridgeHealth = {
    connected: boolean
    endpoint: string
    ollamaAvailable: boolean | null
    message: string
}

export const DEFAULT_BRIDGE_URL = "http://127.0.0.1:8765"

export async function checkProWorshipBridge(baseUrl = DEFAULT_BRIDGE_URL, timeoutMs = 2500): Promise<BridgeHealth> {
    // No arbitrary remote endpoints: avoid accidentally sending private data
    // to another device or a network service.
    let endpoint: URL
    try {
        endpoint = new URL(baseUrl)
    } catch {
        throw new Error("Invalid ProWorshipAI bridge URL")
    }
    if (endpoint.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(endpoint.hostname) || endpoint.username || endpoint.password) {
        throw new Error("ProWorshipAI bridge must use local HTTP (127.0.0.1 or localhost)")
    }
    const url = new URL("/health", endpoint)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
            credentials: "omit"
        })
        if (!response.ok) throw new Error(`Health check returned HTTP ${response.status}`)
        const health: unknown = await response.json()
        if (typeof health !== "object" || health === null || Array.isArray(health)) {
            throw new Error("Unexpected health response")
        }
        const data = health as Record<string, unknown>
        return {
            connected: true,
            endpoint: endpoint.origin,
            ollamaAvailable: typeof data.ollama_available === "boolean" ? data.ollama_available : null,
            message: typeof data.message === "string" ? data.message : "ProWorshipAI bridge reachable"
        }
    } catch (error) {
        return {
            connected: false,
            endpoint: endpoint.origin,
            ollamaAvailable: null,
            message: error instanceof Error ? error.message : "Connection failed"
        }
    } finally {
        clearTimeout(timeout)
    }
}
