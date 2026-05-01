const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const endpoint = 'https://tor.cloud.appwrite.io/v1';

async function resetPassword(email, newPassword) {
  // Find user by email using proper query format: queries as JSON array
  const queryJSON = JSON.stringify([{ attribute: 'email', operator: 'equal', value: email }]);
  const listRes = await fetch(`${endpoint}/users?queries=${encodeURIComponent(queryJSON)}`, {
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    },
  });
  const listData = await listRes.json();
  if (!listRes.ok) {
    throw new Error(`List failed: ${JSON.stringify(listData)}`);
  }
  if (!listData.users || listData.users.length === 0) {
    console.log(`User ${email} not found`);
    return;
  }
  const user = listData.users[0];
  const userId = user.$id;
  // Update password
  const patchRes = await fetch(`${endpoint}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });
  const patchData = await patchRes.json();
  if (patchRes.ok) {
    console.log(`✅ Password reset for ${email} (userId: ${userId})`);
  } else {
    console.error(`❌ Failed to reset password for ${email}:`, patchData);
  }
}

async function main() {
  await resetPassword('advocate@wakiliworld.local', 'demo1234');
  await resetPassword('client@wakiliworld.local', 'demo1234');
  await resetPassword('admin@wakiliworld.local', 'demo1234');
}

main().catch(console.error);
