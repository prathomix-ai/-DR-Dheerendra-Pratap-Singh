"""Feature 1 - Digital RAG Brain (lazy ChromaDB + Gemini embeddings)."""

from __future__ import annotations

import asyncio
import os
from typing import Any

PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION = os.getenv("CHROMA_COLLECTION", "prathomix_knowledge")
EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/text-embedding-004")

_col = None
_client = None
_init_lock = asyncio.Lock()

SEED = [
    {"id": "d1", "text": "Knee osteoarthritis: cartilage degeneration causing weight-bearing pain. Treatment: quadriceps strengthening, low-impact aerobics, ice/heat therapy, NSAIDs.", "meta": {"body_part": "knee"}},
    {"id": "d2", "text": "Frozen shoulder (adhesive capsulitis): progressive stiffness and pain. Phases: freezing, frozen, thawing. Treatment: pendulum exercises, passive stretching, heat.", "meta": {"body_part": "shoulder"}},
    {"id": "d3", "text": "Lumbar disc herniation: nucleus pulposus compresses nerve roots causing sciatica. L4-L5 and L5-S1 most common. Treatment: McKenzie exercises, core stabilization, traction.", "meta": {"body_part": "spine"}},
    {"id": "d4", "text": "ACL rehabilitation protocol: Phase1 (0-2w) quad sets, ice, compression. Phase2 (2-6w) ROM exercises, stationary bike. Phase3 (6-12w) resistance, proprioception, agility.", "meta": {"body_part": "knee"}},
    {"id": "d5", "text": "Cervical spondylosis: degenerative cervical spine changes causing neck pain and radiculopathy. Treatment: cervical traction, isometric exercises, postural correction, heat.", "meta": {"body_part": "neck"}},
    {"id": "d6", "text": "Plantar fasciitis: plantar fascia inflammation causing heel pain worst in morning. Treatment: calf stretching, intrinsic foot strengthening, orthotics, night splints.", "meta": {"body_part": "foot"}},
    {"id": "d7", "text": "Rotator cuff tear: SITS muscle group partial or full tear. Supraspinatus most common. Treatment: pendulum exercises, scapular stabilization, external rotation strengthening.", "meta": {"body_part": "shoulder"}},
    {"id": "d8", "text": "Sciatica: sciatic nerve compression (L4-S3) causing buttock-to-foot pain. Treatment: nerve flossing, piriformis stretch, McKenzie extension, core strengthening, avoid flexion loading.", "meta": {"body_part": "spine"}},
    {"id": "d9", "text": "Patellofemoral pain syndrome (Runner's knee): anterior knee pain with stairs, squatting. Treatment: VMO strengthening, IT band stretching, taping, gait retraining.", "meta": {"body_part": "knee"}},
    {"id": "d10", "text": "Frozen hip (hip OA): progressive hip stiffness and groin pain. Treatment: hip mobilization, aquatic therapy, glute strengthening, gait aids if severe.", "meta": {"body_part": "hip"}},
]


def _get_embedding_api_key() -> str:
    raw_keys = os.getenv("GEMINI_KEYS", os.getenv("GEMINI_API_KEY", ""))
    for key in raw_keys.split(","):
        key = key.strip()
        if key:
            return key
    return ""


def _extract_embedding(response: Any) -> list[float]:
    embedding = getattr(response, "embedding", None)
    if embedding is not None:
        values = getattr(embedding, "values", None)
        if values:
            return list(values)

    if isinstance(response, dict):
        embedding = response.get("embedding")
        if isinstance(embedding, dict):
            values = embedding.get("values")
            if values:
                return list(values)
        values = response.get("embedding_values")
        if values:
            return list(values)

    raise RuntimeError("Gemini embedding API returned no vector data")


async def _embed_text(text: str, task_type: str) -> list[float]:
    api_key = _get_embedding_api_key()
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY or GEMINI_KEYS for embeddings")

    def _call() -> list[float]:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        response = genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type=task_type,
        )
        return _extract_embedding(response)

    return await asyncio.to_thread(_call)


async def _ensure_chroma_ready() -> None:
    global _client, _col

    if _col is not None:
        return

    async with _init_lock:
        if _col is not None:
            return

        # This used to run during app startup; keeping it inside the first request path avoids boot-time RAM spikes.
        import chromadb

        _client = chromadb.PersistentClient(path=PERSIST_DIR)
        _col = _client.get_or_create_collection(COLLECTION, metadata={"hnsw:space": "cosine"})

        if _col.count() == 0:
            documents = [item["text"] for item in SEED]
            ids = [item["id"] for item in SEED]
            metadatas = [item["meta"] for item in SEED]

            embeddings: list[list[float]] = []
            for document in documents:
                embeddings.append(await _embed_text(document, "retrieval_document"))

            _col.add(documents=documents, ids=ids, metadatas=metadatas, embeddings=embeddings)
            print(f"    Seeded {len(SEED)} RAG documents")


async def init_chroma() -> None:
    await _ensure_chroma_ready()


async def query_rag(query: str, n: int = 3, body_part: str | None = None) -> list[dict[str, Any]]:
    try:
        await _ensure_chroma_ready()
        if _col is None:
            return []

        query_embedding = await _embed_text(query, "retrieval_query")
        where = {"body_part": body_part} if body_part else None
        if where:
            result = _col.query(query_embeddings=[query_embedding], n_results=n, where=where)
        else:
            result = _col.query(query_embeddings=[query_embedding], n_results=n)

        documents = result.get("documents", [[]])
        distances = result.get("distances", [[]])
        if not documents or not documents[0]:
            return []

        return [
            {"text": document, "distance": distances[0][index] if distances and distances[0] else None}
            for index, document in enumerate(documents[0])
        ]
    except Exception as exc:
        print(f"RAG query error: {exc}")
        return []