# ToDo List Application

シンプルなWebベースのToDoリストアプリケーションです。

## 概要

このアプリケーションは、ブラウザ上で動作するToDoリスト管理ツールです。サーバーサイドを必要とせず、すべてのデータは`localStorage`に保存されます。

## 機能

- **ログイン認証**: シンプルなユーザー認証機能
- **ToDo一覧表示**: 登録されたToDoをリスト形式で表示
- **ToDo作成**: 新しいToDoを追加
- **ToDo編集**: 既存のToDoを編集
- **ToDo削除**: 不要なToDoを削除
- **完了チェック**: ToDoの完了/未完了を切り替え

## ファイル構成

```
todo-list/
├── login.html          # ログイン画面
├── todolist.html       # ToDo一覧画面
├── edit.html           # ToDo登録/編集画面
├── js/
│   └── app.js          # JavaScriptロジック
└── .github/
    └── copilot-instructions.md
```

## 使用技術

- **HTML5**
- **JavaScript (ES6)**
- **Tailwind CSS** (CDN経由)
- **localStorage** (データ永続化)

## セットアップ

1. リポジトリをクローンまたはダウンロード
2. ブラウザで `login.html` を直接開く

ビルドツールやパッケージマネージャーは不要です。

## 使い方

### ログイン

`login.html` を開き、以下の認証情報でログインしてください。

| ユーザー名 | パスワード |
|-----------|-----------|
| `user`    | `pass`    |

### ToDo管理

1. ログイン後、todolist.html でToDo一覧が表示されます
2. 「新規作成」ボタンで新しいToDoを追加
3. 各ToDoの「編集」ボタンで内容を変更
4. チェックボックスで完了状態を切り替え
5. 「削除」ボタンでToDoを削除

## データ構造

ToDoデータは`localStorage`に以下の形式で保存されます：

```javascript
[
  {
    title: "タイトル",
    detail: "詳細内容",
    checked: false
  }
]
```

## 開発

### デバッグ

ブラウザの開発者ツール（DevTools）を使用してデバッグしてください。

### 主要な関数

`js/app.js` に実装されている主要な関数：

| 関数名 | 説明 |
|--------|------|
| `login()` | ユーザー認証処理 |
| `logout()` | ログアウト処理 |
| `checkLogin()` | ログイン状態確認 |
| `getTodos()` | ToDoリスト取得 |
| `saveTodos()` | ToDoリスト保存 |
| `renderTodos()` | ToDo一覧描画 |
| `toggleCheck()` | 完了状態切り替え |
| `deleteTodo()` | ToDo削除 |

## 注意事項

- 認証情報はハードコードされており、本番環境での使用は推奨しません
- データはブラウザの`localStorage`に保存されるため、ブラウザのデータをクリアすると消去されます

## ライセンス

このプロジェクトはプライベートプロジェクトです。
