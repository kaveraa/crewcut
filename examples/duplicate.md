# Duplicate an item

Ticket: "Add an endpoint to duplicate an item."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)), crewcut 0.6.4, 2026-10-03. The diff is what the session left in the working tree, the reply is its last message; neither is edited. Lines are source lines added, tests counted apart.

## Without crewcut: 23 lines plus 72 of tests, 10 turns, 158k tokens, 0.22 USD

```diff
diff --git a/backend/app/api/routes/items.py b/backend/app/api/routes/items.py
index f0eb30e..1fc2e44 100644
--- a/backend/app/api/routes/items.py
+++ b/backend/app/api/routes/items.py
@@ -72,6 +72,29 @@ def create_item(
     return item
 
 
+@router.post("/{id}/duplicate", response_model=ItemPublic)
+def duplicate_item(
+    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
+) -> Any:
+    """
+    Duplicate an item. The copy is owned by the current user.
+    """
+    item = session.get(Item, id)
+    if not item:
+        raise HTTPException(status_code=404, detail="Item not found")
+    if not current_user.is_superuser and (item.owner_id != current_user.id):
+        raise HTTPException(status_code=403, detail="Not enough permissions")
+    new_item = Item(
+        title=item.title,
+        description=item.description,
+        owner_id=current_user.id,
+    )
+    session.add(new_item)
+    session.commit()
+    session.refresh(new_item)
+    return new_item
+
+
 @router.put("/{id}", response_model=ItemPublic)
 def update_item(
     *,
diff --git a/backend/tests/api/routes/test_items.py b/backend/tests/api/routes/test_items.py
index 3e82cd0..a087297 100644
--- a/backend/tests/api/routes/test_items.py
+++ b/backend/tests/api/routes/test_items.py
@@ -126,6 +126,78 @@ def test_update_item_not_enough_permissions(
     assert content["detail"] == "Not enough permissions"
 
 
+def test_duplicate_item(
+    client: TestClient, normal_user_token_headers: dict[str, str]
+) -> None:
+    data = {"title": "Original", "description": "To be copied"}
+    response = client.post(
+        f"{settings.API_V1_STR}/items/",
+        headers=normal_user_token_headers,
+        json=data,
+    )
+    original = response.json()
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{original['id']}/duplicate",
+        headers=normal_user_token_headers,
+    )
+    assert response.status_code == 200
+    content = response.json()
+    assert content["title"] == data["title"]
+    assert content["description"] == data["description"]
+    assert content["id"] != original["id"]
+    assert content["owner_id"] == original["owner_id"]
+    # The original is untouched
+    response = client.get(
+        f"{settings.API_V1_STR}/items/{original['id']}",
+        headers=normal_user_token_headers,
+    )
+    assert response.status_code == 200
+
+
+def test_duplicate_item_by_superuser_owned_by_superuser(
+    client: TestClient, superuser_token_headers: dict[str, str], db: Session
+) -> None:
+    item = create_random_item(db)
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{item.id}/duplicate",
+        headers=superuser_token_headers,
+    )
+    assert response.status_code == 200
+    content = response.json()
+    assert content["title"] == item.title
+    assert content["description"] == item.description
+    assert content["id"] != str(item.id)
+    me = client.get(
+        f"{settings.API_V1_STR}/users/me", headers=superuser_token_headers
+    ).json()
+    assert content["owner_id"] == me["id"]
+
+
+def test_duplicate_item_not_found(
+    client: TestClient, superuser_token_headers: dict[str, str]
+) -> None:
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{uuid.uuid4()}/duplicate",
+        headers=superuser_token_headers,
+    )
+    assert response.status_code == 404
+    content = response.json()
+    assert content["detail"] == "Item not found"
+
+
+def test_duplicate_item_not_enough_permissions(
+    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
+) -> None:
+    item = create_random_item(db)
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{item.id}/duplicate",
+        headers=normal_user_token_headers,
+    )
+    assert response.status_code == 403
+    content = response.json()
+    assert content["detail"] == "Not enough permissions"
+
+
 def test_delete_item(
     client: TestClient, superuser_token_headers: dict[str, str], db: Session
 ) -> None:
```

Reply:

I added `POST /items/{id}/duplicate`, which copies an item's title and description into a new item and returns it. I haven't run the new tests.

