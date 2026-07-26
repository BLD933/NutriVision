
import chromadb
import os

_COLLECTION_NAME = "medical_guidelines"
_PERSIST_DIR     = os.path.join(os.path.dirname(__file__), "..", "rag")

_client     = chromadb.PersistentClient(path=_PERSIST_DIR)
_collection = None

def get_collection():
    global _collection
    if _collection is None:
        _collection = _client.get_or_create_collection(_COLLECTION_NAME)
    return _collection

def retrieve(query: str, pathologie: str = None, n: int = 3) -> str:
    search  = f"{pathologie} {query}" if pathologie else query
    col     = get_collection()
    results = col.query(query_texts=[search], n_results=n)
    docs    = results["documents"][0] if results["documents"] else []
    metas   = results["metadatas"][0]  if results["metadatas"]  else []
    output  = []
    for doc, meta in zip(docs, metas):
        output.append(f"[{meta.get('source','?')}] {doc}")
    return "\n".join(output)
