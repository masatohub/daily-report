PROJECT_ID  := daily-report-masato
REGION      := asia-northeast1
SERVICE     := daily-report
REGISTRY    := $(REGION)-docker.pkg.dev
REPO        := $(REGISTRY)/$(PROJECT_ID)/$(SERVICE)
IMAGE       := $(REPO)/$(SERVICE)
GIT_SHA     := $(shell git rev-parse --short HEAD)

.PHONY: build push deploy release setup logs

## Docker イメージをビルドする
build:
	docker build -t $(IMAGE):$(GIT_SHA) -t $(IMAGE):latest .

## Artifact Registry へプッシュする
push:
	docker push $(IMAGE):$(GIT_SHA)
	docker push $(IMAGE):latest

## Cloud Run へデプロイする（既存イメージを使用）
deploy:
	gcloud run deploy $(SERVICE) \
		--image $(IMAGE):$(GIT_SHA) \
		--region $(REGION) \
		--project $(PROJECT_ID) \
		--platform managed \
		--allow-unauthenticated

## ビルド → プッシュ → デプロイ を一括実行
release: build push deploy

## 初回セットアップ：Artifact Registry リポジトリを作成し Docker 認証を設定
setup:
	gcloud artifacts repositories create $(SERVICE) \
		--repository-format=docker \
		--location=$(REGION) \
		--project=$(PROJECT_ID)
	gcloud auth configure-docker $(REGISTRY)

## Cloud Run のログをストリーミング表示
logs:
	gcloud run services logs tail $(SERVICE) \
		--region $(REGION) \
		--project $(PROJECT_ID)
