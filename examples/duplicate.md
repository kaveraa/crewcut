# Duplicate an item

Ticket: "Add an endpoint to duplicate an item."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness, unchanged, crewcut 0.15.4, 2026-11-13 (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)). The diff is what the session left behind, the reply is its last message; neither is edited.

## Without crewcut: 20 lines plus 44 of tests, 7 turns, 109k tokens, 0.16 USD

```diff
diff --git a/backend/app/api/routes/items.py b/backend/app/api/routes/items.py
index f0eb30e..fdc34c3 100644
--- a/backend/app/api/routes/items.py
+++ b/backend/app/api/routes/items.py
@@ -72,6 +72,26 @@ def create_item(
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
+    item_in = ItemCreate.model_validate(item)
+    new_item = Item.model_validate(item_in, update={"owner_id": current_user.id})
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
index 3e82cd0..f8aea7b 100644
--- a/backend/tests/api/routes/test_items.py
+++ b/backend/tests/api/routes/test_items.py
@@ -79,6 +79,50 @@ def test_read_items(
     assert len(content["data"]) >= 2
 
 
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
+    assert content["title"] == item.title
+    assert content["description"] == item.description
+    assert content["id"] != str(item.id)
+    # The original item is untouched and still exists
+    original = client.get(
+        f"{settings.API_V1_STR}/items/{item.id}",
+        headers=superuser_token_headers,
+    )
+    assert original.status_code == 200
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
 def test_update_item(
     client: TestClient, superuser_token_headers: dict[str, str], db: Session
 ) -> None:
```

Reply:

I added `POST /items/{id}/duplicate` to `backend/app/api/routes/items.py`, with three tests in `backend/tests/api/routes/test_items.py`. I haven't run the tests.

**How it works:**
- It looks up the item and checks permissions the same way the read, update and delete endpoints do: you get a 404 if the item doesn't exist, and a 403 if you aren't a superuser and don't own it.
- It copies the item's fields by passing the original through the `ItemCreate` schema. The copy gets a new `id` and `created_at`, and the response is the new item.
- If fields are added to `ItemCreate` later, they will be copied too.

**Tests:**
- A successful copy has the same title and description, a different `id`, and leaves the original in place.
- Duplicating a missing item returns 404.
- A normal user duplicating someone else's item gets 403.

**Decisions for you:**
- **Owner:** the copy belongs to whoever makes the request. So when a superuser duplicates another user's item, the superuser owns the copy. To keep the original owner instead, change `current_user.id` to `item.owner_id`.
- **Title:** the copy keeps the exact same title. I didn't add a suffix like " (copy)" because titles are limited to 255 characters, and a suffix could push a long title over that limit.

## With crewcut: 19 lines plus 39 of tests, 9 turns, 139k tokens, 0.19 USD

```diff
diff --git a/backend/app/api/routes/items.py b/backend/app/api/routes/items.py
index f0eb30e..881a723 100644
--- a/backend/app/api/routes/items.py
+++ b/backend/app/api/routes/items.py
@@ -72,6 +72,25 @@ def create_item(
     return item
 
 
+@router.post("/{id}/duplicate", response_model=ItemPublic)
+def duplicate_item(
+    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
+) -> Any:
+    """
+    Duplicate an item.
+    """
+    item = session.get(Item, id)
+    if not item:
+        raise HTTPException(status_code=404, detail="Item not found")
+    if not current_user.is_superuser and (item.owner_id != current_user.id):
+        raise HTTPException(status_code=403, detail="Not enough permissions")
+    copy = Item(title=item.title, description=item.description, owner_id=item.owner_id)
+    session.add(copy)
+    session.commit()
+    session.refresh(copy)
+    return copy
+
+
 @router.put("/{id}", response_model=ItemPublic)
 def update_item(
     *,
diff --git a/backend/tests/api/routes/test_items.py b/backend/tests/api/routes/test_items.py
index 3e82cd0..e2f7a3f 100644
--- a/backend/tests/api/routes/test_items.py
+++ b/backend/tests/api/routes/test_items.py
@@ -162,3 +162,42 @@ def test_delete_item_not_enough_permissions(
     assert response.status_code == 403
     content = response.json()
     assert content["detail"] == "Not enough permissions"
+
+
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
+    assert content["owner_id"] == str(item.owner_id)
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
```

Reply:

I added `POST /items/{id}/duplicate` in `backend/app/api/routes/items.py`. It uses the same 404 and 403 checks as the other item routes and creates a new item with the same title and description, plus three tests in `backend/tests/api/routes/test_items.py`. The copy belongs to the original item's owner, even when a superuser makes it, and I haven't run the tests.
