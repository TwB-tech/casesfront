import { Client, Account, ID } from 'appwrite';
import { config } from 'dotenv';
config();

const client = new Client()
  .setEndpoint('https://tor.cloud.appwrite.io/v1')
  .setProject('69e8bc1500162d3defdb')
  .setKey('standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c');

const account = new Account(client);

async function resetPassword(email, newPassword) {
  try {
    // List users via Account API with JWT (admin privileges)
    // Actually the standard SDK doesn't have listUsers; we need to use client's fetch directly
    const usersRes = await client.fetch('/users', {
      method: 'GET',
      queries: [
        { attribute: 'email', operator: 'equal', value: email }
      ]
    });
    const users = await usersRes.json();
    if (!users.users || users.users.length === 0) {
      console.log(`User ${email} not found`);
      return;
    }
    const user = users.users[0];
    const userId = user.$id;

    // Update password via PATCH /users/:id
    const patchRes = await client.fetch(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword })
    });
    if (patchRes.ok) {
      console.log(`✅ Password reset for ${email}`);
    } else {
      const data = await patchRes.json();
      console.error(`❌ Failed to reset password for ${email}:`, data);
    }
  } catch (e) {
    console.error(`❌ Error resetting password for ${email}:`, e.message);
  }
}

async function main() {
  console.log('=== Resetting test user passwords ===\n');
  await resetPassword('advocate@wakiliworld.local', 'demo1234');
  await resetPassword('client@wakiliworld.local', 'demo1234');
  await resetPassword('admin@wakiliworld.local', 'demo1234');
  console.log('\n✅ Done');
}

main().catch(console.error);
