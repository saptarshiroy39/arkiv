import re
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException

from app.deps import get_user_id
from app.rag.vectorstore import _get_index

router = APIRouter()

@router.get("/chats")
async def get_chats(user_id: str = Depends(get_user_id)) -> dict:
    try:
        index = _get_index()
        stats = index.describe_index_stats()

        namespaces = list(stats.namespaces.keys())
        chats = []
        prefix = f"{user_id}_"
        
        for ns in namespaces:
            if not ns.startswith(prefix):
                continue
            
            session_id = ns[len(prefix):]
            
            if not re.fullmatch(r'\d+', session_id):
                continue

            timestamp = int(session_id) / 1000.0
            dt = datetime.fromtimestamp(timestamp, tz=UTC)

            chats.append({
                "id": session_id,
                "title": f"Analysis {dt.strftime('%H:%M:%S')}",
                "date": dt.strftime('%Y-%m-%d')
            })

        chats.sort(key=lambda x: int(x["id"]), reverse=True)
        return {"chats": chats}
    except Exception as e:
        print(f"Error fetching chats for user {user_id}: {e}")
        raise HTTPException(500, "Failed to fetch chats from Pinecone.")
