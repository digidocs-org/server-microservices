# Introduction to cert-manager for Kubernetes

## We need a Kubernetes cluster

## Installation 

You can find the latest release for `cert-manager` on their [GitHub Releases page](https://github.com/jetstack/cert-manager/) <br/>

For this demo, I will use K8s 1.19 and `cert-manager` [v1.0.4](https://github.com/jetstack/cert-manager/releases/tag/v1.0.4)

```

# Get a container to work in

# mount our kubeconfig file and source code
docker run -it --rm -v ${HOME}:/root/ -v ${PWD}:/work -w /work --net host alpine sh

# install kubectl
apk add --no-cache curl
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x ./kubectl
mv ./kubectl /usr/local/bin/kubectl

#test cluster access:
/work # kubectl get nodes
NAME                    STATUS   ROLES    AGE   VERSION
certmanager-control-plane   Ready    master   3m6s   v1.19.1


# get cert-manager 

cd kubernetes/cert-manager/
curl -LO https://github.com/jetstack/cert-manager/releases/download/v1.0.4/cert-manager.yaml

mv cert-manager.yaml cert-manager-1.0.4.yaml

# install cert-manager 

kubectl apply --validate=false -f cert-manager-1.0.4.yaml
```

## Cert Manager Resources

We can see our components deployed

```
kubectl -n cert-manager get all

NAME                                           READY   STATUS    RESTARTS   AGE
pod/cert-manager-86548b886-2b8x7               1/1     Running   0          77s
pod/cert-manager-cainjector-6d59c8d4f7-hrs2v   1/1     Running   0          77s
pod/cert-manager-webhook-578954cdd-tphpj       1/1     Running   0          77s

NAME                           TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/cert-manager           ClusterIP   10.96.87.136   <none>        9402/TCP   77s
service/cert-manager-webhook   ClusterIP   10.104.59.25   <none>        443/TCP    77s

NAME                                      READY   UP-TO-DATE   AVAILABLE   AGE        
deployment.apps/cert-manager              1/1     1            1           77s
deployment.apps/cert-manager-cainjector   1/1     1            1           77s
deployment.apps/cert-manager-webhook      1/1     1            1           77s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/cert-manager-86548b886               1         1         1       77s
replicaset.apps/cert-manager-cainjector-6d59c8d4f7   1         1         1       77s
replicaset.apps/cert-manager-webhook-578954cdd       1         1         1       77

```

## Test Certificate Issuing 

Let's create some test certificates

```
kubectl create ns cert-manager-test

kubectl apply -f ./selfsigned/issuer.yaml

kubectl apply -f ./selfsigned/certificate.yaml

kubectl describe certificate -n cert-manager-test
kubectl get secrets -n cert-manager-test

kubectl delete ns cert-manager-test
```

## Configuration 

https://cert-manager.io/docs/configuration/

## Ingress Controller

Let's deploy an Ingress controller: <br/>

```
kubectl create ns ingress-nginx

kubectl -n ingress-nginx apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml

kubectl -n ingress-nginx get pods

kubectl -n ingress-nginx --address 0.0.0.0 port-forward svc/ingress-nginx-controller 80
kubectl -n ingress-nginx --address 0.0.0.0 port-forward svc/ingress-nginx-controller 443
```

We should be able to access NGINX in the browser and see a `404 Not Found` page: http://localhost/
This indicates there are no routes to `/` and the ingress controller is running



## Create Let's Encrypt Issuer for our cluster

We create a `ClusterIssuer` that allows us to issue certs in any namespace

```
kubectl apply -f cert-issuer-nginx-ingress.yaml

# check the issuer
kubectl describe clusterissuer letsencrypt-cluster-issuer

```



```

## Issue Certificate 

```
kubectl apply -f certificate.yaml

# check the cert has been issued 

kubectl describe certificate example-app