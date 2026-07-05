# syntax=docker/dockerfile:1

FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

FROM alpine:3.20
WORKDIR /app
RUN adduser -D -g '' appuser

COPY --from=builder /bin/api /app/api
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

USER appuser
EXPOSE 8080
CMD ["/app/api"]
