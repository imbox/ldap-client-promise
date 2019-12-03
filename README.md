# ldap-client-promise
Wrapper around ldapjs client with promises

## Installation
```bash
$ npm install ldap-client-promise
```

## Test
```bash
$ npm test
```

### Integration test OpenLDAP Dockerfile
Docker image: https://github.com/ldapjs/docker-test-openldap

## Basics of LDAP
### Attribute types: RFC2253
```
String  X.500 AttributeType
------------------------------
CN      commonName
L       localityName
ST      stateOrProvinceName
O       organizationName
OU      organizationalUnitName
C       countryName
STREET  streetAddress
DC      domainComponent
UID     userid
```

### CN - Common Name
Refers to individual object (person's name, meeting room, job title, etc.)

### DC - Domain Component
Each component of the domain, e.g. www.mydomain.com => dc=www,dc=mydomain,dc=com

### DN - Distinquished Name
Name that uniquely identifies an entry in the directory
Note: it seems like dn is composed like 
```
dn: CN=Jane Smith,OU=Accounting,DC=example,DC=com
dn: o=testing,dc=example.com,dc=com
```

The distinguished name is queries from right to left


### OU - Organizational Unit
Sometimes user group that user is part of. ou=lawyer,ou=judge

### Example LDAP Interchange Format (LDIF) record
```
dn: cn=The Postmaster,dc=example,dc=com
objectClass: organizationalRole
cn: The Postmaster
```
