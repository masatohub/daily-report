# 営業日報システム API仕様書

---

## 概要

### Base URL

```
/api/v1
```

### 認証

JWT Bearer トークンを使用する。ログイン以外の全エンドポイントで必須。

```
Authorization: Bearer <token>
```

### 共通レスポンス形式

#### 成功

```json
{
  "data": { ... }
}
```

一覧系はページネーション情報を付与する。

```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20
  }
}
```

#### エラー

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [{ "field": "report_date", "message": "報告日は必須です" }]
  }
}
```

### 共通エラーコード

| HTTPステータス | code                    | 説明                 |
| -------------- | ----------------------- | -------------------- |
| 400            | `VALIDATION_ERROR`      | バリデーションエラー |
| 401            | `UNAUTHORIZED`          | 未認証               |
| 403            | `FORBIDDEN`             | 権限なし             |
| 404            | `NOT_FOUND`             | リソースが存在しない |
| 409            | `CONFLICT`              | 一意制約違反         |
| 500            | `INTERNAL_SERVER_ERROR` | サーバーエラー       |

---

## エンドポイント一覧

| メソッド | パス                          | 説明             | アクセス可能ロール |
| -------- | ----------------------------- | ---------------- | ------------------ |
| POST     | `/auth/login`                 | ログイン         | 全員               |
| POST     | `/auth/logout`                | ログアウト       | 全員               |
| GET      | `/daily-reports`              | 日報一覧取得     | 全員               |
| POST     | `/daily-reports`              | 日報作成         | 営業               |
| GET      | `/daily-reports/:id`          | 日報詳細取得     | 全員               |
| PUT      | `/daily-reports/:id`          | 日報更新         | 営業（自分のみ）   |
| POST     | `/daily-reports/:id/comments` | コメント投稿     | 上長               |
| GET      | `/customers`                  | 顧客一覧取得     | 全員               |
| POST     | `/customers`                  | 顧客登録         | 上長               |
| GET      | `/customers/:id`              | 顧客詳細取得     | 全員               |
| PUT      | `/customers/:id`              | 顧客更新         | 上長               |
| DELETE   | `/customers/:id`              | 顧客削除         | 上長               |
| GET      | `/users`                      | ユーザー一覧取得 | 上長               |
| POST     | `/users`                      | ユーザー登録     | 上長               |
| GET      | `/users/:id`                  | ユーザー詳細取得 | 上長               |
| PUT      | `/users/:id`                  | ユーザー更新     | 上長               |
| DELETE   | `/users/:id`                  | ユーザー削除     | 上長               |

---

## 認証

### POST `/auth/login`

ログインしてアクセストークンを取得する。

#### リクエスト

```json
{
  "email": "tanaka@example.com",
  "password": "password123"
}
```

#### レスポンス `200 OK`

```json
{
  "data": {
    "access_token": "eyJhbGci...",
    "user": {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "sales"
    }
  }
}
```

#### エラー

| ステータス | code           | 条件                                 |
| ---------- | -------------- | ------------------------------------ |
| 401        | `UNAUTHORIZED` | メールアドレスまたはパスワードが不正 |

---

### POST `/auth/logout`

トークンを無効化する。

#### レスポンス `204 No Content`

---

## 日報

### GET `/daily-reports`

日報一覧を取得する。営業は自分の日報のみ取得できる。上長は全営業の日報を取得できる。

#### クエリパラメータ

| パラメータ | 型                | 必須 | 説明                                      |
| ---------- | ----------------- | ---- | ----------------------------------------- |
| `from`     | date (YYYY-MM-DD) | ―    | 期間絞り込み（開始）。デフォルト: 当月1日 |
| `to`       | date (YYYY-MM-DD) | ―    | 期間絞り込み（終了）。デフォルト: 今日    |
| `user_id`  | integer           | ―    | 上長のみ指定可。指定なしの場合は全員      |
| `page`     | integer           | ―    | ページ番号。デフォルト: 1                 |
| `per_page` | integer           | ―    | 件数。デフォルト: 20、最大: 100           |

#### レスポンス `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "report_date": "2026-05-19",
      "user": {
        "id": 1,
        "name": "田中太郎"
      },
      "visit_count": 3,
      "problem": "A社の予算が縮小傾向にあり...",
      "plan": "B社へのフォローアップ電話を...",
      "comment_count": 2,
      "created_at": "2026-05-19T09:00:00Z",
      "updated_at": "2026-05-19T10:30:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "per_page": 20
  }
}
```

---

### POST `/daily-reports`

日報を新規作成する。営業担当者のみ実行可能。

#### リクエスト

```json
{
  "report_date": "2026-05-19",
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "新製品ラインナップの提案を実施。来週デモ実施の約束を取り付けた。"
    },
    {
      "customer_id": 15,
      "visit_content": "契約更新の確認。次回見積もり持参で再訪予定。"
    }
  ],
  "problem": "A社の担当者が異動になり、引き継ぎが不透明な状況。",
  "plan": "A社新担当者へのアポイントを取る。B社デモ資料を準備する。"
}
```

#### バリデーション

| フィールド                       | ルール                         |
| -------------------------------- | ------------------------------ |
| `report_date`                    | 必須                           |
| `visit_records`                  | 1件以上必須                    |
| `visit_records[].customer_id`    | 必須、顧客マスタに存在すること |
| `visit_records[].visit_content`  | 必須                           |
| `report_date` + ログインユーザー | 同日の日報が既に存在しないこと |

#### レスポンス `201 Created`

```json
{
  "data": {
    "id": 42
  }
}
```

#### エラー

| ステータス | code               | 条件                     |
| ---------- | ------------------ | ------------------------ |
| 400        | `VALIDATION_ERROR` | バリデーション違反       |
| 403        | `FORBIDDEN`        | 営業以外が実行           |
| 409        | `CONFLICT`         | 同日の日報が既に存在する |

---

### GET `/daily-reports/:id`

日報詳細を取得する。営業は自分の日報のみ参照可能。

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 42,
    "report_date": "2026-05-19",
    "user": {
      "id": 1,
      "name": "田中太郎"
    },
    "visit_records": [
      {
        "id": 101,
        "customer": {
          "id": 10,
          "name": "山田商事",
          "company_name": "山田商事株式会社"
        },
        "visit_content": "新製品ラインナップの提案を実施。来週デモ実施の約束を取り付けた。"
      }
    ],
    "problem": "A社の担当者が異動になり、引き継ぎが不透明な状況。",
    "plan": "A社新担当者へのアポイントを取る。B社デモ資料を準備する。",
    "comments": [
      {
        "id": 201,
        "target": "problem",
        "content": "A社の新担当者情報を営業部共有チャンネルに流しておきます。",
        "user": {
          "id": 2,
          "name": "鈴木部長"
        },
        "created_at": "2026-05-19T12:00:00Z"
      }
    ],
    "created_at": "2026-05-19T09:00:00Z",
    "updated_at": "2026-05-19T10:30:00Z"
  }
}
```

