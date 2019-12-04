const { EventEmitter } = require('events')
const ldap = require('ldapjs')

class Ldap extends EventEmitter {
  constructor ({ url = 'ldap://localhost:389', user, password, log = null }) {
    super()
    this.client = null
    this.url = url
    this.user = user
    this.password = password
    this._boundOnError = this._onError.bind(this)
  }

  async connect () {
    const { url, user, password, log } = this
    this.client = await new Promise((resolve, reject) => {
      const client = ldap.createClient({
        url,
        log,
        timeout: 5000,
        connectTimeout: 10000,
        idleTimeout: 10000,
        reconnect: {
          initialDelay: 100,
          maxDelay: 10000,
          failAfter: 5
        }
      })

      const onError = err => reject(err)
      client.once('error', onError)

      client.bind(user, password, err => {
        client.removeListener('error', onError)
        return err ? reject(err) : resolve(client)
      })
    })
    this.client.on('error', this._boundOnError)
  }

  async add (dn, entry) {
    const self = this
    return new Promise((resolve, reject) => {
      self.client.add(dn, entry, err => {
        err ? reject(err) : resolve()
      })
    })
  }

  async del (dn) {
    const self = this
    return new Promise((resolve, reject) => {
      self.client.del(dn, err => {
        if (err && err.lde_message !== 'No Such Object') {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async search (searchBase, opts) {
    const self = this
    return new Promise((resolve, reject) => {
      self.client.search(searchBase, opts, (err, res) => {
        if (err) return reject(err)

        const entries = []
        const onSearchEntry = entry => {
          entries.push(self._parseEntry(entry))
        }

        const onError = err => {
          res.removeListener('searchEntry', onSearchEntry)
          res.removeListener('end', onEnd)

          if (err.lde_message === 'No Such Object') {
            resolve(entries)
          } else {
            reject(err)
          }
        }

        const onEnd = () => {
          res.removeListener('searchEntry', onSearchEntry)
          res.removeListener('error', onError)
          resolve(entries)
        }

        res.once('error', onError)
        res.on('searchEntry', onSearchEntry)
        res.once('end', onEnd)
      })
    })
  }

  destroy () {
    if (!this.client) return

    this.client.destroy()
    this.client.removeListener('error', this._boundOnError)
  }

  _onError (err) {
    this.emit('error', err)
  }

  // TODO: extend this with more attribute types...
  _parseEntry (entry) {
    const attributes = {}
    for (const attribute of entry.attributes) {
      const { type, vals } = this._parseAttribute(attribute)
      attributes[type] = vals
    }
    return {
      objectName: entry.objectName,
      ...attributes
    }
  }

  _parseAttribute (attribute) {
    const { type, _vals } = attribute
    const vals = type.toLowerCase().includes('photo')
      ? _vals
      : _vals.map(x => x.toString())
    return { type, vals }
  }
}

module.exports = Ldap
