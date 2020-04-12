import csvReader = require("csvtojson");
import fs = require("fs");
import yargv = require("yargs");

const argv = yargv
  .usage("Usage: $0 <inputCsvFile.csv> [options]")
  // tslint:disable-next-line:max-line-length
  .example("$0 -o outputBaseName", "Output the results from the csv into the 'outputBaseName' (01-outputBaseName-groups.ldif & 02-outputBaseName-users.ldif) files")
  .alias("o", "output")
  .nargs("o", 1)
  .default("o", "output")
  .describe("o", "Output file")
  .alias("bdn", "baseDN")
  .nargs("bdn", 1)
  .default("bdn", "dc=contoso,dc=com")
  .describe("bdn", "Base dn (i.e.: dc=contoso,dc=com)")
  .alias("u", "users")
  .nargs("u", 1)
  .default("u", "ou=users")
  .describe("u", "Users OU before the base dn. (i.e.: ou=users)")
  .alias("g", "groups")
  .nargs("g", 1)
  .default("g", "ou=groups")
  .describe("g", "Groups OU before the base dn. (i.e.: ou=groups)")
  .alias("hp", "password")
  .nargs("hp", 1)
  // TODO: http://blog.adamsbros.org/2015/06/09/openldap-ssha-salted-hashes-by-hand/ if we want to do it manually
  .describe("hp", "Default hashed password for the users. If not set, P@ss1W0Rd! will be used")
  .default("hp", "{SHA}RKkNn7+KoG94IN3x/B2jnm/4DS0=")
  .alias("s", "seed")
  .nargs("s", 1)
  .describe("s", "The see used to generate the gidNumber and uidNumber.")
  .default("s", 70000)
  .argv;

const toFileBatchName: string = argv.output;
const baseDn: string = argv.baseDN;
const userBaseDn: string = `${argv.users},${baseDn}`;
const groupBaseDn: string = `${argv.groups},${baseDn}`;
const defaultPassword: string = `userPassword: ${argv.password}`; // Default: P@ss1W0Rd!
let seed: number = argv.seed;

const populateLdif = (fromFile: string) => {
  return new Promise((resolve, reject) => {
    try {
    // tslint:disable-next-line:no-bitwise
      fs.accessSync(fromFile, fs.constants.R_OK | fs.constants.F_OK);
      csvReader().fromFile(fromFile)
        .on("error", (error: any) => {
          return reject(error);
        })
        .on("end_parsed", (jsonObjArr: any[]) => {
          resolve(jsonObjArr);
        });
    } catch (err) {
      return reject("You can't access/read this file.");
    }
  });
};

/**
 * Create the data for ldif based on the csv. It will create the file based on default OpenLdap settings
 * from the docker-ldap (https://github.com/osixia/docker-openldap/tree/stable)
 */
const data = populateLdif(argv._[0])
  .then((jsonData: any) => {
    let buffer: string[] = [];
    const unique = [...new Set(jsonData.map((item: any) => item.group ? item.group : ""))];

    // Ldap Group data
    for (const group of unique) {
      if (group !== "") {
        const groupEntry: string[] = [
          `dn: cn=${group},${groupBaseDn}`,
          `changetype: add`,
          `objectClass: groupOfUniqueNames`,
          `cn: ${group}`,
          `uniqueMember: cn=${group},${groupBaseDn}`,
          `description: ${group}`,
          ``, // Empty to have a separator
        ];

        buffer.push(groupEntry.join("\r\n"));
      }
    }
    // tslint:disable-next-line:max-line-length
    buffer.unshift(`# ldapmodify -a -x -h localhost -p 389 -D "cn=admin,${baseDn}" -f test2.ldif -c -w [YOUR Admin Password]`);
    fs.writeFileSync(`01-${toFileBatchName}-groups.ldif`, buffer.join("\r\n"));
    buffer = []; // reset

    // Ldap User data
    for (const row of jsonData) {
      const rowKeys = Object.keys(row);
      let group: string = "";
      let uniqueMember: string = "";

      rowKeys.forEach((key: any) => {
        switch (key) {
          case "objectClass":
            const objectClass = row[key].split(";");
            for (const oc of objectClass) {
              buffer.push(`objectClass: ${oc}`);
            }
            break;
          case "group":
            group = row[key];
            break;
          case "dn":
            uniqueMember = row[key];
            buffer.push(`${key}: ${row[key]},${userBaseDn}`);
            buffer.push(`changetype: add`);
            break;
          case "manager":
            if (row[key] !== "") {
              buffer.push(`${key}: ${row[key]},${userBaseDn}`);
            }
            break;
          default:
            buffer.push(`${key}: ${row[key]}`);
            break;
        }

        if (key === "uid") {
          buffer.push(`uidNumber: ${seed++}`);
          buffer.push(`gidNumber: ${seed++}`);
        }
      });

      buffer.push(defaultPassword); // Sha-1 for now, other algo exists.
      buffer.push(``);
      // Ldap User-Group data
      if (group && group !== "") {
        buffer.push([
          `dn: cn=${group},${groupBaseDn}`,
          `changetype: modify`,
          `add: uniqueMember`,
          `uniqueMember: ${uniqueMember},${userBaseDn}`,
          ``,
        ].join("\r\n"));
      }
    }
    // TODO: We should write 2 files. One for the users, one for the user group membership.
    // tslint:disable-next-line:max-line-length
    buffer.unshift(`# ldapmodify -a -x -h localhost -p 389 -D "cn=admin,${baseDn}" -f test2.ldif -c -w [YOUR Admin Password]`);
    fs.writeFileSync(`02-${toFileBatchName}-users.ldif`, buffer.join("\r\n"));
  })
  .catch((err) => { console.error(err); });