#### エラー

| ステータス | code        | 条件                             |
| ---------- | ----------- | -------------------------------- |
| 403        | `FORBIDDEN` | 他の営業の日報を参照しようとした |
| 404        | `NOT_FOUND` | 日報が存在しない                 |

---

### PUT `/daily-reports/:id`

日報を更新する。営業担当者が自分の日報のみ更新可能。

#### リクエスト

POST `/daily-reports` と同じ形式。`report_date` は変更不可。

```json
{
  "visit_records": [
    {
      "customer_id": 10,
      "visit_content": "（更新後）新製品提案。デモ日程を来週水曜に確定。"
    }
  ],
  "problem": "A社担当者異動。新担当者との関係構築が急務。",
  "plan": "A社新担当者へ挨拶メールを送付。B社デモ資料完成させる。"
}
```

**訪問記録は全件置き換え**（差分更新ではなく、送信した配列で上書き）

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 42
  }
}
```

#### エラー

| ステータス | code               | 条件                         |
| ---------- | ------------------ | ---------------------------- |
| 400        | `VALIDATION_ERROR` | バリデーション違反           |
| 403        | `FORBIDDEN`        | 他人の日報を更新しようとした |
| 404        | `NOT_FOUND`        | 日報が存在しない             |

---

### POST `/daily-reports/:id/comments`

日報にコメントを投稿する。上長のみ実行可能。

#### リクエスト

```json
{
  "target": "problem",
  "content": "A社の新担当者情報を営業部共有チャンネルに流しておきます。"
}
```

| フィールド | 型     | 必須 | 説明                        |
| ---------- | ------ | ---- | --------------------------- |
| `target`   | string | ○    | `"problem"` または `"plan"` |
| `content`  | string | ○    | コメント本文                |

#### レスポンス `201 Created`

```json
{
  "data": {
    "id": 201,
    "target": "problem",
    "content": "A社の新担当者情報を営業部共有チャンネルに流しておきます。",
    "user": {
      "id": 2,
      "name": "鈴木部長"
    },
    "created_at": "2026-05-19T12:00:00Z"
  }
}
```

#### エラー

| ステータス | code               | 条件                |
| ---------- | ------------------ | ------------------- |
| 400        | `VALIDATION_ERROR` | `target` が不正な値 |
| 403        | `FORBIDDEN`        | 上長以外が実行      |
| 404        | `NOT_FOUND`        | 日報が存在しない    |

---

## 顧客マスタ

### GET `/customers`

顧客一覧を取得する。

#### クエリパラメータ

| パラメータ     | 型      | 必須 | 説明                      |
| -------------- | ------- | ---- | ------------------------- |
| `name`         | string  | ―    | 顧客名（部分一致）        |
| `company_name` | string  | ―    | 会社名（部分一致）        |
| `page`         | integer | ―    | デフォルト: 1             |
| `per_page`     | integer | ―    | デフォルト: 20、最大: 100 |

#### レスポンス `200 OK`

```json
{
  "data": [
    {
      "id": 10,
      "name": "山田商事",
      "company_name": "山田商事株式会社",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ],
  "meta": {
    "total": 80,
    "page": 1,
    "per_page": 20
  }
}
```

---

### POST `/customers`

顧客を登録する。上長のみ実行可能。

#### リクエスト

```json
{
  "name": "山田商事",
  "company_name": "山田商事株式会社"
}
```

#### バリデーション

| フィールド     | ルール |
| -------------- | ------ |
| `name`         | 必須   |
| `company_name` | 必須   |

#### レスポンス `201 Created`

```json
{
  "data": {
    "id": 10
  }
}
```

---

### GET `/customers/:id`

顧客詳細を取得する。

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 10,
    "name": "山田商事",
    "company_name": "山田商事株式会社",
    "created_at": "2026-01-15T00:00:00Z"
  }
}
```

---

### PUT `/customers/:id`

顧客情報を更新する。上長のみ実行可能。

#### リクエスト

```json
{
  "name": "山田商事（更新）",
  "company_name": "山田商事株式会社"
}
```

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 10
  }
}
```

---

### DELETE `/customers/:id`

顧客を削除する。上長のみ実行可能。

訪問記録に紐づいている顧客は削除不可。

#### レスポンス `204 No Content`

#### エラー

| ステータス | code       | 条件                               |
| ---------- | ---------- | ---------------------------------- |
| 409        | `CONFLICT` | 訪問記録に紐づいているため削除不可 |

---

## ユーザーマスタ

### GET `/users`

ユーザー一覧を取得する。上長のみ実行可能。

#### クエリパラメータ

| パラメータ | 型      | 必須 | 説明                      |
| ---------- | ------- | ---- | ------------------------- |
| `page`     | integer | ―    | デフォルト: 1             |
| `per_page` | integer | ―    | デフォルト: 20、最大: 100 |

#### レスポンス `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "role": "sales",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "per_page": 20
  }
}
```

---

### POST `/users`

ユーザーを登録する。上長のみ実行可能。

#### リクエスト

```json
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "securepassword",
  "role": "sales"
}
```

#### バリデーション

| フィールド | ルール                             |
| ---------- | ---------------------------------- |
| `name`     | 必須                               |
| `email`    | 必須、メール形式、ユニーク         |
| `password` | 必須、8文字以上                    |
| `role`     | 必須、`"sales"` または `"manager"` |

#### レスポンス `201 Created`

```json
{
  "data": {
    "id": 1
  }
}
```

#### エラー

| ステータス | code       | 条件                         |
| ---------- | ---------- | ---------------------------- |
| 409        | `CONFLICT` | メールアドレスが既に登録済み |

---

### GET `/users/:id`

ユーザー詳細を取得する。上長のみ実行可能。

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "role": "sales",
    "created_at": "2026-01-10T00:00:00Z"
  }
}
```

---

### PUT `/users/:id`

ユーザー情報を更新する。上長のみ実行可能。

#### リクエスト

```json
{
  "name": "田中太郎",
  "email": "tanaka@example.com",
  "password": "newpassword",
  "role": "sales"
}
```

`password` は省略可。省略した場合はパスワードを変更しない。

#### レスポンス `200 OK`

```json
{
  "data": {
    "id": 1
  }
}
```

---

### DELETE `/users/:id`

ユーザーを削除する。上長のみ実行可能。自分自身は削除不可。

#### レスポンス `204 No Content`

#### エラー

| ステータス | code        | 条件                       |
| ---------- | ----------- | -------------------------- |
| 403        | `FORBIDDEN` | 自分自身を削除しようとした |
