import dotenv from 'dotenv'
dotenv.config()

import { readFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { Octokit } from 'octokit';
import { createAppAuth } from '@octokit/auth-app';
import sodium from 'tweetsodium';
import YAML from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

const installationId = process.env.GH_INSTALLATION_ID;

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GH_APP_ID,
    privateKey: process.env.GH_PRIVATE_KEY,
    installationId,
  },
});

async function getConfig() {
  const file = await readFile(`${__dirname}/../config.yml`, 'utf-8');
  return YAML.parse(file);
}

async function createOrUpdateRepoSecret({ repo, secret }) {
  const { data: { key_id, key } } = await octokit.rest.actions.getRepoPublicKey({
    owner: org,
    repo,
  });

  // Convert the message and key to Uint8Array's (Buffer implements that interface)
  const messageBytes = Buffer.from(secret.value);
  const keyBytes = Buffer.from(key, 'base64');

  // Encrypt using LibSodium.
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);

  return octokit.rest.actions.createOrUpdateRepoSecret({
    owner: org,
    repo,
    secret_name: secret.key,
    encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
    key_id
  });
}

const { org, tokens } = await getConfig();
console.log({ org });

for(const { name = 'REPO_GITHUB_TOKEN', permissions, repository, targets } of tokens) {
  console.log('Processing', { name, repository, permissions, targets });

  const { data: { token }} = await octokit.rest.apps.createInstallationAccessToken({
    installation_id: installationId,
    permissions,
    repositories: targets || [repository]
  });

  await createOrUpdateRepoSecret({
    repo: repository,
    secret: {
      key: name,
      value: token
    }
  });
}
