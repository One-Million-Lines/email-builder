"""
AI service for the OpenPostcards email builder.

This module turns a natural-language instruction into a structured `AIResponse`
that the editor can apply. The design guarantees that whatever the model chooses,
the email stays valid and *visible*:

  1. The client sends a `catalog` of every available module, each with a concrete
     renderable `sample` (real module JSON).
  2. The model only picks module `type`s from that catalog (plus optional text
     overrides) — it never invents raw HTML or unknown blocks.
  3. We assemble the final `insert_module` actions from the real samples, so the
     output always renders in the editor.

Model access is intentionally simple and provider-agnostic: any OpenAI-compatible
Chat Completions endpoint works (OpenAI, Azure OpenAI, Ollama, LM Studio, vLLM, …).
When no API key is configured, a deterministic keyword-based planner runs so the
service is fully usable offline for demos, tests and open-source contributors.
"""

from __future__ import annotations

import json
import os
from typing import Any

import urllib.request
import urllib.error


# --------------------------------------------------------------------------- #
# Configuration (all optional; sensible offline defaults).
# --------------------------------------------------------------------------- #

MODEL = os.environ.get("AI_MODEL", "gpt-4o-mini")
API_KEY = os.environ.get("AI_API_KEY", "")
# OpenAI-compatible base URL. Override for Azure/Ollama/local runtimes.
BASE_URL = os.environ.get("AI_BASE_URL", "https://api.openai.com/v1")
MAX_MODULES = int(os.environ.get("AI_MAX_MODULES", "8"))
REQUEST_TIMEOUT = int(os.environ.get("AI_TIMEOUT", "45"))


class AIServiceError(Exception):
    """Raised for recoverable, client-facing failures."""


# --------------------------------------------------------------------------- #
# Public entry point.
# --------------------------------------------------------------------------- #

def generate(req: dict[str, Any]) -> dict[str, Any]:
    """Handle an `AIRequest` and return an `AIResponse` dict.

    `req` shape (mirrors src/core/aiActions.ts):
        { task, instruction?, document?, context? }
    where `context.catalog` is a list of CatalogEntry from the client.
    """
    task = req.get("task", "create_email")
    instruction = (req.get("instruction") or "").strip()
    catalog = _read_catalog(req)

    # Text-only tasks return a single string in `text`.
    if task in ("rewrite_text", "generate_subject", "generate_preview", "translate", "adapt_tone"):
        return {"text": _text_task(task, instruction, req)}

    if not catalog:
        raise AIServiceError("No module catalog supplied by the client.")

    # Choose an ordered list of module types (+ optional text overrides).
    plan, message = _plan_email(instruction, catalog)
    if not plan:
        return {"text": message or "I couldn't find suitable blocks for that request."}

    by_type = {entry["type"]: entry for entry in catalog}
    actions: list[dict[str, Any]] = []
    for i, step in enumerate(plan[:MAX_MODULES]):
        entry = by_type.get(step.get("type"))
        if not entry:
            continue
        module = _assemble_module(entry["sample"], step.get("content"))
        actions.append({"type": "insert_module", "index": i, "module": module})

    if not actions:
        return {"text": message or "None of the suggested blocks matched the catalog."}

    return {"actions": actions, "text": message}


# --------------------------------------------------------------------------- #
# Planning: model-backed with an offline heuristic fallback.
# --------------------------------------------------------------------------- #

def _plan_email(instruction: str, catalog: list[dict]) -> tuple[list[dict], str]:
    """Return (plan, assistant_message). Plan is a list of {type, content?}."""
    if API_KEY:
        try:
            return _plan_with_model(instruction, catalog)
        except (AIServiceError, urllib.error.URLError, TimeoutError) as exc:
            # Fall back to the heuristic planner rather than failing the request.
            plan = _plan_heuristic(instruction, catalog)
            return plan, f"(Model unavailable, used a built-in planner: {exc})"
    plan = _plan_heuristic(instruction, catalog)
    return plan, "Assembled your email from the available blocks."


def _plan_with_model(instruction: str, catalog: list[dict]) -> tuple[list[dict], str]:
    # Give the model a compact menu: type + category + description.
    menu = [
        {
            "type": e["type"],
            "category": e.get("category"),
            "name": e.get("name"),
            "description": e.get("description"),
        }
        for e in catalog
    ]
    system = (
        "You are an email layout planner for a block-based email builder. "
        "You are given a MENU of modules (each with a stable `type`). "
        "Given the user's request, choose an ordered list of module types that "
        "compose a complete, well-structured marketing email (usually a header, "
        "one or more content/feature blocks, a call to action, and a footer). "
        "Only use `type` values present in the MENU. "
        "Optionally provide `content`: an array of short strings that replace the "
        "text elements of that module, in order. "
        "Respond ONLY with JSON of the form: "
        '{"message": string, "plan": [{"type": string, "content"?: string[]}]}'
    )
    user = (
        f"MENU:\n{json.dumps(menu)[:12000]}\n\n"
        f"REQUEST:\n{instruction or 'Create a general marketing email.'}"
    )
    raw = _chat_completion(system, user)
    data = _parse_json_object(raw)
    plan = data.get("plan") or []
    if not isinstance(plan, list):
        raise AIServiceError("Model returned a non-list plan.")
    cleaned = [
        {"type": p.get("type"), "content": p.get("content")}
        for p in plan
        if isinstance(p, dict) and p.get("type")
    ]
    return cleaned, str(data.get("message") or "Here is your email.")