**How it works** (`backend/app/api/routes/items.py`):
- It uses the same checks as the other item endpoints: 404 if the item doesn't exist, and 403 unless you own the item or are a superuser.
- The copy gets a new id and creation time. The original is not changed.
- **The person who makes the copy owns it.** If a superuser duplicates another user's item, the copy belongs to the superuser. This matches how `create_item` works. If you'd rather the copy stay with the original owner, change `owner_id=current_user.id` to `owner_id=item.owner_id`.
- The title is copied exactly, with no "(copy)" added. Titles are limited to 255 characters, so adding a suffix could push a long title over that limit.

**Tests** (`backend/tests/api/routes/test_items.py`), four new cases:
- A normal user duplicates their own item.
- A superuser duplicates another user's item and ends up owning the copy.
- Duplicating a missing item returns 404.
- Duplicating someone else's item without permission returns 403.

The frontend's generated API client doesn't include this endpoint yet. You'll need to regenerate it before the UI can use it.

## With crewcut: 20 lines plus 38 of tests, 8 turns, 105k tokens, 0.17 USD

```diff
diff --git a/backend/app/api/routes/items.py b/backend/app/api/routes/items.py
index f0eb30e..e2ce60f 100644
--- a/backend/app/api/routes/items.py
+++ b/backend/app/api/routes/items.py
@@ -4,6 +4,7 @@ from typing import Any
 from fastapi import APIRouter, HTTPException
 from sqlmodel import col, func, select
 
+from app import crud
 from app.api.deps import CurrentUser, SessionDep
 from app.models import Item, ItemCreate, ItemPublic, ItemsPublic, ItemUpdate, Message
 
@@ -72,6 +73,25 @@ def create_item(
     return item
 
 
+@router.post("/{id}/duplicate", response_model=ItemPublic)
+def duplicate_item(
+    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
+) -> Any:
+    """
+    Duplicate an item. The copy is owned by the current user.
+    """
+    item = session.get(Item, id)
+    if not item:
+        raise HTTPException(status_code=404, detail="Item not found")
+    if not current_user.is_superuser and (item.owner_id != current_user.id):
+        raise HTTPException(status_code=403, detail="Not enough permissions")
+    return crud.create_item(
+        session=session,
+        item_in=ItemCreate.model_validate(item, from_attributes=True),
+        owner_id=current_user.id,
+    )
+
+
 @router.put("/{id}", response_model=ItemPublic)
 def update_item(
     *,
diff --git a/backend/tests/api/routes/test_items.py b/backend/tests/api/routes/test_items.py
index 3e82cd0..015c709 100644
--- a/backend/tests/api/routes/test_items.py
+++ b/backend/tests/api/routes/test_items.py
@@ -40,6 +40,44 @@ def test_read_item(
     assert content["owner_id"] == str(item.owner_id)
 
 
+def test_duplicate_item(
+    client: TestClient, superuser_token_headers: dict[str, str], db: Session
+) -> None:
+    item = create_random_item(db)
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{item.id}/duplicate",
+        headers=superuser_token_headers,
+    )
+    assert response.status_code == 200
+    content = response.json()
+    assert content["id"] != str(item.id)
+    assert content["title"] == item.title
+    assert content["description"] == item.description
+
+
+def test_duplicate_item_not_found(
+    client: TestClient, superuser_token_headers: dict[str, str]
+) -> None:
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{uuid.uuid4()}/duplicate",
+        headers=superuser_token_headers,
+    )
+    assert response.status_code == 404
+    assert response.json()["detail"] == "Item not found"
+
+
+def test_duplicate_item_not_enough_permissions(
+    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
+) -> None:
+    item = create_random_item(db)
+    response = client.post(
+        f"{settings.API_V1_STR}/items/{item.id}/duplicate",
+        headers=normal_user_token_headers,
+    )
+    assert response.status_code == 403
+    assert response.json()["detail"] == "Not enough permissions"
+
+
 def test_read_item_not_found(
     client: TestClient, superuser_token_headers: dict[str, str]
 ) -> None:
```

Reply:

I added `POST /items/{id}/duplicate` in `backend/app/api/routes/items.py`. It copies the item's title and description into a new item. I haven't run the tests.

- **Checks:** it returns 404 if the item doesn't exist and 403 if you don't own it, unless you're a superuser.
- **Saving:** it reuses the existing `crud.create_item` to save the copy.
- **Ownership:** the copy belongs to whoever calls the endpoint. So if a superuser duplicates another user's item, the superuser owns the copy, not the original owner. If you'd rather keep the original owner, it's a one-line change.
- **Tests:** I added three cases to `backend/tests/api/routes/test_items.py`: a successful copy, an item that doesn't exist, and a user without permission.

The frontend client in `frontend/src/client` hasn't been regenerated, so it doesn't include the new endpoint yet.
