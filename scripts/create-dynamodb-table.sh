#!/bin/bash

# Script to create the audit-logs table in DynamoDB Local

ENDPOINT_URL="${AWS_DYNAMODB_ENDPOINT:-http://localhost:8000}"
TABLE_NAME="${DYNAMODB_AUDIT_TABLE_NAME:-audit-logs}"
REGION="${AWS_REGION:-us-east-1}"

echo "Creating table: $TABLE_NAME"
echo "Endpoint: $ENDPOINT_URL"
echo "Region: $REGION"

aws dynamodb create-table \
  --endpoint-url "$ENDPOINT_URL" \
  --region "$REGION" \
  --table-name "$TABLE_NAME" \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=entityTypeEntityId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "EntityTypeEntityIdIndex",
        "KeySchema": [
          {
            "AttributeName": "entityTypeEntityId",
            "KeyType": "HASH"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      },
      {
        "IndexName": "UserIdIndex",
        "KeySchema": [
          {
            "AttributeName": "userId",
            "KeyType": "HASH"
          }
        ],
        "Projection": {
          "ProjectionType": "ALL"
        }
      }
    ]' \
  --output json

echo ""
echo "Table created successfully!"
echo "You can verify it with: aws dynamodb list-tables --endpoint-url $ENDPOINT_URL --region $REGION"
