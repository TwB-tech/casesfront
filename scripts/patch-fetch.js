const endpoint = 'https://tor.cloud.appwrite.io/v1';
const projectId = '69e8bc1500162d3defdb';
const apiKey = 'standard_c0ef0d3a1fb6688a01c11efc38207f791dbb59a1a9157b9138504b8a148431bdbda78b87f8f7d3b1f5e0ff0c246766ec601175aacca06f06cc001060c001a6d9b857fd72c60ec477dd835e40a11f09644ab93b0654157409e861c1d9eb3edeb25539a68c3cf551ebcc58248da86d744e392891d813ce82a279d87eca13b59c9c';
const databaseId = '69e90e4d00075469122c';
const collectionId = 'cases';
const attrId = 'organization_id';

const url = `${endpoint}/databases/${databaseId}/collections/${collectionId}/attributes/${attrId}`;

// Build body with all known fields from GET
const body = {
  key: attrId,
  type: 'string',
  required: false,
  size: 255,
  array: false,
};

fetch(url, {
  method: 'PUT',
  headers: {
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})
  .then(async res => {
    const text = await res.text();
    console.log('Status:', res.status);
    try {
      const json = JSON.parse(text);
      console.log('Response:', JSON.stringify(json, null, 2));
    } catch {
      console.log('Raw:', text);
    }
  })
  .catch(err => console.error('Fetch error:', err));
