# syntax=docker/dockerfile:1

# build stage

FROM golang:1.21-alpine AS buildstage

WORKDIR /app

COPY . .
RUN go mod download

RUN go build -o /payapid cmd/payapid/*

# deploy stage

FROM alpine:latest

WORKDIR /

COPY --from=buildstage /payapid /payapid

EXPOSE 5000

CMD [ "/payapid" ]