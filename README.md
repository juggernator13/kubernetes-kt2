# КТ2 — контейнеризация и Kubernetes

## 1. Описание

Учебное многокомпонентное приложение для контрольной точки КТ2.

В проекте используются:

- Frontend на nginx;
- Backend на Node.js;
- Docker-образы;
- Kubernetes Deployment;
- Kubernetes Service;
- ConfigMap;
- Secret;
- Ingress;
- локальный Kubernetes-кластер kind.

Архитектура:

Browser
    |
    v
Ingress
    |------------------|
    |                  |
    v                  v
Frontend Service   Backend Service
    |                  |
    v                  v
Frontend Pods      Backend Pods
                       |
                 ConfigMap + Secret

Маршруты:

/      -> frontend-service
/api   -> backend-service

## 2. Требования

Нужно иметь:

- Docker Desktop;
- WSL2/Ubuntu или PowerShell с доступными Docker, kubectl и kind;
- kubectl;
- kind.

kind запускает Kubernetes-ноды как Docker-контейнеры.

## 3. Создание кластера

Если ранее создан старый кластер с именем practice, сначала удалить его:

    kind delete cluster --name practice

Создать кластер:

    kind create cluster --name practice --config kind-config.yaml

Проверить:

    kubectl cluster-info
    kubectl get nodes

## 4. Сборка образов

Из корня проекта:

    docker build -t my-frontend:1.0 ./frontend
    docker build -t my-backend:1.0 ./backend

Проверить:

    docker images

## 5. Загрузка образов в kind

Локальные образы Docker не считаются автоматически доступными внутри kind, поэтому загрузить их:

    kind load docker-image my-frontend:1.0 --name practice
    kind load docker-image my-backend:1.0 --name practice

## 6. Установка Ingress NGINX

Для варианта практикума с ingress-nginx:

    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

Проверить:

    kubectl get pods -n ingress-nginx

Дождаться готовности:

    kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s

## 7. Развертывание приложения

Сначала ConfigMap и Secret:

    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml

Backend:

    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml

Frontend:

    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml

Ingress:

    kubectl apply -f k8s/ingress.yaml

## 8. Проверка

Все основные ресурсы:

    kubectl get all

ConfigMap:

    kubectl get configmap
    kubectl describe configmap backend-config

Secret:

    kubectl get secret

Ingress:

    kubectl get ingress

Pods:

    kubectl get pods -o wide

Deployment:

    kubectl get deployments

Services:

    kubectl get services

## 9. Проверка ConfigMap и Secret

Посмотреть переменные окружения backend можно так:

    kubectl exec deployment/backend -- printenv | grep -E 'MESSAGE|API_KEY'

В результате MESSAGE должен содержать значение из ConfigMap.

API_KEY должен присутствовать как переменная из Secret. В учебной работе используется условное значение.

## 10. Проверка через Ingress

Frontend:

    curl http://localhost:8080/

Backend:

    curl http://localhost:8080/api

Ожидаемый ответ backend:

    {"message":"Hello from Kubernetes ConfigMap","apiKeyConfigured":true}

Если используется другой способ проброса портов или Ingress Controller, порт может отличаться.

## 11. Что показать на сдаче

Основной вывод:

    kubectl get all

Дополнительно:

    kubectl get configmap
    kubectl get secret
    kubectl get ingress
    kubectl get pods -o wide

Показать успешный запрос:

    curl http://localhost:8080/

и:

    curl http://localhost:8080/api

## 12. Что объяснить преподавателю

Frontend:

nginx-сервер раздает статическую HTML-страницу.

Backend:

Node.js-приложение отвечает на /api и получает конфигурацию через переменные окружения.

Deployment:

поддерживает заданное количество реплик. В проекте по две реплики frontend и backend.

Service:

дает стабильный внутренний адрес и направляет запросы к Pod-ам по labels.

ConfigMap:

хранит неконфиденциальную конфигурацию MESSAGE отдельно от Docker-образа.

Secret:

хранит условное чувствительное значение API_KEY. В Kubernetes Secret не следует считать шифрованием сам по себе: стандартное представление значения — base64.

Ingress:

является единой HTTP-точкой входа и направляет / на frontend, а /api на backend.

Если удалить один Pod:

Deployment обнаружит, что фактическое количество Pod-ов меньше желаемого, и создаст новый Pod.

## 13. Полезные команды

Посмотреть события:

    kubectl get events --sort-by=.lastTimestamp

Посмотреть описание Pod:

    kubectl describe pod <pod-name>

Посмотреть логи backend:

    kubectl logs deployment/backend

Посмотреть логи frontend:

    kubectl logs deployment/frontend

Удалить один backend Pod:

    kubectl delete pod <pod-name>

После удаления снова:

    kubectl get pods

Kubernetes должен создать новый Pod.

## 14. Очистка

Удалить приложение:

    kubectl delete -f k8s/

Удалить кластер:

    kind delete cluster --name practice
