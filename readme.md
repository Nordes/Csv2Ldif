Create ldif from csv and the LDIF can be used with the basic OpenLDAP.

# Default password
Value: `P@ss1W0Rd!`

# Help
```text
Usage: index.js <inputCsvFile.csv> [options]

Options:
  --help            Show help                                          [boolean]
  --version         Show version number                                [boolean]
  -o, --output      Output file                              [default: "output"]
  --bdn, --baseDN   Base dn (i.e.: dc=contoso,dc=com)
                                                  [default: "dc=contoso,dc=com"]
  -u, --users       Users OU before the base dn. (i.e.: ou=users)
                                                           [default: "ou=users"]
  -g, --groups      Groups OU before the base dn. (i.e.: ou=groups)
                                                          [default: "ou=groups"]
  --hp, --password  Default hashed password for the users. If not set,
                    P@ss1W0Rd! will be used
                                  [default: "{SHA}RKkNn7+KoG94IN3x/B2jnm/4DS0="]
  -s, --seed        The see used to generate the gidNumber and uidNumber.
                                                                [default: 70000]

Examples:
  index.js -o outputBaseName  Output the results from the csv into the
                              'outputBaseName' (01-outputBaseName-groups.ldif &
                              02-outputBaseName-users.ldif) files
```

# Example
## Output
| File | Desc. |
| ---- | ----- |
| 01-`filePrefix`-groups.ldif | Generation for the groups |
| 02-`filePrefix`-users.ldif | Generation for the user and also do the membership with the groups |

## Example: Once imported

![image](https://user-images.githubusercontent.com/446572/35681705-99522d7c-07a1-11e8-9a25-c8a2e2e09f68.png)

# Stuff to look
- Some picture data could be available 
  - https://mrhodes.net/2011/10/25/adding-285-contoso-users-with-pictures-to-your-development-environment-active-directory/
