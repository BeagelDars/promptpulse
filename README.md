# PromptPulse | AI Gateway & Cost Observability Platform

A modern, high-performance developer tool and B2B SaaS platform designed to solve runaway LLM API expenses, latency spikes, and provider outages for software teams.

---

## 🚀 Features & Architecture

1. **Live Cost & Latency Observability**:
   - Real-time spend tracking against monthly budget caps.
   - P50/P95/P99 latency percentiles and token efficiency metrics.
   - Live inbound request stream showing model, token counts, costs, and cache resolution.

2. **Semantic Caching & Deduplication Gateway**:
   - Reduces upstream API expenses by caching semantically equivalent queries.
   - Decreases response latency down to **<5ms** for cached queries with **$0 token cost**.

3. **Interactive Gateway Simulator & Playground**:
   - Send simulated API prompts across multiple model providers (`GPT-4o`, `Claude 3.5 Sonnet`, `Gemini 1.5 Pro`, `Llama 3 70B`).
   - Test cache hits, latency drops, and cost calculations live.

4. **Budget Guardrails & Circuit Breakers**:
   - Hard and soft monthly spend limits.
   - Automatic rate limiting and circuit breakers preventing runaway agent loops.

5. **2-Line Drop-in SDK Integration**:
   - Compatible with OpenAI, Anthropic, and LangChain SDKs simply by modifying the API base URL.

---

## 💻 Accessing the Application

The development server is running locally. Access it at:
👉 **[http://localhost:8080](http://localhost:8080)**
