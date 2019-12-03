/* eslint-env mocha */
require('should')
const Ldap = require('../')

describe('ldap-client-promise', function () {
  let client
  beforeEach(async function () {
    client = new Ldap({
      user: 'cn=admin,dc=planetexpress,dc=com',
      password: 'GoodNewsEveryone',
      url: 'ldap://localhost:389'
    })
    await client.connect()
  })

  afterEach(function () {
    if (client) {
      client.removeAllListeners()
      client.destroy()
    }
  })

  it('search', async function () {
    client.once('error', err => {
      throw err
    })
    const results = await client.search('ou=people,dc=planetexpress,dc=com', {
      scope: 'sub'
    })
    results
      .map(x => x.objectName)
      .should.deepEqual([
        'ou=people,dc=planetexpress,dc=com',
        'cn=Amy Wong+sn=Kroker,ou=people,dc=planetexpress,dc=com',
        'cn=Bender Bending Rodríguez,ou=people,dc=planetexpress,dc=com',
        'cn=Philip J. Fry,ou=people,dc=planetexpress,dc=com',
        'cn=Hermes Conrad,ou=people,dc=planetexpress,dc=com',
        'cn=Turanga Leela,ou=people,dc=planetexpress,dc=com',
        'cn=Hubert J. Farnsworth,ou=people,dc=planetexpress,dc=com',
        'cn=John A. Zoidberg,ou=people,dc=planetexpress,dc=com',
        'cn=admin_staff,ou=people,dc=planetexpress,dc=com',
        'cn=ship_crew,ou=people,dc=planetexpress,dc=com'
      ])
  })
})
