# SonarQube Cloud Integration Setup

This guide explains how to set up SonarQube Cloud integration with GitHub Actions.

## Prerequisites

1. A SonarQube Cloud account (sign up at https://sonarcloud.io)
2. A GitHub repository

## Step 1: Configure SonarQube Cloud Project

1. Log in to [SonarQube Cloud](https://sonarcloud.io)
2. Note your **Organization Key** (visible in the top navigation or in **My Account** → **Organizations**)
3. Go to **Projects** → **Create Project** → **From GitHub**
4. Select your GitHub organization/user and repository
5. SonarQube will create a project key (e.g., `nestjs-hexagonal-architecture`)
6. Update `sonar-project.properties` with your organization key (replace `your-organization-key` with your actual organization key)

## Step 2: Generate SonarQube Token

1. In SonarQube Cloud, go to **My Account** → **Security**
2. Generate a new token with a descriptive name (e.g., "GitHub Actions")
3. **Copy the token immediately** (you won't be able to see it again)

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** and add:

### Required Secrets:

- `SONAR_TOKEN`: The SonarQube token generated in Step 2
- `SONAR_HOST_URL`: Your SonarQube Cloud URL (usually `https://sonarcloud.io`)

### Optional Secrets (for tests):

- `E2E_DATABASE_URL`: Database URL for E2E tests
- `AWS_REGION`: AWS region for DynamoDB
- `AWS_DYNAMODB_ENDPOINT`: DynamoDB endpoint
- `DYNAMODB_AUDIT_TABLE_NAME`: DynamoDB table name

## Step 4: Verify sonar-project.properties

Ensure `sonar-project.properties` exists in the root of your repository with the correct `sonar.projectKey` matching your SonarQube Cloud project.

## Step 5: Configure GitHub Actions Permissions

In your repository settings:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**

## Step 6: Push and Test

Push the workflow file to your repository. The analysis will run automatically on:

- Pushes to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

## Troubleshooting

- **Token issues**: Ensure `SONAR_TOKEN` is correctly set in GitHub Secrets
- **Project key mismatch**: Verify `sonar.projectKey` in `sonar-project.properties` matches your SonarQube project
- **Coverage not showing**: Ensure `jest` is configured to generate `lcov.info` in the `coverage` directory
