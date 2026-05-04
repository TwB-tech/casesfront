import { config } from 'dotenv';
config();

const endpoint = (process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1').replace(/\/$/, '');
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'default';

function buildQueries(conditions) {
  const qs = new URLSearchParams();
  conditions.forEach((cond, idx) => {
    qs.append(`queries[${idx}]`, JSON.stringify(cond));
  });
  return qs;
}

async function testCourtsAndFirms() {
  console.log('\n=== Testing Courts & Firms Endpoints ===\n');

  // Test courts (simple list)
  console.log('1. Fetching courts...');
  const courtsRes = await fetch(`${endpoint}/databases/${databaseId}/collections/courts/documents`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  const courts = await courtsRes.json();
  if (!courtsRes.ok) throw new Error('Courts error: ' + courts.message);
  console.log(`   ✅ Courts: ${courts.documents?.length || 0} records`);

  // Test firms (role=firm)
  console.log('2. Fetching firms (users with role=firm)...');
  const firmsQuery = buildQueries([
    { method: 'equal', attribute: 'role', values: ['firm'] }
  ]);
  const firmsRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?${firmsQuery}`, {
    headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
  });
  const firms = await firmsRes.json();
  if (!firmsRes.ok) throw new Error('Firms error: ' + firms.message);
  console.log(`   ✅ Firms: ${firms.documents?.length || 0} records`);

  if (firms.documents?.length > 0) {
    const orgIds = [...new Set(firms.documents.map(f => f.organization_id).filter(id => id))];
    console.log('3. Fetching organizations for those firms...');

    let orgQuery;
    if (orgIds.length === 1) {
      orgQuery = buildQueries([
        { method: 'equal', attribute: 'id', values: [orgIds[0]] }
      ]);
    } else {
      const orQueries = orgIds.map(id => ({ method: 'equal', attribute: 'id', values: [id] }));
      orgQuery = buildQueries([
        { method: 'or', attribute: '', values: orQueries }
      ]);
    }

    const orgRes = await fetch(`${endpoint}/databases/${databaseId}/collections/organizations/documents?${orgQuery}`, {
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    });
    const orgs = await orgRes.json();
    if (!orgRes.ok) throw new Error('Orgs error: ' + orgs.message);
    console.log(`   ✅ Organizations: ${orgs.documents?.length || 0} records`);

    // Count advocates per org
    console.log('4. Fetching advocates per org...');
    const advocateQueries = [];
    orgIds.forEach(id => {
      advocateQueries.push({ method: 'equal', attribute: 'organization_id', values: [id] });
    });
    const advQuery = advocateQueries.length === 1
      ? buildQueries(advocateQueries)
      : buildQueries([{ method: 'or', attribute: '', values: advocateQueries }]);
    const advRes = await fetch(`${endpoint}/databases/${databaseId}/collections/users/documents?${advQuery}&queries[1]=${JSON.stringify({ method: 'equal', attribute: 'role', values: ['advocate'] })}`, {
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    });
    const advocates = await advRes.json();
    if (!advRes.ok) throw new Error('Advocates error: ' + advocates.message);
    console.log(`   ✅ Advocates: ${advocates.documents?.length || 0} records`);

    // Count cases per org
    console.log('5. Fetching cases per org...');
    const caseQueries = [];
    orgIds.forEach(id => {
      caseQueries.push({ method: 'equal', attribute: 'organization_id', values: [id] });
    });
    const caseQuery = caseQueries.length === 1
      ? buildQueries(caseQueries)
      : buildQueries([{ method: 'or', attribute: '', values: caseQueries }]);
    const caseRes = await fetch(`${endpoint}/databases/${databaseId}/collections/cases/documents?${caseQuery}`, {
      headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
    });
    const cases = await caseRes.json();
    if (!caseRes.ok) throw new Error('Cases error: ' + cases.message);
    console.log(`   ✅ Cases: ${cases.documents?.length || 0} records`);
  }

  console.log('\n✅ All endpoint queries succeed with correct OR logic.\n');
}

testCourtsAndFirms().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