# Keyword -> preferred categories, used to bias the offline planner.
_INTENT_HINTS = {
    "sale": ["ecommerce", "call_to_action"],
    "shop": ["ecommerce"],
    "product": ["ecommerce"],
    "cart": ["ecommerce", "transactional"],
    "order": ["transactional"],
    "receipt": ["transactional"],
    "welcome": ["header", "content", "call_to_action"],
    "onboard": ["content", "call_to_action"],
    "newsletter": ["header", "content", "content", "footer"],
    "digest": ["content", "content"],
    "event": ["header", "content", "call_to_action"],
    "invite": ["header", "call_to_action"],
}


def _plan_heuristic(instruction: str, catalog: list[dict]) -> list[dict]:
    """Deterministic planner: pick one module per section using keyword hints."""
    text = instruction.lower()
    by_category: dict[str, list[dict]] = {}
    for e in catalog:
        by_category.setdefault(e.get("category", ""), []).append(e)

    # Intent-specific middle sections detected from keywords.
    extra: list[str] = []
    for kw, cats in _INTENT_HINTS.items():
        if kw in text:
            extra = cats
            break

    # Header always leads, footer always trails; content + intent blocks sit
    # in between so the email reads naturally.
    middle = _dedupe_keep_order(extra + ["content", "call_to_action"])
    middle = [c for c in middle if c not in ("header", "footer")]
    sections = _dedupe_keep_order(["header", *middle, "footer"])

    plan: list[dict] = []
    for cat in sections:
        options = by_category.get(cat)
        if options:
            plan.append({"type": options[0]["type"]})
    return plan


# --------------------------------------------------------------------------- #
# Module assembly: clone a real sample, apply optional text overrides.
# --------------------------------------------------------------------------- #

def _assemble_module(sample: dict, content: Any) -> dict:
    """Return a copy of `sample` with optional text overrides applied in order."""
    module = json.loads(json.dumps(sample))  # deep copy
    if isinstance(content, list) and content:
        texts = [c for c in content if isinstance(c, str)]
        it = iter(texts)
        for child in module.get("children", []):
            if child.get("type") == "text":
                try:
                    child["content"] = next(it)
                except StopIteration:
                    break
    return module


def _text_task(task: str, instruction: str, req: dict) -> str:
    if not API_KEY:
        # Offline stubs keep the endpoint usable without a model.
        return {
            "generate_subject": "Your update is here ✨",
            "generate_preview": "A short line that nudges readers to open.",
        }.get(task, instruction or "")
    prompts = {
        "rewrite_text": "Rewrite the text to be clear and engaging. Return only the text.",
        "generate_subject": "Write one compelling email subject line. Return only the line.",
        "generate_preview": "Write one short email preview line. Return only the line.",
        "translate": "Translate the text as instructed. Return only the translation.",
        "adapt_tone": "Rewrite the text in the requested tone. Return only the text.",
    }
    system = prompts.get(task, "Return only the requested text.")
    return _chat_completion(system, instruction).strip()


# --------------------------------------------------------------------------- #
# Minimal OpenAI-compatible Chat Completions client (stdlib only).
# --------------------------------------------------------------------------- #

def _chat_completion(system: str, user: str) -> str:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.4,
    }
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL.rstrip('/')}/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:  # surface a readable message
        detail = exc.read().decode("utf-8", "ignore")[:300]
        raise AIServiceError(f"Model API error {exc.code}: {detail}") from exc
    try:
        return data["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError) as exc:
        raise AIServiceError("Unexpected model response shape.") from exc


# --------------------------------------------------------------------------- #
# Helpers.
# --------------------------------------------------------------------------- #

def _read_catalog(req: dict) -> list[dict]:
    context = req.get("context") or {}
    catalog = context.get("catalog") if isinstance(context, dict) else None
    return catalog if isinstance(catalog, list) else []


def _parse_json_object(raw: str) -> dict:
    """Parse a JSON object, tolerating markdown code fences around it."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        raw = raw[raw.find("{") :]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise AIServiceError("Model did not return JSON.")
    return json.loads(raw[start : end + 1])


def _dedupe_keep_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for i in items:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out
