/* eslint-env mocha */
require('should')
const Ldap = require('../')

const users = Array.from({ length: 100 }, (x, i) => ({
  dn: `cn=foo${i},ou=people,dc=planetexpress,dc=com`,
  entry: {
    cn: `foo${i}`,
    sn: 'bar',
    mail: [`foo${i}@bar.com`],
    objectclass: ['person', 'inetOrgPerson']
  }
}))

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
    results[1].should.deepEqual({
      objectName: 'cn=Amy Wong+sn=Kroker,ou=people,dc=planetexpress,dc=com',
      cn: ['Amy Wong'],
      description: ['Human'],
      givenName: ['Amy'],
      mail: ['amy@planetexpress.com'],
      objectClass: ['top', 'person', 'organizationalPerson', 'inetOrgPerson'],
      ou: ['Intern'],
      sn: ['Kroker'],
      uid: ['amy'],
      userPassword: ['{ssha}3u3qGBJaLskbPH49RkbQmROGNKEoYNQvdSiNfg==']
    })
  })

  it('add/remove users', async function () {
    await client.add(users[0].dn, users[0].entry)
    const added = await client.search(users[0].dn, { scope: 'sub' })
    added.should.containDeep([{ cn: ['foo0'] }])

    await client.del(users[0].dn)
    const afterDel = await client.search(users[0].dn, { scope: 'sub' })

    afterDel.should.deepEqual([])
  })

  it('search over large amount of users', async function () {
    for (const user of users) {
      try {
        await client.add(user.dn, user.entry)
      } catch (e) {}
    }

    const searchResults = await client.search(
      'ou=people,dc=planetexpress,dc=com',
      { scope: 'sub' }
    )
    searchResults.length.should.equal(110)
    for (const user of users) {
      await client.del(user.dn)
    }
  })
})
