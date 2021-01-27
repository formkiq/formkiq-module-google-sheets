#!/bin/bash

docker-compose up -d

until aws --region us-east-1 --no-sign-request --endpoint-url=http://localhost:4566 s3 ls; do
  >&2 echo "S3 is unavailable - sleeping"
  sleep 1
done

echo "S3 is available"

export AWS_ACCESS_KEY_ID=AAAA
export AWS_SECRET_ACCESS_KEY=BBBBBB
export AWS_DEFAULT_REGION=us-east-1

aws ssm put-parameter --endpoint-url=http://localhost:4566 --overwrite --type SecureString --name '/formkiq/prod/auth/google/spreadsheets' --value "$(cat privateKey.json)"