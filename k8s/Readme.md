# Introduction to cert-manager for Kubernetes

## We need a Kubernetes cluster

## Installation 

You can find the latest release for `cert-manager` on their [GitHub Releases page](https://github.com/jetstack/cert-manager/) <br/>

```
# install cert-manager 

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.9.1/cert-manager.yaml
```

## Create Let's Encrypt Issuer for our cluster

```
# apply letsencrypt cert issuer

kubectl apply -f letsencrypt-prod.yaml
```

## Issue Certificate

```
# issue certificate

kubectl apply -f certificate.yaml
```

## Digital Ocean Pod Communication (Optional)

This step is optional only if not using Digitalocean and use ingress controller version 1.3.0

```
# apply ingress svc for cross pod communication

kubectl apply -f ingress-nginx-svc.yaml
```

All done!!
