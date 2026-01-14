# Script to create the audit-logs table in DynamoDB Local (PowerShell)

$ENDPOINT_URL = if ($env:AWS_DYNAMODB_ENDPOINT) { $env:AWS_DYNAMODB_ENDPOINT } else { "http://localhost:8000" }
$TABLE_NAME = if ($env:DYNAMODB_AUDIT_TABLE_NAME) { $env:DYNAMODB_AUDIT_TABLE_NAME } else { "audit-logs" }
$REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "Creating table: $TABLE_NAME"
Write-Host "Endpoint: $ENDPOINT_URL"
Write-Host "Region: $REGION"

$gsiDefinition = @"
[
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
]
"@

$gsiFile = New-TemporaryFile
$gsiDefinition | Out-File -FilePath $gsiFile.FullName -Encoding utf8

try {
  aws dynamodb create-table `
    --endpoint-url "$ENDPOINT_URL" `
    --region "$REGION" `
    --table-name "$TABLE_NAME" `
    --attribute-definitions `
      AttributeName=id,AttributeType=S `
      AttributeName=entityTypeEntityId,AttributeType=S `
      AttributeName=userId,AttributeType=S `
    --key-schema `
      AttributeName=id,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --global-secondary-indexes "file://$($gsiFile.FullName)" `
    --output json

  Write-Host ""
  Write-Host "Table created successfully!"
  Write-Host "You can verify it with: aws dynamodb list-tables --endpoint-url $ENDPOINT_URL --region $REGION"
}
finally {
  Remove-Item $gsiFile.FullName
}
