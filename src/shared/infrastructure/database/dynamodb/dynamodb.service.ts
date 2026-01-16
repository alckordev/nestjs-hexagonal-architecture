import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DynamoDBService.name);
  private readonly client: DynamoDBClient;
  private readonly docClient: DynamoDBDocumentClient;

  constructor(private readonly config: ConfigService) {
    const region = config.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = config.get<string>('AWS_DYNAMODB_ENDPOINT'); // Optional, for local development

    const clientConfig: DynamoDBClientConfig = {
      region,
    };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    this.client = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });

    this.logger.log(`DynamoDB client initialized for region: ${region}`);
  }

  onModuleInit() {
    this.logger.log('DynamoDB service initialized');
  }

  onModuleDestroy() {
    this.client.destroy();
    this.logger.log('DynamoDB service destroyed');
  }

  getDocumentClient(): DynamoDBDocumentClient {
    return this.docClient;
  }

  getClient(): DynamoDBClient {
    return this.client;
  }
}
