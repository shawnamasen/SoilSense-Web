// Offline backend policy regression tests (no real Firebase data touched).
const assert = require('node:assert/strict');
const { test } = require('node:test');
process.env.FIREBASE_WEB_API_KEY = 'test-web-api-key';
process.env.FIREBASE_PROJECT_ID = 'soilsense-db59e';
const { requireAdmin } = require('../auth/firebaseToken');

function fakeFetch(profile, {verified = true} = {}) {
  global.fetch = async (url, config) => {
    if (String(url).startsWith('https://identitytoolkit.googleapis.com/')) {
      return {ok:true, json:async () => ({users:[{localId:'knownuid123',email:'a@example.com',emailVerified:verified}]})};
    }
    assert.match(String(url), /firestore.googleapis.com\/v1\/projects\/soilsense-db59e\/databases\/\(default\)\/documents\/users\/knownuid123/);
    assert.equal(config.headers.Authorization, 'Bearer test-token');
    if (!profile) return {ok:false,status:403,json:async()=>({})};
    return {ok:true,json:async()=>({fields:{role:{stringValue:profile.role},active:{booleanValue:profile.active},name:{stringValue:'Admin'}}})};
  };
}
const req = {headers:{authorization:'Bearer test-token'}};
test('no token is denied',async()=>{
  await assert.rejects(requireAdmin({headers:{}}), err => err.statusCode === 401);
});
test('verified mobile user cannot use admin API',async()=>{
  fakeFetch({role:'farmer',active:true});
  await assert.rejects(requireAdmin(req), err => err.statusCode === 403);
});
test('inactive admin cannot use API',async()=>{
  fakeFetch({role:'admin',active:false});
  await assert.rejects(requireAdmin(req), err => err.statusCode === 403);
});
test('unverified admin cannot use API',async()=>{
  fakeFetch({role:'admin',active:true},{verified:false});
  await assert.rejects(requireAdmin(req), err => err.statusCode === 403);
});
test('verified active admin is permitted',async()=>{
  fakeFetch({role:'admin',active:true});
  const profile = await requireAdmin(req);
  assert.equal(profile.role,'admin');
  assert.equal(profile.uid,'knownuid123');
});
