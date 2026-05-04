import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

async function testEndpoints() {
  console.log('\n=== Testing Courts & Firms Endpoints ===\n');

  // Test courts
  console.log('1. Testing courts endpoint...');
  const courtsRes = await fetch(`${endpoint}/databases/${databaseId}/collections/courts/documents`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  const courtsData = await courtsRes.json();
  if (!courtsRes.ok) throw new Error('Courts fetch failed: ' + courtsData.message);
  console.log(`   ✅ Courts loaded: ${courtsData.documents?.length || 0} records`);

  // Test users for firms (role=firm)
  console.log('2. Testing users query for firms...');
  const query = new URLSearchParams();
  query.append('queries[0]', JSON.stringify({ method: 'equal', attribute: 'role', values: ['firm'] }));
  const firmsRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?${query}`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  const firmsData = await firmsRes.json();
  if (!firmsRes.ok) throw new Error('Firms fetch failed: ' + firmsData.message);
  console.log(`   ✅ Firms loaded: ${firmsData.documents?.length || 0} records`);

  // Test organizations query (for firms marketplace enrichment)
  const firmIds = firmsData.documents?.map(f => f.organization_id).filter(id => id) || [];
  if (firmIds.length > 0) {
    const orgIds = [...new Set(firmIds)];
    console.log('3. Testing organizations query for those firms...');
    const orgQuery = orgIDs.length === 1
      ? `queries[0]=${JSON.stringify({ method: 'equal', attribute: 'id', values: [orgIDs[0]] })}`
      : `queries[0]=${JSON.stringify({ method: 'or', attribute: '', values: orgIDs.map(id => ({ method: 'equal', attribute: 'id', values: [id] })) })}`;
    const orgRes = await fetch(`${endpoint}/databases/${databaseId}/collections/organizations/documents?${orgQuery}`, {
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    });
    const orgData = await orgRes.json();
    if (!orgRes.ok) throw new Error('Organizations fetch failed: ' + orgData.message);
    console.log(`   ✅ Organizations loaded: ${orgData.documents?.length || 0} records`);
  }

  console.log('\n✅ All critical data endpoints are functional.\n');
}

testEndpoints().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
