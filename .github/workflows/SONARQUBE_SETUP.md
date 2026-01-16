# SonarQube Cloud Integration Setup

This guide explains how to set up SonarQube Cloud integration with GitHub Actions.

## Prerequisites

1. A SonarQube Cloud account (sign up at https://sonarcloud.io)
2. A GitHub repository

## Step 1: Create SonarQube Cloud Project

**IMPORTANT**: You must create the project in SonarQube Cloud before running the scan.

1. Log in to [SonarQube Cloud](https://sonarcloud.io)
2. Note your **Organization Key** (visible in the top navigation or in **My Account** → **Organizations**)
3. Go to **Projects** → **Create Project** → **From GitHub**
4. Select your GitHub organization/user and repository
5. SonarQube will create a project with a key (e.g., `alckordev_nestjs-hexagonal-architecture`)
6. **Verify the project key** in the project settings (it might be prefixed with your organization key)
7. Update `sonar-project.properties`:
   - Set `sonar.organization` to your organization key (e.g., `alckordev`)
   - Ensure `sonar.projectKey` matches the project key in SonarQube Cloud (check project settings if unsure)

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

- **Project does not exist error**: The project must be created in SonarQube Cloud before running the scan. Go to SonarQube Cloud → Projects → Create Project → From GitHub
- **Token issues**: Ensure `SONAR_TOKEN` is correctly set in GitHub Secrets
- **Project key mismatch**: Verify `sonar.projectKey` in `sonar-project.properties` matches your SonarQube project key (check project settings in SonarQube Cloud)
- **Organization key**: Make sure `sonar.organization` in `sonar-project.properties` matches your SonarQube organization key
- **Coverage not showing**: Ensure `jest` is configured to generate `lcov.info` in the `coverage` directory
